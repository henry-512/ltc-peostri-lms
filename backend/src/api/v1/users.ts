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
import { APIError, HTTPStatus } from "../../lms/errors";

class UserRoute extends ApiRoute<IUser> {
    public async getUser(key: string): Promise<IUser> {
        if (key && isDBKey(key) && this.exists(key)) {
            return this.getUnsafe(key)
        }
        throw this.error(
            'getUser',
            HTTPStatus.BAD_REQUEST,
            'Invalid user key',
            `${key} not a valid key`
        )
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
                'email':{type:'string',optional:true},

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
        let query = aql`FOR z IN users FILTER z.username == ${username} RETURN {${this.getAllQueryFields}password:z.password}`

        let cursor = await db.query(query)

        if (!cursor.hasNext) {
            throw this.error(
                'getFromUsername',
                HTTPStatus.BAD_REQUEST,
                'Login information invalid',
                `Username ${username} not found`
            )
        }

        let usr = await cursor.next()
        if (cursor.hasNext) {
            throw this.error(
                'getFromUsername',
                HTTPStatus.INTERNAL_SERVER_ERROR,
                'Invalid system state',
                `Multiple users with the same username [${username}]`
            )
        }
        return usr
    }

    public override makeRouter() {
        let r = new Router({prefix:this.routeName})
        // Self
        r.get('/self', async (ctx, next) => {
            let user = await AuthUser.validate(ctx.cookies.get('token'))

            ctx.body = await this.getFromDB(user, user.getId())
            ctx.status = 200
        })

        return super.makeRouter(r)
    }

    public authRouter() { return new Router({prefix: '/api/auth'})
        // Validate login and create JWT cookie
        .post('/', async (ctx, next) => {
            let reqUN = ctx.request.body.username
            let reqPass = ctx.request.body.password

            if (!reqUN || typeof reqUN !== 'string') {
                throw this.error(
                    'authRouter.post',
                    HTTPStatus.BAD_REQUEST,
                    'Login information invalid',
                    `Username [${reqUN}] is not a string`
                )
            }

            let dbUser = await this.getFromUsername(reqUN)

            const {
                password,
                ...dbUserWOPass
            } = dbUser

            if (!reqPass || typeof reqPass !== 'string' || !(await bcrypt.compare(reqPass,password))) {
                throw this.error(
                    'authRouter.post',
                    HTTPStatus.BAD_REQUEST,
                    'Login information invalid',
                    `Password [${reqPass}] is not valid`
                )
            }

            let token = jsonwebtoken.sign({
                    user: dbUserWOPass.id,
                    exp: Math.floor(Date.now() / 1000) + 3600
                }, config.secret)

            ctx.cookies.set('token', token, {
                httpOnly: true,
                maxAge: 3600 * 1000
            })
            ctx.response.body = {
                ...dbUserWOPass
            }
            ctx.status = 200
        })
        .get('/', async (ctx, next) => {
            // Runs the authentication routes
            await next()

            ctx.status = 200
        })
        .post('/logout', async (ctx, next) => {
            ctx.cookies.set('token', '')
            ctx.status = 200
        })
    }
}

export const UserRouteInstance = new UserRoute()

/**
 * An authenticated user instance, associated with their user id
 */
export class AuthUser {
    private rank?: IRank
    private user?: IUser
    public key

    /**
     * Builds an error with the provided fields
     */
    private static error(
        fn:string,
        status:HTTPStatus,
        message?:string,
        verbose?:string
    ): APIError {
        return new APIError(
            'AuthUser',
            fn,
            status,
            message,
            verbose
        )
    }

    public static async validate(auth?:string) {
        if (!auth || typeof auth !== 'string') {
            throw AuthUser.error(
                'validate',
                HTTPStatus.UNAUTHORIZED,
                'Invalid login session',
                `${auth} is not a string`
            )
        }

        let usr = new AuthUser(auth)
        if (!await UserRouteInstance.exists(usr.key)) {
            throw AuthUser.error(
                'authRouter.get',
                HTTPStatus.UNAUTHORIZED,
                'Invalid login session',
                `User [${usr.key}] does not exist`
            )
        }

        return usr
    }

    private constructor(auth:string) {
        let jwt:JwtPayload = {}

        try {
            let ver = jsonwebtoken.verify(auth, config.secret)
            if (typeof ver === 'string') {
                throw new TypeError(`Expected JWT, not [${ver}]`)
            }
            jwt = ver
        } catch (err) {
            throw AuthUser.error(
                'constructor',
                HTTPStatus.UNAUTHORIZED,
                'Invalid login session',
                `JWT ${auth} invalid: ${JSON.stringify(err)}`
            )
        }

        this.key = (<JwtPayload>jwt).user
        if (!isDBKey(this.key)) {
            throw AuthUser.error(
                'constructor',
                HTTPStatus.UNAUTHORIZED,
                'Invalid login session',
                `[${auth}]: [${jwt}] has an invalid key ${this.key}`
            )
        }
    }

    getId() { return UserRouteInstance.keyToId(this.key) }

    async getUser() {
        if (!this.user) this.user = await UserRouteInstance.getUser(this.key)
        return this.user
    }

    async getRank() {
        if (!this.user) this.user = await UserRouteInstance.getUser(this.key)
        if (!this.rank) this.rank = await RankRouteInstance
            .getRank(this.user.rank as string)
        
        return this.rank
    }
}
