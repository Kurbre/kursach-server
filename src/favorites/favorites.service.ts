import { Injectable, NotFoundException } from '@nestjs/common'
import { DatabaseService } from '../database/database.service'
import { AddFavoriteDto } from './dto/add-favorite.dto'
import { FavoriteResponseDto } from './dto/favorite-response.dto'
import { FavoriteActionResponseDto } from './dto/favorite-action-response.dto'
import { IsFavoriteResponseDto } from './dto/is-favorite-response.dto'
import { ProductVariantResponseDto } from '../products/dto/product-variant-response.dto'
import { ProductSpecificationResponseDto } from '../products/dto/product-specification-response.dto'
import { ColorResponse } from '../colors/dto/color-response.dto'

@Injectable()
export class FavoritesService {
  constructor(private readonly db: DatabaseService) {}

  async getFavorites(userId: string): Promise<FavoriteResponseDto[]> {
    const query = `
      SELECT
        p.id,
        p.sku,
        p.is_active,
        p.images_path,
        p.model_id,
        m.name AS model_name,
        b.id AS brand_id,
        b.name AS brand_name,
        p.created_at,
        p.updated_at,
        -- Variants
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', pv.id,
              'ram_gb', pv.ram_gb,
              'storage_gb', pv.storage_gb,
              'price', pv.price,
              'discount', pv.discount,
              'stock_quantity', pv.stock_quantity,
              'color', jsonb_build_object(
                'id', c.id,
                'name', c.name,
                'hex', c.hex
              )
            )
          ) FILTER (WHERE pv.id IS NOT NULL), '[]'
        ) AS variants,
        -- Specifications
        ps.*
      FROM favorite_items fi
      JOIN products p ON fi.product_id = p.id
      JOIN models m ON p.model_id = m.id
      JOIN brands b ON m.brand_id = b.id
      LEFT JOIN product_variants pv ON pv.product_id = p.id
      LEFT JOIN colors c ON pv.color_id = c.id
      LEFT JOIN product_specifications ps ON ps.product_id = p.id
      WHERE fi.user_id = $1
      GROUP BY p.id, m.name, b.id, b.name, p.sku, p.is_active, p.images_path, p.model_id, p.created_at, p.updated_at, ps.id
      ORDER BY p.created_at DESC
    `

    const { rows } = await this.db.query(query, [userId])

    return rows.map(row => {
      // Handle variants - could be already parsed or JSON string
      let variants: any[] = []
      if (row.variants) {
        if (typeof row.variants === 'string') {
          try {
            variants = JSON.parse(row.variants)
          } catch (e) {
            console.error('Error parsing variants JSON:', e)
            variants = []
          }
        } else if (Array.isArray(row.variants)) {
          variants = row.variants
        }
      }

      return {
        id: row.id,
        sku: row.sku,
        is_active: row.is_active,
        images_path: row.images_path,
        model_id: row.model_id,
        model_name: row.model_name,
        brand_id: row.brand_id,
        brand_name: row.brand_name,
        created_at: row.created_at,
        updated_at: row.updated_at,
        variants: variants.map((variant: any) => ({
          ...variant,
          color: variant.color as ColorResponse
        } as ProductVariantResponseDto)),
        specifications: row.specifications ?
          { ...row.specifications } as ProductSpecificationResponseDto :
          undefined
      } as FavoriteResponseDto
    })
  }

  async addToFavorites(userId: string, dto: AddFavoriteDto): Promise<FavoriteActionResponseDto> {
    // Check if the product exists
    const productCheck = await this.db.query(
      'SELECT id FROM products WHERE id = $1',
      [dto.productId]
    )

    if (productCheck.rowCount === 0) {
      throw new NotFoundException('Product not found')
    }

    // Check if already in favorites
    const existingFavorite = await this.db.query(
      'SELECT id FROM favorite_items WHERE user_id = $1 AND product_id = $2',
      [userId, dto.productId]
    )

    if (existingFavorite.rowCount === 0) {
      // Add to favorites
      await this.db.query(
        'INSERT INTO favorite_items (user_id, product_id) VALUES ($1, $2)',
        [userId, dto.productId]
      )
    }
    // If already exists, we still return success (idempotent operation)

    const response = new FavoriteActionResponseDto()
    response.success = true
    return response
  }

  async removeFromFavorites(userId: string, productId: string): Promise<FavoriteActionResponseDto> {
    const result = await this.db.query(
      'DELETE FROM favorite_items WHERE user_id = $1 AND product_id = $2 RETURNING id',
      [userId, productId]
    )

    if ((result.rowCount ?? 0) === 0) {
      throw new NotFoundException('Favorite not found')
    }

    const response = new FavoriteActionResponseDto()
    response.success = true
    return response
  }

  async isFavorite(userId: string, productId: string): Promise<IsFavoriteResponseDto> {
    const result = await this.db.query(
      'SELECT id FROM favorite_items WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    )

    const response = new IsFavoriteResponseDto()
    response.isFavorite = (result.rowCount ?? 0) > 0
    return response
  }
}