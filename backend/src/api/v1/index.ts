import Router from '@koa/router'

import { projects } from './projects'

export function routerBuilder(version: string) {
	const router = new Router({
		prefix: version
	})

	router
		.use(projects().routes())

	return router
}
