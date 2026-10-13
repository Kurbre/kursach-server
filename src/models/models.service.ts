import { Injectable, NotFoundException } from '@nestjs/common'
import { DatabaseService } from '../database/database.service'
import { CreateModelDto } from './dto/create-model.dto'
import { Model } from './types/models.type'
import { UpdateModelDto } from './dto/update-model.dto'
import { PaginationDto } from '../common/dto/pagination.dto'

@Injectable()
export class ModelsService {
	constructor(private readonly db: DatabaseService) {}

	async create(dto: CreateModelDto) {
		const { rows } = await this.db.query<Model>(
			`
                        INSERT INTO models (name, brand_id)
                        VALUES ($1, $2)
                        RETURNING *
                    `,
			[dto.name, dto.brand_id]
		)

		return rows[0]
	}

	async findAll(pagination: PaginationDto): Promise<{ data: Model[]; total: number }> {
		const page = pagination.page ?? 1;
		const limit = pagination.limit ?? 10;
		const offset = (page - 1) * limit;

		const countQuery = `SELECT COUNT(*) AS total FROM models`;
		const { rows: countRows } = await this.db.query<{ total: number }>(countQuery);
		const total = countRows[0]?.total ?? 0;

		const dataQuery = `SELECT * FROM models LIMIT $1 OFFSET $2`;
		const { rows } = await this.db.query<Model>(dataQuery, [limit, offset]);

		return { data: rows, total };
	}

	async findById(id: string) {
		const { rows } = await this.db.query<Model>(
			`SELECT * FROM models WHERE id = $1`,
			[id]
		)

		if (!rows[0]) throw new NotFoundException('Model not found.')

		return rows[0]
	}

	async update(id: string, dto: UpdateModelDto) {
		await this.findById(id)

		const entries = Object.entries(dto).filter(
			([_, value]) => value !== undefined
		)

		if (entries.length === 0) {
			return this.findById(id)
		}

		const setClause = entries
			.map(([key], index) => `${key} = $${index + 1}`)
			.join(', ')

		const values = [...entries.map(([_, value]) => value), id]
		const idIndex = entries.length + 1

		const query = `
            UPDATE models
            SET ${setClause}
            WHERE id = $${idIndex}
            RETURNING *
        `

		const { rows } = await this.db.query<Model>(query, values)

		return rows[0]
	}

	async remove(id: string) {
		await this.findById(id)

		await this.db.query(
			`
                        DELETE FROM models where id = $1
                    `,
			[id]
		)

		return {
			success: true
		}
	}
}
