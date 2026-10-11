import { Injectable, NotFoundException } from '@nestjs/common'
import { DatabaseService } from '../database/database.service'
import { CreateFullProductDto } from './dto/create-full-product.dto'
import { Product, ProductVariant } from './types/products.type'
import { UpdateFullProductDto } from './dto/update-full-product.dto'

@Injectable()
export class ProductsService {
	constructor(private readonly db: DatabaseService) {}

	async createFullProduct(dto: CreateFullProductDto) {
		const client = await this.db.getPool().connect()

		try {
			await client.query('BEGIN')

			const productResult = await client.query<Product>(
				`
					INSERT INTO products (sku, model_id, is_active, images_path)
					VALUES ($1, $2, $3, $4)
					RETURNING id, sku, model_id, is_active, images_path, created_at, updated_at
				`,
				[dto.sku, dto.model_id, dto.is_active, dto.images_path]
			)
			const product = productResult.rows[0]

			const variants = []
			for (const variantDto of dto.variants) {
				const variantResult = await client.query<ProductVariant>(
					`
						INSERT INTO product_variants (
							product_id, color_id, ram_gb, storage_gb, stock_quantity, price, discount
						)
						VALUES ($1, $2, $3, $4, $5, $6, $7)
						RETURNING *
					`,
					[
						product.id,
						variantDto.color_id,
						variantDto.ram_gb,
						variantDto.storage_gb,
						variantDto.stock_quantity ?? 0,
						variantDto.price,
						variantDto.discount ?? 0
					]
				)

				variants.push(variantResult.rows[0])
			}

			let specifications = null
			if (dto.specifications) {
				const specEntries = Object.entries(dto.specifications).filter(
					([_, value]) => value !== undefined
				)

				if (specEntries.length > 0) {
					const columns = ['product_id', ...specEntries.map(([k]) => k)]
					const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ')
					const values = [product.id, ...specEntries.map(([_, v]) => v)]

					const specQuery = `
						INSERT INTO product_specifications (${columns.join(', ')})
						VALUES (${placeholders})
						RETURNING *
					`
					const specResult = await client.query(specQuery, values)
					specifications = specResult.rows[0]
				}
			}

			await client.query('COMMIT')

			return {
				...product,
				variants,
				specifications
			}
		} catch (e) {
			await client.query('ROLLBACK')
			throw e
		} finally {
			client.release()
		}
	}

	async findAll(limit = 20, offset = 0) {
		const query = `
			SELECT 
				p.id,
				p.sku,
				p.is_active,
				p.images_path,
				p.created_at,
				p.updated_at,
				m.name AS model_name,
				b.name AS brand_name,
				COALESCE(
					json_agg(
						json_build_object(
							'id', pv.id,
							'ram_gb', pv.ram_gb,
							'storage_gb', pv.storage_gb,
							'price', pv.price,
							'discount', pv.discount,
							'stock_quantity', pv.stock_quantity,
							'color_id', pv.color_id
						)
					) FILTER (WHERE pv.id IS NOT NULL), '[]'
				) AS variants
			FROM products p
			JOIN models m ON p.model_id = m.id
			JOIN brands b ON m.brand_id = b.id
			LEFT JOIN product_variants pv ON pv.product_id = p.id
			GROUP BY p.id, m.name, b.name
			ORDER BY p.created_at DESC
			LIMIT $1 OFFSET $2
		`

		const { rows } = await this.db.query(query, [limit, offset])
		return rows
	}

	async findFullById(idOrSku: string) {
		const isUuid =
			/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
				idOrSku
			)

		const query = `
			SELECT 
				p.id,
				p.sku,
				p.is_active,
				p.images_path,
				p.created_at,
				p.updated_at,
				m.id AS model_id,
				m.name AS model_name,
				b.id AS brand_id,
				b.name AS brand_name,
				to_jsonb(ps.*) - 'id' - 'product_id' AS specifications,
				COALESCE(
					json_agg(
						json_build_object(
							'id', pv.id,
							'ram_gb', pv.ram_gb,
							'storage_gb', pv.storage_gb,
							'price', pv.price,
							'discount', pv.discount,
							'stock_quantity', pv.stock_quantity,
							'color', json_build_object(
								'id', c.id,
								'name', c.name,
								'hex', c.hex
							)
						)
					) FILTER (WHERE pv.id IS NOT NULL), '[]'
				) AS variants
			FROM products p
			JOIN models m ON p.model_id = m.id
			JOIN brands b ON m.brand_id = b.id
			LEFT JOIN product_specifications ps ON ps.product_id = p.id
			LEFT JOIN product_variants pv ON pv.product_id = p.id
			LEFT JOIN colors c ON pv.color_id = c.id
			WHERE ${isUuid ? 'p.id = $1::uuid' : 'p.sku = $1'}
			GROUP BY p.id, m.id, m.name, b.id, b.name, ps.id
		`

