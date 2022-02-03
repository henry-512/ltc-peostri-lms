import Router from '@koa/router'
import koaBody from 'koa-body'
import { aql } from 'arangojs'

import { db } from '../../database'
import { IArangoIndexes, IUser } from '../../lms/types'

var UserDB = db.collection('users')

export async function uploadUser(key: string, usr: IUser) {
    usr._key = key
    delete usr.id

    return UserDB.save(usr) as IArangoIndexes
}

export async function getUser(id: string, cascade?: boolean) {
    var user = await UserDB.document(id) as IUser

    user.id = user._key

    delete user._key
    delete user._id
    delete user._rev

    return user
}

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
                // TODO: update the ranges
                ctx.set('Content-Range', `users 0-${all.length-1}/${all.length}`)
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
                    var user = await getUser(ctx.params.id)

                    ctx.status = 200
                    ctx.body = user
                    // TODO: update the ranges
                    ctx.set('Content-Range', `users 0-0/1`)
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

    return router
}
