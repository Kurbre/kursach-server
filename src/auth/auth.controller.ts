import {
	BadRequestException,
	Body,
	Controller,
	Post,
	Query,
	Res
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { CreateUserDto } from '../users/dto/create-user.dto'
import { ConfigService } from '@nestjs/config'
import { type Response } from 'express'
import { LoginDto } from './dto/login.dto'

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly configService: ConfigService
	) {}

	private setRefreshTokenCookie(token: string, res: Response) {
		res.cookie('accessToken', token, {
			httpOnly: true,
			sameSite: 'lax',
			secure: this.configService.get('NODE_ENV') === 'production',
			maxAge: 7 * 24 * 60 * 60 * 1000
		})
	}

	@Post('register')
	register(@Body() dto: CreateUserDto) {
		return this.authService.register(dto)
	}

	@Post('register/confirm')
	async registerConfirm(
		@Query('token') token: string,
		@Res({ passthrough: true }) res: Response
	) {
		if (!token) throw new BadRequestException('Token missing.')

		const { accessToken, user } = await this.authService.confirmRegister(token)

		this.setRefreshTokenCookie(accessToken, res)

		return user
	}

	@Post('login')
	async login(
		@Body() dto: LoginDto,
		@Res({ passthrough: true }) res: Response
	) {
		const { accessToken, user } = await this.authService.login(dto)

		this.setRefreshTokenCookie(accessToken, res)

		return user
	}
}
