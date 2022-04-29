import Router from '@koa/router'
import { GeneratedAqlQuery } from 'arangojs/aql'
import fs from 'fs'
import { ParameterizedContext, Request } from 'koa'
import { config } from '../../config'
import { IFilterOpts, IQueryRange } from '../../database'
import { HTTPStatus } from '../../lms/errors'
import {
    FetchType,
    IArangoIndexes,
    PermissionType,
    PermissionValue,
} from '../../lms/types'
import { AuthUser } from '../auth'
import { DBManager } from './DBManager'

/**
 * Administrative router. Mostly a wrapper for database function calls, but also
 * used for a few frontend list generations. Supports GET, GET-ALL, POST, PUT,
 * and DELETE. All administrative routes are prefixed with `admin` and use the
 * `list` prefix for CRUD operations.
 *
 * Associated with a DBManager that manages data manipulation.
 */
export class AdminRouter<Type extends IArangoIndexes> extends Router {
    /**
     * Create a new router.
     */
    constructor(prefix: string, private manager: DBManager<Type>) {
        // Apply prefix
        super({ prefix: `admin/${prefix}` })
    }

    // Attaches custom routes to the router
    public override routes() {
        // Development-only routes
        if (config.devRoutes) {
            this.manager.debugRoutes(this)
        }

        this.get(
            '/list',
            async (ctx) =>
                await parseAndSendQuery(ctx, ctx.state.user, this.manager)
        )

        this.get(
            '/list/:id',
            async (ctx) => await getOne(ctx, this.manager, ctx.params.id)
        )

        this.post('/list', async (ctx) => {
            // Support for multipart requests
            let doc: Type = await parseBody<Type>(ctx.request)

            // Create new document
            let id = await this.manager.create(
                ctx.state.user,
                ctx.request.files,
                doc
            )

            // Convert id to key
            let key = this.manager.db.asKey(id)

            ctx.status = HTTPStatus.CREATED
            ctx.body = {
                id: key,
                message: `${this.manager.className} created with id [${id}]`,
            }
        })

        this.put('/list/:id', async (ctx) => {
            // Support multipart
            let doc: Type = await parseBody<Type>(ctx.request)
            let id = this.manager.db.keyToId(ctx.params.id)

            await this.manager.update(
                ctx.state.user,
                ctx.request.files,
                id,
                doc
            )

            ctx.body = await this.manager.getFromDB(
                ctx.state.user,
                id,
                false,
                false
            )
            ctx.status = HTTPStatus.OK
        })

        this.delete('/list/:id', async (ctx) => {
            let id = await paramId(ctx, this.manager)
            await this.manager.delete(ctx.state.user, id)

            ctx.status = HTTPStatus.OK
            ctx.body = {
                id: ctx.params.id,
                message: `${this.manager.className} deleted`,
            }
        })

        return super.routes()
    }
}

/**
 * User processing router. Designed for queries based on user assignment status.
 */
export class UserRouter<Type extends IArangoIndexes> extends Router {
    /**
     * Create a new router.
     */
    constructor(
        prefix: string,
        private manager: DBManager<Type>,
        private fetchPermission: PermissionType,
        /** Aql query to return the team for this object */
        private filterTeam: GeneratedAqlQuery,
        /** Aql query to return users for this object */
        private filterUsers: GeneratedAqlQuery
    ) {
        // Apply prefix
        super({ prefix: `${prefix}/` })
    }

    /**
     * Builds the router and calls the callback function. The callback is called
     * before the other routes.
     *
     * @param cb A callback function to run to add additional routes
     */
    public build(cb?: (r: Router, manager: DBManager<Type>) => void) {
        if (cb) cb(this, this.manager)

        this.get('list/:id', async (ctx) => {
            let id = await this.manager.db.assertKeyExists(ctx.params.id)

            ctx.body = await this.manager.getFromDB(
                ctx.state.user,
                id,
                true,
                true
            )
            ctx.status = HTTPStatus.OK
        })

        // Filters based on assignment
        this.get('assigned/count', async (ctx) => {
            await this.getCount(ctx, 'ASSIGNED')
        })
        this.get('assigned/list', async (ctx) => {
            await this.getList(ctx, 'ASSIGNED')
        })

        // Filters based on team
        this.get('team/count', async (ctx) => {
            await this.getCount(ctx, 'TEAM')
        })
        this.get('team/list', async (ctx) => {
            await this.getList(ctx, 'TEAM')
        })

        // Filters based on all documents
        this.get(`all/count`, async (ctx) => {
            await this.getCount(ctx, 'ALL')
        })
        this.get(`all/list`, async (ctx) => {
            await this.getList(ctx, 'ALL')
        })

        // Uses user permissions to determine filters
        this.get('default/count', async (ctx) => {
            await this.getCount(ctx)
        })
        this.get('default/list', async (ctx) => {
            await this.getList(ctx)
        })

        return super.routes()
    }

    /**
     * Gets the number of documents with additional filter.
     *
     * @param ctx The context to use
     * @param fetchType The FetchType to determine filtering options. If not
     * set, fetches permissions from the user.
     */
    private async getCount(ctx: ParameterizedContext, fetchType?: FetchType) {
        // Use passed fetching type or pull from user
        if (fetchType === undefined) {
            fetchType = await permission<FetchType>(ctx, this.fetchPermission)
        }

        let user: AuthUser = ctx.state.user

        switch (fetchType) {
            case 'ASSIGNED':
                return await queryFilterCount(ctx, this.manager, {
                    key: 'users', // unused
                    custom: this.filterUsers,
                    contains: user.id,
                })
            case 'TEAM':
                return await queryFilterCount(ctx, this.manager, {
                    key: 'undefined', // This is unused
                    custom: this.filterTeam,
                    intersect: await user.getTeams(),
                })
            default:
                return await queryFilterCount(ctx, this.manager)
        }
    }

