import { config } from "../../config"
import { APIError, HTTPStatus, IErrorable } from "../../lms/errors"
import { IDataFieldData, IFieldData, IForeignFieldData } from "../../lms/FieldData"
import { IArangoIndexes, ICreateUpdate } from "../../lms/types"
import { AuthUser } from "../auth"

export abstract class DataManager<Type> extends IErrorable {
    protected hasCUTimestamp:boolean
    protected fieldEntries:[string, IFieldData][]
    private foreignEntries:[string, IForeignFieldData][]
    private dataEntries:[string, IDataFieldData][]
    protected parentField: null | {
        local:string, foreign:string
    }

    /**
     * Runs the passed function on each foreign key in the document
     */
    protected async mapForeignKeys(
        doc:Type,
        fn:(
            value:any,
            data:IForeignFieldData,
        ) => Promise<any>,
        skippable?:(
            data:IForeignFieldData,
        ) => boolean,
    ) : Promise<Type> {
        return this.mapKeys<IForeignFieldData>(
            doc, this.foreignEntries, fn, skippable
        )
    }

    protected async mapDataKeys(
        doc:Type,
        fn:(
            value:any,
            data:IDataFieldData,
        ) => Promise<any>,
        skippable?:(
            data:IDataFieldData,
        ) => boolean,
    ) : Promise<Type> {
        return this.mapKeys<IDataFieldData>(
            doc, this.dataEntries, fn, skippable
        )
    }

    protected async mapKeys<T extends IFieldData>(
        doc:Type,
        entries:[string, T][],
        fn:(
            value:string,
            data:T,
        ) => Promise<any>,
        skippable?:(
            data:T,
        ) => boolean,
    ) : Promise<Type> {
        return this.forEachField<T>(
            doc,
            entries,
            async (p,o,d) => p.doc[p.key] = <any>await fn(o,d),
            async (p,a,d) => p.doc[p.key] = <any>await Promise.all(
                a.map(o => fn(o,d))
            ),
            async (p,s,d) => {
                let temp:any = {}
                for (let stepId in s) {
                    let stepArray = s[stepId]

                    if (!Array.isArray(stepArray)) {
                        throw this.error(
                            'mapForeignKeys',
                            HTTPStatus.BAD_REQUEST,
                            'Unexpected type',
                            `${stepArray} is not an array`,
                        )
                    }
                    temp[stepId] = <any>await Promise.all(
                        stepArray.map(o => fn(o,d))
                    )
                }
                p.doc[p.key] = temp
            },
            skippable
        )
    }

    protected async forEachField<T extends IFieldData>(
        doc:Type,
        entries:[string, T][],
        // Runs for each foreign key
        keyCall:(
            pointer:{doc:any,key:string | number | symbol}, //doc:Type
            obj:any,
            data:T,
        ) => Promise<any>,
        // Runs for each foreign array
        arrCall:(
            pointer:{doc:any,key:string | number | symbol},
            arr:Array<any>,
            data:T,
        ) => Promise<any>,
        // Runs for each foreign step object
        stpCall:(
            pointer:{doc:any,key:string | number | symbol},
            stp:{[index:string]:Array<any>},
            data:T,
        ) => Promise<any>,
        skippable?:(
            data:T,
        ) => boolean,
    ) : Promise<Type> {
        for (let [fkey, data] of entries) {
            if (skippable && skippable(data)) continue

            if (!(fkey in doc)) {
                if (data.optional) {
                    console.warn(`Optional foreign key [${fkey}] dne`)
                    continue
                }
                throw this.error(
                    'forEachForeignKey',
                    HTTPStatus.BAD_REQUEST,
                    'Missing field',
                    `Foreign field [${fkey}] dne in [${JSON.stringify(doc)}]`
                )
            }

            // key of doc pointing to a foreign object
            let local = fkey as keyof Type
            // An array, string, or step object representing the foreign keys
            let foreign = doc[local]

            switch (data.type) {
                // Single foreign key
                case 'data':
                case 'fkey':
                    await keyCall({doc,key:local},<any>foreign,data)
                    continue
                // Object array
                case 'array':
                    let o: any[] = Array.isArray(foreign)
                        ? foreign
                        : [ foreign ]
                    await arrCall({doc,key:local},o,data)
                    continue
                // Object step object
                case 'step':
                    if (typeof foreign !== 'object') {
                        throw this.error(
                            'forEachForeignKey',
                            HTTPStatus.BAD_REQUEST,
                            'Unexpected type',
                            `${JSON.stringify(foreign)} was expected to be a step object`
                        )
                    }
                    await stpCall({doc,key:local},<any>foreign,data)
                    continue
                default:
                    throw this.internal(
                        'forEachForeignKey',
                        `${JSON.stringify(data)} has invalid .type field (expected foreign key)`
                    )
            }
        }

        return doc
    }

