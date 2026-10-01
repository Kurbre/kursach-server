import { INestApplication, ValidationPipe } from '@nestjs/common'
import { AppModule } from '../src/app.module'
import request, { agent } from 'supertest'
import { Test } from '@nestjs/testing'
import cookieParser from 'cookie-parser'
import { createE2EUser } from './helpers/create-e2e-user'
import { DatabaseService } from '../src/database/database.service'

describe('Users E2E', () => {
	let app: INestApplication
	let db: DatabaseService

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
	})

	afterAll(async () => {
		await app.close()
	})

	describe('GET /users/me', () => {
		const testUser = {
			email: 'users-e2e@example.com',
			login: 'users_e2e',
			name: 'users',
			surname: 'test',
			password: 'password123'
		}

		const deleteUser = async () =>
			await db.query(
				`
						DELETE FROM users
						WHERE email = $1
						OR login = $2
					`,
				[testUser.email, testUser.login]
			)

		beforeEach(async () => {
			await deleteUser()

			await createE2EUser(db, testUser)
		})

		afterAll(async () => {
			await deleteUser()
		})

		it('should login user', async () => {
			const authAgent = agent(app.getHttpServer())

			await authAgent
				.post('/api/auth/login')
				.send({
					login: testUser.login,
					password: testUser.password
				})
				.expect(201)

			const response = await authAgent.get('/api/users/me').expect(200)

			expect(response.body).toMatchObject({
				email: testUser.email,
				login: testUser.login,
				name: testUser.name,
				surname: testUser.surname
			})
		})

		it('should return 401 without authentication', async () => {
			const response = await request(app.getHttpServer())
				.get('/api/users/me')
				.expect(401)

			expect(response.body).toEqual({
				message: 'You are not logged in.',
				error: 'Unauthorized',
				statusCode: 401
			})
		})
	})
})
