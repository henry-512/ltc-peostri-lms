/**
 * Main entrypoint for the program. Builds and starts the koa app, builds and attaches all middleware, and conducts error handling.
 */

import cors from '@koa/cors'
import Koa from 'koa'
import koaBody from 'koa-body'
import logger from 'koa-logger'
import { AuthUser } from './api/auth'
import { parseBody } from './api/v1/Router'
import { config } from './config'
import { APIError, HTTPStatus } from './lms/errors'
import { apiRouter } from './router'

// Build the koa app
const app = require('koa-qs')(new Koa()) as Koa

// apiRouter is an asyncronous function (due to file loading) and we can't use promise/await syntax here so we must use the .then callback.
apiRouter().then(
    async (api) => {
        // Output all API router paths. Mostly for debugging
        console.log(`API Router stack`)
        api.stack.map((i) => console.log(`\t${i.path} ${i.methods}`))

        // Logger prints out the request strings
        app.use(logger())
        // CORS is required for the architecture
        app.use(
            cors({
                credentials: true,
            })
        )
        // Body parser. Converts `ctx.request.body` into parsable text and deconstructs multiparts
        app.use(
            koaBody({
                multipart: true,
                json: true,
                formidable: {
                    // We want to preserve the original filetypes
                    keepExtensions: true,
                    // uploadDir: path.resolve(config.basePath, 'tmp'),
                },
            })
        )

        // API parser and error handler
        app.use(async (ctx, next) => {
            try {
                // Attempt to run the next middleware. If this fails, it gets caught by the try-catch instead of crashing the program.
                await next()
            } catch (e: any) {
                if (e instanceof APIError) {
                    // The error is an APIError which has additional fields associated with it, such as the caller function and error messages
                    e.path = ctx.request.url
                    e.method = ctx.request.method
                    e.body = await parseBody(ctx.request)
                    e.files = ctx.request.files

                    // Build error message string
                    let message = `ERROR: ${e.method}:${e.path} ${e.apiName}.${
                        e.fn
                    } ${e.status}:\n  Message: ${e.message}\n  Verbose: ${
                        e.verbose
                    }\n${e.stack}\n\nBODY:\t${JSON.stringify(
                        e.body
                    )}\n\nFILES:\t${JSON.stringify(e.files)}\n`

                    // Print the message to console
                    console.log(message)

                    ctx.status = e.status
                    ctx.body = {
                        error: e.message,
                    }
                    // If the user has the `verboseLogging` permission, send the build message as well. This is useful on deployment servers without access to the logs.
                    if (ctx.state.user instanceof AuthUser) {
                        let u = ctx.state.user
                        if (await u.getPermission('verboseLogging')) {
                            ctx.body.verbose = message
                        }
                    }
                } else {
                    // The error is not an API error
                    console.log('Non-api error thrown:')
                    console.log(e)

                    ctx.status = e.status || HTTPStatus.INTERNAL_SERVER_ERROR
                    ctx.body = {
                        error: 'Invalid system status',
                    }
                }
            }
        })

        // Authentication route
        let ar = AuthUser.authRouter()
        // Print authenticator routes
        console.log(`Authentication Router stack`)
        console.log(ar.stack.map((i) => `${i.path} ${i.methods}`))
        // Attatch to app
        app.use(ar.routes())

        // Authentication Validator
        /** Validates the user's `token` cookie, set by the authentication routes, and stores the resulting data into `ctx.state.user`.
         * This runs before the API routes but after the Authentication routes.
         * All routes after this assume that `ctx.state.user` is a valid AuthUser instance.
        */
        app.use(async (ctx, next) => {
            // Check if we should fake user authentication
            if (config.spoofUser) {
                // Spoof user
                ctx.state.user = {
                    id: 'users/0123456789012345678900',
                    key: '0123456789012345678900',
                }
            } else {
                // Validates user login, given a jwt token cookie
                ctx.state.user = await AuthUser.validate(
                    ctx.cookies.get('token')
                )
            }

            // Run next middleware
            await next()
        })

        // Private API routes
        // These require a valid `ctx.state.user` field
        app.use(api.routes())

        // Run the app and print the apiPort
        app.listen(config.apiPort, () => {
            console.log(`Starting on ${config.apiPort}`)
        })
    },
    (err) => {
        // Catch any errors with startup. This doesn't do a whole lot, since there is no path back to a valid system state if it crashes during startup.
        console.log('Startup error')
        console.log(err)
    }
)
