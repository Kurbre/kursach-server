import { ApiProperty } from '@nestjs/swagger'

export class IsFavoriteResponseDto {
  @ApiProperty({ example: true, description: 'Находится ли товар в избранном' })
  isFavorite: boolean
}