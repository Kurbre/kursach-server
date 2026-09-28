import {
	BadRequestException,
	Body,
	Controller,
	Post,
	Query
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { CreateUserDto } from '../users/dto/create-user.dto'

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('register')
	register(@Body() dto: CreateUserDto) {
		return this.authService.register(dto)
	}

	@Post('register/confirm')
	registerConfirm(@Query('token') token: string) {
		if (!token) throw new BadRequestException('Token missing.')

		return this.authService.confirmRegister(token)
	}
}
