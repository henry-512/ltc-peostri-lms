/**
 * Configuration loader from a .env file. Applies defaults and should catch invalid entries.
 */

import dotenv from 'dotenv'
import path from 'path'

// Load .env file
dotenv.config()

/**
 *  Parsed .env config type
 */
export interface Config {
    // Port to expose the API on
    apiPort: string
    /**
     * The hostname of the API. This is used for
     */
    hostname: string

    dbUrl: string
    dbName: string
    dbUser: string
    dbPass: string

    devRoutes: boolean
    // True if we should actually/send store files
    releaseFileSystem: boolean
    spoofFileSave: boolean

    basePath: string
    secret: string
    // Duration in seconds
    authDuration: number

    // True if ctx.state.user should be manually set to debug
    // data. Useful for `curl` requests.
    spoofUser: boolean
}

// export env settings
export const config: Config = {
    apiPort: process.env.API_PORT || '4000',
    hostname: process.env.API_HOST || 'localhost',

    dbUrl: process.env.DB_URL || 'localhost:4000',
    dbName: process.env.DB_NAME || 'db',
    dbUser: process.env.DB_USER || 'user',
    dbPass: process.env.DB_PASS || 'password',
    devRoutes: process.env.DEV_ROUTES === 'true',
    releaseFileSystem: process.env.RELEASE_FILE_SYSTEM === 'true',
    spoofFileSave: process.env.SPOOF_FILE_SAVE === 'true',
    secret: process.env.SECRET || 'soyoung',

    // 3600: 1 hour, 86,400: 24 hours
    authDuration: parseInt(process.env.AUTH_DURATION ?? '86400'),

    spoofUser: process.env.SPOOF_USER === 'true',

    basePath: path.resolve(__dirname, '..'),
}
