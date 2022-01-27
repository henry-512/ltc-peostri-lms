import Router from '@koa/router'
import koaBody from 'koa-body'
import { aql } from 'arangojs'

import { db } from '../../database'
import { IProject } from '../../lms/types'

export function projects() {
    const router = new Router({
        prefix: '/projects'
    })

    router
        // get list
        .get('/', async ctx => {
            console.log(JSON.stringify(ctx.request.query))

            try {
                // TODO: Better aql queries
                const cursor = await db.query(aql`
                    for d in projects
                    sort d._key
                    return {
                        id: d._key, // internal id -> api id
                        title: d.title,
                        //createdAt: d.createdAt,
                        //updatedAt: d.updatedAt,
                        //start: d.start,
                        //end: d.end,
                        status: d.status
                    }
                `)

                var all = await cursor.all() as IProject[]

                ctx.status = 200
                ctx.body = all

                // Required by simple REST data provider
                // https://github.com/marmelab/react-admin/blob/master/packages/ra-data-simple-rest/README.md
                
                // TODO: update the ranges
                ctx.set('Content-Range', `projects 0-${all.length-1}/${all.length}`)
                ctx.set('Access-Control-Expose-Headers', 'Content-Range')
            } catch (err) {
                console.log(err)
                ctx.status = 500
            }
        })
        // get one
        .get('/:id', async ctx => {
            try  {
                var col = db.collection('projects')

                if (await col.documentExists(ctx.params.id)) {
                    var doc = await col.document(ctx.params.id) as IProject

                    // Copy ._key to .id
                    doc.id = doc._key

                    // Dont send db stuff to client
                    delete doc._key
                    delete doc._id
                    delete doc._rev

                    ctx.status = 200
                    ctx.body = doc
                } else {
                    ctx.status = 404
                    ctx.body = `Project [${ctx.params.id}] dne.`
                }
                // TODO: update the ranges
                ctx.set('Content-Range', `projects 0-0/1`)
                ctx.set('Access-Control-Expose-Headers', 'Content-Range')
            } catch (err) {
                console.log(err)
                ctx.status = 500
            }
        })
        // Create
        .post('/', koaBody(), async ctx => {
            try {
                var col = db.collection('projects')
                var body = ctx.request.body

                if ('id' in body && await col.documentExists(body.id)) {
                    ctx.status = 409
                    ctx.body = `Document [${body.id}] already exists`
                } else {
                    // Sanitize
                    // _key would need to be set here, but arango
                    // won't accept '' as a valid key and its (probably)
                    // best to let arango generate the key.
                    var proj: IProject = {
                        title: body.title || 'New Project',
                        createdAt: body.createdAt || new Date(),
                        updatedAt: body.updatedAt || new Date(),
                        start: body.start || new Date(),
                        end: body.end || new Date(),
                        status: body.status || 'IN_PROGRESS',
                        comments: body.comments || [],
                        modules: body.modules || [],
                        users: body.users || [],
                        _key: body.id, // either use passed id or undefined
                                       // to let arango pick one
                    }
                    
                    await col.save(proj)
                    ctx.status = 201
                    ctx.body = `Document created`
                    console.log(proj)
                }
            } catch(err) {
                console.log(err)
                ctx.status = 500
            }
        })
        // Create/update
        .put('/:id', koaBody(), async ctx => {
            try {
                var col = db.collection('projects')

                if (await col.documentExists(ctx.params.id)) {
                    var body = ctx.request.body

                    var doc = await col.document(ctx.params.id)

                    var proj: IProject = {
                        title: body.title || doc.title || 'New Project',
                        createdAt: body.createdAt || doc.createdAt || new Date(),
                        updatedAt: body.updatedAt || doc.updatedAt || new Date(),
                        start: body.start || doc.start || new Date(),
                        end: body.end || doc.end || new Date(),
                        status: body.status || doc.status || 'IN_PROGRESS',
                        comments: body.comments || doc.comments || [],
                        modules: body.modules || doc.modules || [],
                        users: body.users || doc.users || [],
                        // maybe hack
                        _id: doc._id,
                        _rev: doc._rev,
                        _key: ctx.params.id || body.id || doc._key || ''
                    }

                    await col.update(ctx.params.id, proj)

                    ctx.status = 200
                    ctx.body = `Document updated`
                    console.log(proj)
                } else {
                    // await col.save(ctx.params.id, ctx.request.body)
                    // ctx.status = 201
                    // ctx.body = `Document created`

                    ctx.status = 409
                    ctx.body = `Document [${ctx.params.id}] dne`
                }
            } catch(err) {
                console.log(err)
                ctx.status = 500
            }
        })
        // Delete
        .delete('/:id', async ctx => {
            try {
                var col = db.collection('projects')

                if (await col.documentExists(ctx.params.id)) {
                    await col.remove(ctx.params.id)
                    ctx.status = 200
                    ctx.body = `Document deleted`
                } else {
                    ctx.status = 404
                    ctx.body = `Document [${ctx.params.id}] dne`
                }
            } catch(err) {
                console.log(err)
                ctx.status = 500
            }
        })

    return router
}
