import Router from '@koa/router'
import fs from 'fs'
import { ParameterizedContext } from 'koa'
import { config } from '../../config'
import { IGetAllQueryResults, IQueryGetOpts } from '../../database'
import { HTTPStatus } from '../../lms/errors'
import { IArangoIndexes } from '../../lms/types'
import { DBManager } from './DBManager'

export interface APIRouterOpts {
    noDebugRoute?: boolean
    noListGetAll?: boolean
    noListGetId?: boolean
    noListPost?: boolean
    noListPut?: boolean
    noListDelete?: boolean
}

export const allDisabled: APIRouterOpts = {
    noDebugRoute: true,
    noListGetAll: true,
    noListGetId: true,
    noListPost: true,
    noListPut: true,
    noListDelete: true,
}

export class APIRouter<Type extends IArangoIndexes> extends Router {
    /**
     * Create a new router.
     */
    constructor(
        prefix: string,
        private manager: DBManager<Type>,
        private apiOpts?: APIRouterOpts
    ) {
        // Apply prefix
        super({ prefix })
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
            this.get('/list/:id', async (ctx) => {
                let id = await this.manager.db.assertKeyExists(ctx.params.id)

                ctx.body = await this.manager.getFromDB(ctx.state.user, id)
                ctx.status = HTTPStatus.OK
            })
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
