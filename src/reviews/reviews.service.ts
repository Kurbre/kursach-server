import { Injectable, NotFoundException } from '@nestjs/common'
import { DatabaseService } from '../database/database.service'
import { CreateReviewDto } from './dto/create-review.dto'
import { UpdateReviewDto } from './dto/update-review.dto'
import { ReviewResponseDto } from './dto/review-response.dto'
import { PaginationDto } from '../common/dto/pagination.dto'

@Injectable()
export class ReviewsService {
	constructor(private readonly db: DatabaseService) {}

	async getReviewsByProduct(productId: string): Promise<ReviewResponseDto[]> {
		const query = `
      SELECT
        r.id,
        r.user_id,
        r.product_id,
        r.rating,
        r.comment,
        r.created_at,
        u.login AS userLogin,
        p.sku AS productSku
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN products p ON r.product_id = p.id
      WHERE r.product_id = $1
      ORDER BY r.created_at DESC
    `

		const { rows } = await this.db.query(query, [productId])
		return rows.map(
			row =>
				({
					id: row.id,
					userId: row.user_id,
					userLogin: row.userLogin,
					productId: row.product_id,
					productSku: row.productSku,
					rating: row.rating,
					comment: row.comment,
					createdAt: row.created_at
				}) as ReviewResponseDto
		)
	}

	async getReviewsByUser(userId: string): Promise<ReviewResponseDto[]> {
		const query = `
      SELECT
        r.id,
        r.user_id,
        r.product_id,
        r.rating,
        r.comment,
        r.created_at,
        u.login AS userLogin,
        p.sku AS productSku
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN products p ON r.product_id = p.id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
    `

		const { rows } = await this.db.query(query, [userId])
		return rows.map(
			row =>
				({
					id: row.id,
					userId: row.user_id,
					userLogin: row.userLogin,
					productId: row.product_id,
					productSku: row.productSku,
					rating: row.rating,
					comment: row.comment,
					createdAt: row.created_at
				}) as ReviewResponseDto
		)
	}

	async getAllReviewsForAdmin(pagination: PaginationDto) {
		const page = pagination.page ?? 1
		const limit = pagination.limit ?? 10
		const offset = (page - 1) * limit
		const { rows: countRows } = await this.db.query<{ total: string }>(
			'SELECT COUNT(*) AS total FROM reviews'
		)
		const { rows } = await this.db.query(
			`
				SELECT r.id, r.user_id AS "userId", u.login AS "userLogin",
					r.product_id AS "productId", p.sku AS "productSku",
					r.rating, r.comment, r.created_at AS "createdAt"
				FROM reviews r
				JOIN users u ON r.user_id = u.id
				JOIN products p ON r.product_id = p.id
				ORDER BY r.created_at DESC
				LIMIT $1 OFFSET $2
			`,
			[limit, offset]
		)
		return { data: rows, total: Number(countRows[0]?.total ?? 0) }
	}

	async createReview(
		userId: string,
		productId: string,
		dto: CreateReviewDto
	): Promise<ReviewResponseDto> {
		// Check if the user exists
		const userCheck = await this.db.query(
			'SELECT id FROM users WHERE id = $1',
			[userId]
		)

		if (userCheck.rowCount === 0) {
			throw new NotFoundException('User not found')
		}

		// Check if the product exists
		const productCheck = await this.db.query(
			'SELECT id FROM products WHERE id = $1',
			[productId]
		)

		if (productCheck.rowCount === 0) {
			throw new NotFoundException('Product not found')
		}

		// Check if user already reviewed this product (should not happen due to UNIQUE constraint, but check anyway)
		const existingReview = await this.db.query(
			'SELECT id FROM reviews WHERE user_id = $1 AND product_id = $2',
			[userId, productId]
		)

		if ((existingReview?.rowCount ?? 0) > 0) {
			throw new Error('Review already exists for this product by this user')
		}

		// Insert the review
		const result = await this.db.query(
			`
      INSERT INTO reviews (user_id, product_id, rating, comment)
      VALUES ($1, $2, $3, $4)
      RETURNING id, user_id, product_id, rating, comment, created_at
      `,
			[userId, productId, dto.rating, dto.comment ?? null]
		)

		const review = result.rows[0]

		// Get user login and product sku for response
		const userProductQuery = `
      SELECT u.login AS userLogin, p.sku AS productSku
      FROM users u
      JOIN products p ON 1=1
      WHERE u.id = $1 AND p.id = $2
    `

		const { rows: userProductRows } = await this.db.query(userProductQuery, [
			userId,
			productId
		])
		const userLogin = userProductRows[0]?.userLogin ?? ''
		const productSku = userProductRows[0]?.productSku ?? ''

		return {
			id: review.id,
			userId: review.user_id,
			userLogin: userLogin,
			productId: review.product_id,
			productSku: productSku,
			rating: review.rating,
			comment: review.comment,
			createdAt: review.created_at
		} as ReviewResponseDto
	}

