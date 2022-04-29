import Router from '@koa/router'
import fs from 'fs'
import path from 'path'

/**
 * Appends the API version and `/api` prefix to all routes. Adding additional
 * API versions requires the following:
 *
 * 1. A single directory in `src/api` with the version name.
 * 2. An `index.ts` file that exports a default function that accepts the API
 *    version string and returns a Router.
 *
 * This function is called once in `src/index.ts` as part of the preparation
 * stage.
 *
 * @return A Router containing all of the routes for the API.
 */
export default async function BuildApiRouters() {
    // API prefix
    const apiRouter = new Router({
        prefix: '/api/',
    })

    // API directory
    const root = path.resolve(__dirname, 'api')
    // Loop over files and directories in the `api` folder
    for (const file of await fs.promises.readdir(root)) {
        const full = path.join(root, file)
        const stat = await fs.promises.stat(full)

        // Only check directories
        if (!stat.isDirectory()) {
            continue
        }

        // Import the router builder
        let index = await require(path.resolve(full))

        // Create router with api version
        let router = index.default(file)

        // Apply to router
        apiRouter.use(router.routes())
        console.log(`Applied api version ${file}`)
    }

    return apiRouter
}
