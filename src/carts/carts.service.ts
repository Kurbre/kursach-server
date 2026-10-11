import { Injectable, NotFoundException } from '@nestjs/common'
import { DatabaseService } from '../database/database.service'
import { CreateCartItemDto } from './dto/create-cart-item.dto'
import { UpdateCartItemDto } from './dto/update-cart-item.dto'
import { CartItemResponseDto } from './dto/cart-item-response.dto'
import { ColorResponse } from '../colors/dto/color-response.dto'
import { ProductVariantResponseDto } from '../products/dto/product-variant-response.dto'

@Injectable()
export class CartsService {
	constructor(private readonly db: DatabaseService) {}

	async getCartItems(userId: string): Promise<CartItemResponseDto[]> {
		const query = `
      SELECT
        ci.id,
        ci.user_id,
        ci.product_variant_id,
        ci.quantity,
        ci.created_at,
        pv.id AS "productVariantId",
        pv.ram_gb,
        pv.storage_gb,
        pv.price,
        pv.discount,
        pv.stock_quantity,
        c.id AS "colorId",
        c.name AS "colorName",
        c.hex AS "colorHex"
      FROM cart_items ci
      JOIN product_variants pv ON ci.product_variant_id = pv.id
      JOIN colors c ON pv.color_id = c.id
      WHERE ci.user_id = $1
      ORDER BY ci.created_at DESC
    `

		const { rows } = await this.db.query(query, [userId])

		return rows.map(row => ({
			id: row.id,
			userId: row.user_id,
			productVariantId: row.product_variant_id,
			quantity: row.quantity,
			createdAt: row.created_at,
			productVariant: {
				id: row.productVariantId,
				ram_gb: row.ram_gb,
				storage_gb: row.storage_gb,
				price: row.price,
				discount: row.discount,
				stock_quantity: row.stock_quantity,
				color: {
					id: row.colorId,
					name: row.colorName,
					hex: row.colorHex
				} as ColorResponse
			} as ProductVariantResponseDto
		}))
	}

	async addItemToCart(
		userId: string,
		dto: CreateCartItemDto
	): Promise<CartItemResponseDto> {
		// Check if the product variant exists
		const variantCheck = await this.db.query(
			'SELECT id FROM product_variants WHERE id = $1',
			[dto.productVariantId]
		)

		if (variantCheck.rowCount === 0) {
			throw new NotFoundException('Product variant not found')
		}

		// Check if item already exists in cart for this user and variant
		const existingItem = await this.db.query(
			'SELECT id, quantity FROM cart_items WHERE user_id = $1 AND product_variant_id = $2',
			[userId, dto.productVariantId]
		)

		if ((existingItem.rowCount ?? 0) > 0) {
			// Item exists, update quantity
			const newQuantity = existingItem.rows[0].quantity + dto.quantity
			await this.db.query('UPDATE cart_items SET quantity = $1 WHERE id = $2', [
				newQuantity,
				existingItem.rows[0].id
			])

			// Return updated item
			return this.getCartItemById(existingItem.rows[0].id)
		} else {
			// Item doesn't exist, create new
			const query = `
        INSERT INTO cart_items (user_id, product_variant_id, quantity)
        VALUES ($1, $2, $3)
        RETURNING id, user_id, product_variant_id, quantity, created_at
      `

			const { rows } = await this.db.query(query, [
				userId,
				dto.productVariantId,
				dto.quantity
			])

			const cartItem = rows[0]
			return this.getCartItemById(cartItem.id)
		}
	}

	async updateCartItem(
		userId: string,
		cartItemId: string,
		dto: UpdateCartItemDto
	): Promise<CartItemResponseDto> {
		// First check if the cart item exists and belongs to the user
		const existingItem = await this.db.query(
			'SELECT id FROM cart_items WHERE id = $1 AND user_id = $2',
			[cartItemId, userId]
		)

		if (existingItem.rowCount === 0) {
			throw new NotFoundException('Cart item not found')
		}

		// If quantity is provided, update it
		if (dto.quantity !== undefined) {
			await this.db.query('UPDATE cart_items SET quantity = $1 WHERE id = $2', [
				dto.quantity,
				cartItemId
			])
		}

		// Return updated item
		return this.getCartItemById(cartItemId)
	}

	async removeItemFromCart(
		userId: string,
		cartItemId: string
	): Promise<{ success: boolean }> {
		const result = await this.db.query(
			'DELETE FROM cart_items WHERE id = $1 AND user_id = $2 RETURNING id',
			[cartItemId, userId]
		)

		if (result.rowCount === 0) {
			throw new NotFoundException('Cart item not found')
		}

		return { success: true }
	}

	async clearCart(userId: string): Promise<{ success: boolean }> {
		await this.db.query('DELETE FROM cart_items WHERE user_id = $1', [userId])

		return { success: true }
	}

	private async getCartItemById(
		cartItemId: string
	): Promise<CartItemResponseDto> {
		const query = `
      SELECT
        ci.id,
        ci.user_id,
        ci.product_variant_id,
        ci.quantity,
        ci.created_at,
        pv.id AS "productVariantId",
        pv.ram_gb,
        pv.storage_gb,
        pv.price,
        pv.discount,
        pv.stock_quantity,
        c.id AS "colorId",
        c.name AS "colorName",
        c.hex AS "colorHex"
      FROM cart_items ci
      JOIN product_variants pv ON ci.product_variant_id = pv.id
      JOIN colors c ON pv.color_id = c.id
      WHERE ci.id = $1
    `

		const { rows } = await this.db.query(query, [cartItemId])

		if (rows.length === 0) {
			throw new NotFoundException('Cart item not found')
		}

		const row = rows[0]
		return {
			id: row.id,
			userId: row.user_id,
			productVariantId: row.product_variant_id,
			quantity: row.quantity,
			createdAt: row.created_at,
			productVariant: {
				id: row.productVariantId,
				ram_gb: row.ram_gb,
				storage_gb: row.storage_gb,
				price: row.price,
				discount: row.discount,
				stock_quantity: row.stock_quantity,
				color: {
					id: row.colorId,
					name: row.colorName,
					hex: row.colorHex
				} as ColorResponse
			} as ProductVariantResponseDto
		}
	}
}
