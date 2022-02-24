import dotenv from 'dotenv'

dotenv.config()

export interface Config {
	apiPort: string
	dbUrl: string
	dbName: string
	dbUser: string
	dbPass: string

	secret: string
}

const config: Config = {
	apiPort: process.env.API_PORT || '4000',
	dbUrl: process.env.DB_URL || 'localhost',
	dbName: process.env.DB_NAME || 'db',
	dbUser: process.env.DB_USER || 'user',
	dbPass: process.env.DB_PASS || 'password',

	secret: process.env.SECRET || 'soyoung',
}

// export env settings
export { config }
