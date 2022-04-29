import Router from '@koa/router'
import bcrypt from 'bcrypt'
import jsonwebtoken, { JwtPayload } from 'jsonwebtoken'
import { config } from '../config'
import { APIError, HTTPStatus } from '../lms/errors'
import {
    defaultPermissions,
    IRank,
    IUser,
    PermissionType,
    PermissionValue,
} from '../lms/types'
import { isDBKey } from '../lms/util'
import { RankManager } from './v1/data/ranks'
import { UserManager } from './v1/data/users'

/**
 * An authenticated user instance, associated with their user database object.
 */
export class AuthUser {
    /** The user's cached rank object */
    private rank?: IRank
    /** The user's cached user object */
    private user?: IUser
    /** The `KEY` for this user */
    public key
    /** The `ID` for this user */
    public id

    /** Wrapper for APIError using the static class name */
    private static error(
        fn: string,
        status: HTTPStatus,
        message?: string,
        verbose?: string
    ): APIError {
        return new APIError('AuthUser', fn, status, message, verbose)
    }

    /**
     * Validates the passed JWT token. Ensures the token's `ID` exists in the
     * database.
     *
     * @param auth A JWT auth string
     * @returns An `AuthUser` instance associated with the JWT token
     */
    public static async validate(auth?: string) {
        if (!auth || typeof auth !== 'string') {
            throw AuthUser.error(
                'validate',
                HTTPStatus.UNAUTHORIZED,
                'Invalid login session',
                `${auth} is not a string`
            )
        }
        // Build AuthUser
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

    /**
     * Internal constructor. Builds an AuthUser that may or may not have a valid
     * `ID` field
     *
     * @param auth A JWT auth string
     */
    private constructor(auth: string) {
        let jwt: JwtPayload = {}

        // Attempt to authenticate the JWT token. `.verify` throws an exception
        // if the string is invalid, so the statement is wrapped in a try-catch
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

        // Set key
        this.key = (<JwtPayload>jwt).user
        if (!isDBKey(this.key)) {
            throw AuthUser.error(
                'constructor',
                HTTPStatus.UNAUTHORIZED,
                'Invalid login session',
                `[${auth}]: [${jwt}] has an invalid key ${this.key}`
            )
        }
        // Cache `ID`
        this.id = UserManager.db.keyToId(this.key)
    }

    /** @return The user object associated with this user */
    async getUser() {
        if (!this.user) this.user = await UserManager.db.get(this.id)
        return this.user
    }

    /** @return The associated user's rank */
    async getRank() {
        if (!this.user) this.user = await UserManager.db.get(this.id)
        if (!this.rank)
            this.rank = await RankManager.db.get(this.user.rank as string)

        return this.rank
    }

    /** @return The associated user's teams */
    async getTeams() {
        if (!this.user) this.user = await UserManager.db.get(this.id)
        return this.user.teams as string[]
    }

    /**
     * Gets the permission value of this user for the passed permission type.
     *
     * @param perm The permission type to retrieve
     * @return The value of the permission
     */
    async getPermission(perm: PermissionType): Promise<PermissionValue> {
        let rank = await this.getRank()
        return rank?.permissions?.[perm] ?? defaultPermissions[perm]
    }

    /**
     * Builds the authentication router. Checks if the user's login information
     * is valid and returns their user data.
     *
     * @return The route middleware to apply to the app
     */
    public static authRouter() {
        return (
            new Router({ prefix: '/api/auth' })
                // Validate login and create JWT cookie
                .post('/', async (ctx) => {
                    // Collect username and password
                    let reqUN = ctx.request.body.username
                    let reqPass = ctx.request.body.password

                    // Ensure username is a string
                    if (!reqUN || typeof reqUN !== 'string') {
                        throw AuthUser.error(
                            'authRouter.post',
                            HTTPStatus.BAD_REQUEST,
                            'Login information invalid',
                            `Username [${reqUN}] is not a string`
                        )
                    }

                    // Get the user
                    const { password, ...dbUserWOPass } =
                        await UserManager.getFromUsername(reqUN)

                    if (!dbUserWOPass.id) {
                        throw AuthUser.error(
                            'authRouter.post',
                            HTTPStatus.INTERNAL_SERVER_ERROR,
                            'Invalid system state',
                            `User [${dbUserWOPass}] lacks an id field`
                        )
                    }

                    // Validate password against database password
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

                    // Create new JWT
                    let token = jsonwebtoken.sign(
                        {
                            user: dbUserWOPass.id,
                            // Date.now() is in milliseconds, exp requires
                            // seconds
                            exp:
                                Math.floor(Date.now() / 1000) +
                                config.authDuration,
                        },
                        config.secret
                    )

                    // Update fields
                    await UserManager.updateForNewLogin(dbUserWOPass.id)

                    // Set cookies and status
                    ctx.cookies.set('token', token, {
                        httpOnly: true,
                        // maxAge requires milliseconds
                        maxAge: config.authDuration * 1000,
                    })
                    // This contains different values from get/:id
                    ctx.response.body = {
                        ...dbUserWOPass,
                    }
                    ctx.status = HTTPStatus.OK
                })
                // Verifies the current login and returns the authenticated user
                .get('/', async (ctx, next) => {
                    // Runs the authentication route
                    await next()

                    let user = ctx.state.user

                    ctx.body = await UserManager.getFromDB(
                        user,
                        user.id,
                        false,
                        false
                    )
                    ctx.status = HTTPStatus.OK
                })
                // Removes login cookie
                .post('/logout', async (ctx) => {
                    ctx.cookies.set('token', '')
                    ctx.status = HTTPStatus.NO_CONTENT
                })
        )
    }
}
