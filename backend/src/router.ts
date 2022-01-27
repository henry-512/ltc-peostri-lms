import Router from '@koa/router'
import fs from 'fs'
import path from 'path'

async function apiRouter() {
    const apiRouter = new Router({
        prefix: '/api/'
    })

    try {
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
    } catch (err) {
        console.log(err)
    }

    return apiRouter
}

export { apiRouter }
