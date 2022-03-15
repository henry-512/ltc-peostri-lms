import Router from "@koa/router";
import { aql, GeneratedAqlQuery } from "arangojs/aql";
import { DocumentCollection } from "arangojs/collection";
import jsonwebtoken, { JwtPayload } from 'jsonwebtoken'
import bcrypt from 'bcrypt'

import { config } from "../../config";
import { db } from "../../database";
import { IUser, IRank } from "../../lms/types";
import { ApiRoute } from "./route";
import { RankRouteInstance } from "./ranks";
import { isDBKey } from "../../lms/util";

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
            'users',
            'User',
            {
                'firstName': {type:'string'},
                'lastName':{type:'string'},
                'avatar':{type:'string'},
                'rank':{type:'fkey'},
                'status':{
                    type:'string',
                    default:'ACTIVE',
                },

                'username':{
                    type:'string',
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
                'rank': RankRouteInstance
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
            RETURN {rank:(RETURN {id:a._key,name:a.name})[0],${queryFields}}`
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

    public makeRouter() {
        let r = new Router({prefix:this.routeName})
        // Self
        r.get('/self', async (ctx, next) => {
            try {
                let user = new AuthUser(ctx.cookies.get('token'))

                ctx.body = await this.getFromDB(user, user.getId())
                ctx.status = 200
            } catch (err) {
                console.log(err)
                ctx.status = 500
            }
        })

        return super.makeRouter(r)
    }

    public authRouter() { return new Router({prefix: '/api/auth'})
        // Validate login and create JWT cookie
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
                        let token = jsonwebtoken.sign({
                                user: dbUserWOPass.id,
                                exp: Math.floor(Date.now() / 1000) + 3600
                            }, config.secret)
                        // ctx.body = {
                        //     token: 
                        // }
                        ctx.cookies.set('token', token, {
                            httpOnly: true,
                            maxAge: 3600 * 1000
                        })
                        ctx.response.body = {
                            ...dbUserWOPass
                        }
                        ctx.status = 200
                    } else {
                        throw new TypeError(`[${reqPass}] is not a string`)
                    }
                } else {
                    throw new TypeError(`[${reqUN}] is not a string`)
                }
            } catch(err) {
                console.log(err)
                ctx.status = 500
            }
        })
        .get('/', async (ctx, next) => {
            try {
                const user = new AuthUser(ctx.cookies.get('token'))

                ctx.status = 200
            } catch (err: any) {
                // TODO: May be a better way to implement this...
                if (err.message == "undefined is not a string") {
                    ctx.status = 401
                    return;
                }

                console.log(err)
                ctx.status = 500
            }
        })
        .post('/logout', async (ctx, next) => {
            try {
                ctx.cookies.set('token', '')
                ctx.status = 200
            } catch(err) {
                console.log(err)
                ctx.status = 500
            }
        })
    }
}

export const UserRouteInstance = new UserRoute()

/**
 * An authenticated user instance, associated with their user id
 */
export class AuthUser {
    private rank?: IRank
    private userPromise: Promise<IUser>
    private user?: IUser
    public key

    constructor(auth?:string) {
        if (!auth || typeof auth !== 'string') {
            throw new TypeError(`${auth} is not a string`)
        }
        let jwt = jsonwebtoken.verify(auth, config.secret)
        this.key = (<JwtPayload>jwt).user
        if (!isDBKey(this.key)) {
            throw new TypeError(`${auth} ->\n${jwt} is not a valid auth string`)
        }
        this.userPromise = UserRouteInstance.getUser(this.key)
    }

    getId() { return UserRouteInstance.keyToId(this.key) }

    async getUser() {
        if (!this.user) this.user = await this.userPromise
        return this.user
    }

    async hasPermission() {
        if (!this.user) this.user = await this.userPromise
        if (!this.rank) this.rank = await RankRouteInstance
            .getRank(this.user.rank as string)
        
        return false
    }
}
