import { Injectable, NotFoundException } from '@nestjs/common'
import { CreateRoleDto } from './dto/create-role.dto'
import { DatabaseService } from '../database/database.service'
import { Role } from './types/role.type'
import { PaginationDto } from '../common/dto/pagination.dto'

@Injectable()
export class RolesService {
	constructor(private readonly db: DatabaseService) {}

	async create(dto: CreateRoleDto) {
		const { rows } = await this.db.query<Role>(
			`
				INSERT INTO roles (name)
				VALUES ($1)
				RETURNING *
			`,
			[dto.name]
		)

		return rows[0]
	}

	async findAll(pagination: PaginationDto): Promise<{ data: Role[]; total: number }> {
		const page = pagination.page ?? 1;
		const limit = pagination.limit ?? 10;
		const offset = (page - 1) * limit;

		const countQuery = `SELECT COUNT(*) AS total FROM roles`;
		const { rows: countRows } = await this.db.query<{ total: number }>(countQuery);
		const total = countRows[0]?.total ?? 0;

		const dataQuery = `SELECT * FROM roles LIMIT $1 OFFSET $2`;
		const { rows } = await this.db.query<Role>(dataQuery, [limit, offset]);

		return { data: rows, total };
	}

	async findById(id: string) {
		const { rows } = await this.db.query<Role>(
			`SELECT * FROM roles WHERE id = $1`,
			[id]
		)

		if (!rows[0]) throw new NotFoundException('Role not found.')

		return rows[0]
	}

	async update(id: string, dto: CreateRoleDto) {
		await this.findById(id)

		const { rows } = await this.db.query<Role>(
			`
				UPDATE roles SET
				name = $1
				WHERE id = $2 
				RETURNING *
			`,
			[dto.name, id]
		)

		return rows[0]
	}

	async remove(id: string) {
		await this.findById(id)

		await this.db.query(
			`
				DELETE FROM roles where id = $1
			`,
			[id]
		)

		return {
			success: true
		}
	}
}
