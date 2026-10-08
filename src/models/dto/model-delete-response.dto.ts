import { ApiProperty } from '@nestjs/swagger'

export class ModelDeleteResponse {
	@ApiProperty({ example: true })
	success: boolean
}
