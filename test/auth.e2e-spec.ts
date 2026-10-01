import { INestApplication, ValidationPipe } from '@nestjs/common'
import { DatabaseService } from '../src/database/database.service'
import { Test } from '@nestjs/testing'
import { AppModule } from '../src/app.module'
import cookieParser from 'cookie-parser'
import { createE2EUser } from './helpers/create-e2e-user'
import request, { agent } from 'supertest'
import Redis from 'ioredis'
import { REDIS_CLIENT } from '../src/redis/redis.module'
import { getPendingToken } from './helpers/get-pending-token'

describe('Auth E2E', () => {
	let app: INestApplication
	let db: DatabaseService
	let redis: Redis

	const deleteUser = async (email: string, login: string) =>
		await db.query(
			`
                    DELETE FROM users
                    WHERE email = $1
					OR login = $2
                `,
			[email, login]
		)

	beforeAll(async () => {
		const module = await Test.createTestingModule({
			imports: [AppModule]
		}).compile()

		app = module.createNestApplication()

		app.use(cookieParser())

		app.setGlobalPrefix('api')

		app.useGlobalPipes(
			new ValidationPipe({
				transform: true,
				whitelist: true
			})
		)

		await app.init()

		db = module.get(DatabaseService)
		redis = module.get(REDIS_CLIENT)
	})

	afterAll(async () => {
		await app.close()
	})

	describe('POST /auth/login', () => {
		const testUser = {
			email: 'auth-e2e@example.com',
			login: 'auth_e2e',
			name: 'auth',
			surname: 'test',
			password: 'password123'
		}

		beforeEach(async () => {
			await deleteUser(testUser.email, testUser.login)

			await createE2EUser(db, testUser)
		})

		afterAll(async () => {
			await deleteUser(testUser.email, testUser.login)
		})

		it('should login user', async () => {
			const response = await request(app.getHttpServer())
				.post('/api/auth/login')
				.send({
					login: testUser.login,
					password: testUser.password
				})
				.expect(201)

			expect(response.body).toMatchObject({
				email: testUser.email,
				login: testUser.login,
				name: testUser.name,
				surname: testUser.surname
			})

			expect(response.headers['set-cookie']).toBeDefined()
		})

		it('should reject invalid password', async () => {
			const response = await request(app.getHttpServer())
				.post('/api/auth/login')
				.send({
					login: 'e2e_test',
					password: 'wrong-password'
				})
				.expect(401)

			expect(response.body.message).toBe('Incorrect login or password.')
		})

		it('should reject unknown user', async () => {
			const response = await request(app.getHttpServer())
				.post('/api/auth/login')
				.send({
					login: 'unknown_user',
					password: 'Password123!'
				})
				.expect(401)

			expect(response.body.message).toBe('Incorrect login or password.')
		})
	})

	describe('POST /auth/logout', () => {
		const testUser = {
			email: 'test-logout-e2e@example.com',
			password: 'password123',
			login: 'logout-test-e2e',
			name: 'test',
			surname: 'e2e'
		}

		beforeEach(async () => {
			await deleteUser(testUser.email, testUser.login)

			await createE2EUser(db, testUser)
		})

		afterAll(async () => {
			await deleteUser(testUser.email, testUser.login)
		})

		it('should be logout user', async () => {
			const authAgent = agent(app.getHttpServer())

			const loginResponse = await authAgent
				.post('/api/auth/login')
				.send({
					login: testUser.login,
					password: testUser.password
				})
				.expect(201)

			expect(loginResponse.headers['set-cookie']).toBeDefined()

			const logoutResponse = await authAgent
				.post('/api/auth/logout')
				.expect(200)

			expect(logoutResponse.headers['set-cookie']).toBeDefined()
			expect(logoutResponse.body.message).toBe(
				'You have successfully logged out of your account.'
			)
		})
	})

	describe('POST /auth/register', () => {
		const testUser = {
			email: 'test-e2e@example.com',
			password: 'password123',
			login: 'register-test-e2e',
			name: 'test',
			surname: 'e2ee'
		}

		const deletePendingUser = async () => {
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

					const pendingUser = JSON.parse(value)

					if (pendingUser.email === testUser.email) {
						await redis.del(key)
					}
				}
			} while (cursor !== '0')
		}

		beforeEach(async () => {
			await deletePendingUser()
			await deleteUser(testUser.email, testUser.login)
		})

		afterEach(async () => {
			await deletePendingUser()
			await deleteUser(testUser.email, testUser.login)
		})

		it('should register pending user', async () => {
			const response = await request(app.getHttpServer())
				.post('/api/auth/register')
				.send(testUser)
				.expect(201)

			expect(response.body.message).toBe(
				'Check your email, you should receive a registration confirmation email.'
			)

			const pendingToken = await getPendingToken(redis, testUser.email)

			expect(pendingToken).toBeDefined()
		})

		it('should register confirm user', async () => {
			const response = await request(app.getHttpServer())
				.post('/api/auth/register')
				.send(testUser)
				.expect(201)

			expect(response.body.message).toBe(
				'Check your email, you should receive a registration confirmation email.'
			)

			const pendingToken = await getPendingToken(redis, testUser.email)

			expect(pendingToken).toBeDefined()

			const confirmResponse = await request(app.getHttpServer())
				.post('/api/auth/register/confirm')
				.query({
					token: pendingToken
				})
				.expect(201)

			expect(confirmResponse.body).toMatchObject({
				email: testUser.email,
				login: testUser.login,
				name: testUser.name,
				surname: testUser.surname
			})

			expect(confirmResponse.headers['set-cookie']).toBeDefined()

			const { rows } = await db.query(
				`
					SELECT
						email,
						login,
						name,
						surname
					FROM users
					WHERE email = $1
				`,
				[testUser.email]
			)

			expect(rows).toHaveLength(1)

			expect(rows[0]).toMatchObject({
				email: testUser.email,
				login: testUser.login,
				name: testUser.name,
				surname: testUser.surname
			})
		})

		it('should reject missing token', async () => {
			const result = await request(app.getHttpServer())
				.post('/api/auth/register/confirm')
				.expect(400)

			expect(result.body.message).toBe('Token missing.')
		})

		it('should reject invalid token', async () => {
			const result = await request(app.getHttpServer())
				.post('/api/auth/register/confirm')
				.query({
					token: 'invalid-token'
				})
				.expect(400)

			expect(result.body.message).toBe('Pending user not found.')
		})
	})
})
