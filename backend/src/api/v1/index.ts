import Router from '@koa/router'
import { CommentRouteInstance } from './comments'
import { FileMetadataRouteInstance } from './fileMetadata'
import { ModuleRouteInstance } from './module'
import { ProjectRouteInstance } from './projects'
import { TaskRouteInstance } from './tasks'
import { UserGroupRouteInstance } from './userGroup'
import { UserRouteInstance } from './users'

export function routerBuilder(version: string) {
	return new Router({prefix: `${version}/`})
		.use(UserGroupRouteInstance.makeRouter().routes())
		.use(UserRouteInstance.makeRouter().routes())
		.use(TaskRouteInstance.makeRouter().routes())
		.use(ModuleRouteInstance.makeRouter().routes())
		.use(CommentRouteInstance.makeRouter().routes())
		.use(FileMetadataRouteInstance.makeRouter().routes())
		.use(ProjectRouteInstance.makeRouter().routes())
}
