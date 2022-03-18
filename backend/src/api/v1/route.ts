import Router from "@koa/router"
import { aql } from "arangojs"
import { GeneratedAqlQuery } from "arangojs/aql"
import { CollectionUpdateOptions, DocumentCollection } from "arangojs/collection"

import { config } from "../../config"
import { APIError, HTTPStatus } from "../../lms/errors"
import { db } from "../../database"
import { IArangoIndexes, ICreateUpdate } from "../../lms/types"
import { convertToKey, generateDBID, isDBId, isDBKey, keyToId, splitId } from "../../lms/util"
import { AuthUser } from "../auth"

interface DBData {
    type:'string' | 'boolean' | 'object' | 'parent' | 'fkey' | 'fkeyArray' | 'fkeyStep' | 'array',
    optional?:boolean,
    default?:any,
    hideGetAll?:boolean,
    hideGetId?:boolean,
    // True if this key should be shown in dereferenced docs
    hideGetRef?:boolean,
    // True if this key shouldn't be dereferenced
    getIdKeepAsRef?:boolean,
    // True if this foreign key should accept built documents
    acceptNewDoc?:boolean,
    // The foreign ApiRoute that manages this document
    foreignApi?:ApiRoute<IArangoIndexes>,
    // If set, this key is a parent key pointing to the local key set in this field
    // ie. module is a parent of task.
    //   module[tasks] <-> task[module]
    //   so tasks.module.parentReferenceKey = tasks
    parentReferenceKey?:string,
    // The foreign data that manages this document
    // foreignData?:
    // True if this foreign object reference can be freely deleted
    freeable?:boolean,
}

/**
 * Makes an AQL query representing a return field of the form
 * [key1:z.key1,key2:z.key2, ...]
 * and appends it to the passed AQL query.
 * @param q The AQL query to append to
 * @param fields An array of string keys
 * @return A new AQL query
 */
function appendReturnFields(q:GeneratedAqlQuery, fields: string[]) {
    fields.forEach((s, i) => {
        q = aql`${q}${s}:z.${s},`
    })
    return q
}

/**
 * Returns the ApiRoute instance corresponding to a database id
 * @param id A db id of the form [name/id]
 * @returns The corresponding ApiRoute
 */
export function getApiInstanceFromId(id: string): ApiRoute<IArangoIndexes> {
    return instances[splitId(id).col]
}
const instances: {[name:string]: ApiRoute<IArangoIndexes>} = {}

/**
 * Route class that manages DB calls and http requests from the client
 * @abstract @class
 * @classdesc Wrapper for DB functions
 * @param Type DB interface representing the data returned by its DB calls
 */
export abstract class ApiRoute<Type extends IArangoIndexes> {
    static ASC = aql`ASC`
    static DESC = aql`DESC` 

    protected collection: DocumentCollection<Type>
    protected getAllQueryFields: GeneratedAqlQuery

    // Caches
    private fieldEntries:[string, DBData][]
    private foreignEntries:[string, ApiRoute<IArangoIndexes>][]
    private parentField: null | {
        local:string, foreign:string
    }

    public async exists(id: string) {
        return this.collection.documentExists(id)
    }

    protected async getUnsafe(id: string): Promise<Type> {
        return this.collection.document(id)
    }

    protected async saveUnsafe(doc: Type) {
        return this.collection.save(doc)
    }

    protected async updateUnsafe(doc: Type, opt: CollectionUpdateOptions) {
        return this.collection.update(doc._key as string, doc, opt)
    }

    protected async removeUnsafe(id: string) {
        await this.collection.remove(id)
    }

    public keyToId(key: string) { return keyToId(key, this.dbName) }
    public generateDBID() { return generateDBID(this.dbName) }

    private getForeignApi(data:DBData) {
        if (!data.foreignApi) {
            throw this.error(
                'getForeignApi',
                HTTPStatus.INTERNAL_SERVER_ERROR,
                'Invalid system state',
                `${JSON.stringify(data)} has invalid .foreignApi field`
            )
        }
        return data.foreignApi
    }

    /**
     * Builds an error with the provided fields
     */
    protected error(
        fn:string,
        status:HTTPStatus,
        message?:string,
        verbose?:string
    ): APIError {
        return new APIError(
            this.dbName,
            fn,
            status,
            message,
            verbose
        )
    }

