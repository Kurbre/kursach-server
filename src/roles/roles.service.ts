import { Injectable } from '@nestjs/common'
import { CreateRoleDto } from './dto/create-role.dto'
import { UpdateRoleDto } from './dto/update-role.dto'
import { DatabaseService } from '../database/database.service'
import { Role } from './types/role.type'

@Injectable()
export class RolesService {
	constructor(private readonly db: DatabaseService) {}

	async create(dto: CreateRoleDto) {
		const { rows } = await this.db.query<Role>(
			`
        INSERT INTO roles (name)
        VALUES ($1)
      `,
			[dto.name]
		)

		return rows[0]
	}

	async findAll() {
		const { rows } = await this.db.query<Role[]>(`SELECT * FROM roles`)

		return rows
	}

	async findOne(id: string) {
		const { rows } = await this.db.query<Role>(
			`SELECT * FROM roles WHERE id = $1`,
			[id]
		)

		return rows[0]
	}

	async update(id: string, dto: UpdateRoleDto) {
		return `This action updates a #${id} role`
	}

	async remove(id: string) {
		return `This action removes a #${id} role`
	}
}
