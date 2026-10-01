import Redis from 'ioredis'

type PendingUser = {
	email: string
	login: string
	name: string
	surname: string
	password: string
}

export async function getPendingToken(redis: Redis, email: string) {
	let cursor = '0'

	do {
		const [nextCursor, keys] = await redis.scan(
			cursor,
			'MATCH',
			'pendingUser:*',
			'COUNT',
			100
		)

		cursor = nextCursor

		for (const key of keys) {
			const value = await redis.get(key)

			if (!value) continue

			const pendingUser = JSON.parse(value) as PendingUser

			if (pendingUser.email === email) {
				return key.replace('pendingUser:', '')
			}
		}
	} while (cursor !== '0')

	throw new Error(`Pending registration token for ${email} not found.`)
}
