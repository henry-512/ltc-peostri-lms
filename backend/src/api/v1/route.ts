import Router from "@koa/router"
import { aql } from "arangojs"
import { GeneratedAqlQuery } from "arangojs/aql"
import { DocumentCollection } from "arangojs/collection"
import { ArrayCursor } from "arangojs/cursor"
import koaBody from "koa-body"

import { db } from "../../database"
import { IArangoIndexes, IComment, ICreateUpdate } from "../../lms/types"
import { generateDBID, isDBId, isDBKey, keyToId, splitId } from "../../lms/util"
import { CommentRouteInstance } from "./comments"

interface DBData {
    type:'string' | 'boolean' | 'object' | 'parent' | 'fkey' | 'fkeyArray' | 'fkeyStep',
    optional?:boolean,
    default?:any,
    hideGetAll?:boolean,
    hideGetId?:boolean,
    hideGetRef?:boolean,
    isForeign?:boolean,
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
    return instances[id.split('/')[0]]
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

    /**
     * @param name Database name
     * @param dname Display name, returned from requests and logs
     * @param fields All fields associated with the db type and their relevant data
     * @param hasDate True if Type has a createdAt and updatedAt field
     * @param foreignFields Maps a local key to its foreign key and API class
     * 
     */
    constructor(
        protected name: string,
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
        queryFields: GeneratedAqlQuery
    ): GeneratedAqlQuery {
        return aql`FOR z in ${collection} SORT z.${sort} ${sortDir} LIMIT ${offset}, ${count} RETURN {${queryFields}}`
    }

    public async exists(id: string) {
        return this.collection.documentExists(id)
    }

    // /**
    //  * Converts all IDs (with collection) in the document to keys
    //  * (without collection)
    //  */
    // private convertIds(doc:Type) {
    //     if (!doc.id || !isDBId(doc.id)) {
    //         throw new TypeError(`Id invalid ${doc}`)
    //     }

    //     for (let [key,cls] of this.foreignEntries) {
    //         if (key in doc) {
    //             let local = key as keyof Type
    //             let foreign = doc[local]

    //             switch (foreign) {

    //             }
    //         } else {
    //             console.warn(`${key} dne in doc`)
    //         }
    //     }
    // }

    /**
     * Retrieves a query from the server, following the passed parameters.
     * @param q An object with query fields.
     *  - sort [id, ASC/DESC]
     *  - range [offset, count]
     * @return A cursor representing all db objects that fit the query 
     */
    protected async query(q: any): Promise<ArrayCursor<Type>> {
        let sort = aql`_key`
        let sortDir = ApiRoute.ASC
        let offset = 0
        let count = 10

        // TODO: implement filtering
        // q.filter

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
            this.getAllQueryFields
        )

