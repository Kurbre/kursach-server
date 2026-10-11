import { IsIn, IsString } from 'class-validator'

export class UpdateOrderStatusDto {
  @IsString()
  @IsIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'], {
    message: 'Статус должен быть одним из: pending, confirmed, shipped, delivered, cancelled'
  })
  status: string
}