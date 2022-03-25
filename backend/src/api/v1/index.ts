import Router from '@koa/router'
import fs from 'fs'
import { config } from '../../config'
import { HTTPStatus } from '../../lms/errors'
import { IArangoIndexes } from '../../lms/types'
import { splitId } from '../../lms/util'
import { CommentManager } from './data/comments'
import { FilemetaManager } from './data/filemeta'
import { ModuleManager } from './data/modules'
import { ProjectManager } from './data/projects'
import { RankManager } from './data/ranks'
import { TaskManager } from './data/tasks'
import { ModuleTempManager } from './data/template/moduleTemplates'
import { ProjectTempManager } from './data/template/projectTemplates'
import { UserManager } from './data/users'
import { DBManager } from './DBManager'

export function routerBuilder(version: string) {
    return (
        new Router({ prefix: `${version}/` })
            .use(
                route('users', UserManager, (r, m) =>
                    r.get('/self', async (ctx) => {
                        let user = ctx.state.user

                        ctx.body = await m.getFromDB(user, 0, user.getId())
                        ctx.status = HTTPStatus.OK
                    })
                )
            )
            .use(route('ranks', RankManager))
            .use(route('tasks', TaskManager))
            .use(route('modules', ModuleManager))
            .use(route('comments', CommentManager))
            .use(route('projects', ProjectManager))
            // Templates
            .use(
                route('template/modules', ModuleTempManager, (r, m) =>
                    r.get('/instance/:id', async (ctx) => {
                        let id = await m.db.assertKeyExists(ctx.params.id)

                        ctx.body = await ModuleTempManager.buildModuleFromId(id)
                        ctx.status = HTTPStatus.OK
                    })
                )
            )
            .use(
                route(
                    'template/projects',
                    ProjectTempManager,
                    // Builds a project matching the passed project template ID
                    (r, m) =>
                        r.get('/instance/:id', async (ctx, next) => {
                            let id = await m.db.assertKeyExists(ctx.params.id)

                            ctx.body =
                                await ProjectTempManager.buildProjectFromId(id)
                            ctx.status = HTTPStatus.OK
                        })
                )
            )
            // Files
            .use(route('filemeta', FilemetaManager))
            .use(
                new Router({ prefix: 'files' })
                    .get('/:id', async (ctx) => {
                        let id = await FilemetaManager.db.assertKeyExists(
                            ctx.params.id
                        )

                        let meta = await FilemetaManager.getFromDB(
                            ctx.state.user,
                            0,
                            id
                        )
                        let buffer = await FilemetaManager.readLatest(meta)

                        ctx.ok(buffer)
                    })
                    .routes()
            )
    )
}

async function parseBody<Type extends IArangoIndexes>(req: any) {
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

function route<Type extends IArangoIndexes>(
    prefix: string,
    manager: DBManager<Type>,
    call?: (router: Router, manager: DBManager<Type>) => any
) {
    let r = new Router({ prefix })

    if (call) {
        call(r, manager)
    }

    if (config.devRoutes) {
        r = manager.debugRoutes(r)
    }

    r.get('/', async (ctx) => {
        let results = await manager.query(ctx.request.query)

        ctx.status = HTTPStatus.OK
        ctx.body = results.all

        ctx.set(
            'Content-Range',
            `documents ${results.low}-${results.high}/${results.size}`
        )
        ctx.set('Access-Control-Expose-Headers', 'Content-Range')
    })

    r.get('/:id', async (ctx) => {
        let id = await manager.db.assertKeyExists(ctx.params.id)

        ctx.body = await manager.getFromDB(ctx.state.user, 0, id)
        ctx.status = HTTPStatus.OK
    })

    r.post('/', async (ctx) => {
        let doc: Type = await parseBody<Type>(ctx.request)

        let id = await manager.create(
            ctx.state.user,
            ctx.request.files,
            doc,
            ctx.header['user-agent'] !== 'backend-testing'
        )

        ctx.status = HTTPStatus.CREATED
        ctx.body = {
            id: splitId(id).key,
            message: `${manager.className} created with id [${id}]`,
        }
    })

    r.put('/:id', async (ctx) => {
        let id = manager.db.keyToId(ctx.params.id)
        let doc: Type = await parseBody<Type>(ctx.request)

        await manager.update(
            ctx.state.user,
            ctx.request.files,
            id,
            doc,
            ctx.header['user-agent'] !== 'backend-testing'
        )

        ctx.body = await manager.getFromDB(ctx.state.user, 0, id)
        ctx.status = HTTPStatus.OK
    })

    r.delete('/:id', async (ctx) => {
        let id = await manager.db.assertKeyExists(ctx.params.id)
        await manager.delete(
            ctx.state.user,
            id,
            ctx.header['user-agent'] !== 'backend-testing',
            true
        )
        ctx.status = HTTPStatus.OK
        ctx.body = {
            id: id,
            message: `${manager.className} deleted`,
        }
    })

    return r.routes()
}
