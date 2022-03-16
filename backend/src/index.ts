import Koa from 'koa'
import cors from '@koa/cors'
import koaBody from 'koa-body'
import jwt from 'koa-jwt'
import logger from 'koa-logger'

import { config } from './config'
import { apiRouter, authRouter } from './router'
import { APIError, HTTPStatus } from './lms/errors'
import { AuthUser } from './api/v1/users'

const app = require('koa-qs')(new Koa()) as Koa

apiRouter().then(async api => {
    // Output all router paths
    console.log(`API Router stack`)
    console.log(api.stack.map(i => `${i.path} ${i.methods}`))

    app.use(logger())
    app.use(cors({
        credentials: true
    }))
    app.use(koaBody())

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

                ctx.status = err.status || HTTPStatus.INTERNAL_SERVER_ERROR
                ctx.body = {
                    error: err.message
                }
            } else {
                console.log('Non-api error thrown:')
                console.log(e)

                ctx.status = HTTPStatus.INTERNAL_SERVER_ERROR
                ctx.body = {
                    error: 'Invalid system status'
                }
            }
        }
    })

    // Authentication route
    let ar = authRouter()
    console.log(`Authentication Router stack`)
    console.log(ar.stack.map(i => `${i.path} ${i.methods}`))
    app.use(ar.routes())
    
    // Authenticator
    app.use(async (ctx, next) => {
        // Converts JWT errors to an APIError
        try {
            // console.log('AUTH A')
            await next()
        } catch (e: any) {
            // Passthrough
            if (e instanceof APIError) {
                throw e
            }
            throw new APIError(
                'Main',
                'Authenticator',
                HTTPStatus.UNAUTHORIZED,
                'Invalid login session',
                `JWT cookie is invalid: ${e}`
            )
        }
    })
    app.use(jwt({
        secret: config.secret,
        cookie: 'token',
    }))
    app.use(async (ctx, next) => {
        // Validates user login, given a valid jwt token
        // console.log('AUTH B')
        // Build and validate user
        ctx.state.user = await AuthUser.validate(ctx.cookies.get('token'))
        // Run next middleware
        await next()
    })

    // Private routes
    app.use(api.routes())

    app.listen(config.apiPort, () => {
        console.log(`Starting on ${config.apiPort}`)
    })
}, err => {
    console.log('internal error')
    console.log(err)
})
