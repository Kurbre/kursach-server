import { ApiProperty } from '@nestjs/swagger'

export class BrandResponse {
	@ApiProperty({ example: 'd96b22b9-e788-486c-b80e-2f5a5fdfff20' })
	id: string

	@ApiProperty({ example: 'Apple' })
	name: string
}
