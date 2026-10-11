import { Injectable, NotFoundException } from '@nestjs/common'
import { DatabaseService } from '../database/database.service'
import { UpdateOrderStatusDto } from './dto/update-order-status.dto'
import { OrderResponseDto } from './dto/order-response.dto'
import { OrderItemResponseDto } from './dto/order-item-response.dto'
import { ProductVariantResponseDto } from '../products/dto/product-variant-response.dto'
import { ColorResponse } from '../colors/dto/color-response.dto'

@Injectable()
export class OrdersService {
  constructor(private readonly db: DatabaseService) {}

  async getUserOrders(userId: string): Promise<OrderResponseDto[]> {
    const query = `
      SELECT
        o.id,
        o.user_id,
        o.total_price,
        o.status,
        o.created_at,
        o.updated_at,
        -- Order items
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', oi.id,
              'order_id', oi.order_id,
              'product_variant_id', oi.product_variant_id,
              'quantity', oi.quantity,
              'price', oi.price,
              'product_variant', jsonb_build_object(
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
            )
          ) FILTER (WHERE oi.id IS NOT NULL), '[]'
        ) AS items
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN product_variants pv ON pv.product_id = oi.product_variant_id
      LEFT JOIN colors c ON pv.color_id = c.id
      WHERE o.user_id = $1
      GROUP BY o.id, o.user_id, o.total_price, o.status, o.created_at, o.updated_at
      ORDER BY o.created_at DESC
    `

    const { rows } = await this.db.query(query, [userId])

    return rows.map(row => {
      // Handle items - could be already parsed or JSON string
      let items: any[] = []
      if (row.items) {
        if (typeof row.items === 'string') {
          try {
            items = JSON.parse(row.items)
          } catch (e) {
            console.error('Error parsing items JSON:', e)
            items = []
          }
        } else if (Array.isArray(row.items)) {
          items = row.items
        }
      }

      return {
        id: row.id,
        userId: row.user_id,
        totalPrice: parseFloat(row.total_price),
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        items: items.map((item: any) => ({
          ...item,
          price: parseFloat(item.price),
          productVariant: item.productVariant ? {
            ...item.productVariant,
            color: item.productVariant.color as ColorResponse
          } as ProductVariantResponseDto : null
        } as OrderItemResponseDto))
      } as OrderResponseDto
    })
  }

  async getOrderById(orderId: string, userId: string): Promise<OrderResponseDto> {
    const query = `
      SELECT
        o.id,
        o.user_id,
        o.total_price,
        o.status,
        o.created_at,
        o.updated_at,
        -- Order items
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', oi.id,
              'order_id', oi.order_id,
              'product_variant_id', oi.product_variant_id,
              'quantity', oi.quantity,
              'price', oi.price,
              'product_variant', jsonb_build_object(
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
            )
          ) FILTER (WHERE oi.id IS NOT NULL), '[]'
        ) AS items
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN product_variants pv ON pv.product_id = oi.product_variant_id
      LEFT JOIN colors c ON pv.color_id = c.id
      WHERE o.id = $1 AND o.user_id = $2
      GROUP BY o.id, o.user_id, o.total_price, o.status, o.created_at, o.updated_at
    `

    const { rows } = await this.db.query(query, [orderId, userId])

    if (rows.length === 0) {
      throw new NotFoundException('Order not found')
    }

    const row = rows[0]
    // Handle items - could be already parsed or JSON string
    let items: any[] = []
    if (row.items) {
      if (typeof row.items === 'string') {
        try {
          items = JSON.parse(row.items)
        } catch (e) {
          console.error('Error parsing items JSON:', e)
          items = []
        }
      } else if (Array.isArray(row.items)) {
        items = row.items
      }
    }

    return {
      id: row.id,
      userId: row.user_id,
      totalPrice: parseFloat(row.total_price),
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      items: items.map((item: any) => ({
        ...item,
        price: parseFloat(item.price),
        productVariant: item.productVariant ? {
          ...item.productVariant,
          color: item.productVariant.color as ColorResponse
        } as ProductVariantResponseDto : null
      } as OrderItemResponseDto))
    } as OrderResponseDto
  }