		const { rows } = await this.db.query(query, [idOrSku])

		if (!rows[0]) throw new NotFoundException('Product not found.')

		return rows[0]
	}

	async updateFullProduct(id: string, dto: UpdateFullProductDto) {
		await this.findFullById(id)

		const client = await this.db.getPool().connect()

		try {
			await client.query('BEGIN')

			const baseFields = {
				sku: dto.sku,
				model_id: dto.model_id,
				is_active: dto.is_active,
				images_path: dto.images_path
			}

			const baseEntries = Object.entries(baseFields).filter(
				([_, value]) => value !== undefined
			)

			if (baseEntries.length > 0) {
				const setClause = baseEntries
					.map(([key], index) => `${key} = $${index + 1}`)
					.join(', ')

				const values = [...baseEntries.map(([_, value]) => value), id]
				const idIndex = baseEntries.length + 1

				await client.query(
					`
					UPDATE products
					SET ${setClause}, updated_at = NOW()
					WHERE id = $${idIndex}
				`,
					values
				)
			}

			if (dto.specifications) {
				const specEntries = Object.entries(dto.specifications).filter(
					([_, value]) => value !== undefined
				)

				if (specEntries.length > 0) {
					const { rows: existingSpecs } = await client.query(
						`SELECT id FROM product_specifications WHERE product_id = $1`,
						[id]
					)

					if (existingSpecs.length > 0) {
						const setClause = specEntries
							.map(([key], index) => `${key} = $${index + 1}`)
							.join(', ')

						const values = [...specEntries.map(([_, value]) => value), id]
						const idIndex = specEntries.length + 1

						await client.query(
							`
							UPDATE product_specifications
							SET ${setClause}
							WHERE product_id = $${idIndex}
						`,
							values
						)
					} else {
						const columns = ['product_id', ...specEntries.map(([k]) => k)]
						const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ')
						const values = [id, ...specEntries.map(([_, v]) => v)]

						await client.query(
							`
							INSERT INTO product_specifications (${columns.join(', ')})
							VALUES (${placeholders})
						`,
							values
						)
					}
				}
			}

			if (dto.variants && dto.variants.length > 0) {
				for (const variantDto of dto.variants) {
					const { id: variantId, ...variantData } = variantDto

					const variantEntries = Object.entries(variantData).filter(
						([_, value]) => value !== undefined
					)

					if (variantId) {
						if (variantEntries.length > 0) {
							const setClause = variantEntries
								.map(([key], index) => `${key} = $${index + 1}`)
								.join(', ')

							const values = [
								...variantEntries.map(([_, value]) => value),
								variantId,
								id
							]
							const variantIdIndex = variantEntries.length + 1
							const productIdIndex = variantEntries.length + 2

							await client.query(
								`
								UPDATE product_variants
								SET ${setClause}
								WHERE id = $${variantIdIndex} AND product_id = $${productIdIndex}
							`,
								values
							)
						}
					} else {
						await client.query(
							`
							INSERT INTO product_variants (
								product_id, color_id, ram_gb, storage_gb, stock_quantity, price, discount
							)
							VALUES ($1, $2, $3, $4, $5, $6, $7)
						`,
							[
								id,
								variantDto.color_id,
								variantDto.ram_gb,
								variantDto.storage_gb,
								variantDto.stock_quantity ?? 0,
								variantDto.price,
								variantDto.discount ?? 0
							]
						)
					}
				}
			}

			await client.query('COMMIT')
		} catch (error) {
			await client.query('ROLLBACK')
			throw error
		} finally {
			client.release()
		}

		return this.findFullById(id)
	}

	async remove(id: string) {
		await this.findFullById(id)

		await this.db.query(
			`
				DELETE FROM products WHERE id = $1
			`,
			[id]
		)

		return {
			success: true
		}
	}
}
