import Router from "@koa/router"
import { aql } from "arangojs"
import { AqlLiteral, AqlQuery, GeneratedAqlQuery } from "arangojs/aql"
import { DocumentCollection } from "arangojs/collection"
import { ParameterizedContext } from "koa"

import { db } from "../../database"
import { IArangoIndexes } from "../../lms/types"

export class ApiRoute<Type extends IArangoIndexes> {
    static ASC = aql`ASC`
    static DESC = aql`DESC`

    name: string
    dname: string
    fields: Array<string>

    collection: DocumentCollection
    getAllQueryFields: GeneratedAqlQuery
    
    private buildQuery() {
        let q = aql`id:d._key,`

        this.fields.forEach((s, i) => {
            q = aql`${q}${s}:d.${s},`
        })

        return q
    }

    constructor(
        name:string,
        dname:string,
        fields:Array<string>
    ) {
        this.name = name
        this.dname = dname
        this.fields = fields

        this.collection = db.collection(name)
        this.getAllQueryFields = this.buildQuery()
    }

    protected async getAll(ctx: ParameterizedContext) {
        try {
            let q = ctx.request.query

            let sort = aql`_key`
            let sortDir = ApiRoute.ASC
            let offset = 0
            let count = 10

            if (q.sort && q.sort.length == 2) {
                if (this.fields.includes(q.sort[0])) {
                    sort = aql`${q.sort[0]}`
                }
                sortDir = q.sort[1] === 'DESC' ? ApiRoute.DESC : ApiRoute.ASC
            }

            if (q.range && q.range.length == 2) {
                offset = parseInt(q.range[0])
                count = Math.min(parseInt(q.range[1]), 50)
            }

            let query = aql`
                FOR d in ${this.collection}
                    SORT d.${sort} ${sortDir}
                    LIMIT ${offset}, ${count}
                    RETURN {${this.getAllQueryFields}}`

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
        try  {
            if (await this.collection.documentExists(ctx.params.id)) {
                ctx.status = 200

                let query = aql`
                    LET d = (RETURN DOCUMENT(${this.name}, ${ctx.params.id}))
                    RETURN {${this.getAllQueryFields}}
                `

                const cursor = await db.query(query)

                ctx.body = await cursor.next()
                // ctx.body = await this.getFromId(ctx.params.id, true)
                ctx.set('Content-Range', `modules 0-0/1`)
                ctx.set('Access-Control-Expose-Headers', 'Content-Range')
            } else {
                ctx.status = 404
                ctx.body = `User [${ctx.params.id}] dne.`
            }
        } catch (err) {
            console.log(err)
            ctx.status = 500
        }
    }

    makeRouter() {
        return new Router({prefix:this.name})
            .get('/', this.getAll.bind(this))
            .get('/:id', this.getId.bind(this))
    }
}