  async createOrderFromCart(userId: string): Promise<OrderResponseDto> {
    // Start a transaction
    const client = await this.db.getPool().connect()

    try {
      await client.query('BEGIN')

      // Get user's cart items with product variant details
      const cartQuery = `
        SELECT
          ci.quantity,
          pv.id AS "productVariantId",
          pv.price,
          pv.ram_gb,
          pv.storage_gb,
          pv.discount,
          c.id AS "colorId",
          c.name AS "colorName",
          c.hex AS "colorHex",
          pv.stock_quantity AS "stockQuantity"
        FROM cart_items ci
        JOIN product_variants pv ON ci.product_variant_id = pv.id
        JOIN colors c ON pv.color_id = c.id
        WHERE ci.user_id = $1
      `

      const { rows: cartItems } = await client.query(cartQuery, [userId])

      if (cartItems.length === 0) {
        throw new NotFoundException('Cart is empty')
      }

      // Check stock availability and calculate total price
      let totalPrice = 0
      const itemsToCreate = []

      for (const cartItem of cartItems) {
        // Check if sufficient stock is available
        if (cartItem.stockQuantity < cartItem.quantity) {
          throw new Error(`Insufficient stock for product variant ${cartItem.productVariantId}`)
        }

        const unitPrice = parseFloat(cartItem.price)
        const quantity = cartItem.quantity
        const discount = cartItem.discount || 0
        const discountedPrice = unitPrice * (1 - discount / 100)
        totalPrice += discountedPrice * quantity

        itemsToCreate.push({
          productVariantId: cartItem.productVariantId,
          quantity: cartItem.quantity,
          price: discountedPrice
        })
      }

      // Create the order
      const orderResult = await client.query(
        `
        INSERT INTO orders (user_id, total_price, status)
        VALUES ($1, $2, 'pending')
        RETURNING id, user_id, total_price, status, created_at, updated_at
        `,
        [userId, totalPrice]
      )

      const order = orderResult.rows[0]
      const orderId = order.id

      // Create order items from cart items
      for (const item of itemsToCreate) {
        await client.query(
          `
          INSERT INTO order_items (
            order_id, product_variant_id, quantity, price
          ) VALUES ($1, $2, $3, $4)
          `,
          [
            orderId,
            item.productVariantId,
            item.quantity,
            item.price
          ]
        )
      }

      // Clear the cart
      await client.query(
        'DELETE FROM cart_items WHERE user_id = $1',
        [userId]
      )

      await client.query('COMMIT')

      // Return the created order with items
      return this.getOrderById(orderId, userId)

    } catch (error) {
      await client.query('ROLLBACK')
      if (error instanceof NotFoundException) {
        throw error
      }
      if (error instanceof Error) {
        throw new Error(error.message)
      }

      throw error
    } finally {
      client.release()
    }
  }

  async updateOrderStatus(
    orderId: string,
    userId: string,
    dto: UpdateOrderStatusDto
  ): Promise<OrderResponseDto> {
    // First check if the order exists and belongs to the user
    const orderCheck = await this.db.query(
      'SELECT id FROM orders WHERE id = $1 AND user_id = $2',
      [orderId, userId]
    )

    if (orderCheck.rowCount === 0) {
      throw new NotFoundException('Order not found')
    }

    // Update the order status
    await this.db.query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2',
      [dto.status, orderId]
    )

    // Return updated order
    return this.getOrderById(orderId, userId)
  }

  async cancelOrder(orderId: string, userId: string): Promise<OrderResponseDto> {
    return this.updateOrderStatus(orderId, userId, { status: 'cancelled' } as UpdateOrderStatusDto)
  }
}