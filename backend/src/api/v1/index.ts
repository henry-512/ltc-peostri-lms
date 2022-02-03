import Router from '@koa/router'

import { commentRoute } from './comments'
import { moduleRoute } from './modules'
import { projectRoute } from './projects'
import { taskRoute } from './tasks'
import { userGroupRoute } from './usergroups'
import { userRoute } from './users'

export function routerBuilder(version: string) {
	const router = new Router({
		prefix: version
	})

	router
		.use(projectRoute().routes())
		.use(userRoute().routes())
		.use(moduleRoute().routes())
		.use(taskRoute().routes())
		.use(commentRoute().routes())
		.use(userGroupRoute().routes())

	return router
}
