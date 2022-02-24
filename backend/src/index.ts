import Koa from 'koa'
import cors from '@koa/cors'
import koaBody from 'koa-body'
import jwt from 'koa-jwt'

import { config } from './config'
import { apiRouter, authRouter } from './router'

const app = require('koa-qs')(new Koa()) as Koa

apiRouter().then(async api => {
    // Output all router paths
    console.log(api.stack.map(i => `${i.path} ${i.methods}`))

    app.use(cors())
    app.use(koaBody())

    // Authentication route
    app.use(authRouter().routes())

    // API parser
    app.use(async (ctx, next) => {
        try {
            console.log(ctx.request.url)
            await next()
        } catch (err: any) {
            ctx.status = err.status || 500
            ctx.body = {
                error: err.originalError ? err.originalError.message : err.message
            }
        }
    })
    
    // Private routes
    app.use(jwt({ secret: config.secret }))
    app.use(api.routes())

    app.listen(config.apiPort, () => {
        console.log(`Starting on ${config.apiPort}`)
    })
}, err => {
    console.log(err)
})
