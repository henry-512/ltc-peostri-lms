import cors from '@koa/cors'
import Koa from 'koa'
import koaBody from 'koa-body'
import logger from 'koa-logger'
import { AuthUser } from './api/auth'
import { parseBody } from './api/v1/Router'
import { config } from './config'
import { APIError, HTTPStatus } from './lms/errors'
import { apiRouter } from './router'

const app = require('koa-qs')(new Koa()) as Koa

apiRouter().then(
    async (api) => {
        // Output all router paths
        console.log(`API Router stack`)
        api.stack.map((i) => console.log(`\t${i.path} ${i.methods}`))

        app.use(logger())
        app.use(
            cors({
                credentials: true,
            })
        )
        app.use(
            koaBody({
                multipart: true,
                json: true,
                formidable: {
                    keepExtensions: true,
                    // uploadDir: path.resolve(config.basePath, 'tmp'),
                },
            })
        )

        // API parser and error handler
        app.use(async (ctx, next) => {
            try {
                // console.log('ERROR HANDLER')
                await next()
            } catch (e: any) {
                // The error is not an API error
                if (e instanceof APIError) {
                    e.path = ctx.request.url
                    e.method = ctx.request.method
                    e.body = await parseBody(ctx.request)
                    e.files = ctx.request.files

                    let message = `ERROR: ${e.method}:${e.path} ${e.apiName}.${e.fn} ${e.status}:\n  Message: ${e.message}\n  Verbose: ${e.verbose}\n${e.stack}\n\nBODY:\t${JSON.stringify(e.body)}\n\nFILES:\t${JSON.stringify(e.files)}\n`

                    console.log(message)

                    ctx.status = e.status
                    ctx.body = {
                        error: e.message,
                    }
                    if (ctx.state.user instanceof AuthUser) {
                        let u = ctx.state.user
                        if (await u.getPermission('verboseLogging')) {
                            ctx.body.verbose = message
                        }
                    }
                } else {
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
        console.log(`Authentication Router stack`)
        console.log(ar.stack.map((i) => `${i.path} ${i.methods}`))
        app.use(ar.routes())

        // Authenticator
        app.use(async (ctx, next) => {
            // console.log('AUTH')
            // Validates user login, given a valid jwt token
            ctx.state.user = await AuthUser.validate(ctx.cookies.get('token'))

            // Run next middleware
            await next()
        })

        // Private routes
        app.use(api.routes())

        app.listen(config.apiPort, () => {
            console.log(`Starting on ${config.apiPort}`)
        })
    },
    (err) => {
        console.log('Startup error')
        console.log(err)
    }
)
