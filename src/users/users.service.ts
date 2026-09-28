import {
	BadRequestException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { DatabaseService } from '../database/database.service'
import { CreateUserDto } from './dto/create-user.dto'
import { hash } from 'argon2'
import { User } from './types/user.type'

@Injectable()
export class UsersService {
	constructor(private readonly db: DatabaseService) {}

	async findAll() {
		const { rows } = await this.db.query<User[]>('SELECT * FROM users')

		return rows
	}

	async findById(id: string) {
		const { rows } = await this.db.query<User>(
			`
				SELECT id, email, login, name, surname, created_at, updated_at FROM users 
				WHERE id = $1
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

	async create(dto: CreateUserDto) {
		const { rows } = await this.db.query<User>(
			`
				INSERT INTO users (email, login, password, name, surname) 
				VALUES ($1, $2, $3, $4, $5)
				RETURNING id, email, login, name, surname, created_at, updated_at
			`,
			[dto.email, dto.login, dto.password, dto.name, dto.surname]
		)

		return rows[0]
	}
}
