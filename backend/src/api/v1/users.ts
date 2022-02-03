import Router from '@koa/router'
import koaBody from 'koa-body'
import { aql } from 'arangojs'

import { db } from '../../database'
import { IArangoIndexes, IUser } from '../../lms/types'
import { generateDBKey } from '../../util'

const UserCol = db.collection('users')

export async function uploadUser(key: string, usr: IUser) {
    delete usr.id
    usr._key = key

    return UserCol.save(usr) as IArangoIndexes
}

export async function getUser(id: string, cascade?: boolean) {
    var user = await UserCol.document(id) as IUser

    user.id = user._key

    delete user._key
    delete user._id
    delete user._rev

    return user
}

export async function existsUser(id: string) { return UserCol.documentExists(id) }


export function userRoute() {
    const router = new Router({
        prefix: '/users'
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
                        case 'firstname':
                        case 'lastname':
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
                        FOR u in users
                        SORT u.${sort} ${sortDir}
                        LIMIT @offset, @count
                        RETURN {
                            id: u._key,
                            firstName: u.firstName,
                            lastName: u.lastName
                        }`,
                    bindVars: {
                        offset: offset,
                        count: count
                    }
                })

                var all = await cursor.all() as IUser[]

                ctx.status = 200
                ctx.body = all

                // Required by simple REST data provider
                // https://github.com/marmelab/react-admin/blob/master/packages/ra-data-simple-rest/README.md
                ctx.set('Content-Range', `users 0-${all.length-1}/${all.length}`)
                ctx.set('Access-Control-Expose-Headers', 'Content-Range')
            } catch (err) {
                console.log(err)
                ctx.status = 500
            }
        })
        .get('/:id', async ctx => {
            try  {
                if (await existsUser(ctx.params.id)) {
                    ctx.status = 200
                    ctx.body = await getUser(ctx.params.id)
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
        .post('/', koaBody(), async ctx => {
            try {
                var body = ctx.request.body

                if (!body.id || await existsUser(body.id)) {
                    ctx.status = 409
                    ctx.body = `User [${body.id}] already exists`
                } else {
                    await uploadUser(generateDBKey(), ctx.body)

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
