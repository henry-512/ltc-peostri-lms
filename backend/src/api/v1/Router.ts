import Router from '@koa/router'
import fs from 'fs'
import { ParameterizedContext } from 'koa'
import { config } from '../../config'
import { IFilterOpts, IGetAllQueryResults, IQueryGetOpts } from '../../database'
import { HTTPStatus } from '../../lms/errors'
import { ApiPerm, FetchType, IArangoIndexes } from '../../lms/types'
import { AuthUser } from '../auth'
import { DBManager } from './DBManager'

export interface AdminRouterOpts {
    noDebugRoute?: boolean
    noListGetAll?: boolean
    noListGetId?: boolean
    noListPost?: boolean
    noListPut?: boolean
    noListDelete?: boolean
}

export const allDisabled: AdminRouterOpts = {
    noDebugRoute: true,
    noListGetAll: true,
    noListGetId: true,
    noListPost: true,
    noListPut: true,
    noListDelete: true,
}

export class AdminRouter<Type extends IArangoIndexes> extends Router {
    /**
     * Create a new router.
     */
    constructor(
        prefix: string,
        private manager: DBManager<Type>,
        private apiOpts?: AdminRouterOpts
    ) {
        // Apply prefix
        super({ prefix: `admin/${prefix}` })
    }

    public override routes() {
        // Attatch default routes
        if (config.devRoutes) {
            this.manager.debugRoutes(this)
        }

        if (!this.apiOpts?.noListGetAll) {
            this.get(
                '/list',
                async (ctx) => await parseRunSendQuery(this.manager, ctx)
            )
        }

        if (!this.apiOpts?.noListGetId) {
            this.get(
                '/list/:id',
                async (ctx) => await getOne(ctx, this.manager, ctx.params.id)
            )
        }

        if (!this.apiOpts?.noListPost) {
            this.post('/list', async (ctx) => {
                let doc: Type = await parseBody<Type>(ctx.request)

                let id = await this.manager.create(
                    ctx.state.user,
                    ctx.request.files,
                    doc,
                    ctx.header['user-agent'] !== 'backend-testing'
                )

                let key = this.manager.db.asKey(id)

                ctx.status = HTTPStatus.CREATED
                ctx.body = {
                    id: key,
                    message: `${this.manager.className} created with id [${id}]`,
                }
            })
        }

        if (!this.apiOpts?.noListPut) {
            this.put('/list/:id', async (ctx) => {
                let id = this.manager.db.keyToId(ctx.params.id)
                let doc: Type = await parseBody<Type>(ctx.request)

                await this.manager.update(
                    ctx.state.user,
                    ctx.request.files,
                    id,
                    doc,
                    ctx.header['user-agent'] !== 'backend-testing'
                )

                ctx.body = await this.manager.getFromDB(ctx.state.user, id)
                ctx.status = HTTPStatus.OK
            })
        }

        if (!this.apiOpts?.noListDelete) {
            this.delete('/list/:id', async (ctx) => {
                let id = await this.manager.db.assertKeyExists(ctx.params.id)
                await this.manager.delete(
                    ctx.state.user,
                    id,
                    ctx.header['user-agent'] !== 'backend-testing',
                    true
                )

                ctx.status = HTTPStatus.OK
                ctx.body = {
                    id: ctx.params.id,
                    message: `${this.manager.className} deleted`,
                }
            })
        }

        return super.routes()
    }
}

export interface UserRouterOpts {
    noAssigned?: boolean
    noAll?: boolean
    noDefault?: boolean
    noListGet?: boolean
}

export class UserRouter<Type extends IArangoIndexes> extends Router {
    /**
     * Create a new router.
     */
    constructor(
        prefix: string,
        private manager: DBManager<Type>,
        private routerOpts?: UserRouterOpts
    ) {
        // Apply prefix
        super({ prefix: `${prefix}/` })
    }

