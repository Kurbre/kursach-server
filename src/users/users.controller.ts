import {
	BadRequestException,
	Body,
	Controller,
	Get,
	HttpStatus,
	Patch,
	Query
} from '@nestjs/common'
import { Auth } from '../auth/decorators/auth.decorator'
import { GetAuthUser } from './decorators/users.decorator'
import { UsersService } from './users.service'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'
import { UserResponse } from './dto/user-response.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'
import { Roles } from '../roles/decorators/roles.decorator'
import { Roles as RolesEnum } from '../roles/types/role.type'
import { PaginationDto } from '../common/dto/pagination.dto'

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Auth()
	@Roles(RolesEnum.ADMIN)
	@Get('admin/all')
	@ApiOperation({ summary: 'Получить список пользователей для администратора' })
	getAllForAdmin(@Query() pagination: PaginationDto) {
		return this.usersService.findAllForAdmin(pagination)
	}

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
