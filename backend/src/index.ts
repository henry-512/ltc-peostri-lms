import Koa from 'koa'
import cors from '@koa/cors'
import koaBody from 'koa-body'
import jwt from 'koa-jwt'
import logger from 'koa-logger'

import { config } from './config'
import { apiRouter, authRouter } from './router'

const app = require('koa-qs')(new Koa()) as Koa

apiRouter().then(async api => {
    // Output all router paths
    console.log(api.stack.map(i => `${i.path} ${i.methods}`))

    app.use(logger())
    app.use(cors({
        credentials: true
    }))
    app.use(koaBody())

    // Authentication route
    app.use(authRouter().routes())

    // API parser
    app.use(async (ctx, next) => {
        try {
            await next()
        } catch (err: any) {
            ctx.status = err.status || 500
            ctx.body = {
                error: err.originalError ? err.originalError.message : err.message
            }
        }
    })
    
    // Private routes
    app.use(jwt({
        secret: config.secret,
        cookie: 'token',
    }))
    app.use(api.routes())

    app.listen(config.apiPort, () => {
        console.log(`Starting on ${config.apiPort}`)
    })
}, err => {
    console.log(err)
})
