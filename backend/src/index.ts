import Koa from 'koa'
import cors from '@koa/cors'
import koaBody from 'koa-body'
import logger from 'koa-logger'
import path from 'path'

import { config } from './config'
import { apiRouter } from './router'
import { APIError, HTTPStatus } from './lms/errors'
import { AuthUser } from './api/auth'

const app = require('koa-qs')(new Koa()) as Koa

apiRouter().then(async api => {
    // Output all router paths
    console.log(`API Router stack`)
    console.log(api.stack.map(i => `${i.path} ${i.methods}`))

    app.use(logger())
    app.use(cors({
        credentials: true
    }))
    app.use(koaBody({
        multipart: true,
        json: true,
        formidable: {
            keepExtensions: true,
            // uploadDir: path.resolve(config.basePath, 'tmp'),
        },
    }))

    // API parser and error handler
    app.use(async (ctx, next) => {
        try {
            // console.log('ERROR HANDLER')
            await next()
        } catch (e: any) {
            // The error is not an API error
            if (e instanceof APIError) {
                let err = e as APIError
                err.path = ctx.request.url
                err.method = ctx.request.method

                console.log(`ERROR: ${err.method}:${err.path} ${err.apiName}.${err.fn} ${err.status}:\n  Message: ${err.message}\n  Verbose: ${err.verbose}\n${err.stack}`)

                ctx.status = err.status
                ctx.body = {
                    error: err.message
                }
            } else {
                console.log('Non-api error thrown:')
                console.log(e)

                ctx.status = e.status || HTTPStatus.INTERNAL_SERVER_ERROR
                ctx.body = {
                    error: 'Invalid system status'
                }
            }
        }
    })

    // Authentication route
    let ar = AuthUser.authRouter()
    console.log(`Authentication Router stack`)
    console.log(ar.stack.map(i => `${i.path} ${i.methods}`))
    app.use(ar.routes())
    
    // Authenticator
    app.use(async (ctx, next) => {
        // console.log('AUTH')
        // Validates user login, given a valid jwt token
        // ctx.state.user = await AuthUser.validate(ctx.cookies.get('token'))
        // Run next middleware
        await next()
    })

    // Private routes
    app.use(api.routes())

    app.listen(config.apiPort, () => {
        console.log(`Starting on ${config.apiPort}`)
    })
}, err => {
    console.log('Startup error')
    console.log(err)
})
