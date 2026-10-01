import { ExecutionContext } from '@nestjs/common'
import { mockUser } from '../mocks/users.mock'
import { getAuthUser } from './users.decorator'

describe('UsersDecorator', () => {
	const mockContext = {
		switchToHttp: () => ({
			getRequest: () => ({
				user: mockUser
			})
		})
	} as ExecutionContext

	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should return user field', () => {
		const result = getAuthUser('id', mockContext)

		expect(result).toEqual(mockUser.id)
	})

	it('should return entire user', () => {
		const result = getAuthUser(undefined, mockContext)

		expect(result).toEqual(mockUser)
	})
})
