import { Test } from '@nestjs/testing'
import { DatabaseService } from './database.service'

describe('DatabaseService', () => {
	let service: DatabaseService

	const mockPool = {
		query: jest.fn()
	}

	beforeEach(async () => {
		jest.clearAllMocks()

		const module = await Test.createTestingModule({
			providers: [
				DatabaseService,
				{
					provide: 'DATABASE_POOL',
					useValue: mockPool
				}
			]
		}).compile()

		service = module.get(DatabaseService)
	})

	it('should be defined', () => {
		expect(service).toBeDefined()
	})

	it('should execute query with values', async () => {
		const result = {
			rows: [{ id: '123' }],
			rowCount: 1
		}

		mockPool.query.mockResolvedValue(result)

		const query = 'SELECT * FROM users WHERE id = $1'
		const values = ['123']

		const response = await service.query(query, values)

		expect(mockPool.query).toHaveBeenCalledTimes(1)
		expect(mockPool.query).toHaveBeenCalledWith(query, values)
		expect(response).toEqual(result)
	})

	it('should execute query without values', async () => {
		const result = {
			rows: [{ id: '123' }],
			rowCount: 1
		}

		mockPool.query.mockResolvedValue(result)

		const query = 'SELECT * FROM users'

		const response = await service.query(query)

		expect(mockPool.query).toHaveBeenCalledTimes(1)
		expect(mockPool.query).toHaveBeenCalledWith(query, undefined)
		expect(response).toEqual(result)
	})

	it('should propagate database error', async () => {
		const error = new Error('Database error')

		mockPool.query.mockRejectedValue(error)

		await expect(service.query('SELECT * FROM users')).rejects.toThrow(
			'Database error'
		)
	})
})
