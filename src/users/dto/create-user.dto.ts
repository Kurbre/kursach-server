import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator'

export class CreateUserDto {
	@IsEmail()
	@MinLength(8)
	@MaxLength(64)
	email: string

	@IsString()
	@MinLength(8)
	@MaxLength(64)
	password: string

	@IsString()
	@MinLength(4)
	@MaxLength(24)
	username: string
}
