import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator'

export class CreateModelDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	@ApiProperty({ example: 'Iphone 16 Pro Max' })
	name: string

	@IsString()
	@IsNotEmpty()
	@Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
	@ApiProperty({ example: '1d2b9213-250d-4f0e-b58a-3ab88f21577d' })
	brand_id: string
}
