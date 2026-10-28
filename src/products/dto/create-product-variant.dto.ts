import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
	IsInt,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	Matches,
	Max,
	Min
} from 'class-validator'

const postgresUuidPattern =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export class CreateProductVariantDto {
	@ApiProperty({
		example: '123e4567-e89b-12d3-a456-426614174000',
		description: 'UUID цвета'
	})
	@Matches(postgresUuidPattern)
	@IsNotEmpty()
	color_id: string

	@ApiProperty({ example: 8, description: 'Объем ОЗУ (ГБ)' })
	@IsInt()
	@Min(1)
	ram_gb: number

	@ApiProperty({ example: 256, description: 'Объем встроенной памяти (ГБ)' })
	@IsInt()
	@Min(1)
	storage_gb: number

	@ApiPropertyOptional({
		example: 15,
		description: 'Остаток на складе',
		default: 0
	})
	@IsOptional()
	@IsInt()
	@Min(0)
	stock_quantity?: number

	@ApiProperty({ example: 119990.0, description: 'Текущая цена товара' })
	@IsNumber()
	@Min(0)
	price: number

	@ApiPropertyOptional({
		example: 10,
		description: 'Скидка в процентах (0-100)',
		default: 0
	})
	@IsOptional()
	@IsInt()
	@Min(0)
	@Max(100)
	discount?: number
}
