import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsHexColor, IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class CreateColorDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(50)
	@ApiProperty({ example: 'Titanium Black', description: 'Название цвета' })
	name: string

	@IsString()
	@IsNotEmpty()
	@IsHexColor()
	@MaxLength(50)
	@ApiPropertyOptional({ example: '#000000', description: 'HEX-код цвета' })
	hex: string
}
