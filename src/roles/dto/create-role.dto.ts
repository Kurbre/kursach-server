import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class CreateRoleDto {
	@ApiProperty({
		description: 'Уникальное название роли',
		example: 'admin',
		required: true
	})
	@IsString()
	@IsNotEmpty()
	name: string
}
