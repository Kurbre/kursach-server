import { ApiProperty } from '@nestjs/swagger'

export class ColorResponse {
	@ApiProperty({ example: 'e9833109-f287-407c-a56d-9fdc3aa2569c' })
	id: string

	@ApiProperty({ example: 'Black' })
	name: string

	@ApiProperty({ example: '#000000' })
	hex: string
}
