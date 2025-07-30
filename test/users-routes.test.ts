import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { server } from '../src/app'
import { database } from '../src/database/config'

describe('Users routes', () => {
	beforeAll(async () => {
		await database.migrate.latest()
		await server.ready()
	})

	afterAll(async () => {
		await database.destroy()
		await server.close()
	})

	beforeEach(async () => {
		await database('users').del()
	})

	it('should create a new user', async () => {
		const response = await request(server.server).post('/users').send({
			name: 'Test User',
			email: 'test@example.com',
			password: '12345',
		})

		expect(response.status).toBe(201)
		expect(response.body).toHaveProperty('message', 'User created successfully')
		expect(response.headers['set-cookie']).toBeDefined()
	})

	it('should not allow duplicate emails', async () => {
		await request(server.server).post('/users').send({
			name: 'Test User',
			email: 'test@example.com',
			password: '12345',
		})

		const response = await request(server.server).post('/users').send({
			name: 'Another User',
			email: 'test@example.com',
			password: '54321',
		})

		expect(response.status).toBe(409)
		expect(response.text).toBe('Email already registered!')
	})

	it('should get the authenticated user', async () => {
		const createRes = await request(server.server).post('/users').send({
			name: 'Test User',
			email: 'test2@example.com',
			password: '12345',
		})

		const cookie = createRes.headers['set-cookie']

		const response = await request(server.server)
			.get('/users')
			.set('Cookie', cookie)

		expect(response.status).toBe(200)
		expect(response.body).toHaveProperty('id')
		expect(response.body).toHaveProperty('email', 'test2@example.com')
	})

	it('should not get user if not authenticated', async () => {
		const response = await request(server.server).get('/users')
		expect(response.status).toBe(500)
		expect(response.text).toMatch(/User not found/)
	})

	it('should logout the user', async () => {
		const createRes = await request(server.server).post('/users').send({
			name: 'Test User',
			email: 'test3@example.com',
			password: '12345',
		})
		const cookie = createRes.headers['set-cookie']

		const response = await request(server.server)
			.get('/users/logout')
			.set('Cookie', cookie)

		expect(response.status).toBe(200)
		expect(response.body).toHaveProperty(
			'Message',
			'Logout was successfully done.',
		)
		expect(response.headers['set-cookie']).toBeDefined()
	})
})
