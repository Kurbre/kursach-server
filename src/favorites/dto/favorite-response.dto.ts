import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ProductVariantResponseDto } from '../../products/dto/product-variant-response.dto'
import { ProductSpecificationResponseDto } from '../../products/dto/product-specification-response.dto'

export class FavoriteResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'UUID товара'
  })
  id: string

  @ApiProperty({ example: 'IPHONE-15-PRO-MAX', description: 'Артикул (SKU)' })
  sku: string

  @ApiProperty({ example: true, description: 'Статус активности товара' })
  is_active: boolean

  @ApiProperty({
    example: ['/uploads/iphone15-front.jpg', '/uploads/iphone15-back.jpg'],
    description: 'Массив путей к изображениям'
  })
  images_path: string[]

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID модели'
  })
  model_id: string

  @ApiProperty({ example: 'iPhone 15 Pro Max', description: 'Название модели' })
  model_name: string

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID бренда'
  })
  brand_id: string

  @ApiProperty({ example: 'Apple', description: 'Название бренда' })
  brand_name: string

  @ApiProperty({
    example: '2026-10-10T14:20:00.000Z',
    description: 'Дата создания'
  })
  created_at: Date

  @ApiProperty({
    example: '2026-10-10T14:20:00.000Z',
    description: 'Дата обновления'
  })
  updated_at: Date

  @ApiProperty({
    type: [ProductVariantResponseDto],
    description: 'Список вариантов модификаций товара'
  })
  variants: ProductVariantResponseDto[]

  @ApiPropertyOptional({
    type: ProductSpecificationResponseDto,
    description: 'Технические характеристики товара'
  })
  specifications?: ProductSpecificationResponseDto
}