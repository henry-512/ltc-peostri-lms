import { config } from "../../config";
import { ArangoWrapper, IQueryGetOpts } from "../../database";
import { APIError, HTTPStatus } from "../../lms/errors";
import { IFieldData, IForeignFieldData } from "../../lms/FieldData";
import { IArangoIndexes, ICreateUpdate } from "../../lms/types";
import { convertToKey, isDBKey, splitId } from "../../lms/util";
import { AuthUser } from "../auth";
import { DataManager } from "./DataManager";

/**
 * Returns the ApiRoute instance corresponding to a database id
 * @param id A db id of the form [name/id]
 * @returns The corresponding ApiRoute
 */
export function getApiInstanceFromId(id: string): DBManager<IArangoIndexes> {
    return instances[splitId(id).col]
}
const instances: {[dbname:string]: DBManager<IArangoIndexes>} = {}

export abstract class DBManager<Type extends IArangoIndexes> extends DataManager<Type> {
    public db: ArangoWrapper<Type>

    constructor(
        dbName: string,
        className: string,
        fields: {[key:string]: IFieldData},
        /**
         * Create/Update timestamp
         */
        hasCUTimestamp: boolean,
    ) {
        fields['id'] = {
            type: 'string',
            optional: true,
        }

        super(className, fields, hasCUTimestamp)

        this.db = new ArangoWrapper<Type>(dbName, this.fieldEntries)
    }

    public async exists(id: string) {
        return this.db.exists(id)
    }

    /**
     * Retrieves a query from the server, following the passed parameters.
     * @param q An object with query fields.
     *  - sort [id, ASC/DESC]
     *  - range [offset, count]
     * @return A cursor representing all db objects that fit the query 
     */
    public async query(q: any) {
        let opts: IQueryGetOpts = {
            range: {
                offset: 0,
                count: 10,
            }
        }

        // let filterIds:string[] = []
        // TODO: implement generic filtering
        // if (q.filter) {
        //     let filter = JSON.parse(q.filter)
        //     if (filter) {
        //         if ('id' in filter && Array.isArray(filter.id)) {
        //             filterIds = filter.id.map((s:string) => convertToKey(s))
        //         }
        //     }
        // }

        // Sorting
        if (q.sort && q.sort.length == 2) {
            let key: string = q.sort[0]

            if (
                !(key in this.fieldData)
                || this.fieldData[key].hideGetAll
            ) {
                throw this.error(
                    'query',
                    HTTPStatus.BAD_REQUEST,
                    'Invalid sorting query',
                    `[${key}] is not a key of this`
                )
            }

            let dir: 'ASC' | 'DESC'

            switch(q.sort[1]) {
                case 'ASC':
                case 'DESC':
                    dir = q.sort[1]
                    break
                default:
                    throw this.error(
                        'query',
                        HTTPStatus.BAD_REQUEST,
                        'Invalid sorting query',
                        `[${q.sort[1]}] is not a valid direction`
                    )
            }

            opts.sort = { key, dir }
        }

        if (q.range && q.range.length == 2) {
            opts.range = {
                offset: parseInt(q.range[0]),
                count: Math.min(parseInt(q.range[1]), 50),
            }
        }

        let query = await this.db.queryGet(opts)

        return {
            cursor: query.cursor,
            size: query.size,
            low: opts.range.offset,
            high: opts.range.offset + opts.range.count,
        }
    }

    public convertIds(doc: Type) {
        return this.mapForeignKeys(doc, async (k,d) => {
            if (typeof k === 'string' && d.foreignApi.db.isDBId(k)) {
                return splitId(k).key
            } else if (typeof k === 'object') {
                return k
            }
            throw this.error(
                'convertIds',
                HTTPStatus.INTERNAL_SERVER_ERROR,
                'Invalid document status',
                `${this.className} [${k}] expected to be a DB id`
            )
        })
    }

