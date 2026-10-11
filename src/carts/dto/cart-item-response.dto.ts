import { ApiProperty } from '@nestjs/swagger'
import { ProductVariantResponseDto } from '../../products/dto/product-variant-response.dto'

export class CartItemResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID позиции в корзине'
  })
  id: string

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID пользователя'
  })
  userId: string

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID варианта продукта'
  })
  productVariantId: string

  @ApiProperty({ example: 2, description: 'Количество товара' })
  quantity: number

  @ApiProperty({ example: '2026-10-10T14:20:00.000Z', description: 'Дата добавления в корзину' })
  createdAt: Date

  @ApiProperty({
    type: ProductVariantResponseDto,
    description: 'Информация о варианте продукта'
  })
  productVariant: ProductVariantResponseDto
}