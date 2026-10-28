import { ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
	ArrayUnique,
	IsArray,
	Matches,
	IsOptional,
	ValidateNested
} from 'class-validator'
import { CreateProductDto } from './create-product.dto'
import { CreateProductSpecificationDto } from './create-product-specification.dto'
import { CreateProductVariantDto } from './create-product-variant.dto'

const postgresUuidPattern =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export class UpdateProductVariantWithIdDto extends PartialType(
	CreateProductVariantDto
) {
	@ApiPropertyOptional({
		example: '123e4567-e89b-12d3-a456-426614174000',
		description:
			'ID существующего варианта (передавать при изменении, убрать при создании нового)'
	})
	@IsOptional()
	@Matches(postgresUuidPattern)
	id?: string
}

export class UpdateFullProductDto extends PartialType(CreateProductDto) {
	@ApiPropertyOptional({ type: [UpdateProductVariantWithIdDto] })
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => UpdateProductVariantWithIdDto)
	variants?: UpdateProductVariantWithIdDto[]

	@ApiPropertyOptional({
		type: [String],
		description: 'IDs вариантов, которые нужно удалить'
	})
	@IsOptional()
	@IsArray()
	@ArrayUnique()
	@Matches(postgresUuidPattern, { each: true })
	delete_variant_ids?: string[]

	@ApiPropertyOptional({ type: CreateProductSpecificationDto })
	@IsOptional()
	@ValidateNested()
	@Type(() => CreateProductSpecificationDto)
	specifications?: CreateProductSpecificationDto
}
