import Router from "@koa/router";
import { aql, GeneratedAqlQuery } from "arangojs/aql";
import { DocumentCollection } from "arangojs/collection";
import jsonwebtoken, { JwtPayload } from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { ParameterizedContext } from "koa";

import { config } from "../../config";
import { db } from "../../database";
import { IUser, IUserGroup } from "../../lms/types";
import { ApiRoute } from "./route";
import { UserGroupRouteInstance } from "./userGroup";
import { isDBKey, keyToId } from "../../lms/util";

export class AuthUser {
    private group?: IUserGroup
    private userPromise: Promise<IUser>
    private user?: IUser
    public key

    constructor(auth?:string) {
        if (!auth || typeof auth !== 'string') {
            throw new TypeError(`${auth} is not a string`)
        }
        let jwt = jsonwebtoken.verify(auth.split(' ')[1], config.secret)
        this.key = (<JwtPayload>jwt).user
        if (isDBKey(this.key)) {
            throw new TypeError(`${auth} is not a valid auth string`)
        }
        this.userPromise = UserRouteInstance.getUser(this.key)
    }

    getId() { return keyToId(this.key, UserRouteInstance.name) }

    async hasPermission() {
        if (!this.user) this.user = await this.userPromise
        if (!this.group) this.group = await UserGroupRouteInstance
            .getGroup(this.user.userGroup as string)
        
        return false
    }
}

class UserRoute extends ApiRoute<IUser> {
    public async getUser(key: string): Promise<IUser> {
        if (key && isDBKey(key) && this.exists(key)) {
            return this.getUnsafe(key)
        }
        throw new TypeError(`${key} not a valid key`)
    }

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

    override async modifyDoc(user: AuthUser, doc:any) {
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
                                user: dbUserWOPass.id,
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