    constructor(
        className: string,
        protected fieldData: {[key:string]: IFieldData},
        opts?: {
            /**
             * Create/Update timestamp
             */
            hasCUTimestamp?: boolean,
        }
    ) {
        super(className)

        this.hasCUTimestamp = opts?.hasCUTimestamp ?? false
        if (this.hasCUTimestamp) {
            fieldData['createdAt'] = {type:'string'}
            fieldData['updatedAt'] = {type:'string'}
        }

        this.fieldEntries = Object.entries(fieldData)
        this.foreignEntries = []
        this.dataEntries = []
        this.parentField = null

        for (let [key, data] of this.fieldEntries) {
            if (data.foreignApi) {
                this.foreignEntries.push([key, data as IForeignFieldData])
            }
            if (data.foreignData) {
                this.dataEntries.push([key, data as IDataFieldData])
            }
            if (data.parentReferenceKey) {
                this.parentField = {
                    local: key,
                    foreign: data.parentReferenceKey,
                }
            }
        }
    }

    /**
     * Adds the passed document, with its id, to the map
     * @param map The map to add to
     */
    protected async verifyAddedDocument(
        user: AuthUser,
        files: any,
        a: Type,
        exists: boolean,
        map: Map<DataManager<any>, any[]>,
        stack: string[]
    ): Promise<Type> {
        // Modify this document, if required
        let doc = await this.modifyDoc(user, files, a)

        if (this.hasCUTimestamp) {
            if (!exists) {
                (<ICreateUpdate>doc).createdAt = new Date().toJSON()
            }
            (<ICreateUpdate>doc).updatedAt = new Date().toJSON()
        }

        // Check for extra fields
        for (const [pK,pV] of Object.entries(doc)) {
            if (pK in this.fieldData) continue

            // Developer routes
            if (config.devRoutes) {
                // Clean existing documents
                if (exists) {
                    console.warn(`deleting key ${this.className}.${pK} from existing doc [${JSON.stringify(doc)}]`)
                    delete (<any>doc)[pK]
                    continue
                }
            }

            throw this.error(
                'addToReferenceMap',
                HTTPStatus.BAD_REQUEST,
                'Excess data provided',
                `${this.className}.${pK} [${pV}] was not expected in (${JSON.stringify(doc)})`
            )
        }

        for (let [k, data] of this.fieldEntries) {
            // key of doc
            let key = k as keyof Type
            
            // Check for missing fields
            if (!(key in doc)) {
                if (data.default !== undefined) {
                    console.warn(`Using default ${data.default} for ${key}`)
                    doc[key] = <any>data.default
                    continue
                } else if (data.optional) {
                    console.warn(`optional key ${key} dne`)
                    continue
                } else {
                    if (exists) {
                        console.warn(`key ${key} is missing in revised document`)
                        continue
                    }
                    throw this.error(
                        'addToReferenceMap',
                        HTTPStatus.BAD_REQUEST,
                        'Missing required field',
                        `${key} dne in ${JSON.stringify(doc)}`
                    )
                }
            }

            // Validate types
            switch (data.type) {
                case 'boolean':
                case 'string':
                case 'number':
                    // The value associated with this key
                    let value = doc[key]

                    if (typeof value === data.type) {
                        continue
                    }
                    throw this.error(
                        'addToReferenceMap',
                        HTTPStatus.BAD_REQUEST,
                        'Invalid document field type',
                        `${this.className}.${key} ${value} expected to be ${data.type}`
                    )
                // Other key types don't need validation here
            }
        }

        // foreign keys
        doc = await this.mapForeignKeys(doc, async (obj, data) =>
            await data.foreignApi.parseGet(
                user, files, obj, data, map, stack,
            )
        )

        // data keys
        doc = await this.mapDataKeys(doc, async (obj, data) =>
            await data.foreignData.parseGet(
                user, files, obj, data, map, stack,
            )
        )

        // Add the document to the map
        if (map.has(this)) {
            map.get(this)?.push(doc)
        } else {
            map.set(this, [doc])
        }

        return doc
    }

