import Router from '@koa/router'
import { CommentRouteInstance } from './comments'
import { FilemetaRouteInstance } from './filemeta'
import { ModuleRouteInstance } from './modules'
import { ProjectRouteInstance } from './projects'
import { TaskRouteInstance } from './tasks'
import { RankRouteInstance } from './ranks'
import { UserRouteInstance } from './users'
import { ModuleTemplateRouteInstance } from './template/moduleTemplates'
import { ProjectTemplateRouteInstance } from './template/projectTemplates'

export function routerBuilder(version: string) {
	return new Router({prefix: `${version}/`})
		.use(RankRouteInstance.makeRouter().routes())
		.use(UserRouteInstance.makeRouter().routes())
		.use(TaskRouteInstance.makeRouter().routes())
		.use(ModuleRouteInstance.makeRouter().routes())
		.use(CommentRouteInstance.makeRouter().routes())
		.use(FilemetaRouteInstance.makeRouter().routes())
		.use(ProjectRouteInstance.makeRouter().routes())
		// Templates
		.use(ModuleTemplateRouteInstance.makeRouter().routes())
		.use(ProjectTemplateRouteInstance.makeRouter().routes())
}
