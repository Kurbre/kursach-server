import { ApiProperty } from '@nestjs/swagger'

export class ModelResponse {
	@ApiProperty({ example: '1d2b9213-250d-4f0e-b58a-3ab88f21577d' })
	id: string

	@ApiProperty({ example: 'Iphone 16 Pro Max' })
	name: string

	@ApiProperty({ example: '1d2b9213-250d-4f0e-b58a-3ab88f21577d' })
	brand_id: string
}
