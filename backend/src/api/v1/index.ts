import Router from '@koa/router'
import { HTTPStatus } from '../../lms/errors'
import { AuthUser } from '../auth'
import { CommentManager } from './data/comments'
import { FilemetaManager } from './data/filemeta'
import { FiledataManager } from './data/files'
import { ModuleManager } from './data/modules'
import { NotificationManager } from './data/notifications'
import { ProjectManager } from './data/projects'
import { RankManager } from './data/ranks'
import { TaskManager } from './data/tasks'
import { TeamManager } from './data/teams'
import { ModuleTempManager } from './data/template/moduleTemplates'
import { ProjectTempManager } from './data/template/projectTemplates'
import { UserManager } from './data/users'
import { APIRouter, sendRange } from './Router'

export function routerBuilder(version: string) {
    // Resolve dependency issue
    UserManager.resolveDependencies()
    TeamManager.resolveDependencies()

    return (
        new Router({ prefix: `${version}/` })
            .use(new APIRouter('ranks', RankManager).routes())
            .use(new APIRouter('tasks', TaskManager).routes())
            .use(new APIRouter('modules', ModuleManager).routes())
            .use(new APIRouter('comments', CommentManager).routes())
            .use(new APIRouter('projects', ProjectManager).routes())
            .use(new APIRouter('teams', TeamManager).routes())
            .use(
                new APIRouter('notifications', NotificationManager)
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
                new APIRouter('template/modules', ModuleTempManager)
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
                new APIRouter('template/projects', ProjectTempManager)
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
            .use(new APIRouter('filemeta', FilemetaManager).routes())
            .use(
                new Router({ prefix: 'files' })
                    .get('/:id', async (ctx) => {
                        let id = await FilemetaManager.db.assertKeyExists(
                            ctx.params.id
                        )

                        let meta = await FilemetaManager.getFromDB(
                            ctx.state.user,
                            id
                        )
                        let buffer = await FiledataManager.readLatest(meta)

                        ctx.ok(buffer)
                    })
                    .routes()
            )
            // User routes
            // Default
            .use(new APIRouter('users', UserManager).routes())
            .use(
                new Router()
                    .get('tasks/count', async (ctx) => {
                        let user: AuthUser = ctx.state.user
                        let id = user.getId()

                        await UserManager.db.assertIdExists(id)

                        ctx.body = await TaskManager.getNumTasksAssignedToUser(
                            id,
                            ctx.request.query
                        )
                        ctx.status = HTTPStatus.OK
                    })
                    .get('tasks/list', async (ctx) => {
                        let user: AuthUser = ctx.state.user
                        let id = user.getId()

                        await UserManager.db.assertIdExists(id)

                        let results = await TaskManager.getTasksAssignedToUser(
                            id,
                            ctx.request.query
                        )

                        sendRange(results, ctx)
                    })
                    .get('tasks/count/:id', async (ctx) => {
                        let id = await UserManager.db.assertKeyExists(
                            ctx.params.id
                        )

                        ctx.body = await TaskManager.getNumTasksAssignedToUser(
                            id,
                            ctx.request.query
                        )
                        ctx.status = HTTPStatus.OK
                    })
                    .get('tasks/list/:id', async (ctx) => {
                        let id = await UserManager.db.assertKeyExists(
                            ctx.params.id
                        )

                        let results = await TaskManager.getTasksAssignedToUser(
                            id,
                            ctx.request.query
                        )

                        sendRange(results, ctx)
                    })
                    .get('projects/count', async (ctx) => {
                        let user: AuthUser = ctx.state.user
                        let id = user.getId()

                        await UserManager.db.assertIdExists(id)

                        ctx.body =
                            await ProjectManager.getNumProjectsAssignedToUser(
                                id,
                                ctx.request.query
                            )
                        ctx.status = HTTPStatus.OK
                    })
                    .get('projects/list', async (ctx) => {
                        let user: AuthUser = ctx.state.user
                        let id = user.getId()

                        await UserManager.db.assertIdExists(id)

                        let results =
                            await ProjectManager.getProjectsAssignedToUser(
                                id,
                                ctx.request.query
                            )

                        sendRange(results, ctx)
                    })
                    .get('projects/count/:id', async (ctx) => {
                        let id = await UserManager.db.assertKeyExists(
                            ctx.params.id
                        )

                        ctx.body =
                            await ProjectManager.getNumProjectsAssignedToUser(
                                id,
                                ctx.request.query
                            )
                        ctx.status = HTTPStatus.OK
                    })
                    .get('projects/list/:id', async (ctx) => {
                        let id = await UserManager.db.assertKeyExists(
                            ctx.params.id
                        )

                        let results =
                            await ProjectManager.getProjectsAssignedToUser(
                                id,
                                ctx.request.query
                            )

                        sendRange(results, ctx)
                    })
                    // NOTIFICATIONS
                    .get('notifications/list', async (ctx) => {
                        let user: AuthUser = ctx.state.user
                        let id = user.getId()

                        await UserManager.db.assertIdExists(id)

                        let results =
                            await NotificationManager.getNotificationsAssignedToUser(
                                id,
                                ctx.request.query
                            )

                        sendRange(results, ctx)
                    })
                    .put('notifications/readall', async (ctx) => {
                        let user: AuthUser = ctx.state.user
                        let id = user.getId()

                        await UserManager.db.assertIdExists(id)

                        await NotificationManager.readAllForUser(id)

                        ctx.status = HTTPStatus.NO_CONTENT
                    })
                    .put('notifications/read/:id', async (ctx) => {
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
