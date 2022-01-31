import Router from '@koa/router'
import koaBody from 'koa-body'
import { aql } from 'arangojs'

import { db } from '../../database'
import { IProject } from '../../lms/types'
import { getComment } from './comments'
import { getModule } from './modules'
import { getUser } from './users'

var ProjectDB = db.collection('projects')

export async function getProject(id: string, cascade?: boolean) {
    var project = await ProjectDB.document(id) as IProject

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
                        createdAt: d.createdAt,
                        updatedAt: d.updatedAt,
                        start: d.start,
                        end: d.end,
                        status: d.status,
                        comments: d.comments,
                        modules: d.modules,
                        users: d.users
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
                var ProjectDB = db.collection('projects')

                if (await ProjectDB.documentExists(ctx.params.id)) {
                    var doc = await getProject(ctx.params.id, true)

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
                var ProjectDB = db.collection('projects')
                var body = ctx.request.body

                if ('id' in body && await ProjectDB.documentExists(body.id)) {
                    ctx.status = 409
                    ctx.body = `Document [${body.id}] already exists`
                } else {
                    // TODO: create docs

                    // Sanitize
                    var proj: IProject = {
                        title: body.title || 'New Project',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        start: body.start || new Date(),
                        end: body.end || new Date(),
                        status: body.status || 'IN_PROGRESS',
                        comments: body.comments || [],
                        modules: body.modules || [],
                        users: body.users || [],
                        _key: body.id, // either use passed id or undefined
                                       // to let arango pick one
                    }
                    
                    await ProjectDB.save(proj)
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
                var ProjectDB = db.collection('projects')

                if (await ProjectDB.documentExists(ctx.params.id)) {
                    var body = ctx.request.body

                    var doc = await ProjectDB.document(ctx.params.id)

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

                    await ProjectDB.update(ctx.params.id, proj)

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
                var ProjectDB = db.collection('projects')

                if (await ProjectDB.documentExists(ctx.params.id)) {
                    await ProjectDB.remove(ctx.params.id)
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
