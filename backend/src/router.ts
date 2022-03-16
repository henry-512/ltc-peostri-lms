import Router from '@koa/router'
import fs from 'fs'
import path from 'path'

export async function apiRouter() {
    const apiRouter = new Router({
        prefix: '/api/'
    })

    const dir = await fs.promises.opendir(path.resolve(__dirname, 'api'))
    for await (const dirent of dir) {
        var { routerBuilder } = await require(path.resolve(__dirname, 'api', dirent.name))

        // Create router with api version
        var router = routerBuilder(dirent.name)

        // Apply to router
        apiRouter.use(router.routes())
        console.log(`Applied api version ${dirent.name}`)
    }
    // dir.close()

    return apiRouter
}