	async updateReview(
		userId: string,
		reviewId: string,
		dto: UpdateReviewDto
	): Promise<ReviewResponseDto> {
		// First check if the review exists and belongs to the user
		const reviewCheck = await this.db.query(
			'SELECT r.id, r.user_id, r.product_id, r.rating, r.comment, r.created_at, u.login AS userLogin, p.sku AS productSku FROM reviews r JOIN users u ON r.user_id = u.id JOIN products p ON r.product_id = p.id WHERE r.id = $1 AND r.user_id = $2',
			[reviewId, userId]
		)

		if (reviewCheck.rowCount === 0) {
			throw new NotFoundException('Review not found or access denied')
		}

		const existingReview = reviewCheck.rows[0]

		// Build update fields dynamically
		const updates: string[] = []
		const values: any[] = []

		if (dto.rating !== undefined) {
			updates.push(`rating = $${updates.length + 1}`)
			values.push(dto.rating)
		}

		if (dto.comment !== undefined) {
			updates.push(`comment = $${updates.length + 1}`)
			values.push(dto.comment ?? null)
		}

		if (updates.length === 0) {
			// No changes to make
			return this.mapReviewToResponse(existingReview)
		}

		// Add reviewId and userId for WHERE clause
		values.push(reviewId)
		values.push(userId)

		// Update the review
		await this.db.query(
			`
      UPDATE reviews
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${values.length - 1} AND user_id = $${values.length}
      `,
			values
		)

		// Return updated review
		return this.getReviewById(reviewId, userId)
	}

	async deleteReview(
		userId: string,
		reviewId: string
	): Promise<{ success: boolean }> {
		const result = await this.db.query(
			'DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING id',
			[reviewId, userId]
		)

		if (result.rowCount === 0) {
			throw new NotFoundException('Review not found or access denied')
		}

		return { success: true }
	}

	async deleteReviewAsAdmin(reviewId: string): Promise<{ success: boolean }> {
		const result = await this.db.query(
			'DELETE FROM reviews WHERE id = $1 RETURNING id',
			[reviewId]
		)
		if (result.rowCount === 0) {
			throw new NotFoundException('Review not found')
		}
		return { success: true }
	}

	async getReviewById(
		reviewId: string,
		userId: string
	): Promise<ReviewResponseDto> {
		const query = `
      SELECT
        r.id,
        r.user_id,
        r.product_id,
        r.rating,
        r.comment,
        r.created_at,
        u.login AS userLogin,
        p.sku AS productSku
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN products p ON r.product_id = p.id
      WHERE r.id = $1 AND r.user_id = $2
    `

		const { rows } = await this.db.query(query, [reviewId, userId])

		if (rows.length === 0) {
			throw new NotFoundException('Review not found or access denied')
		}

		const row = rows[0]
		return {
			id: row.id,
			userId: row.user_id,
			userLogin: row.userLogin,
			productId: row.product_id,
			productSku: row.productSku,
			rating: row.rating,
			comment: row.comment,
			createdAt: row.created_at
		} as ReviewResponseDto
	}

	private mapReviewToResponse(row: any): ReviewResponseDto {
		return {
			id: row.id,
			userId: row.user_id,
			userLogin: row.userLogin,
			productId: row.product_id,
			productSku: row.productSku,
			rating: row.rating,
			comment: row.comment,
			createdAt: row.created_at
		} as ReviewResponseDto
	}
}
