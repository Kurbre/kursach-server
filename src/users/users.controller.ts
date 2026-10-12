import {
	BadRequestException,
	Body,
	Controller,
	Get,
	HttpStatus,
	Patch,
	Post,
	Query
} from '@nestjs/common'
import { Auth } from '../auth/decorators/auth.decorator'
import { GetAuthUser } from './decorators/users.decorator'
import { UsersService } from './users.service'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'
import { UserResponse } from './dto/user-response.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'

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

	@Auth()
	@Patch('reset-password')
	resetPassword(
		@Body() dto: ResetPasswordDto,
		@GetAuthUser('id') userId: string
	) {
		return this.usersService.resetPassword(dto, userId)
	}

	@Auth()
	@Patch('reset-password/confirm')
	resetPasswordConfirm(
		@Query('token') token: string,
		@GetAuthUser('id') userId: string
	) {
		if (!token) throw new BadRequestException('Token not provided.')

		return this.usersService.resetPasswordConfirm(token, userId)
	}
}