    /**
     * Gets the document with the passed key from the database
     * @param id A (valid) db id for the document
     * @return A Type representing a document with key, with .id set and ._* removed
     */
    public async getFromDB(
        user: AuthUser,
        depth: number,
        id: string,
    ) : Promise<Type> {
        let doc = await this.db.get(id)

        for (let [k, data] of this.fieldEntries) {
            if (data.hideGetId) {
                delete (<any>doc)[k]
            } else if (data.default !== undefined) {
                // Put default value in
                (<any>doc)[k] = data.default
            }
        }

        return this.mapForeignKeys(doc, async (k,data) => {
            if (typeof k === 'string') {
                if (data.getIdKeepAsRef) {
                    return convertToKey(k)
                // Dereference the id into an object
                } else if (this.db.isDBId(k)) {
                    // AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
                    // TODO: perfect spot to intercept calls
                    return data.foreignApi.getFromDB(user, depth++, k)
                }
            }
            throw this.internal(
                'getFromDB.mapForeignKeys',
                `[${k}] expected to be a valid DB id`
            )
        })
    }

    /**
     * Validates a document reference
     * @return The id of the new document
     */
     private async ref(
        user: AuthUser,
        files: any,
        doc:any,
        par:string,
        data:IFieldData,
        map: Map<DBManager<IArangoIndexes>, IArangoIndexes[]>,
    ) : Promise<any> {
        if (typeof doc === 'string') {
            // Check if foreign key reference is valid
            if (this.db.isKeyOrId(doc)) {
                let id = this.db.asId(doc)
                if (await this.db.exists(id)) {
                    // Convert from key to id
                    return id
                }
            }

            if (data.acceptNewDoc) {
                let built = await this.buildFromString(user, files, doc, par)
                if (built) {
                    let childId = this.db.generateDBID()
                    await this.addToReferenceMap(user, files, childId, built, map, 2)
                    return childId
                }
            }

            throw this.error(
                'ref',
                HTTPStatus.BAD_REQUEST,
                'Invalid key reference',
                `[${doc}] is not a valid key`
            )
        // Objects are fully-formed documents
        } else if (typeof doc === 'object') {
            // Update parent field only if it isn't already set
            // TODO: validate existing parent keys
            if (this.parentField && !doc[this.parentField.local]) {
                // We're assigning the parent/module/project field
                // of documents here, so they hold references to
                // their parent.
                doc[this.parentField.local] = par
            }

            // If the formed document's id is already in the DB, it
            // is not new
            let isNew:0|1|2 = doc.id && await this.db.exists(doc.id) ? 1 : 2

            // If the document is new and allowed to be new
            if (isNew === 2 && !data.acceptNewDoc) {
                throw this.error(
                    'ref',
                    HTTPStatus.BAD_REQUEST,
                    'New document unauthorized',
                    `New documents [${JSON.stringify(doc)}] not acceptable for type ${JSON.stringify(data)}`
                )
            }

            let childId = isNew === 2
                ? this.db.generateDBID()
                // Document exists, however it's a key
                : this.db.keyToId(doc.id)

            await this.addToReferenceMap(user, files, childId, doc, map, isNew)
            return childId
        }
        throw this.error(
            'ref',
            HTTPStatus.BAD_REQUEST,
            'Invalid foreign object',
            `${doc} is not a foreign document or reference`
        )
    }

