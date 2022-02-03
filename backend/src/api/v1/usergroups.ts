import Router from "@koa/router"
import koaBody from "koa-body"
import { db } from "../../database"
import { IArangoIndexes, IUserGroup } from "../../lms/types"
import { generateDBKey } from "../../util"

const UserGroupCol = db.collection('usergroups')

export async function uploadUserGroup(key: string, usr: IUserGroup) {
    delete usr.id
    usr._key = key

    return UserGroupCol.save(usr) as IArangoIndexes
}

export async function getUserGroup(id: string, cascade?: boolean) {
    var group = await UserGroupCol.document(id) as IUserGroup

    group.id = group._key

    delete group._key
    delete group._id
    delete group._rev

    return group
}

export async function existsUserGroup(id: string) { return UserGroupCol.documentExists(id) }


export function userGroupRoute() {
    const router = new Router({
        prefix: '/usergroups'
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
                        case 'name':
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
                        FOR u in usergroups
                        SORT u.${sort} ${sortDir}
                        LIMIT @offset, @count
                        RETURN {
                            _id: u._key,
                            name: u.name,
                            permissions: u.permissions
                        }`,
                    bindVars: {
                        offset: offset,
                        count: count
                    }
                })

                var all = await cursor.all() as IUserGroup[]

                ctx.status = 200
                ctx.body = all

                // Required by simple REST data provider
                // https://github.com/marmelab/react-admin/blob/master/packages/ra-data-simple-rest/README.md
                ctx.set('Content-Range', `usergroups 0-${all.length-1}/${all.length}`)
                ctx.set('Access-Control-Expose-Headers', 'Content-Range')
            } catch (err) {
                console.log(err)
                ctx.status = 500
            }
        })
        .get('/:id', async ctx => {
			try  {
				if (await UserGroupCol.documentExists(ctx.params.id)) {
					ctx.status = 200
					ctx.body = await getUserGroup(ctx.params.id)
					ctx.set('Content-Range', `modules 0-0/1`)
					ctx.set('Access-Control-Expose-Headers', 'Content-Range')
				} else {
					ctx.status = 404
					ctx.body = `User Group [${ctx.params.id}] dne.`
				}
			} catch (err) {
				console.log(err)
				ctx.status = 500
			}
		})
		.post('/', koaBody(), async ctx => {
			try {
				var body = ctx.request.body

				if (!body.id || await UserGroupCol.documentExists(body.id)) {
					ctx.status = 409
					ctx.body = `User Group [${body.id}] already exists`
				} else {
					await uploadUserGroup(generateDBKey(), ctx.body)

					ctx.status = 201
					ctx.body = 'User Group created'
				}
			} catch (err) {
				console.log(err)
				ctx.status = 500
			}
			console.log('Create new');
		})

	return router
}