    public build(cb?: (r: Router, manager: DBManager<Type>) => void) {
        if (cb) cb(this, this.manager)

        if (!this.routerOpts?.noListGet) {
            this.get('list/:id', async (ctx) => {
                let id = await this.manager.db.assertKeyExists(ctx.params.id)

                ctx.body = await this.manager.getFromDB(
                    ctx.state.user,
                    id,
                    true
                )
                ctx.status = HTTPStatus.OK
            })
        }

        if (!this.routerOpts?.noAssigned) {
            this.get('assigned/count', async (ctx) => {
                await getProjectStatusCount(ctx, this.manager, 'ASSIGNED')
            })
            this.get('assigned/list', async (ctx) => {
                await getProjectStatusList(ctx, this.manager, 'ASSIGNED')
            })
        }

        if (!this.routerOpts?.noAll) {
            this.get('all/count', async (ctx) => {
                await getProjectStatusCount(ctx, this.manager, 'ALL')
            })
            this.get('all/list', async (ctx) => {
                await getProjectStatusList(ctx, this.manager, 'ALL')
            })
        }

        if (!this.routerOpts?.noDefault) {
            this.get('default/count', async (ctx) => {
                await getProjectStatusCount(ctx, this.manager)
            })
            this.get('default/list', async (ctx) => {
                await getProjectStatusList(ctx, this.manager)
            })
        }

        return super.routes()
    }
}

export async function getOne(
    ctx: ParameterizedContext,
    manager: DBManager<any>,
    key: string
) {
    let id = await manager.db.assertKeyExists(key)
    ctx.body = await manager.getFromDB(ctx.state.user, id)
    ctx.status = HTTPStatus.OK
}

export async function parseBody<Type extends IArangoIndexes>(req: any) {
    // Multipart form requests put the POST data in a different spot
    if (req.files && req.files.json) {
        let file = req.files.json
        if (Array.isArray(file)) {
            file = file[0]
        }
        let buf = await fs.promises.readFile(file.path)

        return JSON.parse(buf.toString())
    } else {
        return req.body as Type
    }
}

export async function parseRunSendQuery(
    manager: DBManager<any>,
    ctx: ParameterizedContext
) {
    let opts = manager.parseQuery(ctx.request.query)
    return runAndSendQuery(manager, opts, ctx)
}

export async function runAndSendQuery(
    manager: DBManager<any>,
    opts: IQueryGetOpts,
    ctx: ParameterizedContext
) {
    let results = await manager.runQuery(opts)
    sendRange(results, ctx)
}

export function sendRange(
    results: IGetAllQueryResults,
    ctx: ParameterizedContext
) {
    ctx.status = HTTPStatus.OK
    ctx.body = results.all

    ctx.set(
        'Content-Range',
        `documents ${results.low}-${results.high}/${results.size}`
    )
    ctx.set('Access-Control-Expose-Headers', 'Content-Range')
}

export async function queryFilter(
    ctx: ParameterizedContext,
    manager: DBManager<any>,
    ...filters: IFilterOpts[]
) {
    let results = await manager.runQueryWithFilter(
        ctx.request.query,
        ...filters
    )
    sendRange(results, ctx)
}

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

export async function permission<T>(ctx: ParameterizedContext, perm: ApiPerm) {
    return (<AuthUser>ctx.state.user).getPermission(perm) as any as T
}

export async function getProjectStatusCount(
    ctx: ParameterizedContext,
    m: DBManager<any>,
    fetch?: FetchType
) {
    if (fetch === undefined) {
        fetch = await permission<FetchType>(ctx, 'taskFetching')
    }

    switch (fetch) {
        case 'ASSIGNED':
            return await queryFilterCount(ctx, m, {
                key: 'users',
                inArray: (<AuthUser>ctx.state.user).id,
            })
        default:
            return await queryFilterCount(ctx, m)
    }
}

export async function getProjectStatusList(
    ctx: ParameterizedContext,
    m: DBManager<any>,
    fetch?: FetchType
) {
    if (fetch === undefined) {
        fetch = await permission<FetchType>(ctx, 'taskFetching')
    }

    switch (fetch) {
        case 'ASSIGNED':
            return await queryFilter(ctx, m, {
                key: 'users',
                inArray: (<AuthUser>ctx.state.user).id,
            })
        default:
            return await queryFilter(ctx, m)
    }
}
