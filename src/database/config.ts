import knex from 'knex'
import knexConfig from '../../knexfile'

export const database = knex(knexConfig)
