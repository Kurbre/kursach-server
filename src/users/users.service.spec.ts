import { NotFoundException } from '@nestjs/common'
import { getQueueToken } from '@nestjs/bullmq'
import { Test } from '@nestjs/testing'
import { authQueueConstant } from '../auth/constants/auth-queue.constant'
import { DatabaseService } from '../database/database.service'
import { REDIS_CLIENT } from '../redis/redis.module'
import { CreateUserDto } from './dto/create-user.dto'
import { mockUser } from './mocks/users.mock'
import { UsersService } from './users.service'

describe('UsersService', () => {
	let service: UsersService

	const mockDatabaseService = {
		query: jest.fn()
	}

	beforeEach(async () => {
		jest.clearAllMocks()

		const module = await Test.createTestingModule({
			providers: [
				UsersService,
				{
					provide: DatabaseService,
					useValue: mockDatabaseService
				},
				{
					provide: REDIS_CLIENT,
					useValue: {}
				},
				{
					provide: getQueueToken(authQueueConstant.name),
					useValue: {}
				}
			]
		}).compile()

		service = module.get(UsersService)
	})

	it('should be defined', () => {
		expect(service).toBeDefined()
	})

	// findById

	it('should return user by id', async () => {
		mockDatabaseService.query.mockResolvedValue({
			rows: [mockUser]
		})

		const result = await service.findById(mockUser.id)

		expect(result).toEqual(mockUser)

		expect(mockDatabaseService.query).toHaveBeenCalledWith(
			expect.stringContaining('LEFT JOIN roles'),
			[mockUser.id]
		)
	})

	it('should throw if user does not exist', async () => {
		mockDatabaseService.query.mockResolvedValue({
			rows: []
		})

		await expect(service.findById(mockUser.id)).rejects.toThrow(
			NotFoundException
		)
	})

	// findByEmailOrUsername

	it('should return user by email', async () => {
		mockDatabaseService.query.mockResolvedValue({
			rows: [mockUser]
		})

		const result = await service.findByEmailOrUsername(mockUser.email)

		expect(result).toEqual(mockUser)

		expect(mockDatabaseService.query).toHaveBeenCalledWith(
			expect.stringContaining('WHERE email = $1 OR login = $1'),
			[mockUser.email]
		)
	})

	it('should throw if user email does not exist', async () => {
		mockDatabaseService.query.mockResolvedValue({
			rows: []
		})

		await expect(service.findByEmailOrUsername(mockUser.email)).rejects.toThrow(
			NotFoundException
		)
	})

	it('should return user by login', async () => {
		mockDatabaseService.query.mockResolvedValue({
			rows: [mockUser]
		})

		const result = await service.findByEmailOrUsername(mockUser.login)

		expect(result).toEqual(mockUser)

		expect(mockDatabaseService.query).toHaveBeenCalledWith(
			expect.stringContaining('WHERE email = $1 OR login = $1'),
			[mockUser.login]
		)
	})

	it('should throw if user login does not exist', async () => {
		mockDatabaseService.query.mockResolvedValue({
			rows: []
		})

		await expect(service.findByEmailOrUsername(mockUser.login)).rejects.toThrow(
			NotFoundException
		)
	})

	// findPasswordByEmailOrUsername

	it('should return user and password by email', async () => {
		mockDatabaseService.query.mockResolvedValue({
			rows: [{ ...mockUser, password: 'qwerty123' }]
		})

		const result = await service.findPasswordByEmailOrUsername(mockUser.email)

		expect(result).toEqual({ ...mockUser, password: 'qwerty123' })

		expect(mockDatabaseService.query).toHaveBeenCalledWith(
			expect.stringContaining('WHERE u.email = $1 OR u.login = $1'),
			[mockUser.email]
		)
		expect(mockDatabaseService.query).toHaveBeenCalledWith(
			expect.stringContaining('LEFT JOIN roles'),
			[mockUser.email]
		)
	})

	it('should throw if password user email does not exist', async () => {
		mockDatabaseService.query.mockResolvedValue({
			rows: []
		})

		await expect(
			service.findPasswordByEmailOrUsername(mockUser.email)
		).rejects.toThrow(NotFoundException)
	})

	it('should return user and password by login', async () => {
		mockDatabaseService.query.mockResolvedValue({
			rows: [{ ...mockUser, password: 'qwerty123' }]
		})

		const result = await service.findPasswordByEmailOrUsername(mockUser.login)

		expect(result).toEqual({ ...mockUser, password: 'qwerty123' })

		expect(mockDatabaseService.query).toHaveBeenCalledWith(
			expect.stringContaining('WHERE u.email = $1 OR u.login = $1'),
			[mockUser.login]
		)
	})

	it('should throw if password user email does not exist', async () => {
		mockDatabaseService.query.mockResolvedValue({
			rows: []
		})

		await expect(
			service.findPasswordByEmailOrUsername(mockUser.email)
		).rejects.toThrow(NotFoundException)
	})

	// Create

	it('should create user', async () => {
		const dto: CreateUserDto = {
			email: 'test@gmail.com',
			login: 'test',
			name: 'John',
			surname: 'Doe',
			password: '123'
		}

		mockDatabaseService.query.mockResolvedValue({
			rows: [mockUser]
		})

		const result = await service.create(dto)

		expect(result).toEqual(mockUser)

		expect(mockDatabaseService.query).toHaveBeenCalledWith(
			expect.stringContaining('INSERT INTO users'),
			[
				dto.email,
				dto.login,
				dto.password,
				dto.name,
				dto.surname,
				'guest'
			]
		)
	})
})
