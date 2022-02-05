import Router from "@koa/router"
import { aql } from "arangojs"
import { AqlLiteral, AqlQuery, GeneratedAqlQuery } from "arangojs/aql"
import { DocumentCollection } from "arangojs/collection"
import { ParameterizedContext } from "koa"
import koaBody from "koa-body"
import { IRouterArgs } from "."

import { db } from "../../database"
import { IArangoIndexes } from "../../lms/types"
import { generateDBKey } from "../../util"

function DefaultGaQuery(collection: DocumentCollection, sort: GeneratedAqlQuery, sortDir: GeneratedAqlQuery, offset: number, count: number, queryFields: GeneratedAqlQuery) {
    return aql`FOR z in ${collection} SORT z.${sort} ${sortDir} LIMIT ${offset}, ${count} RETURN {${queryFields}}`
}

function appendQuery(q:GeneratedAqlQuery, fields: string[]) {
    fields.forEach((s, i) => {
        q = aql`${q}${s}:z.${s},`
    })
    return q
}

async function getCascade<Type extends IArangoIndexes>(data:IRouterArgs, id:string) {
    let doc = await db.collection(data.name).document(id) as Type

    doc.id = doc._key
    delete doc._key
    delete doc._id
    delete doc._rev

    for (let c of data.cascade) {
        let key = doc[c.key as keyof Type]

        // console.log(c.key)
        // console.log(key)

        if (typeof key === 'string') {
            doc[c.key as keyof Type] = await getCascade(c.class, <unknown>key as string)
        } else if (typeof key === 'object') {
            doc[c.key as keyof Type] = <unknown>await Promise.all(
                (<unknown>key as Array<string>)
                .map(async (elem:string) => getCascade(c.class, elem))
                ) as Type[keyof Type]
        }
    }

    return doc
}

export class ApiRoute<Type extends IArangoIndexes> implements IRouterArgs {
    static ASC = aql`ASC`
    static DESC = aql`DESC` 

    name: string
    dname: string
    all: string[]
    gaFields: string[]
    cascade: {
		key: string
		class: IRouterArgs
	}[]
    gaQuery: (
        collection: DocumentCollection,
		sort: GeneratedAqlQuery,
		sortDir: GeneratedAqlQuery,
		offset: number, 
		count: number,
        queryFields: GeneratedAqlQuery) => GeneratedAqlQuery
    upload: (
		self:IRouterArgs,
		key:string,
		data: IArangoIndexes,
		par?: string) => Promise<IArangoIndexes>

    collection: DocumentCollection
    getAllQueryFields: GeneratedAqlQuery
    // getIdQueryFields: GeneratedAqlQuery

    constructor(args: IRouterArgs) {
        this.name = args.name
        this.dname = args.dname
        this.all = args.all
        this.gaFields = args.gaFields
        this.cascade = args.cascade
        this.gaQuery = args.gaQuery || DefaultGaQuery
        this.upload = args.upload

        this.collection = db.collection(this.name)
        this.getAllQueryFields = appendQuery(aql`id:z._key,`, this.gaFields)
    }

    protected async getAll(ctx: ParameterizedContext) {
        try {
            let q = ctx.request.query

            let sort = aql`_key`
            let sortDir = ApiRoute.ASC
            let offset = 0
            let count = 10

            if (q.sort && q.sort.length == 2) {
                if (this.all.includes(q.sort[0])) {
                    sort = aql`${q.sort[0]}`
                }
                sortDir = q.sort[1] === 'DESC' ? ApiRoute.DESC : ApiRoute.ASC
            }

            if (q.range && q.range.length == 2) {
                offset = parseInt(q.range[0])
                count = Math.min(parseInt(q.range[1]), 50)
            }

            let query = this.gaQuery(
                this.collection,
                sort,sortDir,
                offset,count,
                this.getAllQueryFields
            )

            const cursor = await db.query(query)

            var all = await cursor.all() as Type[]

            ctx.status = 200
            ctx.body = all

            // Required by simple REST data provider
            // https://github.com/marmelab/react-admin/blob/master/packages/ra-data-simple-rest/README.md
            ctx.set('Content-Range', `${this.name} 0-${all.length-1}/${all.length}`)
            ctx.set('Access-Control-Expose-Headers', 'Content-Range')
        } catch (err) {
            console.log(err)
            ctx.status = 500
        }
    }

    protected async getId(ctx: ParameterizedContext) {
        try {
            if (await this.collection.documentExists(ctx.params.id)) {
                ctx.body = await getCascade(this, ctx.params.id)
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
    }
    
    protected async post(ctx: ParameterizedContext) {
        try {
            var body = ctx.request.body

            if (!body.id || await this.collection.documentExists(body.id)) {
                ctx.status = 409
                ctx.body = `${this.dname} [${body.id}] already exists`
            } else {
                // await uploadComment(generateDBKey(), ctx.body, ctx.body.project)
                await this.upload(this, generateDBKey(), ctx.body as IArangoIndexes, (<any>ctx.body).project)
                ctx.status = 201
                ctx.body = '${this.dname} created'
            }
        } catch (err) {
            console.log(err)
            ctx.status = 500
        }
        console.log('Create new');
    }

    protected async delete(ctx: ParameterizedContext) {
        try {
            if (await this.collection.documentExists(ctx.params.id)) {
                await this.collection.remove(ctx.params.id)
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
    }

    makeRouter() {
        return new Router({prefix:this.name})
            .get('/', this.getAll.bind(this))
            .get('/:id', this.getId.bind(this))
            .post('/', koaBody(), this.post.bind(this))
            .delete('/', this.delete.bind(this))
    }
}
