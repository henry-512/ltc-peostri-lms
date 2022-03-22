import { config } from "../../config"
import { APIError, HTTPStatus, IErrorable } from "../../lms/errors"
import { IFieldData, IForeignFieldData } from "../../lms/FieldData"
import { ICreateUpdate } from "../../lms/types"
import { AuthUser } from "../auth"

export abstract class DataManager<Type> extends IErrorable {
    protected fieldEntries:[string, IFieldData][]
    private foreignEntries:[string, IForeignFieldData][]
    protected parentField: null | {
        local:string, foreign:string
    }

    /**
     * Runs the passed function on each foreign key in the document
     */
    protected async mapForeignKeys(
        doc:Type,
        fn:(
            key:string,
            data:IForeignFieldData,
        ) => Promise<any>,
        skippable?:(
            data:IForeignFieldData,
        ) => boolean,
    ) : Promise<Type> {
        return this.forEachForeignKey(
            doc,
            async (p,k,d) => p.doc[p.key] = <any>await fn(k,d),
            async (p,a,d) => p.doc[p.key] = <any>await Promise.all(
                a.map(k => fn(k,d))
            ),
            async (p,o,d) => {
                let temp:any = {}
                for (let stepId in o) {
                    let stepArray = o[stepId]

                    if (!Array.isArray(stepArray)) {
                        throw this.error(
                            'mapForeignKeys',
                            HTTPStatus.BAD_REQUEST,
                            'Unexpected type',
                            `${stepArray} is not an array`,
                        )
                    }
                    temp[stepId] = <any>await Promise.all(
                        stepArray.map(k => fn(k,d)
                    ))
                }
                p.doc[p.key] = temp
            },
            skippable
        )
    }

    protected async forEachForeignKey(
        doc:Type,
        // Runs for each foreign key
        keyCall:(
            pointer:{doc:any,key:string | number | symbol}, //doc:Type
            key:string,
            data:IForeignFieldData,
        ) => Promise<any>,
        // Runs for each foreign array
        arrCall:(
            pointer:{doc:any,key:string | number | symbol},
            arr:Array<string>,
            data:IForeignFieldData,
        ) => Promise<any>,
        // Runs for each foreign step object
        stpCall:(
            pointer:{doc:any,key:string | number | symbol},
            stp:{[index:string]:Array<string>},
            data:IForeignFieldData,
        ) => Promise<any>,
        skippable?:(
            data:IForeignFieldData,
        ) => boolean,
    ) : Promise<Type> {
        for (let [fkey, data] of this.foreignEntries) {
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
                case 'fkey':
                    await keyCall({doc,key:local},<any>foreign,data)
                    continue
                // Foreign key array
                case 'array':
                    if (!Array.isArray(foreign)) {
                        throw this.error(
                            'forEachForeignKey',
                            HTTPStatus.BAD_REQUEST,
                            'Unexpected type',
                            `${JSON.stringify(foreign)} was expected to be an array`
                        )
                    }
                    await arrCall({doc,key:local},foreign,data)
                    continue
                // Foreign key step object
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
        /**
         * Create/Update timestamp
         */
        protected hasCUTimestamp: boolean,
    ) {
        super(className)

        if (this.hasCUTimestamp) {
            fieldData['createdAt'] = {type:'string'}
            fieldData['updatedAt'] = {type:'string'}
        }

        this.fieldEntries = Object.entries(fieldData)
        this.foreignEntries = []
        this.parentField = null

        for (let [key, data] of this.fieldEntries) {
            if (data.foreignApi) {
                this.foreignEntries.push([key, data as IForeignFieldData])
            }
            if (data.parentReferenceKey) {
                this.parentField = {
                    local: key,
                    foreign: data.parentReferenceKey,
                }
            }
        }
    }

    protected async verifyAddedDocument(
        user: AuthUser,
        files: any,
        addDocId: string,
        a: Type,
        exists: boolean,
    ): Promise<Type> {
        // Modify this document, if required
        let doc = await this.modifyDoc(user, files, a, addDocId)

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

            // The value associated with this key
            let value = doc[key]

            // Validate types
            switch (data.type) {
                case 'boolean':
                case 'string':
                case 'number':
                    if (typeof value === data.type) {
                        continue
                    }
                    throw this.error(
                        'addToReferenceMap',
                        HTTPStatus.BAD_REQUEST,
                        'Invalid document field type',
                        `${this.className}.${key} ${value} expected to be ${data.type}`
                    )
                // Parent keys don't need validation
                case 'parent':
                    continue
            }

            // Managed objects
            data.type

            let isForeign = data.type === 'fkey' || data.instance === 'fkey'

            if (isForeign) {
                continue
            } else {
                switch (data.type) {
                    case 'data':
                    case 'array':
                    case 'step':
                }
            }
        }

        return doc
    }

    /**
     * Accepts a non id/key string and converts it into a valid document
     */
    protected async buildFromString(
        user: AuthUser,
        files: any,
        str: string,
        par: string
    ) : Promise<Type | null> {
        return null
    }

    /**
     * Modifies a document. Called after verifying all fields exist,
     * and after dereferencing all keys
     */
    protected async modifyDoc(
        user:AuthUser,
        files:any,
        doc:any,
        id:string
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
