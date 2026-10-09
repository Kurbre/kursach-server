import { Injectable, NotFoundException } from '@nestjs/common'
import { DatabaseService } from '../database/database.service'
import { Color } from './types/colors.type'
import { UpdateColorDto } from './dto/update-color.dto'
import { CreateColorDto } from './dto/create-color.dto'

@Injectable()
export class ColorsService {
	constructor(private readonly db: DatabaseService) {}

	async create(dto: CreateColorDto) {
		const { rows } = await this.db.query<Color>(
			`
				INSERT INTO colors (name, hex)
				VALUES ($1, $2)
				RETURNING *
			`,
			[dto.name, dto.hex]
		)

		return rows[0]
	}

	async findAll() {
		const { rows } = await this.db.query<Color>(`SELECT * FROM colors`)

		return rows
	}

	async findById(id: string) {
		const { rows } = await this.db.query<Color>(
			`SELECT * FROM colors WHERE id = $1`,
			[id]
		)

		if (!rows[0]) throw new NotFoundException('Color not found.')

		return rows[0]
	}

	async update(id: string, dto: UpdateColorDto) {
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
			UPDATE colors
			SET ${setClause}
			WHERE id = $${idIndex}
			RETURNING *
		`

		const { rows } = await this.db.query<Color>(query, values)

		return rows[0]
	}

	async remove(id: string) {
		await this.findById(id)

		await this.db.query(
			`
				DELETE FROM colors WHERE id = $1
			`,
			[id]
		)

		return {
			success: true
		}
	}
}