    protected async parseGet(
        user: AuthUser,
        files: any,
        doc: any,
        data: IFieldData,
        map: Map<DataManager<any>, any[]>,
        stack: string[],
    ): Promise<any> {
        // Doc is either a foreign key or a string to serialize
        if (typeof doc === 'string') {
            if (data.foreignApi) {
                let db = data.foreignApi.db
                // Check if foreign key reference is valid
                if (db.isKeyOrId(doc)) {
                    let id = db.asId(doc)
                    if (await db.exists(id)) {
                        // Convert from key to id
                        return id
                    }
                }
            }

            if (data.acceptNewDoc) {
                let built = await this.buildFromString(user, files, doc, stack[stack.length - 1])
                if (built !== undefined) {
                    if (data.foreignApi) {
                        let id = (<any>built).id
                        if (!id) {
                            throw this.internal(
                                'parseGet',
                                `buildFromString returns document without id field`
                            )
                        }
                        stack.push(id)
                    }
                    await this.verifyAddedDocument(user, files, built, true, map, stack)
                    return data.foreignApi ? stack.pop() : built
                }
            }

            throw this.error(
                'parseGet',
                HTTPStatus.BAD_REQUEST,
                'Invalid key value',
                `[${doc}] is not a valid string entry`
            )
        // Objects are fully-formed documents
        } else if (typeof doc === 'object') {
            // Update parent field only if it isn't already set
            // TODO: validate existing parent keys
            if (this.parentField && !doc[this.parentField.local]) {
                // We're assigning the parent/module/project field
                // of documents here, so they hold references to
                // their parent.
                doc[this.parentField.local] = stack[stack.length - 1]
            }

            // Non-foreign documents are verified directly
            if (!data.foreignApi) {
                await this.verifyAddedDocument(user, files, doc, false, map, stack)
                return doc
            }

            let db = data.foreignApi.db
            let exists = await db.tryExists(doc.id)

            if (exists) {
                throw this.error(
                    'parseGet',
                    HTTPStatus.BAD_REQUEST,
                    'New document unauthorized',
                    `New documents [${JSON.stringify(doc)}] not acceptable for type ${JSON.stringify(data)}`
                )
            }

            let id = exists ? db.keyToId(doc.id) : db.generateDBID()
            doc.id = id
            stack.push(id)
            await this.verifyAddedDocument(user, files, doc, exists, map, stack)
            return stack.pop()
        }
        throw this.error(
            'ref',
            HTTPStatus.BAD_REQUEST,
            'Invalid foreign object',
            `[${JSON.stringify(doc)}] is not a foreign document or reference for data [${data.type}]`
        )
    }

    /**
     * Accepts a non id/key string and converts it into a valid document
     */
    protected async buildFromString(
        user: AuthUser,
        files: any,
        str: string,
        par: string
    ) : Promise<Type | undefined> {
        return undefined
    }

    /**
     * Modifies a document. Called after verifying all fields exist,
     * and after dereferencing all keys
     */
    protected async modifyDoc(
        user:AuthUser,
        files:any,
        doc:any,
    ) : Promise<Type> {
        return doc
    }

    protected async addReference(id:string, field:string, real:boolean) {
        throw this.error(
            'addReference',
            HTTPStatus.NOT_IMPLEMENTED
        )
    }

    protected async removeReference(id:string, field:string, real:boolean) {
        throw this.error(
            'removeReference',
            HTTPStatus.NOT_IMPLEMENTED
        )
    }
}
