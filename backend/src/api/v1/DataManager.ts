import { config } from '../../config'
import { HTTPStatus, IErrorable } from '../../lms/errors'
import {
    IDataFieldData,
    IFieldData,
    IForeignFieldData,
} from '../../lms/FieldData'
import { IArangoIndexes, ICreateUpdate } from '../../lms/types'
import { isDBId, isDBKey, PTR, splitId, str } from '../../lms/util'
import { AuthUser } from '../auth'

export const instances: { [dbname: string]: DataManager<IArangoIndexes> } = {}

export class DataManager<Type> extends IErrorable {
    protected hasCUTimestamp: boolean
    protected fieldEntries: [string, IFieldData][]
    protected foreignEntries: [string, IForeignFieldData][]
    private dataEntries: [string, IDataFieldData][]
    protected parentField: null | {
        local: string
        foreign: string
    }

    // hack
    public resolveDependencies() {
        for (let [key, data] of this.fieldEntries) {
            if (typeof data.foreignApi === 'string') {
                data.foreignApi = instances[data.foreignApi] as any
            }
        }
    }

    /**
     * Runs the passed function on each foreign key in the document
     */
    public async mapForeignKeys(
        doc: Type,
        fn: (value: any, data: IForeignFieldData) => Promise<any>,
        skippable?: (data: IForeignFieldData) => boolean
    ): Promise<Type> {
        return this.mapKeys<IForeignFieldData>(
            doc,
            this.foreignEntries,
            fn,
            skippable
        )
    }

    protected async mapDataKeys(
        doc: Type,
        fn: (value: any, data: IDataFieldData) => Promise<any>,
        skippable?: (data: IDataFieldData) => boolean
    ): Promise<Type> {
        return this.mapKeys<IDataFieldData>(
            doc,
            this.dataEntries,
            fn,
            skippable
        )
    }

    protected async mapKeys<T extends IFieldData>(
        doc: Type,
        entries: [string, T][],
        fn: (value: string, data: T) => Promise<any>,
        skippable?: (data: T) => boolean
    ): Promise<Type> {
        return this.forEachField<T>(
            doc,
            entries,
            async (p, o, d) => (p.obj[p.key] = <any>await fn(o, d)),
            async (p, a, d) =>
                (p.obj[p.key] = <any>await Promise.all(a.map((o) => fn(o, d)))),
            async (p, s, d) => {
                let temp: any = {}
                for (let stepId in s) {
                    let stepArray = s[stepId]

                    if (!Array.isArray(stepArray)) {
                        throw this.error(
                            'mapForeignKeys',
                            HTTPStatus.BAD_REQUEST,
                            'Unexpected type',
                            `${stepArray} is not an array`
                        )
                    }
                    temp[stepId] = <any>(
                        await Promise.all(stepArray.map((o) => fn(o, d)))
                    )
                }
                p.obj[p.key] = temp
            },
            skippable
        )
    }

