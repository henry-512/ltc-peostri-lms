import Router from '@koa/router'

import { projects } from './projects'
import { users } from './users'

export function routerBuilder(version: string) {
	const router = new Router({
		prefix: version
	})

	router
		.use(projects().routes())
		.use(users().routes())

	return router
}