    /**
     * Runs the passed function on each foreign key in the document
     */
    protected async mapForeignKeys(
        doc:Type,
        fn:(
            key:string,
            data:DBData,
        ) => Promise<any>,
        skippable?:(
            data:DBData,
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
            data:DBData,
        ) => Promise<any>,
        // Runs for each foreign array
        arrCall:(
            pointer:{doc:any,key:string | number | symbol},
            arr:Array<string>,
            data:DBData,
        ) => Promise<any>,
        // Runs for each foreign step object
        stpCall:(
            pointer:{doc:any,key:string | number | symbol},
            stp:{[index:string]:Array<string>},
            data:DBData,
        ) => Promise<any>,
        skippable?:(
            data:DBData,
        ) => boolean,
    ) : Promise<Type> {
        for (let [fkey,clazz] of this.foreignEntries) {
            let data = this.fields[fkey]

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
                case 'fkeyArray':
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
                case 'fkeyStep':
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
                    throw this.error(
                        'forEachForeignKey',
                        HTTPStatus.INTERNAL_SERVER_ERROR,
                        'Invalid system state',
                        `${JSON.stringify(data)} has invalid .type field (expected foreign key)`
                    )
            }
        }

        return doc
    }

    /**
     * @param name Database name
     * @param dname Display name, returned from requests and logs
     * @param fields All fields associated with the db type and their relevant data
     * @param hasDate True if Type has a createdAt and updatedAt field
     * @param foreignFields Maps a local key to its foreign key and API class
     * 
     */
    constructor(
        public dbName: string,
        protected routeName: string,
        protected displayName: string,
        protected fields: {
            [key:string]: DBData
        },
        /**
         * Create/Update timestamp
         */
        protected hasCUTimestamp: boolean,
        /**
         * These fields should exist in this.fields.
         */
        // private foreignClasses: {
        //     [local:string] : ApiRoute<IArangoIndexes>
        // },
        // private parentField: null | {
        //     local:string, foreign:string
        // }
    ) {
        if (this.hasCUTimestamp) {
            fields['createdAt'] = {type:'string'}
            fields['updatedAt'] = {type:'string'}
        }

        // Caches
        this.collection = db.collection(this.dbName)
        this.fieldEntries = Object.entries(this.fields)
        this.foreignEntries = []
        this.parentField = null

        let gaKeys:string[] = []
        for (let [key,data] of this.fieldEntries) {
            if (!data.hideGetAll) {
                gaKeys = gaKeys.concat(key)
            }
            if (data.foreignApi) {
                this.foreignEntries.push([key, data.foreignApi])
            }
            if (data.parentReferenceKey) {
                this.parentField = {
                    local: key,
                    foreign: data.parentReferenceKey,
                }
            }
        }

        // Fields to return from a getAll query
        this.getAllQueryFields = appendReturnFields(aql`id:z._key,`, gaKeys)

        // Debug document schema for test.js
        if (config.devRoutes) {
            console.log(this.dbName)
            console.log(JSON.stringify(this.fields))
        }
    }

    protected getAllQuery(
        collection: DocumentCollection,
		sort: GeneratedAqlQuery,
		sortDir: GeneratedAqlQuery,
		offset: number, 
		count: number,
        queryFields: GeneratedAqlQuery,
        filterIds: string[]
    ): GeneratedAqlQuery {
        let query = aql`FOR z IN ${collection} SORT z.${sort} ${sortDir}`

        if (filterIds.length > 0) {
            query = aql`${query} FILTER z._key IN ${filterIds}`
        }

        return aql`${query} LIMIT ${offset}, ${count} RETURN {${queryFields}}`
    }

    /**
     * Converts all IDs (with collection) in the document to keys
     * (without collection). Only called by GET/
     */
    private async convertIds(doc:Type) : Promise<Type> {
        return this.mapForeignKeys(doc, async (k,d) => {
            if (typeof k === 'string' && isDBId(k)) {
                return splitId(k).key
            } else if (typeof k === 'object') {
                return k
            }
            throw this.error(
                'convertIds',
                HTTPStatus.INTERNAL_SERVER_ERROR,
                'Invalid document status',
                `${this.dbName} [${k}] expected to be a DB id`
            )
        })
    }

    /**
     * Retrieves a query from the server, following the passed parameters.
     * @param q An object with query fields.
     *  - sort [id, ASC/DESC]
     *  - range [offset, count]
     * @return A cursor representing all db objects that fit the query 
     */
    protected async query(q: any) {
        let sort = aql`_key`
        let sortDir = ApiRoute.ASC
        let offset = 0
        let count = 10

        let filterIds:string[] = []

        // TODO: implement generic filtering
        if (q.filter) {
            let filter = JSON.parse(q.filter)
            if (filter) {
                if ('id' in filter && Array.isArray(filter.id)) {
                    filterIds = filter.id.map((s:string) => convertToKey(s))
                }
            }
        }

        // Sorting
        if (q.sort && q.sort.length == 2) {
            for (let [key] of this.fieldEntries) {
                if (key === q.sort[0]) {
                    sort = aql`${q.sort[0]}`
                    break
                }
            }
            sortDir = q.sort[1] === 'DESC' ? ApiRoute.DESC : ApiRoute.ASC
        }

        if (q.range && q.range.length == 2) {
            offset = parseInt(q.range[0])
            count = Math.min(parseInt(q.range[1]), 50)
        }

        let query = this.getAllQuery(
            this.collection,
            sort,sortDir,
            offset,count,
            this.getAllQueryFields,
            filterIds
        )

        return {
            cursor: await db.query(query),
            size: (await this.collection.count()).count,
            low: offset,
            high: offset + count,
        }
    }

    /**
     * Gets the document with the passed key from the database
     * @param id A (valid) db id for the document
     * @param dereference If true, dereference all foreign keys in this and all other documents
     * @return A Type representing a document with key, with .id set and ._* removed
     */
    public async getFromDB(user: AuthUser, id: string) : Promise<Type> {
        let doc = await this.getUnsafe(id)
    
        doc.id = doc._key
        delete doc._key
        delete doc._id
        delete doc._rev

        for (let [k, data] of this.fieldEntries) {
            if (data.hideGetId) {
                delete (<any>doc)[k]
            }
        }

        return this.mapForeignKeys(doc, async (k,data) => {
            if (typeof k === 'string') {
                if (data.getIdKeepAsRef) {
                    return convertToKey(k)
                // Dereference the id into an object
                } else if (isDBId(k)) {
                    return this.getForeignApi(data).getFromDB(user, k)
                }
            }
            throw this.error(
                'getFromDB.mapForeignKeys',
                HTTPStatus.INTERNAL_SERVER_ERROR,
                'Invalid document status',
                `[${k}] expected to be a valid DB id`
            )
        })
    }

    /**
     * Accepts a non id/key string and converts it into a valid document
     */
    protected buildFromString(user:AuthUser,str:string,par:string) : Type | null { return null }

    /**
     * Modifies a document. Called after verifying all fields exist,
     * and after dereferencing all keys
     */
    protected async modifyDoc(user:AuthUser,doc:any,id:string) { return doc }

    /**
     * Validates a document reference
     * @return The id of the new document
     */
    private async ref(
        user: AuthUser,
        doc:any,
        par:string,
        data:DBData,
        map: Map<ApiRoute<IArangoIndexes>, IArangoIndexes[]>,
    ) : Promise<any> {
        if (typeof doc === 'string') {
            // Check if foreign key reference is valid
            if ((isDBId(doc) || isDBKey(doc)) && await this.exists(doc)) {
                // Convert from key to id
                return isDBKey(doc) ? this.keyToId(doc) : doc
            }

            if (data.acceptNewDoc) {
                let built = this.buildFromString(user, doc, par)
                if (built) {
                    let childId = this.generateDBID()
                    await this.addToReferenceMap(user, childId, built, map, 2)
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
            let isNew:0|1|2 = doc.id && await this.exists(doc.id) ? 1 : 2

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
                ? this.generateDBID()
                // Document exists, however it's a key
                : this.keyToId(doc.id)

            await this.addToReferenceMap(user, childId, doc, map, isNew)
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
        addDocId: string,
        addDoc: Type,
        map: Map<ApiRoute<IArangoIndexes>, IArangoIndexes[]>,
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
        addDoc = await this.modifyDoc(user, addDoc, addDocId)

        if (this.hasCUTimestamp) {
            if (isNew === 0)
                isNew = await this.exists(addDocId) ? 1 : 2
            if (isNew === 2) {
                (<ICreateUpdate>addDoc).createdAt = new Date().toJSON()
            }
            (<ICreateUpdate>addDoc).updatedAt = new Date().toJSON()
        }

        // Check for extra fields
        for (const [pK,pV] of Object.entries(addDoc)) {
            if (pK in this.fields) continue

            // Developer routes
            if (config.devRoutes) {
                if (isNew === 0)
                    isNew = await this.exists(addDocId) ? 1 : 2
                // Clean existing documents
                if (isNew === 1) {
                    console.warn(`deleting key ${this.dbName}.${pK} from existing doc [${JSON.stringify(addDoc)}]`)
                    delete (<any>addDoc)[pK]
                    continue
                }
            }

            throw this.error(
                'addToReferenceMap',
                HTTPStatus.BAD_REQUEST,
                'Excess data provided',
                `${this.displayName}.${pK} [${pV}] was not expected in (${JSON.stringify(addDoc)})`
            )
        }

        // Add DB key
        addDoc._key = convertToKey(addDocId)

        for (let [k,data] of this.fieldEntries) {
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
                        isNew = await this.exists(addDocId) ? 1 : 2
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
                    if (typeof value === data.type) {
                        continue
                    }
                    throw this.error(
                        'addToReferenceMap',
                        HTTPStatus.BAD_REQUEST,
                        'Invalid document field type',
                        `${this.dbName}.${key} ${value} expected to be ${data.type}`
                    )
                // TODO: array type checking
                case 'array':
                    if (!Array.isArray(value)) {
                        throw this.error(
                            'addToReferenceMap',
                            HTTPStatus.BAD_REQUEST,
                            'Invalid document field type',
                            `${this.dbName}.${key} ${value} expected to be array`
                        )
                    }
                    continue
                // TODO: object type checking
                case 'object':
                    continue
                /*
                    v FOREIGN OBJECTS v
                */
                // Ref single doc
                case 'fkey':
                    addDoc[key] = await this.getForeignApi(data).ref(
                        user,
                        value,
                        addDocId,
                        data,
                        map,
                    )
                    continue
                // Ref array of docs
                case 'fkeyArray':
                    let clsar = this.getForeignApi(data)
                    if (Array.isArray(value)) {
                        addDoc[key] = <any>await Promise.all(value.map(
                            lpDoc => clsar.ref(
                                user,
                                lpDoc,
                                addDocId,
                                data,
                                map,
                            )
                        ))
                        continue
                    }
                    if (typeof value === 'string') {
                        addDoc[key] = <any>[
                            await clsar.ref(
                                user,
                                value,
                                addDocId,
                                data,
                                map,
                            )
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
                    let clsst = this.getForeignApi(data)
                    if (typeof value === 'object') {
                        let temp:any = {}
                        for (let [stepId, stepAr] of Object.entries(value)) {
                            if (Array.isArray(stepAr)) {
                                temp[stepId] = <any>await Promise.all(
                                    stepAr.map(lpDoc => clsst.ref(
                                        user,
                                        lpDoc,
                                        addDocId,
                                        data,
                                        map,
                                    ))
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

    protected async create(user: AuthUser, id: string, doc: Type, real: boolean) {
        // The passed document has a parent key, so we need to
        // update the parent to include this document
        // if (this.parentKey && this.parentKey.local in doc) {
        //     // TODO
        // }

        // Turns a fully-dereferenced document into a reference
        // document
        let map = new Map<ApiRoute<IArangoIndexes>, IArangoIndexes[]>()
        await this.addToReferenceMap(user, id, doc, map, 2)

        real || console.log('FAKING CREATE')
        // Saves each document in the map to its respective collection
        try {
            for (let [api, docs] of map) {
                for (let doc of docs) {
                    console.log(`Saving ${api.displayName} | ${JSON.stringify(doc)}`)
                    real && await api.saveUnsafe(doc)
                }
            }
        } catch (err:any) {
            // Delete malformed documents
            console.error(`Error with saving: ${err}`)
            for (let [api, docs] of map) {
                for (let doc of docs) {
                    if ('_key' in doc) {
                        let k = doc._key as string
                        if (await api.exists(k)) {
                            console.log(`Removing malformed doc w/ id ${k}`)
                            await api.removeUnsafe(k)
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
            if (err.fn) {
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
    }

    protected async update(user: AuthUser, key: string, doc: Type, real: boolean) {
        let id = this.keyToId(key)

        // We dont need to update all elements, .update does that
        // automatically for us :)

        // TODO: update parent
        // if (this.parentKey) {
        //     //if ()
        // }

        let map = new Map<ApiRoute<IArangoIndexes>, IArangoIndexes[]>()
        await this.addToReferenceMap(user, id, doc, map, 1)

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
                if (await api.exists(d._key)) {
                    console.log(`Updating ${api.displayName} | ${JSON.stringify(d)}`)
                    real && await api.updateUnsafe(d, {
                        mergeObjects:false
                    })
                } else {
                    console.log(`Saving ${api.displayName} | ${JSON.stringify(d)}`)
                    real && await api.saveUnsafe(d)
                }
            }
        }
    }
    
    private async addReference(id:string, field:string, real:boolean) {
        throw this.error(
            'addReference',
            HTTPStatus.NOT_IMPLEMENTED
        )
    }

    private async removeReference(id:string, field:string, real:boolean) {
        throw this.error(
            'removeReference',
            HTTPStatus.NOT_IMPLEMENTED
        )
    }

    /**
     * Deletes a document and all its associated documents
     * @param base True if this is the base call (ie the call that should
     *  update parent fields)
     */
    protected async delete(user: AuthUser, key: string, real: boolean, base: boolean) {
        if (!await this.exists(key)) {
            console.warn(`Document with id ${key} dne, due to malformed document`)
            return
        }

        let doc = await this.getUnsafe(key)

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
            return this.getForeignApi(data).delete(user, k, real, false)
        }, (data) => !data.freeable)

        // Update parent
        // The original call is the only one that should update
        // the parent field
        if (base && this.parentField) {
            let localId = this.parentField.local
            if (localId in doc) {
                let parentId = (<any>doc)[localId]
                if (!isDBId(parentId)) {
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
                    `Parent id key ${this.dbName}.${localId} dne in ${doc}`
                )
            }
        }

        console.log(`${real ? 'DELETING' : 'FAKE DELETING'} ${this.displayName} | ${key} | ${doc}`)
        real && await this.collection.remove(key)
    }

    /**
     * Removes all orphaned documents from this collection.
     * A document is an orphan if:
     * - It has a parent field that points to a document that does not exist.
     * - It should have a parent field, but doesn't
     * - It has an invalid parent field
     * NOTE: VERY EXPENSIVE, don't run that often
     */
    private async deleteOrphans() {
        if (!this.parentField) {
            throw this.error(
                'deleteOrphans',
                HTTPStatus.INTERNAL_SERVER_ERROR,
                'Invalid system state',
                `deleteOrphans called on ${this.dbName}`
            )
        }

        // Filters documents with parent fields that cannot be properly
        // dereferenced [DOCUMENT(d.parent) === null]
        return db.query(aql`FOR d IN ${this.collection} FILTER DOCUMENT(d.${this.parentField.local})._id == null REMOVE d IN ${this.collection}`)
    }

    /**
     * Removes all abandoned documents from this collection.
     * A document is abandoned iff:
     * - It has a parent field that points to a valid document
     * - AND its parent document does not hold a reference to it
     * NOTE: VERY EXPENSIVE, don't run that often
     */
    private async deleteAbandoned() {
        // Not implemented :)
        return
    }

    /**
     * Removes all foreign key references for documents in this collection that no longer point to valid documents.
     * NOTE: EXCEPTIONALLY EXPENSIVE, only run when necessary
     */
    private async disown() {
        if (this.foreignEntries.length === 0) return

        let cursor = await db.query(aql`FOR d in ${this.collection} RETURN d`)

        while (cursor.hasNext) {
            // Async ??
            let doc = await cursor.next()

            // Delete disowned children
            await this.updateUnsafe(await this.forEachForeignKey(
                doc,
                async (p,k,d) => {
                    let c = this.getForeignApi(d)
                    if (!isDBId(k) || !c.exists(k)) {
                        p.doc[p.key] = <any>''
                    }
                },
                async (p,a,d) => {
                    let c = this.getForeignApi(d)
                    for (var i = a.length - 1; i >= 0; i--) {
                        if (!isDBId(a[i]) || !c.exists(a[i])) {
                            a.splice(i, 1)
                        }
                    }
                },
                async (p,o,d) => {
                    let c = this.getForeignApi(d)
                    for (let k in o) {
                        let sAr = o[k]

                        if (!Array.isArray(sAr)) {
                            throw this.error(
                                'disown',
                                HTTPStatus.INTERNAL_SERVER_ERROR,
                                'Invalid system state',
                                `${sAr} is not an array`
                            )
                        }
                        for (var i = sAr.length - 1; i >= 0; i--) {
                            if (!isDBId(sAr[i]) || !c.exists(sAr[i])) {
                                sAr.splice(i, 1)
                            }
                        }
                        // Delete empty steps
                        if (sAr.length === 0) delete o[k]
                    }
                }
            ), {
                mergeObjects:false,
            })
        }
    }

    makeRouter(router?:Router) {
        let r = router || new Router({prefix:this.routeName})
        // Orphan delete
        if (config.devRoutes && this.parentField) {
            r.delete('/orphan', async (ctx,next) => {
                if (ctx.header['user-agent'] === 'backend-testing') {
                    await this.deleteOrphans()
                    ctx.status = HTTPStatus.OK
                }
                await next()
            })
        }
        // Disown update
        if (config.devRoutes && this.foreignEntries.length !== 0) {
            r.delete('/disown', async (ctx,next) => {
                if (ctx.header['user-agent'] === 'backend-testing') {
                    await this.disown()
                    ctx.status = HTTPStatus.OK
                }
                await next()
            })
        }
        r.get('/', async (ctx, next) => {
            const qdata = await this.query(ctx.request.query)
            let all = await qdata.cursor.all()

            // Convert all document foreign ids to keys
            await Promise.all(all.map(
                async doc => this.convertIds(doc)
            ))

            ctx.status = HTTPStatus.OK
            ctx.body = all

            ctx.set('Content-Range', `${this.dbName} ${qdata.low}-${qdata.high}/${qdata.size}`)
            ctx.set('Access-Control-Expose-Headers', 'Content-Range')

            await next()
        })
        r.get('/:id', async (ctx, next) => {
            if (await this.exists(ctx.params.id)) {
                ctx.body = await this.getFromDB(
                    ctx.state.user, ctx.params.id)
                ctx.status = HTTPStatus.OK

                await next()
            } else {
                ctx.status = HTTPStatus.NOT_FOUND
                ctx.body = `${this.displayName} [${ctx.params.id}] dne.`
            }
        })
        r.post('/', async (ctx, next) => {
            console.log(`${this.dbName}: ${JSON.stringify(ctx.request.body)}`)
            console.log(`\tfiles: ${JSON.stringify(ctx.request.files)}`)

            let doc = ctx.request.body as Type
            let newID = this.generateDBID()

            await this.create(
                ctx.state.user, newID, doc,
                ctx.header['user-agent'] !== 'backend-testing')

            ctx.status = HTTPStatus.CREATED
            ctx.body = {
                id: splitId(newID).key,
                message: `${this.displayName} created with id [${newID}]`
            }

            await next()
        })
        r.put('/:id', async (ctx, next) => {
            if (await this.exists(ctx.params.id)) {
                await this.update(
                    ctx.state.user, ctx.params.id, ctx.request.body,
                    ctx.header['user-agent'] !== 'backend-testing')
                ctx.status = HTTPStatus.OK
                ctx.body = {
                    id: ctx.params.id,
                    message: `${this.displayName} [${ctx.params.id}] updated`,
                }

                await next()
            } else {
                ctx.status = HTTPStatus.CONFLICT
                ctx.body = `${this.displayName} [${ctx.params.id}] dne`
            }
        })
        r.delete('/:id', async (ctx, next) => {
            if (await this.exists(ctx.params.id)) {
                await this.delete(
                    ctx.state.user, ctx.params.id,
                    ctx.header['user-agent'] !== 'backend-testing',
                    true)
                ctx.status = HTTPStatus.OK
                ctx.body = {
                    id: ctx.params.id,
                    message: `${this.displayName} deleted`,
                }

                await next()
            } else {
                ctx.status = HTTPStatus.NOT_FOUND
                ctx.body = `${this.displayName} [${ctx.params.id}] dne`
            }
        })
        return r
    }
}
