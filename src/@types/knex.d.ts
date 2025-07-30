// biome-ignore lint/correctness/noUnusedImports: <just for override module>
import knex from 'knex'

declare module 'knex/types/tables.js' {
	export interface Tables {
		users: {
			id: string
			name: string
			email: string
			password: string
			created_at: Date
			updated_at: Date
		}

		meals: {
			id: string
			user_id: string
			title: string
			description: string
			is_on_diet: boolean
			created_at: Date
			updated_at: Date
		}
	}
}
