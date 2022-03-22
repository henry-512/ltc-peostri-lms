import Router from '@koa/router'
import fs from 'fs'

import { CommentManager } from './data/comments'
import { FilemetaManager } from './data/filemeta'
import { ModuleManager } from './data/modules'
import { ProjectManager } from './data/projects'
import { TaskManager } from './data/tasks'
import { RankManager } from './data/ranks'
import { UserManager } from './data/users'
import { ModuleTemplateRouteInstance } from './data/template/moduleTemplates'
import { ProjectTemplateRouteInstance } from './data/template/projectTemplates'
import { HTTPStatus } from "../../lms/errors";
import { IArangoIndexes } from "../../lms/types";
import { DBManager } from "./DBManager";
import { splitId } from '../../lms/util'
import { AuthUser } from '../auth'

export function routerBuilder(version: string) {
	return new Router({prefix: `${version}/`})
		.use(route('users', UserManager, (r,m) =>
			r.get('/self', async (ctx, next) => {
				let user = await AuthUser.validate(ctx.cookies.get('token'))
	
				ctx.body = await m.getFromDB(user, 0, user.getId())
				ctx.status = HTTPStatus.OK
			})
		))
		.use(route('ranks', RankManager))
		.use(route('tasks', TaskManager))
		.use(route('modules', ModuleManager))
		.use(route('comments', CommentManager))
		.use(route('projects', ProjectManager))
		// Templates
		.use(route('template/modules', ModuleTemplateRouteInstance,
			(r,m) => r.get('/instance/:id', async (ctx, next) => {
				let id = m.db.keyToId(ctx.params.id)
				if (!m.exists(id)) {
					ctx.body = await ModuleTemplateRouteInstance
						.buildModuleFromId(id)
					ctx.status = HTTPStatus.OK
				} else {
					ctx.status = HTTPStatus.NOT_FOUND
					ctx.body = `${m.className} [${id}] dne`
				}
			})
		))
		.use(route('template/projects', ProjectTemplateRouteInstance,
			// Builds a project matching the passed project template ID
			(r,m) => r.get('/instance/:id', async (ctx, next) => {
				let id = m.db.keyToId(ctx.params.id)
				if (!m.exists(id)) {
					ctx.body = await ProjectTemplateRouteInstance
						.buildProjectFromId(id)
					ctx.status = HTTPStatus.OK
				} else {
					ctx.status = HTTPStatus.NOT_FOUND
					ctx.body = `${m.className} [${id}] dne`
				}
				
				next()
			})
		))
		// Files
		.use(route('filemeta', FilemetaManager))
		.use(new Router({prefix:'files'})
			.get('/:id', async (ctx, next) => {
				let id = FilemetaManager.db.keyToId(ctx.params.id)
				if (await FilemetaManager.exists(id)) {
					let meta = await FilemetaManager.getFromDB(
						ctx.state.user,
						0,
						id
					)
					let buffer = await FilemetaManager.readLatest(meta)
					ctx.ok(buffer)
				} else {
					ctx.status = HTTPStatus.NOT_FOUND
					ctx.body = `File [${id}] dne.`
				}

				next()
			})
			.routes())
}

async function parseBody<Type extends IArangoIndexes>(req:any) {
	// Multipart form requests put the POST data in a different spot
	if (req.files && req.files.json) {
		let file = req.files.json
		if (Array.isArray(file)) {
			file = file[0]
		}
		let buf = await fs.promises.readFile(
			file.path,
		)

		return JSON.parse(buf.toString())
	} else {
		return req.body as Type
	}
}

function route<Type extends IArangoIndexes>(
	prefix: string,
	manager: DBManager<Type>,
	call?: (router: Router, manager: DBManager<Type>) => any
) {
	let r = new Router({prefix})

	if (call) {
		call(r, manager)
	}

	r.get('/', async (ctx, next) => {
		const qdata = await manager.query(ctx.request.query)
		let all = await qdata.cursor.all()

		// Convert all document foreign ids to keys
		await Promise.all(all.map(
			async doc => manager.convertIds(doc)
		))

		ctx.status = HTTPStatus.OK
		ctx.body = all

		ctx.set('Content-Range', `documents ${qdata.low}-${qdata.high}/${qdata.size}`)
		ctx.set('Access-Control-Expose-Headers', 'Content-Range')

		await next()
	})

	r.get('/:id', async (ctx, next) => {
		let id = manager.db.keyToId(ctx.params.id)
		if (await manager.exists(id)) {
			ctx.body = await manager.getFromDB(
				ctx.state.user, 0, id
			)
			ctx.status = HTTPStatus.OK
		} else {
			ctx.status = HTTPStatus.NOT_FOUND
			ctx.body = `${manager.className} [${id}] dne.`
		}
	})

	r.post('/', async (ctx, next) => {
		let doc:Type = await parseBody<Type>(ctx.request)

		let id = await manager.create(
			ctx.state.user,
			ctx.request.files,
			doc,
			ctx.header['user-agent'] !== 'backend-testing')

		ctx.status = HTTPStatus.CREATED
		ctx.body = {
			id: splitId(id).key,
			message: `${manager.className} created with id [${id}]`
		}
	})

	r.put('/:id', async (ctx, next) => {
		let id = manager.db.keyToId(ctx.params.id)
		if (await manager.exists(id)) {
			let doc:Type = await parseBody<Type>(ctx.request)

			await manager.update(
				ctx.state.user,
				ctx.request.files,
				ctx.params.id,
				doc,
				ctx.header['user-agent'] !== 'backend-testing')

			ctx.body = await manager.getFromDB(
				ctx.state.user, 0, ctx.params.id
			)
			ctx.status = HTTPStatus.OK
		} else {
			ctx.status = HTTPStatus.CONFLICT
			ctx.body = `${manager.className} [${id}] dne`
		}
	})

	r.delete('/:id', async (ctx, next) => {
		let id = manager.db.keyToId(ctx.params.id)
		if (await manager.exists(id)) {
			await manager.delete(
				ctx.state.user, id,
				ctx.header['user-agent'] !== 'backend-testing',
				true)
			ctx.status = HTTPStatus.OK
			ctx.body = {
				id: id,
				message: `${manager.className} deleted`,
			}
		} else {
			ctx.status = HTTPStatus.NOT_FOUND
			ctx.body = `${manager.className} [${id}] dne`
		}
	})

	return r.routes()
}
