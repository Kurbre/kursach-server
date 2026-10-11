import { ApiProperty } from '@nestjs/swagger'

export class ProductDeleteResponseDto {
	@ApiProperty({ example: true, description: 'Флаг успешного удаления' })
	success: boolean
}