    /**
     * Gets all of the documents including the additional filter.
     *
     * @param ctx The context to use
     * @param fetchType The FetchType to determine filtering options. If not
     * set, fetches permissions from the user.
     */
    private async getList(ctx: ParameterizedContext, fetchType?: FetchType) {
        if (fetchType === undefined) {
            fetchType = await permission<FetchType>(ctx, this.fetchPermission)
        }

        let user: AuthUser = ctx.state.user

        switch (fetchType) {
            case 'ASSIGNED':
                return await parseAndSendQueryFilter(ctx, user, this.manager, {
                    key: 'users', // unused
                    custom: this.filterUsers,
                    contains: user.id,
                })
            case 'TEAM':
                return await parseAndSendQueryFilter(ctx, user, this.manager, {
                    key: 'undefined',
                    custom: this.filterTeam,
                    anyOf: await user.getTeams(),
                })
            default:
                return await parseAndSendQuery(ctx, user, this.manager)
        }
    }
}

/**
 * Gets a single document.
 *
 * @param ctx The context to use
 * @param manager The DB manager associated with the key
 * @param key The `KEY` to retrieve
 */
export async function getOne(
    ctx: ParameterizedContext,
    manager: DBManager<any>,
    key: string
) {
    let id = await manager.db.assertKeyExists(key)
    ctx.body = await manager.getFromDB(ctx.state.user, id, false, false)
    ctx.status = HTTPStatus.OK
}

/**
 * Returns the JSON part of a multipart form, if required. Otherwise just
 * returns req.body.
 *
 * @param req A `ctx.request` object
 */
export async function parseBody<T>(req: Request): Promise<T> {
    // Multipart form requests put the POST data in a different spot
    if (req.files && req.files.json) {
        let file = req.files.json
        if (Array.isArray(file)) {
            file = file[0]
        }
        let buf = await fs.promises.readFile(file.path)

        // Parse the JSON body
        return JSON.parse(buf.toString())
    } else {
        return req.body
    }
}

/**
 * Parses and sends a GET-ALL query on the passed DB manager,
 *
 * @param ctx The context to use
 * @param user The user that initialized the request
 * @param manager The DB manager to query with
 */
export async function parseAndSendQuery(
    ctx: ParameterizedContext,
    user: AuthUser,
    manager: DBManager<any>
) {
    let opts = manager.parseQuery(ctx.request.query)
    let results = await manager.runQuery(user, opts)
    sendRange(ctx, results)
}

/**
 * Sends a query range. Sets `Content-Range` headers and sets the return body.
 *
 * @param ctx The context to use
 * @param results The results of the query
 */
export function sendRange(ctx: ParameterizedContext, results: IQueryRange) {
    ctx.status = HTTPStatus.OK
    ctx.body = results.all

    ctx.set(
        'Content-Range',
        `documents ${results.low}-${results.high}/${results.size}`
    )
    ctx.set('Access-Control-Expose-Headers', 'Content-Range')
}

/**
 * Runs a query with additional filters.
 *
 * @param ctx The context to use
 * @param user The user to associate with the request
 * @param manager The database manager to query on
 * @param filters An optional array of additional filters
 */
export async function parseAndSendQueryFilter(
    ctx: ParameterizedContext,
    user: AuthUser,
    manager: DBManager<any>,
    ...filters: IFilterOpts[]
) {
    let results = await manager.runQueryWithFilter(
        user,
        ctx.request.query,
        ...filters
    )
    sendRange(ctx, results)
}

/**
 * Runs a query with additional filters and returns its length.
 *
 * @param ctx The context to use
 * @param manager The database manager to query on
 * @param filters An optional array of additional filters
 */
export async function queryFilterCount(
    ctx: ParameterizedContext,
    manager: DBManager<any>,
    ...filters: IFilterOpts[]
) {
    ctx.body = await manager.queryLengthWithFilter(
        ctx.request.query,
        ...filters
    )
    ctx.status = HTTPStatus.OK
}

/**
 * Retrieves the user's permission.
 *
 * @typeParam T The permission return type
 * @param ctx The context to retrieve `.state.user` from
 * @param perm The permission to retrieve
 * @return The permission's value with the user or its default value
 */
export async function permission<T extends PermissionValue>(
    ctx: ParameterizedContext,
    perm: PermissionType
): Promise<T> {
    return (<AuthUser>ctx.state.user).getPermission(perm) as any
}

/**
 * Rips `ctx.params.id` and converts it from a `KEY` to an `ID`, and asserts
 * that it exists.
 *
 * @param ctx The context to use
 * @param manager The database manager to use for key assertion
 * @return A valid and existent `ID`
 */
export async function paramId(
    ctx: ParameterizedContext,
    manager: DBManager<any>
): Promise<string> {
    return manager.db.assertKeyExists(ctx.params.id)
}

/** An interface for ctx bodies that are a multipart reference string. */
export interface IFileBody {
    file: string
}
