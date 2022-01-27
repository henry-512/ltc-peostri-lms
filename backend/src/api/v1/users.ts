import Router from '@koa/router'
import koaBody from 'koa-body'
import { aql } from 'arangojs'

import { db } from '../../database'
import { IUser } from '../../lms/types'

export function users() {
    const router = new Router({
        prefix: '/users'
    })

    router
        .get('/', async ctx => {
            try {
                // TODO: Better aql queries
                const cursor = await db.query(aql`
                    for u in users
                    sort u._key
                    return {
                        id: u._key, // internal id -> api id
                        firstName: u.firstName,
                        lastName: u.lastName
                    }
                `)

                var all = await cursor.all() as IUser[]

                ctx.status = 200
                ctx.body = all

                // Required by simple REST data provider
                // https://github.com/marmelab/react-admin/blob/master/packages/ra-data-simple-rest/README.md
                ctx.set('Content-Range', all.length.toString())
                ctx.set('Access-Control-Expose-Headers', 'Content-Range')
            } catch (err) {
                console.log(err)
                ctx.status = 500
            }
        })
        .get('/:id', async ctx => {
            try  {
                var col = db.collection('projects')

                if (await col.documentExists(ctx.params.id)) {
                    var user = await col.document(ctx.params.id) as IUser

                    // Copy ._key to .id
                    user.id = user._key

                    // Dont send db stuff to client
                    delete user._key
                    delete user._id
                    delete user._rev

                    ctx.status = 200
                    ctx.body = user
                } else {
                    ctx.status = 404
                    ctx.body = `User [${ctx.params.id}] dne.`
                }
            } catch (err) {
                console.log(err)
                ctx.status = 500
            }
        })

    return router
}
