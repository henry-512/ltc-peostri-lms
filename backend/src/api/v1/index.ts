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
