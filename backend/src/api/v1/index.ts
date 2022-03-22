import Router from '@koa/router'
import { CommentRouteInstance } from './data/comments'
import { FilemetaRouteInstance } from './data/filemeta'
import { ModuleRouteInstance } from './data/modules'
import { ProjectRouteInstance } from './data/projects'
import { TaskRouteInstance } from './data/tasks'
import { RankRouteInstance } from './data/ranks'
import { UserRouteInstance } from './data/users'
import { ModuleTemplateRouteInstance } from './data/template/moduleTemplates'
import { ProjectTemplateRouteInstance } from './data/template/projectTemplates'
import { HTTPStatus } from '../../lms/errors'

export function routerBuilder(version: string) {
	return new Router({prefix: `${version}/`})
		.use(RankRouteInstance.makeRouter().routes())
		.use(UserRouteInstance.makeRouter().routes())
		.use(TaskRouteInstance.makeRouter().routes())
		.use(ModuleRouteInstance.makeRouter().routes())
		.use(CommentRouteInstance.makeRouter().routes())
		.use(ProjectRouteInstance.makeRouter().routes())
		// Templates
		.use(ModuleTemplateRouteInstance.makeRouter().routes())
		.use(ProjectTemplateRouteInstance.makeRouter().routes())
		// Files
		.use(FilemetaRouteInstance.makeRouter().routes())
		.use(new Router({prefix:'files'})
			.get('/:id', async (ctx, next) => {
				if (await FilemetaRouteInstance.exists(ctx.params.id)) {
					let meta = await FilemetaRouteInstance.getFromDB(
						ctx.state.user,
						0,
						ctx.params.id
					)
					let buffer = await FilemetaRouteInstance.readLatest(meta)
					ctx.ok(buffer)
				} else {
					ctx.status = HTTPStatus.NOT_FOUND
					ctx.body = `File [${ctx.params.id}] dne.`
				}

				next()
			})
			.routes())
}
