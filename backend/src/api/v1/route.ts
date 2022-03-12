import Router from "@koa/router"
import { aql } from "arangojs"
import { GeneratedAqlQuery } from "arangojs/aql"
import { CollectionUpdateOptions, DocumentCollection } from "arangojs/collection"
import { ParameterizedContext } from "koa"

import { db } from "../../database"
import { IArangoIndexes, ICreateUpdate } from "../../lms/types"
import { convertToKey, generateDBID, isDBId, isDBKey, keyToId, splitId } from "../../lms/util"
import { AuthUser } from "./users"

interface DBData {
    type:'string' | 'boolean' | 'object' | 'parent' | 'fkey' | 'fkeyArray' | 'fkeyStep',
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
    isForeign?:boolean,
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

    protected async exists(id: string) {
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

    /**
     * @param name Database name
     * @param dname Display name, returned from requests and logs
     * @param fields All fields associated with the db type and their relevant data
     * @param hasDate True if Type has a createdAt and updatedAt field
     * @param foreignFields Maps a local key to its foreign key and API class
     * 
     */
    constructor(
        public name: string,
        protected dname: string,
        protected fields: {
            [key:string]: DBData
        },
        /**
         * Create/Update timestamp
         */
        protected hasCUTimestamp: boolean,
        /**
         * These fields should exist in fields.
         *
         */
        private foreignClasses: {
            [local:string] : ApiRoute<IArangoIndexes>
        },
        private parentField: null | {
            local:string, foreign:string
        }
    ) {
        if (this.hasCUTimestamp) {
            fields['createdAt'] = {type:'string'}
            fields['updatedAt'] = {type:'string'}
        }

        this.collection = db.collection(this.name)
        this.fieldEntries = Object.entries(this.fields)
        this.foreignEntries = Object.entries(this.foreignClasses)

        let gaKeys:string[] = []
        for (let [key,data] of this.fieldEntries) {
            if (!data.hideGetAll) {
                gaKeys = gaKeys.concat(key)
            }
            if (key in this.foreignClasses) {
                data.isForeign = true
            }
        }

        if (this.parentField) {
            this.fields[this.parentField.local].isForeign = true
        }

        this.getAllQueryFields = appendReturnFields(aql`id:z._key,`, gaKeys)
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
     * (without collection)
     */
    private convertIds(doc:Type) {
        for (let [key,cls] of this.foreignEntries) {
            if (key in doc) {
                let local = key as keyof Type
                let foreign = doc[local]

                let data = this.fields[key]

                switch (data.type) {
                    case 'fkey':
                        if (typeof foreign === 'string') {
                            doc[local] = <any>splitId(foreign).key
                            continue
                        } else if (typeof foreign === 'object') {
                            continue
                        }
                        throw new TypeError(`${JSON.stringify(foreign)} was expected to be a string`)
                    case 'fkeyArray':
                        if (Array.isArray(foreign)) {
                            doc[local] = <any>foreign.map(
                                k => splitId(k).key
                            )
                            continue
                        }
                        throw new TypeError(`${JSON.stringify(foreign)} was expected to be an array`)
                    case 'fkeyStep':
                        if (typeof foreign === 'object') {
                            let temp:any = {}
                            for (let [sid, sar] of Object.entries(foreign)) {
                                if (Array.isArray(sar)) {
                                    temp[sid] =
                                        sar.map(k => splitId(k).key)
                                } else {
                                    throw new TypeError(`${sar} is not an array`)
                                }
                            }
                            doc[local] = temp
                            continue
                        }
                        throw new TypeError(`${JSON.stringify(foreign)} was expected to be a step object`)
                    default:
                        throw new TypeError(`INTERNAL ERROR: ${data} has invalid type.`)
                }
            } else {
                console.warn(`${key} dne in doc`)
            }
        }
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
    public async getFromDB(user: AuthUser, id: string, dereference: boolean) {
        let doc = await this.getUnsafe(id)
    
        doc.id = doc._key
        delete doc._key
        delete doc._id
        delete doc._rev
    
        if (!dereference) {
            return doc
        }
        /**
         * Local function to dereference the passed id corresponding to
         * the passed route.
         */
        async function deref(k:string, r:ApiRoute<IArangoIndexes>) {
            if (isDBId(k)) {
                return <any>r.getFromDB(user, k, true)
            } else {
                throw new TypeError(`Foreign key [${k}] is not a valid id. Did you forget the collection name? (name/key)`)
            }
        }

        // Loop over the foreign keys
        for (let [fkey,cls] of this.foreignEntries) {
            let data = this.fields[fkey]

            if (!(fkey in doc)) {
                if (data.optional) {
                    console.warn(`Optional field [${fkey}] dne`)
                    continue
                }
                throw new TypeError(`Field ${fkey} dne in ${JSON.stringify(doc)}`)
            }

            // key of doc pointing to 
            let localKey = fkey as keyof Type
            // An array or string representing the foreign keys
            let foreign = doc[localKey]

            switch (data.type) {
                // Single foreign key
                case 'fkey':
                    if (typeof foreign === 'string') {
                        doc[localKey] = data.getIdKeepAsRef
                            ? convertToKey(foreign)
                            : await deref(foreign, cls)
                        continue
                    }
                    throw new TypeError(`${JSON.stringify(foreign)} was expected to be a string`)
                // Foreign key array
                case 'fkeyArray':
                    if (Array.isArray(foreign)) {
                        // For each foreign key in the array, retrieve it from the database; then store the documents (as an array) back in doc[key]
                        doc[localKey] = <any>await Promise.all(foreign.map(async k => data.getIdKeepAsRef
                            ? convertToKey(k)
                            : deref(k, cls)
                        ))
                        continue
                    }
                    throw new TypeError(`${JSON.stringify(foreign)} was expected to be an array`)
                // Foreign key step object
                case 'fkeyStep':
                    if (typeof foreign === 'object') {
                        let temp:any = {}
                        for (let [stepId, stepArray] of Object.entries(foreign)) {
                            if (Array.isArray(stepArray)) {
                                temp[stepId] = <any>await Promise.all(
                                    stepArray.map(k => data.getIdKeepAsRef
                                        ? convertToKey(k)
                                        : deref(k, cls)
                                    )
                                )
                            } else {
                                throw new TypeError(`${stepArray} is not an array`)
                            }
                        }
                        doc[localKey] = <any>temp
                        continue
                    }
                    throw new TypeError(`${JSON.stringify(foreign)} was expected to be a step object`)
                default:
                    throw new TypeError(`INTERNAL ERROR: ${data} has invalid type.`)
            }
        }
        return doc
    }

    /**
     * Accepts a non id/key string
     */
    protected buildFromString(user: AuthUser,str:string,par:string) : Type | null {
        return null
    }

    /**
     * Modifies a document. Called after verifying all fields exist,
     * and after dereferencing all keys
     */
    protected async modifyDoc(user: AuthUser,doc:any) { return doc }

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
        create: boolean
    ) : Promise<any> {
        if (typeof doc === 'string') {
            // Check if foreign key reference is valid
            if ((isDBId(doc) || isDBKey(doc)) && await this.exists(doc)) {
                // Convert from key to id
                return isDBKey(doc) ? keyToId(doc, this.name) : doc
            }

            if (data.acceptNewDoc) {
                let built = this.buildFromString(user, doc, par)
                if (built) {
                    let childId = generateDBID(this.name)
                    await this.addToReferenceMap(user, childId, built, map, create)
                    return childId
                }
            }

            throw new TypeError(`Foreign key [${doc}] does not exist`)
        // Objects are fully-formed documents
        } else if (typeof doc === 'object') {
            if (!data.acceptNewDoc) {
                throw new TypeError(`New documents [${JSON.stringify(doc)}] not acceptable for this type ${JSON.stringify(data)}`)
            }

            // Update parent field only if it isn't already set
            // TODO: validate existing parent keys
            if (this.parentField && !doc[this.parentField.local]) {
                // We're assigning the parent/module/project field
                // of documents here, so they hold references to
                // their parent.
                doc[this.parentField.local] = par
            }

            let childId = create ? generateDBID(this.name) : doc.id
            await this.addToReferenceMap(user, childId, doc, map, create)
            return childId
        }
        throw new TypeError(`${doc} is not a foreign document or reference`)
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
        create: boolean
    ): Promise<void> {
        delete addDoc.id
        addDoc._key = convertToKey(addDocId)

        if (this.hasCUTimestamp) {
            if (create) {
                (<ICreateUpdate>addDoc).createdAt = new Date(); //??? ; ???
            }
            (<ICreateUpdate>addDoc).updatedAt = new Date()
        }

        for (let [key,data] of this.fieldEntries) {
            // key of doc
            let localKey = key as keyof Type
            
            if (!(key in addDoc)) {
                if (data.default !== undefined) {
                    console.warn(`Using default ${data.default} for ${key}`)
                    addDoc[localKey] = <any>data.default
                    continue
                } else if (data.optional) {
                    console.warn(`optional key ${key} dne`)
                    continue
                } else {
                    throw new TypeError(`${key} dne in ${JSON.stringify(addDoc)}`)
                }
            }

            if (!data.isForeign) {
                continue
            }

            // A foreign key type
            let foreign = addDoc[localKey]
            // Foreign class
            let cls = this.foreignClasses[key]

            switch (data.type) {
                // Ref single doc
                case 'fkey':
                    if (typeof foreign === 'object' || typeof foreign === 'string') {
                        addDoc[localKey] = await cls.ref(
                            user,
                            foreign,
                            addDocId,
                            data,
                            map,
                            create
                        )
                        continue
                    }
                    throw new TypeError(`${foreign} expected to be a document`)
                // Ref array of docs
                case 'fkeyArray':
                    if (Array.isArray(foreign)) {
                        addDoc[localKey] = <any>await Promise.all(foreign.map(
                            lpDoc => cls.ref(
                                user,
                                lpDoc,
                                addDocId,
                                data,
                                map,
                                create
                            )
                        ))
                        continue
                    }
                    if (typeof foreign === 'string') {
                        addDoc[localKey] = <any>[
                            await cls.ref(
                                user,
                                foreign,
                                addDocId,
                                data,
                                map,
                                create
                            )
                        ]
                        continue
                    }
                    throw new TypeError(`${foreign} expected to be an array`)
                // Ref step obj of docs
                case 'fkeyStep':
                    if (typeof foreign === 'object') {
                        let temp:any = {}
                        for (let [stepId, stepAr] of Object.entries(foreign)) {
                            if (Array.isArray(stepAr)) {
                                temp[stepId] = <any>await Promise.all(
                                    stepAr.map(lpDoc => cls.ref(
                                        user,
                                        lpDoc,
                                        addDocId,
                                        data,
                                        map,
                                        create
                                    ))
                                )
                                continue
                            }
                            throw new TypeError(`${stepAr} expected to be an array`)
                        }
                        addDoc[localKey] = temp
                        continue
                    }
                    throw new TypeError(`${JSON.stringify(foreign)} expected to be a step array`)
                case 'parent':
                    continue
                default:
                    throw new TypeError(`INTERNAL ERROR: ${JSON.stringify(data)} has invalid type.`)
            }
        }

        // Modify this document, if required
        addDoc = await this.modifyDoc(user, addDoc)

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
        await this.addToReferenceMap(user, id, doc, map, true)

        real || console.log('FAKING CREATE')
        // Saves each document in the map to its respective collection
        try {
            for (let [api, docs] of map) {
                for (let doc of docs) {
                    console.log(`Saving ${api.name} | ${JSON.stringify(doc)}`)
                    real && await api.saveUnsafe(doc)
                }
            }
        } catch (err) {
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
                        throw new TypeError(`INTERNAL ERROR ${doc} lacks _key field`)
                    }
                }
            }
        }
    }

    protected async update(user: AuthUser, key: string, doc: Type, real: boolean) {
        let id = keyToId(key, this.name)

        // We dont need to update all elements, .update does that
        // automatically for us :)

        // TODO: update parent
        // if (this.parentKey) {
        //     //if ()
        // }

        let map = new Map<ApiRoute<IArangoIndexes>, IArangoIndexes[]>()
        await this.addToReferenceMap(user, id, doc, map, true)

        real || console.log('FAKING UPDATE')
        // Updates each document in the map to its respective collection
        // TODO Delete/revert malformed docs
        for (let [api, docs] of map) {
            for (let d of docs) {
                if (!d._key || !isDBKey(d._key)) {
                    throw new TypeError(`${d._key} invalid`)
                }
                if (await api.exists(d._key)) {
                    console.log(`Updating ${api.name} | ${JSON.stringify(d)}`)
                    real && await api.updateUnsafe(d, {
                        mergeObjects:false
                    })
                } else {
                    console.log(`Saving ${api.name} | ${JSON.stringify(d)}`)
                    real && await api.saveUnsafe(d)
                }
            }
        }
    }
    
    private async addReference(id:string, field:string, real:boolean) {
        throw new Error(`method not implemented lol`)
    }

    private async removeReference(id:string, field:string, real:boolean) {
        throw new Error(`method not implemented lol`)
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
        for (let [fkey,cls] of this.foreignEntries) {
            let data = this.fields[fkey]
            
            if (!data.freeable) {
                continue
            }

            if (!(fkey in doc)) {
                console.warn(`foreign key ${fkey} dne`)
                continue
            }

            let localKey = fkey as keyof Type
            let foreign = doc[localKey]

            switch (data.type) {
                case 'fkey':
                    if (typeof foreign === 'string') {
                        await cls.delete(user, foreign, real, false)
                        continue
                    }
                    throw new TypeError(`${JSON.stringify(foreign)} was expected to be a string`)
                    
                case 'fkeyArray':
                    if (Array.isArray(foreign)) {
                        await Promise.all(foreign.map(
                            d => cls.delete(user, d, real, false)
                        ))
                        continue
                    }
                    throw new TypeError(`${JSON.stringify(foreign)} was expected to be an array`)
                case 'fkeyStep':
                    if (typeof foreign === 'object') {
                        for (let [_,sAr] of Object.entries(foreign)) {
                            if (Array.isArray(sAr)) {
                                await Promise.all(
                                    sAr.map(d => cls.delete(user, d, real, false))
                                )
                            } else {
                                throw new TypeError(`${sAr} is not an array`)
                            }
                        }
                        continue
                    }
                    throw new TypeError(`${JSON.stringify(foreign)} was expected to be a step object`)
                default:
                    throw new TypeError(`INTERNAL ERROR: ${data} has invalid type.`)
            }
        }

        // Update parent
        // The original call is the only one that should update
        // the parent field
        if (base && this.parentField) {
            let localId = this.parentField.local
            if (localId in doc) {
                let parentId = (<any>doc)[localId]
                if (!isDBId(parentId)) {
                    throw new TypeError(`parent id ${parentId} invalid`)
                }
                await getApiInstanceFromId(parentId)
                    .removeReference(
                        doc._id as string,
                        this.parentField.foreign,
                        real
                    )
            } else {
                throw new TypeError(`parent id key ${localId} dne in ${doc}`)
            }
        }

        console.log(`${real ? 'DELETING' : 'FAKE DELETING'} ${this.name} | ${key} | ${doc}`)
        real && await this.collection.remove(key)
    }

    makeRouter() { return new Router({prefix:this.name})
        .get('/', async (ctx, next) => {
            try {
                const qdata = await this.query(ctx.request.query)
                let all = await qdata.cursor.all()

                // Convert all document foreign ids to keys
                all.forEach(
                    doc => this.convertIds(doc)
                )

                ctx.status = 200
                ctx.body = all
    
                ctx.set('Content-Range', `${this.name} ${qdata.low}-${qdata.high}/${qdata.size}`)
                ctx.set('Access-Control-Expose-Headers', 'Content-Range')

                next()
            } catch (err) {
                console.log(err)
                ctx.status = 500
            }
        })
        .get('/:id', async (ctx, next) => {
            try {
                if (await this.exists(ctx.params.id)) {
                    let user = new AuthUser(ctx.cookies.get('token'))

                    ctx.body = await this.getFromDB(user, ctx.params.id, true)
                    ctx.status = 200

                    next()
                } else {
                    ctx.status = 404
                    ctx.body = `${this.dname} [${ctx.params.id}] dne.`
                }
            } catch (err) {
                console.log(err)
                ctx.status = 500
            }
        })
        .post('/', async (ctx, next) => {
            try {
                let doc = ctx.request.body as Type
                let newID = generateDBID(this.name)

                let user = new AuthUser(ctx.cookies.get('token'))
                await this.create(user, newID, doc, ctx.header['user-agent'] !== 'backend-testing')

                ctx.status = 201
                ctx.body = {
                    id: splitId(newID).key,
                    message: `${this.dname} created with id [${newID}]`
                }

                next()
            } catch (err) {
                console.log(err)
                ctx.status = 500
            }
        })
        .put('/:id', async (ctx, next) => {
            try {
                if (await this.exists(ctx.params.id)) {
                    let user = new AuthUser(ctx.cookies.get('token'))
                    await this.update(user, ctx.params.id, ctx.request.body, ctx.header['user-agent'] !== 'backend-testing')
                    ctx.status = 200
                    ctx.body = {
                        id: ctx.params.id,
                        message: `${this.dname} [${ctx.params.id}] updated`,
                    }

                    next()
                } else {
                    ctx.status = 409
                    ctx.body = `${this.dname} [${ctx.params.id}] dne`
                }
            } catch(err) {
                console.log(err)
                ctx.status = 500
            }
        })
        .delete('/:id', async (ctx, next) => {
            try {
                if (await this.exists(ctx.params.id)) {
                    let user = new AuthUser(ctx.cookies.get('token'))
                    await this.delete(user, ctx.params.id, ctx.header['user-agent'] !== 'backend-testing', true)
                    ctx.status = 200
                    ctx.body = {
                        id: ctx.params.id,
                        message: `${this.dname} deleted`,
                    }

                    next()
                } else {
                    ctx.status = 404
                    ctx.body = `${this.dname} [${ctx.params.id}] dne`
                }
            } catch(err) {
                console.log(err)
                ctx.status = 500
            }
        })
    }
}
