import type { FastifyInstance } from 'fastify'
import z from 'zod'
import { database } from '../database/config'
import { checkUserAuth } from '../middlewares/checkUserAuth'

const createUserSchema = z.object({
	name: z.string().min(3),
	email: z.string().email(),
	password: z.string().min(4),
})

export function usersRoutes(server: FastifyInstance) {
	server.get(
		'/',
		{
			preHandler: [checkUserAuth],
		},
		async (request, reply) => {
			const userID = request.cookies.user_id

			const user = await database('users')
				.select('*')
				.where('id', userID)
				.first()

			if (!user) {
				return reply.status(404).send("User can't be find")
			}

			return reply.send(user)
		},
	)

	server.post('/', async (request, reply) => {
		const payload = createUserSchema.safeParse(request.body)

		if (!payload.success) {
			throw new Error('Please, fill all the fields.')
		}

		const { name, email, password } = payload.data

		const emailOwner = await database('users').where({ email }).first()

		if (emailOwner) {
			return reply.status(409).send('Email already registered!')
		}

		const [{ id }] = await database('users')
			.insert({ name, email, password })
			.returning('*')

		reply.clearCookie('user_id')
		reply.setCookie('user_id', id)

		return reply.status(201).send({
			message: 'User created successfully',
		})
	})

	server.get(
		'/logout',
		{
			preHandler: [checkUserAuth],
		},
		async (_, reply) => {
			return reply.clearCookie('user_id').send({
				Message: 'Logout was successfully done.',
			})
		},
	)
}
