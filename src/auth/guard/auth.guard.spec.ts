import { ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import { DatabaseService } from '../../database/database.service'
import { AuthGuard } from './auth.guard'

describe('AuthGuard', () => {
	let guard: AuthGuard

	const mockJwtService = {
		verifyAsync: jest.fn()
	}

	const mockDatabaseService = {
		query: jest.fn()
	}

	const mockUser = {
		id: '123',
		email: 'test@gmail.com',
		login: 'test',
		name: 'John',
		surname: 'Doe',
		created_at: new Date(),
		updated_at: new Date()
	}

	const createContext = (cookies = {}) => {
		const req: {
			cookies: Record<string, string>
			user?: typeof mockUser
		} = {
			cookies
		}

		const context = {
			switchToHttp: () => ({
				getRequest: () => req
			})
		} as ExecutionContext

		return {
			context,
			req
		}
	}

	beforeEach(async () => {
		jest.clearAllMocks()

		const module = await Test.createTestingModule({
			providers: [
				AuthGuard,
				{
					provide: JwtService,
					useValue: mockJwtService
				},
				{
					provide: DatabaseService,
					useValue: mockDatabaseService
				}
			]
		}).compile()

		guard = module.get(AuthGuard)
	})

	it('should be defined', () => {
		expect(guard).toBeDefined()
	})

	it('should throw if access token is missing', async () => {
		const { context } = createContext()

		await expect(guard.canActivate(context)).rejects.toThrow(
			new UnauthorizedException('You are not logged in.')
		)

		expect(mockJwtService.verifyAsync).not.toHaveBeenCalled()
		expect(mockDatabaseService.query).not.toHaveBeenCalled()
	})

	it('should allow request if token and user are valid', async () => {
		const token = 'access-token'

		mockJwtService.verifyAsync.mockResolvedValue({
			sub: mockUser.id
		})

		mockDatabaseService.query.mockResolvedValue({
			rows: [mockUser]
		})

		const { context, req } = createContext({
			accessToken: token
		})

		const result = await guard.canActivate(context)

		expect(result).toBe(true)

		expect(mockJwtService.verifyAsync).toHaveBeenCalledTimes(1)
		expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(token)

		expect(mockDatabaseService.query).toHaveBeenCalledTimes(1)
		expect(mockDatabaseService.query).toHaveBeenCalledWith(
			expect.stringContaining('FROM users'),
			[mockUser.id]
		)

		expect(req.user).toEqual(mockUser)
	})

	it('should throw if user does not exist', async () => {
		const token = 'access-token'

		mockJwtService.verifyAsync.mockResolvedValue({
			sub: mockUser.id
		})

		mockDatabaseService.query.mockResolvedValue({
			rows: []
		})

		const { context } = createContext({
			accessToken: token
		})

		await expect(guard.canActivate(context)).rejects.toThrow(
			new UnauthorizedException('You are not logged in.')
		)

		expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(token)

		expect(mockDatabaseService.query).toHaveBeenCalledWith(
			expect.stringContaining('FROM users'),
			[mockUser.id]
		)
	})

	it('should throw if token is invalid', async () => {
		const token = 'invalid-token'

		mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'))

		const { context } = createContext({
			accessToken: token
		})

		await expect(guard.canActivate(context)).rejects.toThrow(
			new UnauthorizedException('You are not logged in.')
		)

		expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(token)
		expect(mockDatabaseService.query).not.toHaveBeenCalled()
	})
})
