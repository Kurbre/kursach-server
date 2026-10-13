import { Injectable, NotFoundException } from '@nestjs/common'
import { CreateBrandDto } from './dto/create-brand.dto'
import { DatabaseService } from '../database/database.service'
import { Brand } from './types/brands.type'
import { PaginationDto } from '../common/dto/pagination.dto'

@Injectable()
export class BrandsService {
	constructor(private readonly db: DatabaseService) {}

	async create(dto: CreateBrandDto) {
		const { rows } = await this.db.query<Brand>(
			`
					INSERT INTO brands (name)
					VALUES ($1)
					RETURNING *
				`,
			[dto.name]
		)

		return rows[0]
	}

	async findAll(pagination: PaginationDto): Promise<{ data: Brand[]; total: number }> {
		const page = pagination.page ?? 1;
		const limit = pagination.limit ?? 10;
		const offset = (page - 1) * limit;

		const countQuery = `SELECT COUNT(*) AS total FROM brands`;
		const { rows: countRows } = await this.db.query<{ total: number }>(countQuery);
		const total = countRows[0]?.total ?? 0;

		const dataQuery = `SELECT * FROM brands LIMIT $1 OFFSET $2`;
		const { rows } = await this.db.query<Brand>(dataQuery, [limit, offset]);

		return { data: rows, total };
	}

	async findById(id: string) {
		const { rows } = await this.db.query<Brand>(
			`SELECT * FROM brands WHERE id = $1`,
			[id]
		)

		if (!rows[0]) throw new NotFoundException('Brand not found.')

		return rows[0]
	}

	async update(id: string, dto: CreateBrandDto) {
		await this.findById(id)

		const { rows } = await this.db.query<Brand>(
			`
					UPDATE brands SET
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
					DELETE FROM brands where id = $1
				`,
			[id]
		)

		return {
			success: true
		}
	}
}
