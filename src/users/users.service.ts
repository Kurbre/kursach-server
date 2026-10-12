import {
	BadRequestException,
	Inject,
	Injectable,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common'
import { DatabaseService } from '../database/database.service'
import { Roles } from '../roles/types/role.type'
import { CreateUserDto } from './dto/create-user.dto'
import { User } from './types/user.type'
import { authQueueConstant } from '../auth/constants/auth-queue.constant'
import { hash, verify } from 'argon2'
import { randomBytes } from 'crypto'
import { InjectQueue } from '@nestjs/bullmq'
import { REDIS_CLIENT } from '../redis/redis.module'
import Redis from 'ioredis'
import { Queue } from 'bullmq'
import { ResetPasswordDto } from './dto/reset-password.dto'

@Injectable()
export class UsersService {
	constructor(
		private readonly db: DatabaseService,
		@Inject(REDIS_CLIENT) private readonly redis: Redis,
		@InjectQueue(authQueueConstant.name) private readonly authQueue: Queue
	) {}

	async findById(id: string) {
		const { rows } = await this.db.query<User>(
			`
				SELECT
					u.id,
					u.email,
					u.login,
					u.name,
					u.surname,
					u.role_id,
					r.name AS role,
					u.created_at,
					u.updated_at
				FROM users u
				LEFT JOIN roles r ON u.role_id = r.id
				WHERE u.id = $1
			`,
			[id]
		)

		if (!rows[0]) throw new NotFoundException('User not found.')

		return rows[0]
	}

	async findByEmailOrUsername(login: string, isValidation = true) {
		const { rows } = await this.db.query<User>(
			`
				SELECT id, email, login, name, surname, created_at, updated_at from users 
				WHERE email = $1 OR login = $1
			`,
			[login]
		)

		if (isValidation) {
			if (!rows[0]) throw new NotFoundException('User not found.')
		}

		return rows[0]
	}

	async findPasswordByEmailOrUsername(login: string, isValidation = true) {
		const { rows } = await this.db.query<User & { password: string }>(
			`
				SELECT * from users
				WHERE email = $1 OR login = $1
			`,
			[login]
		)

		if (isValidation) {
			if (!rows[0]) throw new NotFoundException('User not found.')
		}

		return rows[0]
	}

	async create(dto: CreateUserDto) {
		const { rows } = await this.db.query<User>(
			`
				INSERT INTO users (email, login, password, name, surname, role_id)
				VALUES (
					$1,
					$2,
					$3,
					$4,
					$5,
					(SELECT id FROM roles WHERE name = $6)
				)
				RETURNING id, email, login, name, surname, role_id, created_at, updated_at
			`,
			[dto.email, dto.login, dto.password, dto.name, dto.surname, Roles.GUEST]
		)

		return rows[0]
	}

	async resetPassword(dto: ResetPasswordDto, userId: string) {
		const { rows } = await this.db.query<User & { password: string }>(
			`
				SELECT id, password, login, email FROM users WHERE id = $1
			`,
			[userId]
		)
		const user = rows[0]
		if (!user) {
			throw new NotFoundException('User not found.')
		}

		const isValidPassword = await verify(user.password, dto.oldPassword)

		if (!isValidPassword)
			throw new BadRequestException('Password is not valid.')

		const isSamePassword = await verify(user.password, dto.newPassword)
		if (isSamePassword) {
			throw new BadRequestException(
				'New password must be different from the current password.'
			)
		}

		const token = randomBytes(32).toString('hex')
		const hashPassword = await hash(dto.newPassword)

		await this.redis.set(
			`resetPassword:${token}`,
			JSON.stringify({
				id: userId,
				password: hashPassword
			}),
			'EX',
			60 * 30 // 30 minutes
		)

		await this.authQueue.add(authQueueConstant.sendResetPassword, {
			email: user.email,
			login: user.login,
			token
		})

		return {
			success: true,
			message: 'Check your email and confirm the password reset.'
		}
	}

	async resetPasswordConfirm(token: string, userId: string) {
		const pendingResetPassword = await this.redis.get(`resetPassword:${token}`)
		if (!pendingResetPassword)
			throw new NotFoundException('Pending reset password not found.')

		const resetPassword = JSON.parse(pendingResetPassword) as {
			id: string
			password: string
		}

		if (resetPassword.id !== userId)
			throw new UnauthorizedException('Not access.')

		await this.db.query(
			`
				UPDATE users SET
				password = $1
				WHERE id = $2
			`,
			[resetPassword.password, resetPassword.id]
		)

		await this.redis.del(`resetPassword:${token}`)

		return {
			success: true,
			message: 'Password successfully updated.'
		}
	}
}
