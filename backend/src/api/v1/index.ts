import Router from '@koa/router'
import { CommentRouteInstance } from './comments'
import { FileMetadataRouteInstance } from './fileMetadata'
import { ModuleRouteInstance } from './modules'
import { ProjectRouteInstance } from './projects'
import { TaskRouteInstance } from './tasks'
import { RankRouteInstance } from './ranks'
import { UserRouteInstance } from './users'

export function routerBuilder(version: string) {
	return new Router({prefix: `${version}/`})
		.use(RankRouteInstance.makeRouter().routes())
		.use(UserRouteInstance.makeRouter().routes())
		.use(TaskRouteInstance.makeRouter().routes())
		.use(ModuleRouteInstance.makeRouter().routes())
		.use(CommentRouteInstance.makeRouter().routes())
		.use(FileMetadataRouteInstance.makeRouter().routes())
		.use(ProjectRouteInstance.makeRouter().routes())
}
