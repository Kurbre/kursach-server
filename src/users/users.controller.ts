import { Controller, Get, HttpStatus } from '@nestjs/common'
import { Auth } from '../auth/decorators/auth.decorator'
import { GetAuthUser } from './decorators/users.decorator'
import { UsersService } from './users.service'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'
import { UserResponse } from './dto/user-response.dto'

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Auth()
	@Get('me')
	@ApiOperation({ summary: 'Получить авторизованного пользователя' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Пользователь успешно получено',
		type: UserResponse
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Не авторизован'
	})
	getProfile(@GetAuthUser('id') id: string) {
		return this.usersService.findById(id)
	}
}
