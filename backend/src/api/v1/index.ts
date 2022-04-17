import Router from '@koa/router'
import { HTTPStatus } from '../../lms/errors'
import { AuthUser } from '../auth'
import send from 'koa-send'
import { CommentManager } from './data/comments'
import { FilemetaManager } from './data/filemeta'
import { FiledataManager } from './data/files'
import { UserLogManager } from './data/log/userLog'
import { ModuleManager } from './data/modules'
import { NotificationManager } from './data/notifications'
import { ProjectManager } from './data/projects'
import { RankManager } from './data/ranks'
import { TaskManager } from './data/tasks'
import { TeamManager } from './data/teams'
import { ModuleTempManager } from './data/template/moduleTemplates'
import { ProjectTempManager } from './data/template/projectTemplates'
import { UserManager } from './data/users'
import { AdminRouter, getOne, sendRange, UserRouter } from './Router'

export function routerBuilder(version: string) {
    // Resolve dependency issue
    UserManager.resolveDependencies()
    TeamManager.resolveDependencies()

    return (
        new Router({ prefix: `${version}/` })
            .use(new AdminRouter('ranks', RankManager).routes())
            .use(new AdminRouter('tasks', TaskManager).routes())
            .use(new AdminRouter('modules', ModuleManager).routes())
            .use(new AdminRouter('comments', CommentManager).routes())
            .use(new AdminRouter('projects', ProjectManager).routes())
            .use(new AdminRouter('users', UserManager).routes())
            .use(new AdminRouter('teams', TeamManager).routes())
            .use(new AdminRouter('log/users', UserLogManager).routes())
            .use(
                new AdminRouter('notifications', NotificationManager)
                    .put('/read/:id', async (ctx) => {
                        // TODO: validate recipient?

                        let id = await NotificationManager.db.assertKeyExists(
                            ctx.params.id
                        )

                        await NotificationManager.read(id)

                        ctx.status = HTTPStatus.NO_CONTENT
                    })
                    .routes()
            )
            // Templates
            .use(
                new AdminRouter('template/modules', ModuleTempManager)
                    .get('/instance/:id', async (ctx) => {
                        let id = await ModuleTempManager.db.assertKeyExists(
                            ctx.params.id
                        )

                        ctx.body = await ModuleTempManager.buildModuleFromId(id)
                        ctx.status = HTTPStatus.OK
                    })
                    .routes()
            )
            .use(
                new AdminRouter('template/projects', ProjectTempManager)
                    // Builds a project matching the passed project template ID
                    .get('/instance/:id', async (ctx) => {
                        let id = await ProjectTempManager.db.assertKeyExists(
                            ctx.params.id
                        )

                        ctx.body = await ProjectTempManager.buildProjectFromId(
                            id
                        )
                        ctx.status = HTTPStatus.OK
                    })
                    .routes()
            )
            // Files
            .use(new AdminRouter('filemeta', FilemetaManager).routes())
            .use(new AdminRouter('files', FiledataManager).routes())
            // Download and management
            .use(
                new Router({ prefix: 'files/' })
                    // Get raw metadata
                    .get(
                        'list/:id',
                        async (ctx) =>
                            await getOne(ctx, FilemetaManager, ctx.params.id)
                    )
                    // Send latest for the passed metadata handler
                    .get('latest/:id', async (ctx) => {
                        let id = await FilemetaManager.db.assertKeyExists(
                            ctx.params.id
                        )
                        let meta = await FilemetaManager.getFromDB(
                            ctx.state.user,
                            id
                        )
                        let pathTo = await FiledataManager.readLatest(
                            ctx.state.user,
                            meta
                        )
                        // ctx.ok(buffer)
                        await send(ctx, pathTo)
                    })
                    .get('static/:id', async (ctx) => {
                        let id = await FiledataManager.db.assertKeyExists(
                            ctx.params.id
                        )
                        let pathTo = await FiledataManager.read(
                            ctx.state.user,
                            id
                        )
                        await send(ctx, pathTo)
                    })
                    .routes()
            )
            // User routes
            // Tasks
            .use(new UserRouter('tasks', TaskManager).build())
            .use(new UserRouter('projects', ProjectManager).build())
            .use(
                new Router({ prefix: 'notifications/' })
                    // NOTIFICATIONS
                    .get('list', async (ctx) => {
                        let user: AuthUser = ctx.state.user
                        let id = user.id

                        let results =
                            await NotificationManager.getNotificationsAssignedToUser(
                                id,
                                ctx.request.query
                            )

                        sendRange(results, ctx)
                    })
                    .put('readall', async (ctx) => {
                        let user: AuthUser = ctx.state.user
                        let id = user.id

                        await NotificationManager.readAllForUser(id)

                        ctx.status = HTTPStatus.NO_CONTENT
                    })
                    .put('read/:id', async (ctx) => {
                        // TODO: validate recipient?

                        let id = await NotificationManager.db.assertKeyExists(
                            ctx.params.id
                        )

                        await NotificationManager.read(id)

                        ctx.status = HTTPStatus.NO_CONTENT
                    })
                    .routes()
            )
    )
}
