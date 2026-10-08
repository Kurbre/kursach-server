import { ApiProperty } from '@nestjs/swagger'

export class UserResponse {
	@ApiProperty({ example: 'admin@example.com' })
	email: string

	@ApiProperty({ example: 'admin' })
	login: string

	@ApiProperty({ example: 'Jhon' })
	name: string

	@ApiProperty({ example: 'Jhonson' })
	surname: string

	@ApiProperty({ example: '2026-10-08 06:29:18.373466+00' })
	created_at: Date

	@ApiProperty({ example: '2026-10-08 06:29:18.373466+00' })
	updated_at: Date

	@ApiProperty({ example: 'd96b22b9-e788-486c-b80e-2f5a5fdfff20' })
	role_id: string
}
