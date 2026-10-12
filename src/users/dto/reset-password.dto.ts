import { ApiProperty } from '@nestjs/swagger'
import { IsString, MaxLength, MinLength } from 'class-validator'

export class ResetPasswordDto {
	@IsString()
	@MinLength(8)
	@MaxLength(64)
	@ApiProperty({ example: 'qwerty123' })
	oldPassword: string

	@IsString()
	@MinLength(8)
	@MaxLength(64)
	@ApiProperty({ example: 'qwerty123' })
	newPassword: string
}
