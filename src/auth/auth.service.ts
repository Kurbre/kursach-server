import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { UsersService } from '../users/users.service'
import { CreateUserDto } from '../users/dto/create-user.dto'
import { DatabaseService } from '../database/database.service'
import Redis from 'ioredis'
import { REDIS_CLIENT } from '../redis/redis.module'

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly db: DatabaseService,
		@Inject(REDIS_CLIENT) private readonly redis: Redis
	) {}

	async register(dto: CreateUserDto) {
		const { rows: oldUser } = await this.db.query(
			'SELECT email from users WHERE email = $1 OR username = $2',
			[dto.email, dto.username]
		)
		if (oldUser[0])
			throw new BadRequestException(
				'A user with this email or username already exists.'
			)

		this.redis.set
	}
}
