import { ApiProperty } from '@nestjs/swagger'

export class ColorDeleteResponse {
	@ApiProperty({ example: true })
	success: boolean
}
