import fastifyCookie from '@fastify/cookie'
import fastify from 'fastify'

import { mealsRoutes } from './routes/meals'
import { usersRoutes } from './routes/users'

export const server = fastify()

server.register(fastifyCookie)

server.register(usersRoutes, {
	prefix: '/users',
})

server.register(mealsRoutes, {
	prefix: '/meals',
})
