import { getQueueToken } from '@nestjs/bullmq'
import { BadRequestException, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import * as argon2 from 'argon2'
import { Profile } from 'passport-google-oauth20'
import { DatabaseService } from '../database/database.service'
import { Roles } from '../roles/types/role.type'
import { REDIS_CLIENT } from '../redis/redis.module'
import { CreateUserDto } from '../users/dto/create-user.dto'
import { mockUser } from '../users/mocks/users.mock'
import { UsersService } from '../users/users.service'
import { AuthService } from './auth.service'
import { authQueueConstant } from './constants/auth-queue.constant'
import { LoginDto } from './dto/login.dto'

jest.mock('argon2')

describe('AuthService', () => {
	let service: AuthService

	const mockBull = {
		add: jest.fn()
	}

	const mockDatabaseService = {
		query: jest.fn()
	}

	const mockUsersService = {
		create: jest.fn(),
		findPasswordByEmailOrUsername: jest.fn(),
		findById: jest.fn()
	}

	const mockJwtService = {
		signAsync: jest.fn()
	}

	const mockRedis = {
		set: jest.fn(),
		get: jest.fn(),
		del: jest.fn()
	}

	const dto: CreateUserDto = {
		email: 'test@gmail.com',
		login: 'test',
		name: 'John',
		surname: 'Doe',
		password: '123'
	}

	beforeEach(async () => {
		jest.clearAllMocks()

		const module = await Test.createTestingModule({
			providers: [
				AuthService,
				{
					provide: getQueueToken(authQueueConstant.name),
					useValue: mockBull
				},
				{
					provide: DatabaseService,
					useValue: mockDatabaseService
				},
				{
					provide: UsersService,
					useValue: mockUsersService
				},
				{
					provide: JwtService,
					useValue: mockJwtService
				},
				{
					provide: REDIS_CLIENT,
					useValue: mockRedis
				}
			]
		}).compile()

		service = module.get(AuthService)
	})

	it('should be defined', () => {
		expect(service).toBeDefined()
	})

	// Create

	it('should send email for register', async () => {
		mockDatabaseService.query.mockResolvedValue({
			rows: []
		})
		;(argon2.hash as jest.Mock).mockResolvedValue('hashed-password')

		const result = await service.register(dto)

		expect(mockDatabaseService.query).toHaveBeenCalledWith(
			expect.stringContaining('WHERE email = $1 OR login = $2'),
			[dto.email, dto.login]
		)

		expect(argon2.hash).toHaveBeenCalledWith(dto.password)
		expect(argon2.hash).toHaveBeenCalledTimes(1)

		expect(mockRedis.set).toHaveBeenCalledWith(
			expect.stringContaining('pendingUser:'),
			expect.any(String),
			'EX',
			expect.any(Number)
		)

		expect(mockBull.add).toHaveBeenCalledWith(
			expect.any(String),
			expect.any(Object)
		)
		expect(mockBull.add).toHaveBeenCalledTimes(1)

		expect(result).toEqual(
			expect.objectContaining({
				success: true,
				message: expect.any(String)
			})
		)
	})

	it('should throw if user is exist', async () => {
		mockDatabaseService.query.mockResolvedValue({
			rows: [mockUser]
		})

		await expect(service.register(dto)).rejects.toThrow(BadRequestException)
	})

	// Confirm register

	it('should be confirmed register', async () => {
		const user = {
			login: mockUser.login,
			name: mockUser.name,
			surname: mockUser.surname,
			email: mockUser.email,
			password: '123'
		}

		mockDatabaseService.query.mockResolvedValue({
			rows: []
		})
		mockUsersService.create.mockResolvedValue(mockUser)
		mockRedis.get.mockResolvedValue(JSON.stringify(user))
		jest.spyOn(service, 'generateAccessToken').mockResolvedValue('access-token')

		const generateAccessTokenSpy = jest
			.spyOn(service, 'generateAccessToken')
			.mockResolvedValue('access-token')

		const result = await service.confirmRegister('token')

		expect(mockRedis.get).toHaveBeenCalledWith(
			expect.stringContaining('pendingUser:')
		)

		expect(mockUsersService.create).toHaveBeenCalledWith(user)
		expect(result.user).toEqual(mockUser)

		expect(generateAccessTokenSpy).toHaveBeenCalledWith(mockUser.id)

		expect(mockRedis.del).toHaveBeenCalledWith(
			expect.stringContaining('pendingUser')
		)

		expect(result).toEqual({
			user: mockUser,
			accessToken: expect.any(String)
		})
	})

	it('should throw if users is exist', async () => {
		mockDatabaseService.query.mockResolvedValue({
			rows: [mockUser]
		})

		await expect(service.confirmRegister('token')).rejects.toThrow(
			BadRequestException
		)
	})

	// login

	it('shold be success login', async () => {
		const dto: LoginDto = {
			login: mockUser.login,
			password: '123'
		}

		mockUsersService.findPasswordByEmailOrUsername.mockResolvedValue({
			...mockUser,
			password: 'hashed-password'
		})
		;(argon2.verify as jest.Mock).mockResolvedValue(true)
		jest.spyOn(service, 'generateAccessToken').mockResolvedValue('token')

		const generateAccessTokenSpy = jest
			.spyOn(service, 'generateAccessToken')
			.mockResolvedValue('token')

		const result = await service.login(dto)

		expect(mockUsersService.findPasswordByEmailOrUsername).toHaveBeenCalledWith(
			dto.login,
			false
		)

		expect(argon2.verify).toHaveBeenCalledWith('hashed-password', dto.password)

		expect(generateAccessTokenSpy).toHaveBeenCalledWith(mockUser.id)

		expect(result).toEqual({
			user: {
				...mockUser,
				password: 'hashed-password'
			},
			accessToken: 'token'
		})
	})

	it('shold throw if users is not exists', async () => {
		const dto: LoginDto = {
			login: mockUser.login,
			password: '123'
		}

		mockUsersService.findPasswordByEmailOrUsername.mockResolvedValue(null)

		await expect(service.login(dto)).rejects.toThrow(UnauthorizedException)
	})

	it('shold throw if users incorect password', async () => {
		const dto: LoginDto = {
			login: mockUser.login,
			password: '123'
		}

		jest.spyOn(argon2, 'verify').mockResolvedValue(false)

		mockUsersService.findPasswordByEmailOrUsername.mockResolvedValue({
			user: mockUser,
			password: 'hashed-password'
		})

		await expect(service.login(dto)).rejects.toThrow(UnauthorizedException)

		expect(argon2.verify).toHaveBeenCalledWith('hashed-password', dto.password)
	})

	// Google OAuth

	it('should throw if google profile does not have email', async () => {
		const profile = {
			id: 'google-id',
			emails: [],
			name: {
				givenName: 'John',
				familyName: 'Doe'
			}
		} as unknown as Profile

		await expect(service.validateGoogleUser(profile)).rejects.toThrow(
			BadRequestException
		)

		expect(mockDatabaseService.query).not.toHaveBeenCalled()
	})

	it('should return user if google account already exists', async () => {
		const profile = {
			id: 'google-id',
			emails: [
				{
					value: 'test@gmail.com'
				}
			],
			name: {
				givenName: 'John',
				familyName: 'Doe'
			}
		} as unknown as Profile

		mockDatabaseService.query.mockResolvedValueOnce({
			rows: [
				{
					user_id: mockUser.id
				}
			]
		})

		mockUsersService.findById.mockResolvedValue(mockUser)

		const result = await service.validateGoogleUser(profile)

		expect(mockDatabaseService.query).toHaveBeenCalledWith(
			expect.stringContaining('FROM user_oauth_accounts'),
			['google', profile.id]
		)

		expect(mockUsersService.findById).toHaveBeenCalledWith(mockUser.id)

		expect(result).toEqual(mockUser)

		expect(mockDatabaseService.query).toHaveBeenCalledTimes(1)
	})

	it('should link google account to existing user', async () => {
		const profile = {
			id: 'google-id',
			emails: [
				{
					value: 'test@gmail.com'
				}
			],
			name: {
				givenName: 'John',
				familyName: 'Doe'
			}
		} as unknown as Profile

		mockDatabaseService.query
			.mockResolvedValueOnce({
				rows: []
			})
			.mockResolvedValueOnce({
				rows: [
					{
						id: mockUser.id
					}
				]
			})
			.mockResolvedValueOnce({
				rows: []
			})

		mockUsersService.findById.mockResolvedValue(mockUser)

		const result = await service.validateGoogleUser(profile)

		expect(mockDatabaseService.query).toHaveBeenNthCalledWith(
			1,
			expect.stringContaining('FROM user_oauth_accounts'),
			['google', profile.id]
		)

		expect(mockDatabaseService.query).toHaveBeenNthCalledWith(
			2,
			expect.stringContaining('FROM users'),
			[profile.emails![0].value]
		)

		expect(mockDatabaseService.query).toHaveBeenNthCalledWith(
			3,
			expect.stringContaining('INSERT INTO user_oauth_accounts'),
			[mockUser.id, 'google', profile.id]
		)

		expect(mockUsersService.findById).toHaveBeenCalledWith(mockUser.id)

		expect(result).toEqual(mockUser)
	})

	it('should create new google user', async () => {
		const profile = {
			id: 'google-id',
			emails: [
				{
					value: 'john.doe@gmail.com'
				}
			],
			name: {
				givenName: 'John',
				familyName: 'Doe'
			}
		} as unknown as Profile

		const googleUser = {
			...mockUser,
			email: 'john.doe@gmail.com',
			login: 'johndoe',
			name: 'John',
			surname: 'Doe'
		}

		mockDatabaseService.query
			.mockResolvedValueOnce({
				rows: []
			})
			.mockResolvedValueOnce({
				rows: []
			})
			.mockResolvedValueOnce({
				rows: []
			})
			.mockResolvedValueOnce({
				rows: [googleUser]
			})
			.mockResolvedValueOnce({
				rows: []
			})

		const result = await service.validateGoogleUser(profile)

		expect(mockDatabaseService.query).toHaveBeenNthCalledWith(
			1,
			expect.stringContaining('FROM user_oauth_accounts'),
			['google', profile.id]
		)

		expect(mockDatabaseService.query).toHaveBeenNthCalledWith(
			2,
			expect.stringContaining('WHERE email = $1'),
			[profile.emails![0].value]
		)

		expect(mockDatabaseService.query).toHaveBeenNthCalledWith(
			3,
			expect.stringContaining('WHERE email = $1 OR login = $2'),
			[profile.emails![0].value, 'johndoe']
		)

		expect(mockDatabaseService.query).toHaveBeenNthCalledWith(
			4,
			expect.stringContaining('INSERT INTO users'),
			['john.doe@gmail.com', 'johndoe', 'John', 'Doe', null, Roles.GUEST]
		)

		expect(mockDatabaseService.query).toHaveBeenNthCalledWith(
			5,
			expect.stringContaining('INSERT INTO user_oauth_accounts'),
			[googleUser.id, 'google', profile.id]
		)

		expect(result).toEqual(googleUser)

		expect(mockDatabaseService.query).toHaveBeenCalledTimes(5)
	})
	it('should generate unique login if google login is already taken', async () => {
		const profile = {
			id: 'google-id',
			emails: [
				{
					value: 'john.doe@gmail.com'
				}
			],
			name: {
				givenName: 'John',
				familyName: 'Doe'
			}
		} as unknown as Profile

		const googleUser = {
			...mockUser,
			email: 'john.doe@gmail.com',
			login: 'johndoe2',
			name: 'John',
			surname: 'Doe'
		}

		mockDatabaseService.query
			.mockResolvedValueOnce({
				rows: []
			})
			.mockResolvedValueOnce({
				rows: []
			})
			.mockResolvedValueOnce({
				rows: [
					{
						id: 'existing-user-id'
					}
				]
			})
			.mockResolvedValueOnce({
				rows: [
					{
						id: 'existing-user-id-2'
					}
				]
			})
			.mockResolvedValueOnce({
				rows: []
			})
			.mockResolvedValueOnce({
				rows: [googleUser]
			})
			.mockResolvedValueOnce({
				rows: []
			})

		const result = await service.validateGoogleUser(profile)

		expect(mockDatabaseService.query).toHaveBeenNthCalledWith(
			1,
			expect.stringContaining('FROM user_oauth_accounts'),
			['google', profile.id]
		)

		expect(mockDatabaseService.query).toHaveBeenNthCalledWith(
			2,
			expect.stringContaining('WHERE email = $1'),
			[profile.emails![0].value]
		)

		expect(mockDatabaseService.query).toHaveBeenNthCalledWith(
			3,
			expect.stringContaining('WHERE email = $1 OR login = $2'),
			['john.doe@gmail.com', 'johndoe']
		)

		expect(mockDatabaseService.query).toHaveBeenNthCalledWith(
			4,
			expect.stringContaining('WHERE email = $1 OR login = $2'),
			['john.doe@gmail.com', 'johndoe1']
		)

		expect(mockDatabaseService.query).toHaveBeenNthCalledWith(
			5,
			expect.stringContaining('WHERE email = $1 OR login = $2'),
			['john.doe@gmail.com', 'johndoe2']
		)

		expect(mockDatabaseService.query).toHaveBeenNthCalledWith(
			6,
			expect.stringContaining('INSERT INTO users'),
			['john.doe@gmail.com', 'johndoe2', 'John', 'Doe', null, Roles.GUEST]
		)

		expect(mockDatabaseService.query).toHaveBeenNthCalledWith(
			7,
			expect.stringContaining('INSERT INTO user_oauth_accounts'),
			[googleUser.id, 'google', profile.id]
		)

		expect(result).toEqual(googleUser)

		expect(mockDatabaseService.query).toHaveBeenCalledTimes(7)
	})
})