    /**
     * Adds the passed document, with its id, to the map
     * @param addDocId The db id for the document
     * @param addDoc The document to add to the map
     * @param map The map to add to
     */
    private async addToReferenceMap(
        user: AuthUser,
        files: any,
        addDocId: string,
        addDoc: Type,
        map: Map<DBManager<IArangoIndexes>, IArangoIndexes[]>,
        /**
         * 0 - Unknown
         * 1 - Not new
         * 2 - New
         */
        isNew: 0 | 1 | 2,
    ): Promise<void> {
        // Used for frontend mangement, redundant in DB
        delete addDoc.id

        // Modify this document, if required
        addDoc = await this.modifyDoc(user, files, addDoc, addDocId)

        if (this.hasCUTimestamp) {
            if (isNew === 0)
                isNew = await this.db.exists(addDocId) ? 1 : 2
            if (isNew === 2) {
                (<ICreateUpdate>addDoc).createdAt = new Date().toJSON()
            }
            (<ICreateUpdate>addDoc).updatedAt = new Date().toJSON()
        }

        // Check for extra fields
        for (const [pK,pV] of Object.entries(addDoc)) {
            if (pK in this.fieldData) continue

            // Developer routes
            if (config.devRoutes) {
                if (isNew === 0)
                    isNew = await this.db.exists(addDocId) ? 1 : 2
                // Clean existing documents
                if (isNew === 1) {
                    console.warn(`deleting key ${this.className}.${pK} from existing doc [${JSON.stringify(addDoc)}]`)
                    delete (<any>addDoc)[pK]
                    continue
                }
            }

            throw this.error(
                'addToReferenceMap',
                HTTPStatus.BAD_REQUEST,
                'Excess data provided',
                `${this.className}.${pK} [${pV}] was not expected in (${JSON.stringify(addDoc)})`
            )
        }

        // Add DB key
        addDoc._key = convertToKey(addDocId)

        for (let [k, data] of this.fieldEntries) {
            // key of doc
            let key = k as keyof Type
            
            // Check for missing fields
            if (!(key in addDoc)) {
                if (data.default !== undefined) {
                    console.warn(`Using default ${data.default} for ${key}`)
                    addDoc[key] = <any>data.default
                    continue
                } else if (data.optional) {
                    console.warn(`optional key ${key} dne`)
                    continue
                } else {
                    if (isNew === 0)
                        isNew = await this.db.exists(addDocId) ? 1 : 2
                    if (isNew !== 2) {
                        console.warn(`key ${key} is missing in revised document`)
                        continue
                    }
                    throw this.error(
                        'addToReferenceMap',
                        HTTPStatus.BAD_REQUEST,
                        'Missing required field',
                        `${key} dne in ${JSON.stringify(addDoc)}`
                    )
                }
            }

            // The value associated with this key
            let value = addDoc[key]

            // Validate types
            switch(data.type) {
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
                // TODO: array type checking
                case 'array':
                    if (!Array.isArray(value)) {
                        throw this.error(
                            'addToReferenceMap',
                            HTTPStatus.BAD_REQUEST,
                            'Invalid document field type',
                            `${this.className}.${key} ${value} expected to be array`
                        )
                    }
                    continue
                // TODO: object type checking
                case 'object':
                    continue
            }

            // v FOREIGN OBJECTS v
            let fdata = data as IForeignFieldData
            const ref = (d: any) =>
                fdata.foreignApi.ref(user, files, d, addDocId, data, map)
            switch (fdata.type) {
                // Ref single doc
                case 'fkey':
                    addDoc[key] = await ref(value)
                    continue
                // Ref array of docs
                case 'fkeyArray':
                    if (Array.isArray(value)) {
                        addDoc[key] = <any>await Promise.all(value.map(
                            lpDoc => ref(lpDoc)
                        ))
                        continue
                    }
                    if (typeof value === 'string') {
                        addDoc[key] = <any>[
                            await ref(value)
                        ]
                        continue
                    }
                    throw this.error(
                        'addToReferenceMap',
                        HTTPStatus.BAD_REQUEST,
                        'Invalid document field type',
                        `${value} expected to be an array`
                    )
                // Ref step obj of docs
                case 'fkeyStep':
                    if (typeof value === 'object') {
                        let temp:any = {}
                        for (let [stepId, stepAr] of Object.entries(value)) {
                            if (Array.isArray(stepAr)) {
                                temp[stepId] = <any>await Promise.all(
                                    stepAr.map(lpDoc => ref(lpDoc))
                                )
                                continue
                            }
                            throw this.error(
                                'addToReferenceMap',
                                HTTPStatus.BAD_REQUEST,
                                'Invalid document field type',
                                `${value} expected to be an array`
                            )
                        }
                        addDoc[key] = temp
                        continue
                    }
                    throw this.error(
                        'addToReferenceMap',
                        HTTPStatus.BAD_REQUEST,
                        'Invalid document field type',
                        `${JSON.stringify(value)} expected to be an step array`
                    )
                case 'parent':
                    continue
                default:
                    throw this.error(
                        'forEachForeignKey',
                        HTTPStatus.INTERNAL_SERVER_ERROR,
                        'Invalid system state',
                        `${JSON.stringify(data)} has invalid .type field`
                    )
            }
        }

        // Add the document to the map
        if (map.has(this)) {
            map.get(this)?.push(addDoc)
        } else {
            map.set(this, [addDoc])
        }
    }

