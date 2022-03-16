import Router from "@koa/router"
import bcrypt from 'bcrypt'
import jsonwebtoken, { JwtPayload } from 'jsonwebtoken'

import { config } from "../config"
import { APIError, HTTPStatus } from "../lms/errors"
import { IRank, IUser } from "../lms/types"
import { RankRouteInstance } from "./v1/ranks"
import { UserRouteInstance } from "./v1/users"
import { isDBKey } from "../lms/util"

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

    public static authRouter() { return new Router({prefix: '/api/auth'})
        // Validate login and create JWT cookie
        .post('/', async (ctx, next) => {
            let reqUN = ctx.request.body.username
            let reqPass = ctx.request.body.password

            if (!reqUN || typeof reqUN !== 'string') {
                throw AuthUser.error(
                    'authRouter.post',
                    HTTPStatus.BAD_REQUEST,
                    'Login information invalid',
                    `Username [${reqUN}] is not a string`
                )
            }

            let dbUser = await UserRouteInstance.getFromUsername(reqUN)

            const {
                password,
                ...dbUserWOPass
            } = dbUser

            if (!reqPass || typeof reqPass !== 'string' || !(await bcrypt.compare(reqPass,password))) {
                throw AuthUser.error(
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
        // Verifies the current login
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