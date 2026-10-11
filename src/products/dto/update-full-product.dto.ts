import { ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsArray, IsOptional, IsUUID, ValidateNested } from 'class-validator'
import { CreateProductDto } from './create-product.dto'
import { CreateProductSpecificationDto } from './create-product-specification.dto'
import { CreateProductVariantDto } from './create-product-variant.dto'

export class UpdateProductVariantWithIdDto extends PartialType(
	CreateProductVariantDto
) {
	@ApiPropertyOptional({
		example: '123e4567-e89b-12d3-a456-426614174000',
		description:
			'ID существующего варианта (передавать при изменении, убрать при создании нового)'
	})
	@IsOptional()
	@IsUUID()
	id?: string
}

export class UpdateFullProductDto extends PartialType(CreateProductDto) {
	@ApiPropertyOptional({ type: [UpdateProductVariantWithIdDto] })
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => UpdateProductVariantWithIdDto)
	variants?: UpdateProductVariantWithIdDto[]

	@ApiPropertyOptional({ type: CreateProductSpecificationDto })
	@IsOptional()
	@ValidateNested()
	@Type(() => CreateProductSpecificationDto)
	specifications?: CreateProductSpecificationDto
}
