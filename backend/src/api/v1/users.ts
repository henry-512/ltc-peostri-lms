import Router from "@koa/router";
import { aql, GeneratedAqlQuery } from "arangojs/aql";
import { DocumentCollection } from "arangojs/collection";
import jsonwebtoken from 'jsonwebtoken'
import bcrypt from 'bcrypt'

import { config } from "../../config";
import { db } from "../../database";
import { IUser } from "../../lms/types";
import { ApiRoute } from "./route";
import { UserGroupRouteInstance } from "./userGroup";

class UserRoute extends ApiRoute<IUser> {
    constructor() {
        super(
            'users',
            'User',
            {
                'firstName': {type:'string'},
                'lastName':{type:'string'},
                'avatar':{type:'string'},
                'userGroup':{type:'fkey'},

                'username':{
                    type:'string',
                    hideGetAll:true,
                    hideGetId:true,
                    hideGetRef:true,
                },
                'password':{
                    type:'string',
                    hideGetAll:true,
                    hideGetId:true,
                    hideGetRef:true,
                }
            },
            false,
            {
                'userGroup': UserGroupRouteInstance
            },
            null
        )
    }
    // Override
    // Dereferences the usergroup ID and name
    override getAllQuery(
        collection: DocumentCollection,
		sort: GeneratedAqlQuery,
		sortDir: GeneratedAqlQuery,
		offset: number, 
		count: number,
        queryFields: GeneratedAqlQuery,
        filterIds: string[]
    ): GeneratedAqlQuery {
        let query = aql`FOR z in ${collection} SORT z.${sort} ${sortDir}`

        if (filterIds.length > 0) {
            query = aql`${query} FILTER z._key IN ${filterIds}`
        }

        return aql`${query} LIMIT ${offset}, ${count}
            LET a = (RETURN DOCUMENT(z.userGroup))[0]
            RETURN {userGroup:(RETURN {id:a._key,name:a.name})[0],${queryFields}}`
    }

    override async modifyDoc(doc:any) {
        // Hash password
        doc.password = await bcrypt.hash(doc.password, 5)
        return doc
    }

    private async getFromUsername(username: string) {
        let query = aql`FOR z IN users FILTER z.username == ${username} RETURN {${this.getAllQueryFields}username:z.username,password:z.password}`

        let cursor = await db.query(query)

        if (cursor.hasNext) {
            let usr = await cursor.next()
            if (cursor.hasNext) {
                throw new TypeError('INTERNAL ERROR: Multiple users with the same username')
            }
            return usr
        } else {
            throw new TypeError(`Username ${username} not found`)
        }
    }

    public authRouter() { return new Router({prefix: '/auth'})
        .post('/', async (ctx, next) => {
            try {
                let reqUN = ctx.request.body.username
                let reqPass = ctx.request.body.password

                if (reqUN && typeof reqUN === 'string') {
                    let dbUser = await this.getFromUsername(reqUN)

                    const {
                        password,
                        ...dbUserWOPass
                    } = dbUser

                    if (reqPass && typeof reqPass === 'string' && await bcrypt.compare(reqPass, password)) {
                        ctx.body = {
                            token: jsonwebtoken.sign({
                                data: dbUserWOPass,
                                exp: Math.floor(Date.now() / 1000) + 3600
                            }, config.secret)
                        }
                    } else {
                        throw new TypeError(`[${password}] is not a string`)
                    }
                } else {
                    throw new TypeError(`[${reqUN}] is not a string`)
                }
            } catch(err) {
                console.log(err)
                ctx.status = 500
            }
        })
    }
}

export const UserRouteInstance = new UserRoute()
