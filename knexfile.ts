import type { Knex } from 'knex'
import { env } from './src/env'

const databaseUrl =
	env.DATABASE_CLIENT === 'pg'
		? env.DATABASE_URL
		: {
				filename: env.DATABASE_URL,
			}

const config: Knex.Config = {
	client: env.DATABASE_CLIENT,
	connection: databaseUrl,
	migrations: {
		directory: env.KNEX_MIGRATIONS,
		database: env.DATABASE_URL,
	},
	useNullAsDefault: true,
}

export default config