        return db.query(query)
    }

    private async getUnsafe(id: string): Promise<Type> {
        return this.collection.document(id)
    }

    /**
     * Gets the document with the passed key from the database
     * @param id A (valid) db id for the document
     * @param dereference If true, dereference all foreign keys in this and all other documents
     * @return A Type representing a document with key, with .id set and ._* removed
     */
    public async getFromDB(id: string, dereference: boolean) {
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
                return <any>r.getFromDB(k, true)
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

            let foreignType = data.type

            switch (foreignType) {
                // Single foreign key
                case 'fkey':
                    if (typeof foreign === 'string') {
                        doc[localKey] = await deref(foreign, cls)
                        break
                    }
                    throw new TypeError(`${JSON.stringify(foreign)} was expected to be a string`)
                // Foreign key array
                case 'fkeyArray':
                    if (Array.isArray(foreign)) {
                        // For each foreign key in the array, retrieve it from the database; then store the documents (as an array) back in doc[key]
                        doc[localKey] = <any>await Promise.all(foreign.map(async k => deref(k, cls)))
                        break
                    }
                    throw new TypeError(`${JSON.stringify(foreign)} was expected to be an array`)
                // Foreign key step object
                case 'fkeyStep':
                    if (typeof foreign === 'object') {
                        let temp:any = {}
                        for (let [stepId, stepArray] of Object.entries(foreign)) {
                            if (Array.isArray(stepArray)) {
                                temp[stepId] = <any>await Promise.all((<string[]>stepArray).map(async (k:string) => deref(k, cls)))
                            } else {
                                throw new TypeError(`${stepArray} is not an array`)
                            }
                        }
                        doc[localKey] = <any>temp
                        break
                    }
                    throw new TypeError(`${JSON.stringify(foreign)} was expected to be a step object`)
                default:
                    throw new TypeError(`INTERNAL ERROR: ${data} has invalid type.`)
            }
        }
        return doc
    }

    /**
     * Adds the passed document, with its id, to the map
     * @param addDocId The db id for the document
     * @param addDoc The document to add to the map
     * @param map The map to add to
     */
    private async addToReferenceMap(
        addDocId: string,
        addDoc: Type,
        map: Map<DocumentCollection, IArangoIndexes[]>
    ): Promise<void> {
        delete addDoc.id
        //addDoc._id = addDocId
        addDoc._key = splitId(addDocId).key

        if (this.hasCUTimestamp) {
            (<ICreateUpdate>addDoc).createdAt = new Date(); //??? ; ???
            (<ICreateUpdate>addDoc).updatedAt = new Date()
        }

        async function ref(doc:any, cls:ApiRoute<IArangoIndexes>) {
            if (typeof doc === 'string') {
                // Check if foreign key reference is valid
                if ((isDBId(doc) || isDBKey(doc)) && await cls.exists(doc)) {
                    // Convert from key to id
                    return isDBKey(doc) ? keyToId(doc, cls.name) : doc
                }
                // NOTE: If this is supposed to be a comment reference
                // but does not exist, this generates a comment.
                if (cls === CommentRouteInstance) {
                    let childId = generateDBID(cls.name)
                    // TODO: input validation
                    let com: IComment = {
                        content: doc,
                        // TODO: Make this into user validation
                        author: 'users/0123456789012345678900',
                        parent: addDocId
                    }
                    await cls.addToReferenceMap(childId, com, map)
                    return childId
                }
                throw new TypeError(`Foreign key [${doc}] does not exist`)
            // Objects are fully-formed documents
            } else if (typeof doc === 'object') {
                if (cls.parentField) {
                    // We're assigning the parent/module/project field
                    // of documents here, so they hold references to
                    // their parent.
                    doc[cls.parentField.local] = addDocId
                }

                let childId = generateDBID(cls.name)
                await cls.addToReferenceMap(childId, doc, map)

                return childId
            }
            throw new TypeError(`${doc} is not a foreign document or reference`)
        }

        for (let [key,data] of this.fieldEntries) {
            // key of doc
            let localKey = key as keyof Type
            
            if (!(key in addDoc)) {
                if (data.default) {
                    console.warn(`Using default ${data.default} for ${key}`)
                    addDoc[localKey] = <any>data.default
                    continue
                } else if (data.optional) {
                    console.warn(`optional key ${key} dne`)
                    continue
                } else {
                    throw new TypeError(`${key} dne in ${addDoc}`)
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
                        addDoc[localKey] = <any>await ref(foreign, cls)
                        break
                    }
                    throw new TypeError(`${foreign} expected to be a document`)
                // Ref array of docs
                case 'fkeyArray':
                    if (Array.isArray(foreign)) {
                        addDoc[localKey] = <any>await Promise.all(foreign.map(
                            lpDoc => ref(lpDoc, cls)
                        ))
                        break
                    }
                    throw new TypeError(`${foreign} expected to be an array`)
                // Ref step obj of docs
                case 'fkeyStep':
                    if (typeof foreign === 'object') {
                        let temp:any = {}
                        for (let [stepId, stepAr] of Object.entries(foreign)) {
                            if (Array.isArray(stepAr)) {
                                temp[stepId] = <any>await Promise.all(
                                    stepAr.map(lpDoc => ref(lpDoc, cls))
                                )
                                continue
                            }
                            throw new TypeError(`${stepAr} expected to be an array`)
                        }
                        addDoc[localKey] = temp
                        break
                    }
                    throw new TypeError(`${JSON.stringify(foreign)} expected to be a step array`)
                case 'parent':
                    break
                default:
                    throw new TypeError(`INTERNAL ERROR: ${data} has invalid type.`)
            }
        }

        // Add the document to the map
        if (map.has(this.collection)) {
            map.get(this.collection)?.push(addDoc)
        } else {
            map.set(this.collection, [addDoc])
        }
    }

    protected async create(id: string, doc: Type, real: boolean) {
        // The passed document has a parent key, so we need to
        // update the parent to include this document
        // if (this.parentKey && this.parentKey.local in doc) {
        //     // TODO
        // }

        // Turns a fully-dereferenced document into a reference
        // document
        let map = new Map<DocumentCollection, IArangoIndexes[]>()
        await this.addToReferenceMap(id, doc, map)

        if (real) {
            // Saves each document in the map to its respective collection
            try {
                for (let [col, docs] of map) {
                    for (let doc of docs) {
                        console.log(`Saving ${col.name} | ${JSON.stringify(doc)}`)
                        // TODO: Delete docs on failed save
                        await col.save(doc)
                    }
                }
            } catch (err) {
                // Delete malformed documents
                console.error(`Error with saving: ${err}`)
                for (let [col, docs] of map) {
                    for (let doc of docs) {
                        if ('_key' in doc) {
                            let k = doc._key as string
                            if (await col.documentExists(k)) {
                                console.log(`Removing malformed doc w/ id ${k}`)
                                await col.remove(k)
                            }
                        } else {
                            throw new TypeError(`INTERNAL ERROR ${doc} lacks _key field`)
                        }
                    }
                }
            }
        } else {
            for (let [col, docs] of map) {
                for (let d of docs) {
                    console.log(`Saved ${col.name} | ${JSON.stringify(d)}`)
                }
            }
        }
    }

    protected async update(key: string, doc: Type, real: boolean) {
        delete doc.id
        // We dont need to update all elements, .update does that
        // automatically for us :)

        // TODO: update parent
        // if (this.parentKey) {
        //     //if ()
        // }

        // Update the date if necessary
        if (this.hasCUTimestamp) {
            (<ICreateUpdate>doc).updatedAt = new Date()
        }

        // Update the db
        if (real) {
            return this.collection.update(key, doc)
        } else {
            console.log(`collection ${this.name} id ${key} updated to ${doc}`)
        }
    }

    protected async delete(key: string, real: boolean) {
        let doc = this.getUnsafe(key)

        // TODO
        // Delete children
        // for (let [fkey,cls] of this.foreignEntries) {
        //     if (!(fkey in doc) {

        //     }
        // }


        // Update parent
        // if (this.parentKey) {
        //     console.log('delete from parent')
        // }

        if (real) {
            await this.collection.remove(key)
        } else {
            console.log(`collection ${this.name} id ${key} deleted`)
        }
    }

    makeRouter() { return new Router({prefix:this.name})
        .get('/', async (ctx) => {
            try {
                const cursor = await this.query(ctx.request.query)
                let all = await cursor.all()

                ctx.status = 200
                ctx.body = all
    
                ctx.set('Content-Range', `${this.name} 0-${Math.max(all.length-1, 0)}/${all.length}`)
                ctx.set('Access-Control-Expose-Headers', 'Content-Range')
            } catch (err) {
                console.log(err)
                ctx.status = 500
            }
        })
        .get('/:id', async (ctx) => {
            try {
                if (await this.exists(ctx.params.id)) {
                    ctx.body = await this.getFromDB(ctx.params.id, true)
                    ctx.status = 200

                    ctx.set('Content-Range', `${this.name} 0-0/1`)
                    ctx.set('Access-Control-Expose-Headers', 'Content-Range')
                } else {
                    ctx.status = 404
                    ctx.body = `${this.dname} [${ctx.params.id}] dne.`
                }
            } catch (err) {
                console.log(err)
                ctx.status = 500
            }
        })
        .post('/', koaBody(), async (ctx) => {
            try {
                let body = ctx.request.body
    
                if (body.id && await this.exists(body.id)) {
                    ctx.status = 409
                    ctx.body = `${this.dname} [${body.id}] already exists`
                } else {
                    let newID = generateDBID(this.name)
                    let doc = body as Type
                    await this.create(newID, doc, ctx.header['user-agent'] !== 'backend-testing')
    
                    ctx.status = 201
                    ctx.body = {
                        id: newID,
                        message: `${this.dname} created with id [${newID}]`
                    }
                }
            } catch (err) {
                console.log(err)
                ctx.status = 500
            }
        })
        .put('/:id', koaBody(), async (ctx) => {
            try {
                if (await this.exists(ctx.params.id)) {
                    await this.update(ctx.params.id, ctx.request.body, ctx.header['user-agent'] !== 'backend-testing')
                    ctx.status = 200
                    ctx.body = `${this.dname} [${ctx.params.id}] updated`
                } else {
                    ctx.status = 409
                    ctx.body = `${this.dname} [${ctx.params.id}] dne`
                }
            } catch(err) {
                console.log(err)
                ctx.status = 500
            }
        })
        .delete('/', async (ctx) => {
            try {
                if (await this.exists(ctx.params.id)) {
                    await this.delete(ctx.params.id, ctx.header['user-agent'] !== 'backend-testing')
                    ctx.status = 200
                    ctx.body = `${this.dname} deleted`
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
