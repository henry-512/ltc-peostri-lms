import Router from '@koa/router'
import koaBody from 'koa-body'

import { generateDBKey } from '../../util'
import { db } from '../../database'
import { IArangoIndexes, IModule, IComment } from '../../lms/types'
import { getComment, uploadAllComments } from './comments'
import { existsTask, getTask, uploadTask } from './tasks'

const ModuleCol = db.collection('modules')

/**
 * Adds a passed module to the database
 */
export async function uploadModule(key: string, mod: IModule, parent: string) {
	// Convert from key to id
	const modId = 'modules/'.concat(key)

	mod.tasks = await Promise.all(mod.tasks.map(async tsk => {
        if (typeof tsk !== 'string') {
			var nk = generateDBKey()
            await uploadTask(nk, tsk, modId)
			return 'tasks/'.concat(nk)
        } else if (typeof tsk === 'string' && await existsTask(tsk)) {
			return 'tasks/'.concat(tsk)
		} else {
            throw new ReferenceError(`Task ${tsk} not valid`)
		}
    }))

	if (!mod.comments) {
        mod.comments = []
    } else if (mod.comments.length !== 0) {
        let comAr = await uploadAllComments(mod.comments as IComment[], modId)
        mod.comments = comAr.map(v => v._key as string)
    }

	delete mod.id
	mod._key = key

	console.log(`Module added: ${mod}`)

	return ModuleCol.save(mod) as IArangoIndexes
}

export async function getModule(id: string, cascade?: boolean) {
	var mod = await ModuleCol.document(id) as IModule

	mod.id = mod._key

	delete mod._key
	delete mod._id
	delete mod._rev

	if (cascade) {
		if (mod.comments) {
			mod.comments = await Promise.all(mod.comments.map(async c => await getComment(c as string, cascade)))
		}
		if (mod.tasks) {
			mod.tasks = await Promise.all(mod.tasks.map(async t => await getTask(t as unknown as string, cascade)))
		}
	}

	return mod
}

export async function existsModule(id: string) { return ModuleCol.documentExists(id) }

export function moduleRoute() {
    const router = new Router({
        prefix: 'modules'
    })

	router
		.get('/', async ctx => {
			try {
				let q = ctx.request.query

				let sort = '_key'
				let sortDir = 'ASC'
				let offset = 0
				let count = 10

				if (q.sort && q.sort.length == 2) {
					switch (q.sort[0]) {
						case 'id': sort = '_key'; break
						case 'title':
						case 'project':
							sort = q.sort[0]
                            break
						default:
							sort = '_key'
					}
					sortDir = q.sort[1] === 'DESC' ? 'DESC' : 'ASC'
				}

				if (q.range && q.range.length == 2) {
					offset = parseInt(q.range[0])
					count = Math.min(parseInt(q.range[1]), 50)
				}

				const cursor = await db.query({
					query: `
						FOR m in modules
						SORT m.${sort} ${sortDir}
						LIMIT @offset, @count
						RETURN {
							id: m._key,
							tasks: m.tasks,
							comments: m.comments,
							project: m.project
						}`,
					bindVars: {
						offset: offset,
						count: count
					}
				})

				var all = await cursor.all() as IModule[]

				ctx.status = 200
				ctx.body = all

				// Required by simple REST data provider
				// https://github.com/marmelab/react-admin/blob/master/packages/ra-data-simple-rest/README.md
				ctx.set('Content-Range', `modules 0-${all.length-1}/${all.length}`)
				ctx.set('Access-Control-Expose-Headers', 'Content-Range')
			} catch (err) {
				console.log(err)
				ctx.status = 500
			}
		})
		.get('/:id', async ctx => {
			try  {
				if (await ModuleCol.documentExists(ctx.params.id)) {
					ctx.status = 200
					ctx.body = await getModule(ctx.params.id, true)
					ctx.set('Content-Range', `modules 0-0/1`)
					ctx.set('Access-Control-Expose-Headers', 'Content-Range')
				} else {
					ctx.status = 404
					ctx.body = `User [${ctx.params.id}] dne.`
				}
			} catch (err) {
				console.log(err)
				ctx.status = 500
			}
		})
		.post('/', koaBody(), async ctx => {
			try {
				var body = ctx.request.body

				if (!body.id || await ModuleCol.documentExists(body.id)) {
					ctx.status = 409
					ctx.body = `User [${body.id}] already exists`
				} else {
					await uploadModule(generateDBKey(), ctx.body, ctx.body.project)

					ctx.status = 201
					ctx.body = 'User created'
				}
			} catch (err) {
				console.log(err)
				ctx.status = 500
			}
			console.log('Create new');
		})

	return router
}