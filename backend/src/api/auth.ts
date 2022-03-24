import Router from '@koa/router'
import bcrypt from 'bcrypt'
import jsonwebtoken, { JwtPayload } from 'jsonwebtoken'
import { config } from '../config'
import { APIError, HTTPStatus } from '../lms/errors'
import { IRank, IUser } from '../lms/types'
import { isDBKey } from '../lms/util'
import { RankManager } from './v1/data/ranks'
import { UserManager } from './v1/data/users'

/**
 * An authenticated user instance, associated with their user id
 */
export class AuthUser {
    private rank?: IRank
    private user?: IUser
    public key
    public id

    /**
     * Builds an error with the provided fields
     */
    private static error(
        fn: string,
        status: HTTPStatus,
        message?: string,
        verbose?: string
    ): APIError {
        return new APIError('AuthUser', fn, status, message, verbose)
    }

    public static async validate(auth?: string) {
        if (!auth || typeof auth !== 'string') {
            throw AuthUser.error(
                'validate',
                HTTPStatus.UNAUTHORIZED,
                'Invalid login session',
                `${auth} is not a string`
            )
        }

        let usr = new AuthUser(auth)
        if (!(await UserManager.db.exists(usr.id))) {
            throw AuthUser.error(
                'authRouter.get',
                HTTPStatus.UNAUTHORIZED,
                'Invalid login session',
                `User [${usr.key}] does not exist`
            )
        }

        return usr
    }

    private constructor(auth: string) {
        let jwt: JwtPayload = {}

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
        this.id = UserManager.db.keyToId(this.key)
        if (!isDBKey(this.key)) {
            throw AuthUser.error(
                'constructor',
                HTTPStatus.UNAUTHORIZED,
                'Invalid login session',
                `[${auth}]: [${jwt}] has an invalid key ${this.key}`
            )
        }
    }

    getId() {
        return UserManager.db.keyToId(this.key)
    }

    async getUser() {
        if (!this.user) this.user = await UserManager.getUser(this.key)
        return this.user
    }

    async getRank() {
        if (!this.user) this.user = await UserManager.getUser(this.key)
        if (!this.rank)
            this.rank = await RankManager.getRank(this.user.rank as string)

        return this.rank
    }

    public static authRouter() {
        return (
            new Router({ prefix: '/api/auth' })
                // Validate login and create JWT cookie
                .post('/', async (ctx) => {
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

                    let dbUser = await (<any>UserManager.db).getFromUsername(
                        reqUN
                    )

                    const { password, ...dbUserWOPass } = dbUser

                    if (
                        !reqPass ||
                        typeof reqPass !== 'string' ||
                        !(await bcrypt.compare(reqPass, password))
                    ) {
                        throw AuthUser.error(
                            'authRouter.post',
                            HTTPStatus.BAD_REQUEST,
                            'Login information invalid',
                            `Password [${reqPass}] is not valid`
                        )
                    }

                    let token = jsonwebtoken.sign(
                        {
                            user: dbUserWOPass.id,
                            exp: Math.floor(Date.now() / 1000) + 3600,
                        },
                        config.secret
                    )

                    // ASYNC can be called on a different thread
                    // UserManager.updateForNewLogin(usr.id)

                    ctx.cookies.set('token', token, {
                        httpOnly: true,
                        maxAge: 3600 * 1000,
                    })
                    ctx.response.body = {
                        ...dbUserWOPass,
                    }
                    ctx.status = HTTPStatus.OK
                })
                // Verifies the current login
                .get('/', async (ctx, next) => {
                    // Runs the authentication routes
                    await next()

                    ctx.status = HTTPStatus.NO_CONTENT
                })
                // Removes login cookie
                .post('/logout', async (ctx) => {
                    ctx.cookies.set('token', '')
                    ctx.status = HTTPStatus.NO_CONTENT
                })
        )
    }
}
