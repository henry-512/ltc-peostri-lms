import Router from "@koa/router"
import { aql } from "arangojs"
import { GeneratedAqlQuery } from "arangojs/aql"
import { DocumentCollection } from "arangojs/collection"
import { ArrayCursor } from "arangojs/cursor"
import koaBody from "koa-body"

import { db } from "../../database"
import { IArangoIndexes, ICreateUpdate } from "../../lms/types"
import { generateBase64UUID, isDBId } from "../../lms/util"

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

    /**
     * @param name Database name
     * @param dname Display name, returned from requests and logs
     * @param visibleFields All fields associated with the db type that are visible to normal situations. Used to determine what fields are in the object.
     * @param hasDate True if Type has a createdAt and updatedAt field
     * @param foreignFields Array of fields that are foreign keys. Key refers to the field key in Type, class refers to the ApiRoute that matches the DB field
     * @param parentKey If Type stores its parent type, local refers to the key in Type and foreign is the key in the referenced type
     * @param step If Type has a Step reference object, this is the name of its local key. This key should also be in foreignFields along with its class.
     * 
     */
    constructor(
        protected name: string,
        protected dname: string,
        protected visibleFields: string[],
        protected hasDate: boolean,
        private foreignFields: {
            key:string
            class:ApiRoute<IArangoIndexes>
        }[],
        private parentKey: null | {
            local:string
            foreign:string
        },
        private foreignStep: null | string
    ) {
        this.collection = db.collection(this.name)
        this.getAllQueryFields = appendReturnFields(aql`id:z._key,`, this.visibleFields)
        instances[name] = this
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
            if (this.visibleFields.includes(q.sort[0])) {
                sort = aql`${q.sort[0]}`
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

    /**
     * Gets the document with the passed key from the database
     * @param key A (valid) db key for the document
     * @param dereference If true, dereference all foreign keys in this and all other documents
     * @return A Type representing a document with key, with .id set and ._* removed
     */
    public async getFromDB(key: string, dereference: boolean) {
        let doc = await this.collection.document(key) as Type
    
        doc.id = doc._key
        delete doc._key
        delete doc._id
        delete doc._rev
    
        if (dereference) {
            /**
             * Local function to dereference the passed id corresponding to
             * the passed route.
             */
            async function deref(k:string, r:ApiRoute<IArangoIndexes>) {
                if (isDBId(k)) {
                    return r.getFromDB(<string><unknown>k, true)
                } else {
                    throw new TypeError(`Foreign key [${k}] is not a valid id. Did you forget the collection name? (name/key)`)
                }
            }

            // Loop over the foreign keys
            for (let c of this.foreignFields) {
                if (!(c.key in doc)) {
                    throw new TypeError(`${c.key} should exist in ${doc}, but does not`)
                }

                // The type for the foreign interface
                type foreignInterface = Type[keyof Type]
                // Key is the foreign key property of Type
                let key = c.key as keyof Type
                // An array or string representing the foreign keys
                let foreignKey = doc[key]
        
                // Dereference string id
                if (typeof foreignKey === 'string') {
                    doc[key] = <foreignInterface>await deref(foreignKey, c.class)
                // Dereference array of string ids
                } else if (Array.isArray(foreignKey)) {
                    // For each foreignKey in the array, retrieve it from the database; then store the documents (as an array) back in doc[key]
                    doc[key] = <foreignInterface><unknown>await Promise.all((<string[]>foreignKey).map(async (k:string) => deref(k, c.class)))
                } else {
                    throw new TypeError(`${foreignKey} is not a foreign key string or array`)
                }
            }
        }
    
        return doc
    }

    parseDoc(
        map: Map<DocumentCollection, IArangoIndexes[]>,
        parent:string,
        doc:any,
        type:{key:string,class:ApiRoute<IArangoIndexes>}
    ): any {
        // String IDs are foreign key references, and should be checked
        if (typeof doc === 'string') {
            // Check if foreign key reference is valid
            if (!isDBId(doc)) {
                throw new TypeError(`Foreign key [${type.key}] is not a valid id. Did you forget the collection name?`)
            } else if (!type.class.exists(doc)) {
                throw new TypeError(`Foreign key [${doc}] invalid`)
            }
            return doc
        // Objects are fully-formed documents
        } else if (typeof doc === 'object') {
            // A step array is of the form
            // [order: string]: IArangoIndexes[]
            // So we need to loop over the keys, then over the array
            if (type.key === this.foreignStep) {
                let temp:any = {}
                for (let [stepId, stepArray] of Object.entries(doc)) {
                    if (Array.isArray(stepArray)) {
                        temp[stepId] = stepArray.map(
                            t2 => this.parseDoc(map, parent, t2, type)
                        )
                    } else {
                        throw new TypeError(`${stepArray} is not an array`)
                    }
                }
                return temp
            } else {
                let childKey = generateBase64UUID()
                if (type.class.parentKey) {
                    // We're assigning the parent/module/project field
                    // of documents here, so they hold references to
                    // their parent.
                    doc[type.class.parentKey.local] = <any>parent
                }

                type.class.addToReferenceMap(childKey, doc, map)

                return `${type.class.name}/${childKey}`
            }
        } else {
            throw new TypeError(`${doc} is not a foreign document or reference`)
        }
    }

    private addToReferenceMap(
        addDocKey: string,
        addDoc: Type,
        map: Map<DocumentCollection, IArangoIndexes[]>
    ): Map<DocumentCollection, IArangoIndexes[]> {
        delete addDoc.id
        addDoc._key = addDocKey

        if (this.hasDate) {
            (<ICreateUpdate>addDoc).createdAt = new Date(); //??? ; ???
            (<ICreateUpdate>addDoc).updatedAt = new Date()
        }

        // The database id this document refers to
        let addDocId = `${this.name}/${addDocKey}`

        // Loop over the document's foreign fields
        // referencing each one
        for (let typeForeignField of this.foreignFields) {
            if (!(typeForeignField.key in addDoc)) {
                throw new TypeError(`${typeForeignField.key} should exist in ${addDoc}, but does not`)
            }

            // An array, string, or doc representing the foreign keys
            // EX project.modules: string[], comment.parent: string
            let temp = addDoc[typeForeignField.key as keyof Type]

            if (Array.isArray(temp)) {
                addDoc[typeForeignField.key as keyof Type] = temp.map(loopDoc => this.parseDoc(map, addDocId, loopDoc, typeForeignField)
                ) as any
            } else {
                addDoc[typeForeignField.key as keyof Type] = this.parseDoc(map, addDocId, temp, typeForeignField)
            }
        }

        // Add the document to the map
        if (map.has(this.collection)) {
            map.get(this.collection)?.push(addDoc)
        } else {
            map.set(this.collection, [addDoc])
        }

        return map
    }

    protected async create(key: string, doc: Type) {
         // The passed document has a parent key, so we need to
        // update the parent to include this document
        if (this.parentKey && this.parentKey.local in doc) {
            // TODO
        }

        // Turns a fully-dereferenced document into a reference
        // document
        let map = this.addToReferenceMap(key, doc, new Map())
        // Saves each document in the map to its respective collection
        for (let [col, doc] of map) {
            await col.saveAll(doc)
            console.log(`Saved ${JSON.stringify(doc)} into ${JSON.stringify(col.name)}`)
        }
    }

    protected async update(key: string, doc: Type) {
        delete doc.id
        // We dont need to update all elements, .update does that
        // automatically for us :)

        // TODO: update parent
        if (this.parentKey) {
            //if ()
        }

        // Update the date if necessary
        if (this.hasDate) {
            (<ICreateUpdate>doc).updatedAt = new Date()
        }

        // Update the db
        return this.collection.update(key, doc)
    }

    protected async delete(key: string) {
        await this.collection.remove(key)

        // TODO
        // Delete children
        // Update parent
        if (this.parentKey) {
            console.log('delete from parent')
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
                var body = ctx.request.body
    
                if (body.id && await this.exists(body.id)) {
                    ctx.status = 409
                    ctx.body = `${this.dname} [${body.id}] already exists`
                } else {
                    let newKey = generateBase64UUID()
                    let doc = body as Type
                    await this.create(newKey, doc)
    
                    ctx.status = 201
                    ctx.body = {
                        id: newKey,
                        message: `${this.dname} created with id ${newKey}`
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
                    await this.update(ctx.params.id, ctx.request.body)
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
                    await this.delete(ctx.params.id)
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
