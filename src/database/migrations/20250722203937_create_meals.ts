import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable('meals', (table) => {
		table.uuid('id').primary().defaultTo(knex.fn.uuid())
		table.string('title').notNullable()
		table.text('description').notNullable()
		table.boolean('is_on_diet').notNullable()
		table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
		table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
		table
			.uuid('user_id')
			.notNullable()
			.references('id')
			.inTable('users')
			.onDelete('CASCADE')
	})
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTable('meals')
}