    public async create(
        user: AuthUser,
        files: any,
        doc: Type,
        real: boolean
    ) {
        let id = this.db.generateDBID()

        // The passed document has a parent key, so we need to
        // update the parent to include this document
        // if (this.parentKey && this.parentKey.local in doc) {
        //     // TODO
        // }

        // Turns a fully-dereferenced document into a reference
        // document
        let map = new Map<DBManager<IArangoIndexes>, IArangoIndexes[]>()
        await this.addToReferenceMap(user, files, id, doc, map, 2)

        real || console.log('FAKING CREATE')
        // Saves each document in the map to its respective collection
        try {
            for (let [api, docs] of map) {
                for (let doc of docs) {
                    console.log(`Saving ${api.className} | ${JSON.stringify(doc)}`)
                    real && await api.db.saveUnsafe(doc)
                }
            }
        } catch (err:any) {
            // Delete malformed documents
            console.error(`Error with saving: ${err}`)
            for (let [api, docs] of map) {
                for (let doc of docs) {
                    if ('_key' in doc) {
                        let k = doc._key as string
                        if (await api.db.exists(k)) {
                            console.log(`Removing malformed doc w/ id ${k}`)
                            await api.db.removeUnsafe(k)
                        }
                    } else {
                        throw this.error(
                            'create',
                            HTTPStatus.INTERNAL_SERVER_ERROR,
                            'Invalid system state',
                            `${JSON.stringify(doc)} lacks _key field`
                        )
                    }
                }
            }

            // If this is an APIError, pass control
            if (err instanceof APIError) {
                throw err
            }
            // Some other error type
            throw this.error(
                'create',
                HTTPStatus.INTERNAL_SERVER_ERROR,
                'Invalid system state',
                JSON.stringify(err)
            )
        }

        return id
    }

    public async update(
        user: AuthUser,
        files: any,
        key: string,
        doc: Type,
        real: boolean
    ) {
        let id = this.db.keyToId(key)

        // We dont need to update all elements, .update does that
        // automatically for us :)

        // TODO: update parent
        // if (this.parentKey) {
        //     //if ()
        // }

        let map = new Map<DBManager<IArangoIndexes>, IArangoIndexes[]>()
        await this.addToReferenceMap(user, files, id, doc, map, 1)

        real || console.log('FAKING UPDATE')
        // Updates each document in the map to its respective collection
        // TODO Delete/revert malformed docs
        for (let [api, docs] of map) {
            for (let d of docs) {
                if (!d._key || !isDBKey(d._key)) {
                    throw this.error(
                        'create',
                        HTTPStatus.INTERNAL_SERVER_ERROR,
                        'Invalid system state',
                        `${d._key} invalid`
                    )
                }
                if (await api.db.exists(d._key)) {
                    console.log(`Updating ${api.className} | ${JSON.stringify(d)}`)
                    real && await api.db.updateUnsafe(d, {
                        mergeObjects: false
                    })
                } else {
                    console.log(`Saving ${api.className} | ${JSON.stringify(d)}`)
                    real && await api.db.saveUnsafe(d)
                }
            }
        }
    }

    /**
     * Deletes a document and all its associated documents
     * @param base True if this is the base call (ie the call that should
     *  update parent fields)
     */
    public async delete(user: AuthUser, key: string, real: boolean, base: boolean) {
        let doc = await this.db.get(key)

        // Delete children
        doc = await this.mapForeignKeys(doc, async(k,data) => {
            if (typeof k !== 'string') {
                throw this.error(
                    'delete.mapForeignKeys',
                    HTTPStatus.INTERNAL_SERVER_ERROR,
                    'Invalid system state',
                    `[${k}] is not a string`
                )
            }
            return data.foreignApi.delete(user, k, real, false)
        }, (data) => !data.freeable)

        // Update parent
        // The original call is the only one that should update
        // the parent field
        if (base && this.parentField) {
            let localId = this.parentField.local
            if (localId in doc) {
                let parentId = (<any>doc)[localId]
                if (!this.db.isDBId(parentId)) {
                    throw this.error(
                        'delete',
                        HTTPStatus.INTERNAL_SERVER_ERROR,
                        'Invalid system state',
                        `Parent id [${parentId}] invalid`
                    )
                }
                await getApiInstanceFromId(parentId)
                    .removeReference(
                        doc._id as string,
                        this.parentField.foreign,
                        real
                    )
            } else {
                throw this.error(
                    'delete',
                    HTTPStatus.INTERNAL_SERVER_ERROR,
                    'Invalid system state',
                    `Parent id key ${this.className}.${localId} dne in ${doc}`
                )
            }
        }

        console.log(`${real ? 'DELETING' : 'FAKE DELETING'} ${this.className} | ${key} | ${doc}`)
        real && await this.db.removeUnsafe(key)
    }
}
