import { ApiProperty } from '@nestjs/swagger'
import { ProductVariantResponseDto } from '../../products/dto/product-variant-response.dto'

export class OrderItemResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID позиции в заказе'
  })
  id: string

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID заказа'
  })
  orderId: string

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID варианта продукта'
  })
  productVariantId: string

  @ApiProperty({ example: 2, description: 'Количество товара' })
  quantity: number

  @ApiProperty({ example: 119990.0, description: 'Цена за единицу товара' })
  price: number

  @ApiProperty({
    type: ProductVariantResponseDto,
    description: 'Информация о варианте продукта'
  })
  productVariant: ProductVariantResponseDto
}