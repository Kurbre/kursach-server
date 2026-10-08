import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator'

export class CreateUserDto {
	@IsEmail()
	@MinLength(8)
	@MaxLength(64)
	@ApiProperty({ example: 'admin@example.com' })
	email: string

	@IsString()
	@MinLength(8)
	@MaxLength(64)
	@ApiProperty({ example: 'qwerty123' })
	password: string

	@IsString()
	@MinLength(4)
	@MaxLength(24)
	@ApiProperty({ example: 'admin' })
	login: string

	@IsString()
	@MinLength(4)
	@MaxLength(24)
	@ApiProperty({ example: 'Jhon' })
	name: string

	@IsString()
	@MinLength(4)
	@MaxLength(24)
	@ApiProperty({ example: 'Jhonson' })
	surname: string
}
