import {
	BadRequestException,
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Post,
	Query,
	Res
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { type Response } from 'express'
import { GetAuthUser } from '../users/decorators/users.decorator'
import { CreateUserDto } from '../users/dto/create-user.dto'
import { type User } from '../users/types/user.type'
import { AuthService } from './auth.service'
import { GoogleAuth } from './decorators/google-auth.decorator'
import { LoginDto } from './dto/login.dto'
import { RegisterResponse } from './dto/register-response.dto'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'
import { UserResponse } from '../users/dto/user-response.dto'
import { LogoutResponse } from './dto/logout-response.dto'

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly configService: ConfigService
	) {}

	private setAccessTokenCookie(token: string, res: Response) {
		res.cookie('accessToken', token, {
			httpOnly: true,
			sameSite: 'lax',
			secure: this.configService.get('NODE_ENV') === 'production',
			maxAge: 7 * 24 * 60 * 60 * 1000
		})
	}

	@Post('register')
	@ApiOperation({ summary: 'Зарегестрировать временного пользователя' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description:
			'Временный пользователь успешно зарегестрирован, и письмо отправлено на почту',
		type: RegisterResponse
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'Пользователь уже существует'
	})
	register(@Body() dto: CreateUserDto) {
		return this.authService.register(dto)
	}

	@Post('register/confirm')
	@ApiOperation({ summary: 'Подтвердить зарегестрированого пользователя' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'Пользователь успешно зарегестрирован',
		type: UserResponse
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'Временный пользователь не найден'
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'Временный пользователь с таким email или login уже существует'
	})
	async registerConfirm(
		@Query('token') token: string,
		@Res({ passthrough: true }) res: Response
	) {
		if (!token) throw new BadRequestException('Token missing.')

		const { accessToken, user } = await this.authService.confirmRegister(token)

		this.setAccessTokenCookie(accessToken, res)

		return user
	}

	@Post('login')
	@ApiOperation({ summary: 'Авторизовать пользователя' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'Пользователь успешно авторизован',
		type: UserResponse
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Неверный логин или пароль'
	})
	async login(
		@Body() dto: LoginDto,
		@Res({ passthrough: true }) res: Response
	) {
		const { accessToken, user } = await this.authService.login(dto)

		this.setAccessTokenCookie(accessToken, res)

		return user
	}

	@Post('logout')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Выйти из аккаунта' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Пользователь успешно разлогинен',
		type: LogoutResponse
	})
	logout(@Res({ passthrough: true }) res: Response) {
		res.clearCookie('accessToken')

		return {
			success: true,
			message: 'You have successfully logged out of your account.'
		}
	}

	@Get('google')
	@GoogleAuth()
	google() {}

	@Get('google/callback')
	@GoogleAuth()
	async googleCallback(
		@GetAuthUser() user: User,
		@Res({ passthrough: true }) res: Response
	) {
		const accessToken = await this.authService.generateAccessToken(user.id)

		this.setAccessTokenCookie(accessToken, res)

		return user
	}
}
