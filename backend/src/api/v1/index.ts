import Router from '@koa/router'
import { aql } from 'arangojs/aql'
import send from 'koa-send'
import { HTTPStatus } from '../../lms/errors'
import { AuthUser } from '../auth'
import { CommentManager } from './data/comments'
import { FilemetaManager } from './data/filemeta'
import { FiledataManager, FULL_FILE_PATH } from './data/files'
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
import { Managers } from './DBManager'
import {
    AdminRouter,
    getOne,
    IFileBody,
    paramId,
    parseBody,
    sendRange,
    UserRouter,
} from './Router'

/**
 * Builds a router with the passed version string.
 *
 * @param version The version string to use as the router prefix
 */
export default function routerBuilder(version: string) {
    // Resolve dependency issue
    for (const [name, manager] of Object.entries(Managers)) {
        manager.resolveDependencies()
    }

    return (
        new Router({ prefix: `${version}/` })
            //
            // ADMINISTRATION
            //
            .use(new AdminRouter('ranks', RankManager).routes())
            .use(new AdminRouter('tasks', TaskManager).routes())
            .use(new AdminRouter('modules', ModuleManager).routes())
            .use(new AdminRouter('comments', CommentManager).routes())
            .use(new AdminRouter('projects', ProjectManager).routes())
            .use(new AdminRouter('users', UserManager).routes())
            .use(new AdminRouter('teams', TeamManager).routes())
            .use(new AdminRouter('log/users', UserLogManager).routes())
            .use(new AdminRouter('filemeta', FilemetaManager).routes())
            .use(new AdminRouter('files', FiledataManager).routes())
            .use(
                new AdminRouter('notifications', NotificationManager)
                    // Reads a single notification
                    .put('/read/:id', async (ctx) => {
                        let id = await paramId(ctx, NotificationManager)

                        await NotificationManager.read(id)

                        ctx.status = HTTPStatus.NO_CONTENT
                    })
                    .routes()
            )
            // Templates
            .use(
                new AdminRouter('template/modules', ModuleTempManager)
                    // Creates a `module` from a template
                    .get('/instance/:id', async (ctx) => {
                        let id = await paramId(ctx, ModuleTempManager)

                        ctx.body = await ModuleTempManager.buildModuleFromId(id)
                        ctx.status = HTTPStatus.OK
                    })
                    .routes()
            )
            .use(
                new AdminRouter('template/projects', ProjectTempManager)
                    // Builds a project matching the passed project template ID
                    .get('/instance/:id', async (ctx) => {
                        let id = await paramId(ctx, ProjectTempManager)

                        ctx.body = await ProjectTempManager.buildProjectFromId(
                            id
                        )
                        ctx.status = HTTPStatus.OK
                    })
                    .routes()
            )

            //
            // User-facing routes
            //

            // File download and management
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
                        let id = await paramId(ctx, FilemetaManager)
                        let meta = await FilemetaManager.getFromDB(
                            ctx.state.user,
                            id,
                            false,
                            false
                        )
                        let pathTo = await FiledataManager.readLatest(
                            ctx.state.user,
                            meta
                        )
                        // Send the static file
                        await send(ctx, pathTo, { root: FULL_FILE_PATH })
                    })
                    .get('static/:id/:filename', async (ctx) => {
                        let id = await paramId(ctx, FiledataManager)
                        let pathTo = await FiledataManager.read(
                            ctx.state.user,
                            id
                        )
                        // Send the static file
                        await send(ctx, pathTo, { root: FULL_FILE_PATH })
                    })
                    .routes()
            )
            // Primary list user routes
            .use(
                new UserRouter(
                    'tasks',
                    TaskManager,
                    'taskFetching',
                    aql`DOCUMENT(z.project).team`,
                    aql`z.users`
                ).build()
            )
            .use(
                new UserRouter(
                    'projects',
                    ProjectManager,
                    'projectFetching',
                    aql`z.team`,
                    aql`z.users`
                ).build()
            )
            .use(
                new UserRouter(
                    'modules',
                    ModuleManager,
                    'moduleFetching',
                    aql`DOCUMENT(z.project).team`,
                    aql`DOCUMENT(z.project).users`
                ).build()
            )
            // NOTIFICATIONS
            .use(
                new Router({ prefix: 'notifications/' })
                    .get('list', async (ctx) => {
                        let user: AuthUser = ctx.state.user

                        let results =
                            await NotificationManager.runQueryWithFilter(
                                ctx.state.user,
                                ctx.request.query,
                                {
                                    key: 'recipient',
                                    eq: user.id,
                                }
                            )

                        sendRange(ctx, results)
                    })
                    // Reads all of the notifications for a user
                    .put('readall', async (ctx) => {
                        let user: AuthUser = ctx.state.user
                        let id = user.id

                        await NotificationManager.readAllForUser(id)

                        ctx.status = HTTPStatus.NO_CONTENT
                    })
                    // Reads one notification
                    .put('read/:id', async (ctx) => {
                        let id = await paramId(ctx, NotificationManager)

                        await NotificationManager.read(id)

                        ctx.status = HTTPStatus.NO_CONTENT
                    })
                    .routes()
            )
            //
            // PROCEEDING
            //
            // Projects
            .use(
                new Router({ prefix: 'proceeding/projects/' })
                    .put('complete/:id', async (ctx) => {
                        let id = await paramId(ctx, ProjectManager)
                        await ProjectManager.complete(ctx.state.user, id, true)
                        ctx.status = HTTPStatus.OK
                    })
                    .put('start/:id', async (ctx) => {
                        let id = await paramId(ctx, ProjectManager)
                        await ProjectManager.start(ctx.state.user, id)
                        ctx.status = HTTPStatus.OK
                    })
                    .put('restart/:id', async (ctx) => {
                        let id = await paramId(ctx, ProjectManager)
                        await ProjectManager.restart(ctx.state.user, id)
                        ctx.status = HTTPStatus.OK
                    })
                    .routes()
            )
            // Modules
            .use(
                new Router({ prefix: 'proceeding/modules/' })
                    .put('complete/:id', async (ctx) => {
                        let id = await paramId(ctx, ModuleManager)
                        await ModuleManager.complete(ctx.state.user, id, true)
                        ctx.status = HTTPStatus.OK
                    })
                    .put('start/:id', async (ctx) => {
                        let id = await paramId(ctx, ModuleManager)
                        await ModuleManager.start(ctx.state.user, id)
                        ctx.status = HTTPStatus.OK
                    })
                    .put('restart/:id', async (ctx) => {
                        let id = await paramId(ctx, ModuleManager)
                        await ModuleManager.restart(ctx.state.user, id)
                        ctx.status = HTTPStatus.OK
                    })
                    .put('advance/:id', async (ctx) => {
                        let id = await paramId(ctx, ModuleManager)
                        await ModuleManager.advance(ctx.state.user, id, true)
                        ctx.status = HTTPStatus.OK
                    })
                    .routes()
            )
            // Tasks
            .use(
                new Router({ prefix: 'proceeding/tasks/' })
                    .put('complete/:id', async (ctx) => {
                        let id = await paramId(ctx, TaskManager)
                        await TaskManager.complete(ctx.state.user, id)
                        ctx.status = HTTPStatus.OK
                    })
                    .put('upload/:id', async (ctx) => {
                        let id = await paramId(ctx, TaskManager)
                        let body = await parseBody<IFileBody>(ctx.request)
                        await TaskManager.upload(
                            ctx.state.user,
                            id,
                            ctx.request.files,
                            body.file
                        )
                        ctx.status = HTTPStatus.OK
                    })
                    .put('review/:id', async (ctx) => {
                        let id = await paramId(ctx, TaskManager)
                        let body = await parseBody<IFileBody>(ctx.request)
                        await TaskManager.review(
                            ctx.state.user,
                            id,
                            ctx.request.files,
                            body.file
                        )
                        ctx.status = HTTPStatus.OK
                    })
                    .put('revise/:id', async (ctx) => {
                        let id = await paramId(ctx, TaskManager)
                        await TaskManager.revise(
                            ctx.state.user,
                            id,
                            ctx.request.body.review
                        )
                        ctx.status = HTTPStatus.OK
                    })
                    .put('approve/:id', async (ctx) => {
                        let id = await paramId(ctx, TaskManager)
                        await TaskManager.approve(ctx.state.user, id)
                        ctx.status = HTTPStatus.OK
                    })
                    .put('deny/:id', async (ctx) => {
                        let id = await paramId(ctx, TaskManager)
                        let body = await parseBody<IFileBody>(ctx.request)
                        await TaskManager.deny(
                            ctx.state.user,
                            id,
                            ctx.request.files,
                            body.file
                        )
                        ctx.status = HTTPStatus.OK
                    })
                    .routes()
            )
    )
}
