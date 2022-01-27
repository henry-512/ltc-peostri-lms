import Application from 'koa'
import Router from '@koa/router'
import koaBody from 'koa-body'
import { aql } from 'arangojs'

import { db } from '../../database'
import { IDBProject } from '../../util/db-types'

import { projMap } from '../../util/maps'

export function projects() {
    const router = new Router({
        prefix: '/projects'
    })

    router
        // get list
        .get('/', async ctx => {
            console.log(ctx.request.query)

            try {
                // TODO: Better aql queries
                const cursor = await db.query(aql`
                    for d in projects
                    sort d._key
                    return d
                `)

                var all = await cursor.all() as IDBProject[]

                ctx.status = 200
                ctx.body = all.map(projMap)

                // Required by simple REST data provider
                // https://github.com/marmelab/react-admin/blob/master/packages/ra-data-simple-rest/README.md
                ctx.set('Content-Range', all.length.toString())
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
                    var doc = await col.document(ctx.params.id) as IDBProject

                    ctx.status = 200
                    ctx.body = projMap(doc)
                } else {
                    ctx.status = 404
                    ctx.body = `Project [${ctx.params.id}] dne.`
                }
            } catch (err) {
                console.log(err)
                ctx.status = 500
            }
        })
        // Create
        .post('/', koaBody(), async ctx => {
            try {
                var col = db.collection('projects')

                if (await col.documentExists(ctx.params.id)) {
                    ctx.status = 409
                    ctx.body = `Document [${ctx.params.id}] already exists`
                } else {
                    await col.save(ctx.params.id, ctx.request.body)
                    ctx.status = 201
                    ctx.body = `Document created`
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
                    await col.update(ctx.params.id, ctx.request.body)
                    ctx.status = 200
                    ctx.body = `Document updated`
                } else {
                    await col.save(ctx.params.id, ctx.request.body)
                    ctx.status = 201
                    ctx.body = `Document created`
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
