import Router from "@koa/router"
import { aql } from "arangojs"
import { GeneratedAqlQuery } from "arangojs/aql"
import { DocumentCollection } from "arangojs/collection"
import koaBody from "koa-body"

import { db } from "../../database"
import { IArangoIndexes, ICreateUpdate } from "../../lms/types"
import { generateBase64UUID } from "../../lms/util"

function appendQuery(q:GeneratedAqlQuery, fields: string[]) {
    fields.forEach((s, i) => {
        q = aql`${q}${s}:z.${s},`
    })
    return q
}

const instances: {[name:string]: ApiRoute<IArangoIndexes>} = {}
export function getApiInstanceFromId(id: string) {
    return instances[id.split('/')[0]]
}

export abstract class ApiRoute<Type extends IArangoIndexes> {
    static ASC = aql`ASC`
    static DESC = aql`DESC` 

    protected collection: DocumentCollection<Type>
    protected getAllQueryFields: GeneratedAqlQuery

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
        protected noDerefFields: string[]
    ) {
        this.collection = db.collection(this.name)
        this.getAllQueryFields = appendQuery(aql`id:z._key,`, this.visibleFields)
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

    protected async getAll(q: any) {
        let sort = aql`_key`
        let sortDir = ApiRoute.ASC
        let offset = 0
        let count = 10

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

    public async getFromDB(key: string, dereference: true) {
        let doc = await this.collection.document(key) as Type
    
        doc.id = doc._key
        delete doc._key
        delete doc._id
        delete doc._rev
    
        if (dereference) {
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
                    doc[key] = <foreignInterface>await c.class.getFromDB(<string><unknown>foreignKey, true)
                // Dereference array of string ids
                } else if (typeof foreignKey === 'object') {
                    doc[key] = <foreignInterface><unknown>await Promise.all(
                        (<string[]><unknown>foreignKey)
                        .map(async (k:string) => c.class.getFromDB(k, true))
                        )
                } else {
                    throw new TypeError(`${foreignKey} is not a foreign key string or array`)
                }
            }
        }
    
        return doc
    }

    private addToReferenceMap(
        key: string,
        doc: Type,
        map: Map<DocumentCollection, IArangoIndexes[]>
    ): Map<DocumentCollection, IArangoIndexes[]> {
        delete doc.id
        doc._key = key

        if (this.hasDate) {
            (<ICreateUpdate>doc).createdAt = new Date(); //??? ; ???
            (<ICreateUpdate>doc).updatedAt = new Date()
        }

        // The database id this document refers to
        let id = `${this.name}/${key}`

        // Loop over the document's foreign fields
        // referencing each one
        for (let fField of this.foreignFields) {
            if (!(fField.key in doc)) {
                throw new TypeError(`${fField.key} should exist in ${doc}, but does not`)
            }

            // Key is the foreign key property of Type
            // EX modules
            let key = fField.key as keyof Type
            // An array, string, or doc representing the foreign keys
            // EX project.modules: string[], comment.parent: string
            let foreignDoc = doc[key]
            let isForeignDocArray = Array.isArray(foreignDoc)
            // Converts the array or single element into an array
            let foreignDocs:Type[keyof Type][] = Array.isArray(foreignDoc)
                ? foreignDoc
                : [foreignDoc]

            // Foreign Keys
            let foreignKeys: string[] = []

            for (let fdoc of foreignDocs) {
                // String IDs are foreign key references, and should be checked
                if (typeof fdoc === 'string') {
                    // Check if foreign key reference is valid
                    if (!fField.class.exists(fdoc)) {
                        throw new TypeError(`Foreign key ${fdoc} invalid`)
                    }
                    foreignKeys.push(fdoc)
                // Objects are fully-formed documents
                } else if (typeof fdoc === 'object') {
                    let childKey = generateBase64UUID()
                    if (fField.class.parentKey) {
                        // Ok this one's pretty nasty, but it kinda has to
                        // be like this.
                        // We're assigning the parent/module/project field
                        // of documents here, so they hold references to
                        // their parent.
                        // These fields are only ever strings, and ID is
                        // always a string.
                        // However, the indexes are only known at runtime
                        // so we need to nastyconvert from string to
                        // string-but-typescript-knows-it-is-valid-at-
                        // runtime.
                        let localKey = fField.class.parentKey.local
                        fdoc[localKey as keyof typeof fdoc]
                        = <Type[keyof Type][keyof Type[keyof Type]]><unknown>id
                    }

                    foreignKeys.push(`${fField.class.name}/${childKey}`)

                    fField.class.addToReferenceMap(childKey, fdoc, map)
                } else {
                    throw new TypeError(`${fdoc} is not a foreign document or reference`)
                }
            }

            // Replace the foreign doc array with a list of foreign keys
            if (isForeignDocArray) {
                doc[key] = <Type[keyof Type]><unknown>foreignKeys
            } else {
                doc[key] = <Type[keyof Type]><unknown>(foreignKeys[0] || '')
            }
        }

        // Add the document to the map
        if (map.has(this.collection)) {
            map.get(this.collection)?.push(doc)
        } else {
            map.set(this.collection, [doc])
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
                const cursor = await this.getAll(ctx.request.query)
                let all = await cursor.all() as Type[]

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
