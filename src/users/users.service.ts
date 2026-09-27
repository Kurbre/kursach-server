import {
	BadRequestException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { DatabaseService } from '../database/database.service'
import { CreateUserDto } from './dto/create-user.dto'
import { hash } from 'argon2'

@Injectable()
export class UsersService {
	constructor(private readonly db: DatabaseService) {}

	async findAll() {
		const { rows } = await this.db.query('SELECT * FROM users')

		return rows
	}

	async findById(id: string) {
		const { rows } = await this.db.query('SELECT * FROM users WHERE id = $1', [
			id
		])

		if (!rows[0]) throw new NotFoundException('User not found.')

		return rows[0]
	}

	async create(dto: CreateUserDto) {
		const { rows: oldUser } = await this.db.query(
			'SELECT email from users WHERE email = $1 OR username = $2',
			[dto.email, dto.username]
		)
		if (oldUser[0]) throw new BadRequestException('')

		const hashPassword = await hash(dto.password)

		const { rows } = await this.db.query(
			`
				INSERT INTO users (email, username, password) 
				VALUES ($1, $2, $3)
				RETURNING id, email, username, created_at
			`,
			[dto.email, dto.username, hashPassword]
		)

		return rows[0]
	}
}
