import Router from '@koa/router'
import { IUser } from '../../lms/types'
import { apiRouter } from '../../router'

import { commentRoute } from './comments'
import { moduleRoute } from './modules'
import { projectRoute } from './projects'
import { ApiRoute } from './route'
import { taskRoute } from './tasks'
import { userGroupRoute } from './usergroups'
import { userRoute } from './users'

export function routerBuilder(version: string) {
	const router = new Router({
		prefix: `${version}/`
	})

	router
		// .use(new ApiRoute<IUser>('users', 'User', [
		// 	'firstName', 'lastName', 'avatar', 'usergroup'
		// ]).makeRouter().routes())
		
		.use(projectRoute().routes())
		.use(userRoute().routes())
		.use(moduleRoute().routes())
		.use(taskRoute().routes())
		.use(commentRoute().routes())
		.use(userGroupRoute().routes())

	return router
}
