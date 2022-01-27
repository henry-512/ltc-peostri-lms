import { Database, aql } from 'arangojs'

import { config } from './config'

// Set up database
export const db = new Database({
    url: config.dbUrl,
    databaseName: config.dbName,
    auth: { username: config.dbUser, password: config.dbPass }
})
