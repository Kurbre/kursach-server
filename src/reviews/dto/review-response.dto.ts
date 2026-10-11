import { ApiProperty } from '@nestjs/swagger'

export class ReviewResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID отзыва'
  })
  id: string

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID пользователя'
  })
  userId: string

  @ApiProperty({ example: 'john_doe', description: 'Логин пользователя' })
  userLogin: string

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID товара'
  })
  productId: string

  @ApiProperty({ example: 'IPHONE-15-PRO-MAX', description: 'Артикул товара' })
  productSku: string

  @ApiProperty({ example: 5, description: 'Оценка (1-5)' })
  rating: number

  @ApiProperty({ example: 'Отличный телефон!', description: 'Текст отзыва' })
  comment: string

  @ApiProperty({
    example: '2026-10-10T14:20:00.000Z',
    description: 'Дата создания отзыва'
  })
  createdAt: Date
}