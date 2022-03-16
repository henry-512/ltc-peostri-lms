import Router from '@koa/router'
import fs from 'fs'
import path from 'path'

export async function apiRouter() {
    const apiRouter = new Router({
        prefix: '/api/'
    })

    // API directory
    const root = path.resolve(__dirname, 'api')
    for (const file of await fs.promises.readdir(root)) {
        const full = path.join(root, file)
        const stat = await fs.promises.stat(full)

        if (!stat.isDirectory()) {
            continue
        }

        // Import the router builder
        var { routerBuilder } = await require(path.resolve(full))

        // Create router with api version
        var router = routerBuilder(file)

        // Apply to router
        apiRouter.use(router.routes())
        console.log(`Applied api version ${file}`)
    }

    return apiRouter
}
