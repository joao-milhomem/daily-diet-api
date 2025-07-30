import type { FastifyReply } from 'fastify/types/reply'
import type { FastifyRequest } from 'fastify/types/request'

export async function checkUserAuth(request: FastifyRequest, _: FastifyReply) {
	const userID = request.cookies.user_id

	if (!userID) {
		throw new Error('User not found.')
	}
}
