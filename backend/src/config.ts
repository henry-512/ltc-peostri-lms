/**
 * Configuration loader from a .env file. Applies defaults and should catch
 * invalid entries.
 */

import dotenv from 'dotenv'
import path from 'path'

// Load .env file
dotenv.config()

/**
 *  Parsed .env config type
 */
export interface Config {
    /** Port to expose the API on */
    apiPort: string
    /**
     * The hostname of the API. This is used for sending files.
     */
    hostname: string

    // Arangojs authentication fields
    /** Database URL and port */
    dbUrl: string
    /** Database name to use */
    dbName: string
    /** Database username for authentication */
    dbUser: string
    /** Database password for authentication */
    dbPass: string

    // Development config
    /** Enables development-only utility routes */
    devRoutes: boolean
    /** True if invalid files should return 404.pdf instead of throwing an
     * internal error */
    releaseFileSystem: boolean
    /** True if files shouldn't be saved. This should be combined with
     * `releaseFileSystem` or all requests will throw errors */
    spoofFileSave: boolean
    /** True if ctx.state.user should be manually set to debug data. Useful when
     * the authentication cookie is difficult to deal with. */
    spoofUser: boolean

    // Authentication config
    /** HMAC secret to encrypt and decrypt JWTs with. Defaults to a hard-coded
     * base-64 UUID. */
    secret: string
    /** JWT and Cookie expiration time in days */
    authDuration: number

    /** Base path of execution. Set during startup. */
    basePath: string
}

// Export configuration as an Immutable object
export const config = Object.freeze<Config>({
    apiPort: process.env.API_PORT || '4000',
    hostname: process.env.API_HOST || 'localhost',

    dbUrl: process.env.DB_URL || 'localhost:4000',
    dbName: process.env.DB_NAME || 'db',
    dbUser: process.env.DB_USER || 'user',
    dbPass: process.env.DB_PASS || 'password',

    devRoutes: process.env.DEV_ROUTES === 'true',
    releaseFileSystem: process.env.RELEASE_FILE_SYSTEM === 'true',
    spoofFileSave: process.env.SPOOF_FILE_SAVE === 'true',
    spoofUser: process.env.SPOOF_USER === 'true',

    secret: process.env.SECRET || 'DPpRP0ybDSbpQsoq6ZAAHk', // generateBase64UUID(),
    // 3600: 1 hour, 86,400: 24 hours
    authDuration: parseInt(process.env.AUTH_DURATION ?? '86400'),

    basePath: path.resolve(__dirname, '..'),
})
