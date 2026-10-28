import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
	IsArray,
	IsBoolean,
	IsNotEmpty,
	IsOptional,
	IsString,
	Matches,
	ValidateNested
} from 'class-validator'
import { CreateProductVariantDto } from './create-product-variant.dto'
import { CreateProductSpecificationDto } from './create-product-specification.dto'

const postgresUuidPattern =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export class CreateFullProductDto {
	@ApiProperty({ example: 'IPHONE-15-PRO-MAX', description: 'Артикул товара' })
	@IsString()
	@IsNotEmpty()
	sku: string

	@ApiProperty({
		example: '123e4567-e89b-12d3-a456-426614174000',
		description: 'UUID модели'
	})
	@Matches(postgresUuidPattern)
	@IsNotEmpty()
	model_id: string

	@ApiPropertyOptional({ example: true, default: true })
	@IsOptional()
	@IsBoolean()
	is_active?: boolean

	@ApiPropertyOptional({ example: ['/uploads/iphone15.jpg'] })
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	images_path?: string[]

	@ApiProperty({
		type: [CreateProductVariantDto],
		description: 'Список модификаций (память/цвет/цена)'
	})
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => CreateProductVariantDto)
	variants: CreateProductVariantDto[]

	@ApiPropertyOptional({
		type: CreateProductSpecificationDto,
		description: 'Технические характеристики'
	})
	@IsOptional()
	@ValidateNested()
	@Type(() => CreateProductSpecificationDto)
	specifications?: CreateProductSpecificationDto
}
