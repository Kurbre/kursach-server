import { IsString, MaxLength, MinLength } from 'class-validator'

export class LoginDto {
	@IsString()
	@MinLength(8)
	@MaxLength(64)
	password: string

	@IsString()
	@MinLength(4)
	@MaxLength(24)
	login: string
}
