import dotenv from 'dotenv'
import { z } from 'zod'

if (process.env.NODE_ENV === 'test') {
	dotenv.config({ path: '.env.test' })
} else {
	dotenv.config({ path: '.env', quiet: true })
}

const envSchema = z.object({
	NODE_ENV: z.enum(['dev', 'test', 'prod']),
	PORT: z.coerce.number().default(3333),
	DATABASE_CLIENT: z.enum(['sqlite3', 'pg']).default('sqlite3'),
	DATABASE_URL: z.string(),
	KNEX_MIGRATIONS: z.string(),
})

const _env = envSchema.safeParse(process.env)

if (!_env.success) {
	console.error('❌ Invalid environment variables:', _env.error)
	process.exit(1)
}

export const env = _env.data
