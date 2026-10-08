import { ApiProperty } from '@nestjs/swagger'
import { IsString, MaxLength, MinLength } from 'class-validator'

export class LoginDto {
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
}
