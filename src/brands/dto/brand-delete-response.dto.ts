import { ApiProperty } from '@nestjs/swagger'

export class BrandDeleteResponse {
	@ApiProperty({ example: true })
	success: boolean
}
