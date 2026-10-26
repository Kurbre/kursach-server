import {
	BadRequestException,
	Inject,
	Injectable,
	NotFoundException,
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
import { Profile } from 'passport-google-oauth20'
import { Roles } from '../roles/types/role.type'
import { ResetPasswordDto } from '../users/dto/reset-password.dto'

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

		const accessToken = await this.generateAccessToken(
			user.id,
			user.role || 'guest'
		)

		await this.redis.del(this.getPendingUser(token))

		return {
			user,
			accessToken
		}
	}

	async login(dto: LoginDto) {
		const result = await this.usersService.findPasswordByEmailOrUsername(
			dto.login,
			false
		)

		if (!result) throw new UnauthorizedException('Incorrect login or password.')

		const { password, ...user } = result

		const isValidPassword = await verify(password, dto.password)
		if (!isValidPassword)
			throw new UnauthorizedException('Incorrect login or password.')

		const accessToken = await this.generateAccessToken(
			result.id,
			result.role || 'guest'
		)

		return {
			user,
			accessToken
		}
	}

	async validateGoogleUser(profile: Profile) {
		const email = profile.emails?.[0]?.value

		if (!email) {
			throw new BadRequestException('Google account does not have an email.')
		}

		const name = profile.name?.givenName ?? ''
		const surname = profile.name?.familyName ?? ''

		const providerAccountId = profile.id

		const { rows: oauthAccounts } = await this.db.query(
			`
			SELECT user_id
			FROM user_oauth_accounts
			WHERE provider = $1
			AND provider_account_id = $2
			LIMIT 1
		`,
			['google', providerAccountId]
		)

		if (oauthAccounts[0]) {
			const user = await this.usersService.findById(oauthAccounts[0].user_id)

			return user
		}

		const { rows: userRows } = await this.db.query(
			`
			SELECT id
			FROM users
			WHERE email = $1
			LIMIT 1
		`,
			[email]
		)

		if (userRows[0]) {
			await this.db.query(
				`
				INSERT INTO user_oauth_accounts (
					user_id,
					provider,
					provider_account_id
				)
				VALUES ($1, $2, $3)
			`,
				[userRows[0].id, 'google', profile.id]
			)

			return this.usersService.findById(userRows[0].id)
		}

		return this.createGoogleUser({
			providerAccountId,
			email,
			name,
			surname
		})
	}

	private async createGoogleUser(data: {
		providerAccountId: string
		email: string
		name: string
		surname: string
	}) {
		const baseLogin = data.email
			.split('@')[0]
			.toLowerCase()
			.replace(/[^a-z0-9_]/g, '')

		let login = baseLogin
		let counter = 1

		while (true) {
			const { rows } = await this.db.query(
				`
				SELECT id
				FROM users
				WHERE email = $1 OR login = $2
				LIMIT 1
			`,
				[data.email, login]
			)

			if (!rows[0]) break

			login = `${baseLogin}${counter++}`
		}

		const { rows: userRows } = await this.db.query(
			`
			INSERT INTO users (
				email,
				login,
				name,
				surname,
				password,
				role_id
			)
			VALUES (
				$1,
				$2,
				$3,
				$4,
				$5,
				(SELECT id FROM roles WHERE name = $6)
			)
			RETURNING
				id,
				email,
				login,
				name,
				surname,
				role_id,
				created_at,
				updated_at
		`,
			[data.email, login, data.name, data.surname, null, Roles.GUEST]
		)

		const user = userRows[0]

		await this.db.query(
			`
			INSERT INTO user_oauth_accounts (
				user_id,
				provider,
				provider_account_id
			)
			VALUES ($1, $2, $3)
		`,
			[user.id, 'google', data.providerAccountId]
		)

		return user
	}

	async generateAccessToken(id: string, role: string) {
		return this.jwtService.signAsync({ sub: id, role })
	}

	private getPendingUser(token: string) {
		return `pendingUser:${token}`
	}
}
