import { ApiProperty } from '@nestjs/swagger'
import { OrderItemResponseDto } from './order-item-response.dto'

export class OrderResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID заказа'
  })
  id: string

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID пользователя'
  })
  userId: string

  @ApiProperty({ example: 239980.0, description: 'Общая стоимость заказа' })
  totalPrice: number

  @ApiProperty({ example: 'pending', description: 'Статус заказа' })
  status: string

  @ApiProperty({ example: 'courier', description: 'Способ доставки' })
  deliveryMethod: string

  @ApiProperty({ example: {'address': 'Some address'}, description: 'Информация о доставке' })
  deliveryInfo: Record<string, any>

  @ApiProperty({
    example: '2026-10-10T14:20:00.000Z',
    description: 'Дата создания заказа'
  })
  createdAt: Date

  @ApiProperty({
    example: '2026-10-10T14:20:00.000Z',
    description: 'Дата обновления заказа'
  })
  updatedAt: Date

  @ApiProperty({
    type: [OrderItemResponseDto],
    description: 'Список позиций в заказе'
  })
  items: OrderItemResponseDto[]
}