    /**
     * @param allFn
     * @param foreignFn
     * @param dataFn
     * @param otherFn
     * @param parentFn
     */
    protected async mapEachField(
        doc: any,
        // Runs for all keys. Returns true if this key should be skipped
        allFn?: (pointer: PTR<any>, data: IFieldData) => Promise<boolean>,
        // Runs for each foreign key
        foreignFn?: (value: any, data: IForeignFieldData) => Promise<any>,
        // Runs for each data key
        dataFn?: (value: any, data: IDataFieldData) => Promise<any>,
        // Runs for each other key
        otherFn?: (value: any, data: IFieldData) => Promise<any>,
        // Runs for parent keys
        parentFn?: (value: any, data: IFieldData) => Promise<any>
    ): Promise<any> {
        for (let [key, data] of this.fieldEntries) {
            if (allFn && (await allFn({ obj: doc, key }, data))) {
                continue
            }

            let value = doc[key]

            switch (data.type) {
                case 'string':
                case 'boolean':
                case 'number':
                    if (otherFn) doc[key] = await otherFn(value, data)
                    break
                case 'parent':
                    if (parentFn) doc[key] = await parentFn(value, data)
                    break
                case 'data':
                    if (dataFn)
                        doc[key] = await dataFn(value, data as IDataFieldData)
                    break
                case 'fkey':
                    if (foreignFn)
                        doc[key] = await foreignFn(
                            value,
                            data as IForeignFieldData
                        )
                    break
                case 'array':
                    value = Array.isArray(value) ? value : [value]

                    if (value.length === 0) {
                        break
                    }

                    if (data.foreignApi) {
                        if (foreignFn) {
                            let d = data as IForeignFieldData
                            doc[key] = await Promise.all(
                                value.map(async (o: any) => foreignFn(o, d))
                            )
                        }
                    } else if (data.foreignData) {
                        if (dataFn) {
                            let d = data as IDataFieldData
                            doc[key] = await Promise.all(
                                value.map(async (o: any) => dataFn(o, d))
                            )
                        }
                    } else {
                        console.log(data.foreignApi)
                        throw this.internal(
                            'mapEachField',
                            `${str(data)} has array type but neither reference.`
                        )
                    }
                    break
                case 'step':
                    let dF = data as IForeignFieldData
                    let dD = data as IDataFieldData

                    let stepper: any = {}
                    for (let stepId in value) {
                        let stepArray = value[stepId]

                        if (!Array.isArray(stepArray)) {
                            throw this.error(
                                'mapForeignKeys',
                                HTTPStatus.BAD_REQUEST,
                                'Unexpected type',
                                `${JSON.stringify(stepArray)} is not an array`
                            )
                        }

                        if (data.foreignApi) {
                            if (!foreignFn) {
                                break
                            }
                            stepper[stepId] = await Promise.all(
                                stepArray.map((o: any) => foreignFn(o, dF))
                            )
                        } else if (data.foreignData) {
                            if (!dataFn) {
                                break
                            }
                            stepper[stepId] = await Promise.all(
                                stepArray.map((o: any) => dataFn(o, dD))
                            )
                        } else {
                            throw this.internal(
                                'mapEachField',
                                `${data} has step type but neither reference.`
                            )
                        }
                    }
                    doc[key] = stepper
            }
        }

        return doc
    }

