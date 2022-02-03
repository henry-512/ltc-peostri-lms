import Router from '@koa/router'
import koaBody from 'koa-body'
import { aql } from 'arangojs'

import { generateDBKey } from '../../util'
import { db } from '../../database'
import { IProject, IComment, IArangoIndexes } from '../../lms/types'
import { getComment, uploadAllComments } from './comments'
import { getModule, uploadModule, existsModule } from './modules'
import { getUser, uploadUser } from './users'

var ProjectCol = db.collection('projects')

export async function uploadProject(key: string, pro: IProject) {
    // Convert from key to id
    const proId = 'projects/'.concat(key)

    if (!pro.comments) {
        pro.comments = []
    } else if (pro.comments.length !== 0) {
        let comAr = await uploadAllComments(pro.comments as IComment[], proId)
        pro.comments = comAr.map(v => v._key as string)
    }

    pro.modules = await Promise.all(pro.modules.map(async mod => { 
        if (typeof mod !== 'string') {
            var nk = generateDBKey()
            await uploadModule(nk, mod, proId)
            return 'modules/'.concat(nk)
        } else if (typeof mod === 'string' && await existsModule(mod)) {
            return 'modules'.concat(mod)
        } else {
            throw new ReferenceError(`Module ${mod} not valid`)
        }
    }))

    // pro.users = await Promise.all(pro.users.map(async usr => {
    //     var nk = generateDBKey()
    //     if (typeof usr !== 'string') {
    //         await uploadUser(nk, usr, proId)
    //     } else {
    //         throw new ReferenceError(`User ${usr} not valid`)
    //     }
    //     return 'users/'.concat(nk)
    // }))

    pro.createdAt = new Date()
    pro.updatedAt = new Date()

    delete pro.id
    pro._key = key

    console.log(`Project added: ${pro}`)

    return ProjectCol.save(pro) as IArangoIndexes
}

export async function getProject(id: string, cascade?: boolean) {
    var project = await ProjectCol.document(id) as IProject

    // mod.id = mod._key

    delete project._key
    delete project._id
    delete project._rev

    if (cascade) {
        project.comments = await Promise.all(project.comments.map(async c => await getComment(c as string, cascade)))
        project.modules = await Promise.all(project.modules.map(async m => await getModule(m as string, cascade)))
        project.users = await Promise.all(project.users.map(async u => await getUser(u as string, cascade)))
    }

    return project
}

export async function existsProject(id: string) { return ProjectCol.documentExists(id) }

export function projectRoute() {
    const router = new Router({
        prefix: '/projects'
    })

    router
        // get list
        .get('/', async ctx => {
            console.log(`project get req ${JSON.stringify(ctx.request.query)}`)

            try {
                let q = ctx.request.query

                let sort = '_key'
                let sortDir = 'ASC'
                let offset = 0
                let count = 10

                if (q.sort && q.sort.length == 2) {
                    switch (q.sort[0]) {
                        case 'id': sort = '_key'; break
                        case 'createdAt':
                        case 'updatedAt':
                        case 'start':
                        case 'end':
                        case 'status':
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
                        FOR d in projects
                        SORT d.${sort} ${sortDir}
                        LIMIT @offset, @count
                        RETURN {
                            id: d._key,
                            title: d.title,
                            createdAt: d.createdAt,
                            updatedAt: d.updatedAt,
                            start: d.start,
                            end: d.end,
                            status: d.status,
                            comments: d.comments,
                            modules: d.modules,
                            users: d.users
                        }`,
                    bindVars: {
                        offset: offset,
                        count: count
                    }
                })

                var all = await cursor.all() as IProject[]

                ctx.status = 200
                ctx.body = all

                // Required by simple REST data provider
                // https://github.com/marmelab/react-admin/blob/master/packages/ra-data-simple-rest/README.md
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
                if (await existsProject(ctx.params.id)) {
                    ctx.status = 200
                    ctx.body = await getProject(ctx.params.id, true)
                } else {
                    ctx.status = 404
                    ctx.body = `Project [${ctx.params.id}] dne.`
                }

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
                var body = ctx.request.body

                if (!body.id || await existsProject(body.id)) {
                    ctx.status = 409
                    ctx.body = `Document [${body.id}] already exists`
                } else {
                    await uploadProject(generateDBKey(), ctx.body)

                    ctx.status = 201
                    ctx.body = 'Project created'
                }
            } catch(err) {
                console.log(err)
                ctx.status = 500
            }
        })
        // update
        .put('/:id', koaBody(), async ctx => {
            try {
                if (await existsProject(ctx.params.id)) {
                    var body = ctx.request.body

                    var doc = await ProjectCol.document(ctx.params.id)

                    var proj: IProject = {
                        title: body.title || doc.title || 'New Project',
                        createdAt: doc.createdAt || new Date(),
                        updatedAt: new Date(),
                        start: body.start || doc.start || new Date(),
                        end: body.end || doc.end || new Date(),
                        status: body.status || doc.status || 'IN_PROGRESS',
                        comments: body.comments || doc.comments || [],
                        modules: body.modules || doc.modules || [],
                        users: body.users || doc.users || []
                    }

                    await ProjectCol.update(ctx.params.id, proj)

                    ctx.status = 200
                    ctx.body = `Document updated`
                    console.log(proj)
                } else {
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
                if (await existsProject(ctx.params.id)) {
                    await ProjectCol.remove(ctx.params.id)
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
