import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { server } from '../src/app'
import { database } from '../src/database/config'

describe('Meals routes', () => {
	beforeAll(async () => {
		await server.ready()
	})

	afterAll(async () => {
		await database.destroy()
		await server.close()
	})

	beforeEach(async () => {
		await database('meals').del()
		await database('users').del()
	})

	it('should create a new meal', async () => {
		// Create user and get cookie
		const userRes = await request(server.server).post('/users').send({
			name: 'Test User',
			email: 'testmeals@example.com',
			password: '12345',
		})
		const cookie = userRes.headers['set-cookie']

		const response = await request(server.server)
			.post('/meals')
			.set('Cookie', cookie)
			.send({
				title: 'Breakfast',
				description: 'Eggs and toast',
				is_on_diet: true,
			})

		expect(response.status).toBe(201)
		expect(response.body).toHaveProperty(
			'message',
			'the meal was created successfully!',
		)
	})

	it('should list all meals for the user', async () => {
		const userRes = await request(server.server).post('/users').send({
			name: 'Test User',
			email: 'testmeals2@example.com',
			password: '12345',
		})
		const cookie = userRes.headers['set-cookie']

		await request(server.server).post('/meals').set('Cookie', cookie).send({
			title: 'Lunch',
			description: 'Chicken and rice',
			is_on_diet: false,
		})

		const response = await request(server.server)
			.get('/meals')
			.set('Cookie', cookie)

		expect(response.status).toBe(200)
		expect(Array.isArray(response.body)).toBe(true)
		expect(response.body.length).toBeGreaterThan(0)
	})

	it('should update a meal', async () => {
		const userRes = await request(server.server).post('/users').send({
			name: 'Test User',
			email: 'testmeals3@example.com',
			password: '12345',
		})
		const cookie = userRes.headers['set-cookie']

		await request(server.server).post('/meals').set('Cookie', cookie).send({
			title: 'Dinner',
			description: 'Salad',
			is_on_diet: true,
		})

		const mealsList = await request(server.server)
			.get('/meals')
			.set('Cookie', cookie)
		const mealId = mealsList.body[0].id

		const response = await request(server.server)
			.put(`/meals/${mealId}`)
			.set('Cookie', cookie)
			.send({
				title: 'Dinner Updated',
			})

		expect(response.status).toBe(201)
		expect(response.text).toContain('The meal wasupdated successfully')
	})

	it('should delete a meal', async () => {
		const userRes = await request(server.server).post('/users').send({
			name: 'Test User',
			email: 'testmeals4@example.com',
			password: '12345',
		})
		const cookie = userRes.headers['set-cookie']

		await request(server.server).post('/meals').set('Cookie', cookie).send({
			title: 'Snack',
			description: 'Fruit',
			is_on_diet: true,
		})

		const mealsList = await request(server.server)
			.get('/meals')
			.set('Cookie', cookie)
		const mealId = mealsList.body[0].id

		const response = await request(server.server)
			.delete(`/meals/${mealId}`)
			.set('Cookie', cookie)

		expect(response.status).toBe(200)
		expect(response.body).toHaveProperty('Message', 'The meal was deleted.')
	})

	it('should return dashboard data', async () => {
		const userRes = await request(server.server).post('/users').send({
			name: 'Test User',
			email: 'testmeals5@example.com',
			password: '12345',
		})
		const cookie = userRes.headers['set-cookie']

		await request(server.server).post('/meals').set('Cookie', cookie).send({
			title: 'Breakfast',
			description: 'Eggs',
			is_on_diet: true,
		})
		await request(server.server).post('/meals').set('Cookie', cookie).send({
			title: 'Lunch',
			description: 'Burger',
			is_on_diet: false,
		})

		const response = await request(server.server)
			.get('/meals/dashboard')
			.set('Cookie', cookie)

		expect(response.status).toBe(200)
		expect(response.body).toHaveProperty('inDiet')
		expect(response.body).toHaveProperty('outOfDiet')
		expect(response.body).toHaveProperty('bestSequence')
		expect(response.body).toHaveProperty('total')
	})
})
