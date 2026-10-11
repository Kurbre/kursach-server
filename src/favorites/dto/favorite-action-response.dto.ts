import { ApiProperty } from '@nestjs/swagger'

export class FavoriteActionResponseDto {
  @ApiProperty({ example: true, description: 'Статус выполнения операции' })
  success: boolean
}