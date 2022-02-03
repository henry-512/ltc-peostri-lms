import Router from '@koa/router'
import koaBody from 'koa-body'

import { db } from '../../database'
import { ITask, IArangoIndexes, IComment } from '../../lms/types'
import { generateDBKey } from '../../util'
import { getComment, uploadAllComments } from './comments'
import { getUser } from './users'

var TaskCol = db.collection('tasks')

export async function uploadTask(key: string, task: ITask, parent: string) {
	// Convert from key to id
	const taskId = 'tasks/'.concat(key)

	if (!task.comments) {
        task.comments = []
    } else if (task.comments.length !== 0) {
        let comAr = await uploadAllComments(task.comments as IComment[], taskId)
        task.comments = comAr.map(v => v._key as string)
    }

	delete task.id
	task.module = parent
	task._key = key

	console.log(`Task uploaded: ${task}`)

	return TaskCol.save(task) as IArangoIndexes
}

export async function getTask(id: string, cascade?: boolean) {
	var task = await TaskCol.document(id) as ITask

	task.id = task._key

	delete task._key
	delete task._id
	delete task._rev

	if (cascade) {
		task.comments = await Promise.all(task.comments.map(async c => await getComment(c as string, cascade)))
		if (task.assigned) {
			task.assigned = await Promise.all(task.assigned.map(async t => await getUser(t as string, cascade)))
		}
	}

	return task
}

export async function existsTask(id: string) { return TaskCol.documentExists(id) }

export function taskRoute() {
    const router = new Router({
        prefix: '/tasks'
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
						case 'status':
						case 'module':
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
						FOR t in tasks
						SORT t.${sort} ${sortDir}
						LIMIT @offset, @count
						RETURN {
							id: t._key,
							title: t.title,
							assigned: t.assigned,
							comments: t.comments,
							module: t.module
						}`,
					bindVars: {
						offset: offset,
						count: count
					}
				})

				var all = await cursor.all() as ITask[]

				ctx.status = 200
				ctx.body = all

				// Required by simple REST data provider
				// https://github.com/marmelab/react-admin/blob/master/packages/ra-data-simple-rest/README.md
				ctx.set('Content-Range', `tasks 0-${all.length-1}/${all.length}`)
				ctx.set('Access-Control-Expose-Headers', 'Content-Range')
			} catch (err) {
				console.log(err)
				ctx.status = 500
			}
		})
		.get('/:id', async ctx => {
			try  {
				if (await TaskCol.documentExists(ctx.params.id)) {
					ctx.status = 200
					ctx.body = await getTask(ctx.params.id)
					ctx.set('Content-Range', `modules 0-0/1`)
					ctx.set('Access-Control-Expose-Headers', 'Content-Range')
				} else {
					ctx.status = 404
					ctx.body = `Task [${ctx.params.id}] dne.`
				}
			} catch (err) {
				console.log(err)
				ctx.status = 500
			}
		})
		.post('/', koaBody(), async ctx => {
			try {
				var body = ctx.request.body

				if (!body.id || await TaskCol.documentExists(body.id)) {
					ctx.status = 409
					ctx.body = `Task [${body.id}] already exists`
				} else {
					await uploadTask(generateDBKey(), ctx.body, ctx.body.project)

					ctx.status = 201
					ctx.body = 'Task created'
				}
			} catch (err) {
				console.log(err)
				ctx.status = 500
			}
			console.log('Create new');
		})

	return router
}
