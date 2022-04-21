import dotenv from 'dotenv'
import path from 'path'

dotenv.config()

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
}

const config: Config = {
    apiPort: process.env.API_PORT || '4000',
    hostname: process.env.API_POST || '4000',

    dbUrl: process.env.DB_URL || 'localhost',
    dbName: process.env.DB_NAME || 'db',
    dbUser: process.env.DB_USER || 'user',
    dbPass: process.env.DB_PASS || 'password',
    devRoutes: process.env.DEV_ROUTES === 'true',
    releaseFileSystem: process.env.RELEASE_FILE_SYSTEM === 'true',
    secret: process.env.SECRET || 'soyoung',

    basePath: path.resolve(__dirname, '..'),
}

// export env settings
export { config }