    protected async forEachField<T extends IFieldData>(
        doc: Type,
        entries: [string, T][],
        // Runs for each foreign key
        keyCall: (pointer: PTR<any>, obj: any, data: T) => Promise<any>,
        // Runs for each foreign array
        arrCall: (pointer: PTR<any>, arr: Array<any>, data: T) => Promise<any>,
        // Runs for each foreign step object
        stpCall: (
            pointer: PTR<any>,
            stp: { [index: string]: Array<any> },
            data: T
        ) => Promise<any>,
        skippable?: (data: T) => boolean
    ): Promise<Type> {
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
                    await keyCall({ obj: doc, key: local }, <any>foreign, data)
                    continue
                // Object array
                case 'array':
                    let o: any[] = Array.isArray(foreign) ? foreign : [foreign]
                    await arrCall({ obj: doc, key: local }, o, data)
                    continue
                // Object step object
                case 'step':
                    if (typeof foreign !== 'object') {
                        throw this.error(
                            'forEachForeignKey',
                            HTTPStatus.BAD_REQUEST,
                            'Unexpected type',
                            `${JSON.stringify(
                                foreign
                            )} was expected to be a step object`
                        )
                    }
                    await stpCall({ obj: doc, key: local }, <any>foreign, data)
                    continue
                default:
                    throw this.internal(
                        'forEachForeignKey',
                        `${data} has invalid .type field (expected foreign key)`
                    )
            }
        }

        return doc
    }

    constructor(
        className: string,
        protected fieldData: { [key: string]: IFieldData },
        opts?: {
            /**
             * Create/Update timestamp
             */
            hasCUTimestamp?: boolean
        }
    ) {
        super(className)

        this.hasCUTimestamp = opts?.hasCUTimestamp ?? false
        if (this.hasCUTimestamp) {
            fieldData['createdAt'] = { type: 'string' }
            fieldData['updatedAt'] = { type: 'string' }
        }

        this.fieldEntries = Object.entries(fieldData)
        this.foreignEntries = []
        this.dataEntries = []
        this.parentField = null

        for (let [key, data] of this.fieldEntries) {
            // Set data names
            data.name = key
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
        lastDBId: string
    ): Promise<Type> {
        // Modify this document, if required
        let doc = await this.modifyDoc(user, files, a)

        if (this.hasCUTimestamp) {
            if (!exists) {
                ;(<ICreateUpdate>doc).createdAt = new Date().toJSON()
            }
            ;(<ICreateUpdate>doc).updatedAt = new Date().toJSON()
        }

        // Check for extra fields
        for (const [pK, pV] of Object.entries(doc)) {
            if (pK in this.fieldData) continue

            // Developer routes
            if (config.devRoutes) {
                // Clean existing documents
                if (exists) {
                    console.warn(
                        `deleting key ${
                            this.className
                        }.${pK} from existing doc [${JSON.stringify(doc)}]`
                    )
                    delete (<any>doc)[pK]
                    continue
                }
            }

            throw this.error(
                'addToReferenceMap',
                HTTPStatus.BAD_REQUEST,
                'Excess data provided',
                `${
                    this.className
                }.${pK} [${pV}] was not expected in (${JSON.stringify(doc)})`
            )
        }

        // The doucment currently in the DB with this ID
        let fetched: any
        // Id. Either a valid ID if this is a foreign document or undefined
        let id = (<any>doc).id

        doc = await this.mapEachField(
            doc,
            // all
            async (pointer, data) => {
                let k = pointer.key
                let o = pointer.obj
                // Check for missing fields
                if (k in o) {
                    if (o[k] === undefined || o[k] === null) {
                        delete o[k]
                    } else {
                        return false
                    }
                }
                if (data.default !== undefined) {
                    console.warn(
                        `Using default ${data.default} for ${String(k)}`
                    )
                    o[k] = data.default
                    return false
                } else if (data.optional) {
                    console.warn(
                        `optional key ${String(k)} for ${str(data)} dne`
                    )
                    return true
                } else if (exists) {
                    // Pull missing elements from the database
                    if (!fetched) {
                        if (!(<any>this).db) {
                            throw this.internal(
                                'verifyAddedDocument.mapEachField',
                                `${this.className} is not a DBManager, yet contains a missing element and exists in the DB.`
                            )
                        }
                        try {
                            console.log(
                                `Missing field ${String(
                                    k
                                )} in ${o}, checking DB`
                            )
                            fetched = await (<any>this).db.get(id)
                        } catch (e) {
                            console.warn('Error with check')
                            return false
                        }
                    }
                    o[k] = fetched[k]
                    // Elements in the db are assumed to be valid
                    return true
                }
                throw this.error(
                    'verifyAddedDocument.mapEachField',
                    HTTPStatus.BAD_REQUEST,
                    'Missing required field',
                    `${String(k)} dne in ${JSON.stringify(o)}`
                )
            },
            // foreign
            async (v, d) =>
                d.foreignApi.parseGet(user, files, v, d, map, id ?? lastDBId),
            // data
            async (v, d) =>
                d.foreignData.parseGet(user, files, v, d, map, id ?? lastDBId),
            // other
            async (value, data) => {
                if (typeof value === data.type) {
                    return value
                }
                throw this.error(
                    'verifyAddedDocument.mapEachField',
                    HTTPStatus.BAD_REQUEST,
                    'Invalid document field type',
                    `${this.className}.${data.name} ${value} expected to be ${data.type}`
                )
            },
            // parent
            async (value, data) => {
                if (typeof value === 'string' && isDBId(value)) {
                    return value
                }
                throw this.internal(
                    'verifyAddedDocument.mapEachField',
                    `${value} ${str(data)} not a valid parent id`
                )
            }
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
        par: string
    ): Promise<any> {
        // Doc is either a foreign key or a string to serialize
        if (typeof doc === 'string') {
            // Verify foreign reference
            if (data.foreignApi) {
                let db = data.foreignApi.db
                // Check if foreign key reference is valid
                if (db.isKeyOrId(doc)) {
                    let id = db.asId(doc)
                    if (await db.tryExists(id)) {
                        return id
                    }
                    console.warn(`key ${doc} is a KEY or ID but DNE`)
                }
                console.warn(
                    `expected key of ${str(data)}, got ${doc}, trying bfs`
                )
            }

            // Build a new document from a string
            if (data.acceptNewDoc) {
                let built = await this.buildFromString(user, files, doc, par)
                if (built !== undefined) {
                    // Verify id and add to call stack
                    let id = (<any>built).id
                    if (data.foreignApi) {
                        if (!id || !data.foreignApi.db.isDBId(id)) {
                            throw this.internal(
                                'parseGet',
                                `buildFromString on ${this.className} returns document without id field`
                            )
                        }
                    }
                    built = await this.verifyAddedDocument(
                        user,
                        files,
                        built,
                        false,
                        map,
                        id ?? par
                    )
                    // Return either the id reference or the built object
                    return data.foreignApi ? id : built
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
            if (this.parentField) {
                let local = this.parentField.local
                if (!doc[local]) {
                    // We're assigning the parent/module/project fieldof documents here, so they hold references to their parent.
                    doc[local] = par
                }
            }

            // Non-foreign documents are verified directly
            if (!data.foreignApi) {
                return this.verifyAddedDocument(
                    user,
                    files,
                    doc,
                    false,
                    map,
                    par
                )
            }

            let db = data.foreignApi.db
            let id = doc.id
            let exists = false

            // doc.id is either null (new document) or KEY
            if (id) {
                if (!isDBKey(id)) {
                    throw this.internal(
                        'parseGet',
                        `${id} is not a KEY ${JSON.stringify(doc)}`
                    )
                }

                id = db.keyToId(doc.id)
                exists = await db.exists(id)

                // If this is new
                if (!exists) {
                    // And we allow new documents
                    if (!data.acceptNewDoc) {
                        throw this.error(
                            'parseGet',
                            HTTPStatus.BAD_REQUEST,
                            'New document unauthorized',
                            `New documents [${JSON.stringify(
                                doc
                            )}] not acceptable for type ${str(data)}`
                        )
                    }

                    // Generate new id
                    id = db.generateDBID()
                }
            } else {
                // If there is no id field, it is assumed to not exist
                if (!data.acceptNewDoc) {
                    throw this.error(
                        'parseGet',
                        HTTPStatus.BAD_REQUEST,
                        'New document unauthorized',
                        `New documents [${JSON.stringify(
                            doc
                        )}] not acceptable for type ${str(data)}`
                    )
                }
                id = db.generateDBID()
            }

            // Set new/modified id
            doc.id = id
            await this.verifyAddedDocument(user, files, doc, exists, map, id)
            return id
        }
        throw this.error(
            'ref',
            HTTPStatus.BAD_REQUEST,
            'Invalid foreign object',
            `[${JSON.stringify(
                doc
            )}] is not a foreign document or reference for data [${str(data)}]`
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
    ): Promise<Type | undefined> {
        return undefined
    }

    /**
     * Modifies a doc, if required. Called before verifying any fields.
     */
    protected async modifyDoc(
        user: AuthUser,
        files: any,
        doc: any
    ): Promise<Type> {
        return doc
    }

    protected async addReference(id: string, field: string, real: boolean) {
        throw this.error('addReference', HTTPStatus.NOT_IMPLEMENTED)
    }

    protected async removeReference(id: string, field: string, real: boolean) {
        throw this.error('removeReference', HTTPStatus.NOT_IMPLEMENTED)
    }

    // Called by GET-ALL and GET-ID
    public async convertIDtoKEY(doc: Type): Promise<Type> {
        return this.mapEachField(
            doc,
            // all
            async (p, data) => {
                if (!(p.key in p.obj)) {
                    if (data.default !== undefined) {
                        // Put default value in
                        p.obj[p.key] = data.default
                    } else {
                        console.warn(`${String(p.key)} missing in GET/ ${doc}`)
                    }
                    return true
                }
                return false
            },
            (v, d) => {
                if (typeof v === 'string' && d.foreignApi.db.isDBId(v)) {
                    return splitId(v).key
                } else if (typeof v === 'object') {
                    // d.distortOnGet(v)
                    return v
                }
                throw this.internal(
                    'convertIds',
                    `${this.className} [${v}] expected to be a DB id`
                )
            },
            (v, d) => {
                if (typeof v === 'object') {
                    return d.foreignData.convertIDtoKEY(v)
                }
                throw this.internal(
                    'convertIds',
                    `${this.className} [${v}] expected to be an object`
                )
            }
        )
    }
}
