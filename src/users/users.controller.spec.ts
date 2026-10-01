import { Test } from '@nestjs/testing'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'
import { mockUser } from './mocks/users.mock'
import { AuthGuard } from '../auth/guard/auth.guard'

describe('UsersController', () => {
	let controller: UsersController

	const mockUsersService = {
		findById: jest.fn()
	}

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			controllers: [UsersController],
			providers: [
				{
					provide: UsersService,
					useValue: mockUsersService
				}
			]
		})
			.overrideGuard(AuthGuard)
			.useValue({
				canActivate: jest.fn(() => true)
			})
			.compile()

		controller = module.get(UsersController)
	})

	it('should return current user', async () => {
		mockUsersService.findById.mockResolvedValue(mockUser)

		const result = await controller.getProfile(mockUser.id)

		expect(result).toEqual(mockUser)

		expect(mockUsersService.findById).toHaveBeenCalledWith(mockUser.id)
		expect(mockUsersService.findById).toHaveBeenCalledTimes(1)
	})
})
