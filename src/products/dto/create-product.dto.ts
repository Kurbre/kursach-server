import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
	IsArray,
	IsBoolean,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUUID
} from 'class-validator'

export class CreateProductDto {
	@ApiProperty({
		example: 'IPHONE-15-PRO-MAX',
		description: 'Уникальный артикул (SKU)'
	})
	@IsString()
	@IsNotEmpty()
	sku: string

	@ApiProperty({
		example: '123e4567-e89b-12d3-a456-426614174000',
		description: 'UUID модели'
	})
	@IsUUID()
	@IsNotEmpty()
	model_id: string

	@ApiPropertyOptional({
		example: true,
		description: 'Статус активности',
		default: true
	})
	@IsOptional()
	@IsBoolean()
	is_active?: boolean

	@ApiPropertyOptional({
		example: ['/uploads/iphone15-front.jpg'],
		description: 'Пути к изображениям'
	})
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	images_path?: string[]
}
