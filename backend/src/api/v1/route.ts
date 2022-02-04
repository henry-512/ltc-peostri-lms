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
        let q = ''

        this.fields.forEach(s => {
            q = q.concat(', ', s, ': d.', s)
        })

        return aql`${q.substring(2)}`
    }
// {"query":"FOR d in @value0 SORT d._key ASC LIMIT @value1, @value2 RETURN {@value3}","bindVars":{"value0":"users","value1":0,"value2":10,"value3":"firstName:d.firstName,lastName:d.lastName,avatar:d.avatar,usergroup:d.usergroup"}}
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

    async getAll(ctx:ParameterizedContext) {
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

            // const cursor = await db.query({
            //     query: aql`
            //         FOR u in users
            //         SORT u.${sort} ${sortDir}
            //         LIMIT @offset, @count
            //         RETURN {
            //             id: u._key,
            //             firstName: u.firstName,
            //             lastName: u.lastName,
            //             avatar: u.avatar,
            //             usergroup: u.usergroup
            //         }`,
            //     bindVars: {
            //         offset: offset,
            //         count: count
            //     }
            // })

            //const v = aql`id: d._key`
            const v = this.getAllQueryFields

            let xxx = aql`FOR d in ${this.collection} SORT d.${sort} ${sortDir} LIMIT ${offset}, ${count} RETURN {${v}}`
            console.log(JSON.stringify(xxx))

            const cursor = await db.query(xxx)

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

    makeRouter() {
        return new Router({prefix:this.name})
            .get('/', this.getAll.bind(this))
    }
}
