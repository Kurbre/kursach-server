import {
	BadRequestException,
	Inject,
	Injectable,
	UnauthorizedException
} from '@nestjs/common'
import { UsersService } from '../users/users.service'
import { CreateUserDto } from '../users/dto/create-user.dto'
import { DatabaseService } from '../database/database.service'
import Redis from 'ioredis'
import { REDIS_CLIENT } from '../redis/redis.module'
import { InjectQueue } from '@nestjs/bullmq'
import { authQueueConstant } from './constants/auth-queue.constant'
import { Queue } from 'bullmq'
import { hash, verify } from 'argon2'
import { randomBytes } from 'crypto'
import { type User } from '../users/types/user.type'
import { JwtService } from '@nestjs/jwt'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
	constructor(
		@Inject(REDIS_CLIENT) private readonly redis: Redis,
		@InjectQueue(authQueueConstant.name) private readonly authQueue: Queue,
		private readonly usersService: UsersService,
		private readonly db: DatabaseService,
		private readonly jwtService: JwtService
	) {}

	async register(dto: CreateUserDto) {
		const { rows: oldUser } = await this.db.query(
			'SELECT email from users WHERE email = $1 OR login = $2',
			[dto.email, dto.login]
		)

		if (oldUser[0])
			throw new BadRequestException(
				'A user with this email or username already exists.'
			)

		const token = randomBytes(32).toString('hex')
		const hashPassword = await hash(dto.password)

		await this.redis.set(
			this.getPendingUser(token),
			JSON.stringify({
				login: dto.login,
				email: dto.email,
				password: hashPassword,
				name: dto.name,
				surname: dto.surname
			}),
			'EX',
			60 * 30 // 30 minutes
		)

		await this.authQueue.add(authQueueConstant.sendRegisterMail, {
			token
		})

		return {
			success: true,
			message:
				'Check your email, you should receive a registration confirmation email.'
		}
	}

	async confirmRegister(token: string) {
		const pendingUser = await this.redis.get(this.getPendingUser(token))

		if (!pendingUser) throw new BadRequestException('Pending user not found.')

		const { email, login, name, password, surname } = JSON.parse(
			pendingUser
		) as User & {
			password: string
		}

		const { rows } = await this.db.query(
			`
				SELECT id
				FROM users
				WHERE email = $1 OR login = $2
				LIMIT 1
			`,
			[email, login]
		)

		if (rows[0]) {
			throw new BadRequestException('Email or login is already taken.')
		}

		const user = await this.usersService.create({
			email,
			login,
			name,
			password,
			surname
		})

		const accessToken = await this.generateAccessToken(user.id)

		await this.redis.del(this.getPendingUser(token))

		return {
			user,
			accessToken
		}
	}

	async login(dto: LoginDto) {
		const user = await this.usersService.findPasswordByEmailOrUsername(
			dto.login,
			false
		)
		if (!user) throw new UnauthorizedException('Incorrect login or password.')

		const isValidPassword = await verify(user.password, dto.password)
		if (!isValidPassword)
			throw new UnauthorizedException('Incorrect login or password.')

		const accessToken = await this.generateAccessToken(user.id)

		return {
			user,
			accessToken
		}
	}

	private async generateAccessToken(id: string) {
		return this.jwtService.signAsync({ sub: id })
	}

	private getPendingUser(token: string) {
		return `pendingUser:${token}`
	}
}
