import Koa from 'koa'
import Application from 'koa'
import cors from '@koa/cors'

import { config } from './config'
import { apiRouter } from './router'

const app = require('koa-qs')(new Koa())

apiRouter()
    .then(router => {
        // Output all router paths
        console.log(router.stack.map(i => `${i.path} ${i.methods}`))

        app
            .use(cors())
            .use(router.routes())
            // Catch all route
            .use(async (ctx: Application.ParameterizedContext) => {
                console.log('Unrouted api call')
                // console.log(`Params: ${ctx.params}`)
                // console.log(`Query: ${ctx.query}`)
                // console.log(`Request: ${ctx.request}`)
            
                ctx.status = 404
            }) 

        const server = app.listen(config.apiPort, () => {
            console.log(`Starting on ${config.apiPort}`)
        })
    }, err => {
        console.log(err)
    })
