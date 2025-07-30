import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { database } from '../database/config'
import { checkUserAuth } from '../middlewares/checkUserAuth'

const createMealSchema = z.object({
	title: z.string(),
	description: z.string(),
	is_on_diet: z.boolean(),
})

const updateMealSchema = createMealSchema.partial()
const updateMealParamsSchema = z.object({
	id: z.string(),
})

const querySchema = updateMealParamsSchema.partial()

export function mealsRoutes(server: FastifyInstance) {
	server.addHook('onRequest', checkUserAuth)

	server.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
		const payload = createMealSchema.safeParse(request.body)

		if (!payload.success) {
			throw new Error('Invalid format')
		}

		const userID = request.cookies.user_id

		await database('meals').insert({
			...payload.data,
			user_id: userID,
		})

		return reply.status(201).send({
			message: 'the meal was created successfully!',
		})
	})

	server.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
		const query = querySchema.safeParse(request.query)

		if (!query.success) {
			throw new Error('Invalid query param')
		}

		if (query.data.id) {
			const meal = await database('meals')
				.select('*')
				.where('id', query.data.id)
			return reply.send(meal)
		}

		const meals = await database('meals').where(
			'user_id',
			request.cookies.user_id,
		)

		return reply.send(meals)
	})

	server.put('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
		const payload = updateMealSchema.safeParse(request.body)
		const paramsPayload = updateMealParamsSchema.safeParse(request.params)

		if (!paramsPayload.success) {
			return reply.status(404).send({
				Message: 'Invalid params',
			})
		}

		if (!payload.success) {
			throw new Error('Please, input some valid data')
		}

		const { title, description, is_on_diet } = payload.data
		const mealID = paramsPayload.data.id

		if (!title && !description && is_on_diet) {
			throw new Error("There's not to be changed")
		}

		try {
			await database('meals')
				.update({
					...payload.data,
					updated_at: database.fn.now(),
				})
				.where('id', mealID)
		} catch (error) {
			console.error(error)
		}

		return reply.status(201).send('The meal wasupdated successfully')
	})

	server.delete(
		'/:id',
		async (request: FastifyRequest, reply: FastifyReply) => {
			const params = updateMealParamsSchema.safeParse(request.params)

			if (!params.success) {
				throw new Error('Meal id not found')
			}

			try {
				await database('meals').delete('*').where('id', params.data.id)
			} catch (error) {
				console.error(error)
			}

			return reply.send({
				Message: 'The meal was deleted.',
			})
		},
	)

	server.get(
		'/dashboard',
		async (request: FastifyRequest, reply: FastifyReply) => {
			const meals = await database('meals')
				.select('*')
				.where('user_id', request.cookies.user_id)

			const dashboard = meals.reduce(
				(acc, meal) => {
					if (meal.is_on_diet) {
						acc.inDiet++
						acc.currentSequence++
					} else {
						if (acc.bestSequence < acc.currentSequence) {
							acc.bestSequence = acc.currentSequence
						}
						acc.currentSequence = 0
						acc.outOfDiet++
					}

					return acc
				},
				{
					outOfDiet: 0,
					inDiet: 0,
					bestSequence: 0,
					currentSequence: 0,
					total: meals.length,
				},
			)

			return reply.send(dashboard)
		},
	)
}
