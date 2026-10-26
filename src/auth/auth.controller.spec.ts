import { BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthGuard } from '@nestjs/passport'
import { Test } from '@nestjs/testing'
import { CreateUserDto } from '../users/dto/create-user.dto'
import { mockUser } from '../users/mocks/users.mock'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'

jest.mock('argon2')

describe('AuthController', () => {
	let controller: AuthController

	const mockService = {
		register: jest.fn(),
		confirmRegister: jest.fn(),
		login: jest.fn(),
		generateAccessToken: jest.fn()
	}

	const mockConfigService = {
		get: jest.fn()
	}

	const mockResponse = {
		cookie: jest.fn(),
		clearCookie: jest.fn()
	}

	const registerDto: CreateUserDto = {
		email: 'test@gmail.com',
		login: 'test',
		name: 'John',
		surname: 'Doe',
		password: '123'
	}

	const loginDto: LoginDto = {
		login: 'test',
		password: '123'
	}

	beforeEach(async () => {
		jest.clearAllMocks()

		const module = await Test.createTestingModule({
			controllers: [AuthController],
			providers: [
				{
					provide: AuthService,
					useValue: mockService
				},
				{
					provide: ConfigService,
					useValue: mockConfigService
				}
			]
		})
			.overrideGuard(AuthGuard)
			.useValue({
				canActivate: jest.fn(() => true)
			})
			.compile()

		controller = module.get(AuthController)
	})

	it('should be defined', () => {
		expect(controller).toBeDefined()
	})

	describe('register', () => {
		it('should register user', async () => {
			const result = {
				success: true,
				message: expect.any(String)
			}

			mockService.register.mockResolvedValue(result)

			const response = await controller.register(registerDto)

			expect(mockService.register).toHaveBeenCalledTimes(1)
			expect(mockService.register).toHaveBeenCalledWith(registerDto)
			expect(response).toEqual(result)
		})
	})

	describe('registerConfirm', () => {
		it('should throw if token is missing', async () => {
			await expect(
				controller.registerConfirm('', mockResponse as any)
			).rejects.toThrow(new BadRequestException('Token missing.'))

			expect(mockService.confirmRegister).not.toHaveBeenCalled()
		})

		it('should confirm registration', async () => {
			const accessToken = 'access-token'

			mockService.confirmRegister.mockResolvedValue({
				accessToken,
				user: mockUser
			})

			mockConfigService.get.mockReturnValue('development')

			const response = await controller.registerConfirm(
				'registration-token',
				mockResponse as any
			)

			expect(mockService.confirmRegister).toHaveBeenCalledTimes(1)
			expect(mockService.confirmRegister).toHaveBeenCalledWith(
				'registration-token'
			)

			expect(mockConfigService.get).toHaveBeenCalledWith('NODE_ENV')

			expect(mockResponse.cookie).toHaveBeenCalledTimes(1)
			expect(mockResponse.cookie).toHaveBeenCalledWith(
				'accessToken',
				accessToken,
				{
					httpOnly: true,
					sameSite: 'lax',
					secure: false,
					maxAge: 7 * 24 * 60 * 60 * 1000
				}
			)

			expect(response).toEqual(mockUser)
		})
	})

	describe('login', () => {
		it('should login user', async () => {
			const accessToken = 'access-token'

			mockService.login.mockResolvedValue({
				accessToken,
				user: mockUser
			})

			mockConfigService.get.mockReturnValue('development')

			const response = await controller.login(loginDto, mockResponse as any)

			expect(mockService.login).toHaveBeenCalledTimes(1)
			expect(mockService.login).toHaveBeenCalledWith(loginDto)

			expect(mockConfigService.get).toHaveBeenCalledWith('NODE_ENV')

			expect(mockResponse.cookie).toHaveBeenCalledWith(
				'accessToken',
				accessToken,
				{
					httpOnly: true,
					sameSite: 'lax',
					secure: false,
					maxAge: 7 * 24 * 60 * 60 * 1000
				}
			)

			expect(response).toEqual(mockUser)
		})
	})

	describe('logout', () => {
		it('should clear access token cookie', () => {
			const response = controller.logout(mockResponse as any)

			expect(mockResponse.clearCookie).toHaveBeenCalledTimes(1)
			expect(mockResponse.clearCookie).toHaveBeenCalledWith('accessToken')

			expect(response).toEqual({
				success: true,
				message: 'You have successfully logged out of your account.'
			})
		})
	})

	describe('google', () => {
		it('should be defined', () => {
			expect(controller.google()).toBeUndefined()
		})
	})

	describe('googleCallback', () => {
		it('should generate access token and return user', async () => {
			const accessToken = 'google-access-token'

			mockService.generateAccessToken.mockResolvedValue(accessToken)
			mockConfigService.get.mockReturnValue('development')

			const response = await controller.googleCallback(
				mockUser,
				mockResponse as any
			)

			expect(mockService.generateAccessToken).toHaveBeenCalledTimes(1)
			expect(mockService.generateAccessToken).toHaveBeenCalledWith(
				mockUser.id,
				mockUser.role
			)

			expect(mockConfigService.get).toHaveBeenCalledWith('NODE_ENV')

			expect(mockResponse.cookie).toHaveBeenCalledWith(
				'accessToken',
				accessToken,
				{
					httpOnly: true,
					sameSite: 'lax',
					secure: false,
					maxAge: 7 * 24 * 60 * 60 * 1000
				}
			)

			expect(response).toEqual(mockUser)
		})
	})
})
