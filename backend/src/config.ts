import dotenv from 'dotenv'
import path from 'path'

dotenv.config()

// Parsed .env configs
export interface Config {
    apiPort: string
    hostname: string

    dbUrl: string
    dbName: string
    dbUser: string
    dbPass: string

    devRoutes?: boolean
    // True if we should actually/send store files
    releaseFileSystem?: boolean

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

    dbUrl: process.env.DB_URL || 'localhost',
    dbName: process.env.DB_NAME || 'db',
    dbUser: process.env.DB_USER || 'user',
    dbPass: process.env.DB_PASS || 'password',
    devRoutes: process.env.DEV_ROUTES === 'true',
    releaseFileSystem: process.env.RELEASE_FILE_SYSTEM === 'true',
    secret: process.env.SECRET || 'soyoung',

    // 3600: 1 hour, 86,400: 24 hours
    authDuration: parseInt(process.env.AUTH_DURATION ?? '86400'),

    spoofUser: process.env.SPOOF_USER === 'true',

    basePath: path.resolve(__dirname, '..'),
}
