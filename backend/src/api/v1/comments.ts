import Router from '@koa/router'
import koaBody from 'koa-body'

import { db } from '../../database'
import { IComment, IArangoIndexes } from '../../lms/types'
import { generateDBKey } from '../../util'
import { getUser } from './users'

const CommentCol = db.collection('comments')

export async function uploadAllComments(comAr: IComment[], parent: string) {
	return CommentCol.saveAll(await Promise.all(comAr.map(async com => {
        var nk = generateDBKey()
        if (typeof com === 'string') {
			throw new ReferenceError(`Comment ${com} not valid`)
		}
		if (typeof com.author !== 'string') {
			throw new TypeError(`Author ${com.author} is not a string reference`)
		}
	
		com.createdAt = new Date()
		com.updatedAt = new Date()
	
		delete com.id
		com.parent = parent
		com._key = nk

		console.log(`Comment added: ${com}`)

		return com
    }))) as Promise<IArangoIndexes[]>
}

export async function uploadComment(key: string, com: IComment, parent: string) {
	// Parent cannot be checked since it gets added to db last

	// Uploaded comments should always have reference Authors
	if (typeof com.author !== 'string') {
		throw new TypeError(`Author ${com.author} is not a string reference`)
	}

	com.createdAt = new Date()
	com.updatedAt = new Date()

	delete com.id
	com.parent = parent
	com._key = key
	
	return CommentCol.save(com) as IArangoIndexes
}

export async function getComment(id: string, cascade?: boolean) {
	var com = await CommentCol.document(id) as IComment

	com.id = com._key

	delete com._key
	delete com._id
	delete com._rev

	if (cascade && com.author) {
		com.author = await getUser(com.author as string, cascade)
	}

	return com	
}

export async function existsComment(id: string) { return CommentCol.documentExists(id) }

export function commentRoute() {
    const router = new Router({
        prefix: '/comments'
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
						case 'content':
						case 'author':
						case 'createdAt':
						case 'updatedAt':
						case 'parent':
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
						FOR c in comments
						SORT c.${sort} ${sortDir}
						LIMIT @offset, @count
						RETURN {
							id: c._key,
							content: t.content,
							author: t.author,
							createdAt: t.createdAt,
							updatedAt: t.updatedAt,
							parent: t.parent
						}`,
					bindVars: {
						offset: offset,
						count: count
					}
				})

				var all = await cursor.all() as IComment[]

				ctx.status = 200
				ctx.body = all

				// Required by simple REST data provider
				// https://github.com/marmelab/react-admin/blob/master/packages/ra-data-simple-rest/README.md
				ctx.set('Content-Range', `comments 0-${all.length-1}/${all.length}`)
				ctx.set('Access-Control-Expose-Headers', 'Content-Range')
			} catch (err) {
				console.log(err)
				ctx.status = 500
			}
		})
		.get('/:id', async ctx => {
			try  {
				if (await CommentCol.documentExists(ctx.params.id)) {
					ctx.status = 200
					ctx.body = await getComment(ctx.params.id)
					ctx.set('Content-Range', `modules 0-0/1`)
					ctx.set('Access-Control-Expose-Headers', 'Content-Range')
				} else {
					ctx.status = 404
					ctx.body = `Comment [${ctx.params.id}] dne.`
				}
			} catch (err) {
				console.log(err)
				ctx.status = 500
			}
		})
		.post('/', koaBody(), async ctx => {
			try {
				var body = ctx.request.body

				if (!body.id || await CommentCol.documentExists(body.id)) {
					ctx.status = 409
					ctx.body = `Comment [${body.id}] already exists`
				} else {
					await uploadComment(generateDBKey(), ctx.body, ctx.body.project)

					ctx.status = 201
					ctx.body = 'Comment created'
				}
			} catch (err) {
				console.log(err)
				ctx.status = 500
			}
			console.log('Create new');
		})

	return router
}
