import { ApiProperty } from '@nestjs/swagger'

export class DeleteCartsResponseDto {
	@ApiProperty({ example: true })
	success: boolean
}
