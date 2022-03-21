import dotenv from 'dotenv'
import path from 'path';

dotenv.config()

export interface Config {
	apiPort: string
	dbUrl: string
	dbName: string
	dbUser: string
	dbPass: string
	devRoutes?: string

	basePath: string
	secret: string
}

const config: Config = {
	apiPort: process.env.API_PORT || '4000',
	dbUrl: process.env.DB_URL || 'localhost',
	dbName: process.env.DB_NAME || 'db',
	dbUser: process.env.DB_USER || 'user',
	dbPass: process.env.DB_PASS || 'password',
	devRoutes: process.env.DEV_ROUTES,

	basePath: path.resolve(__dirname, '..'),
	secret: process.env.SECRET || 'soyoung',
}

// export env settings
export { config }
