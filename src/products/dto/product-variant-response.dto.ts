import { ApiProperty } from '@nestjs/swagger'
import { ColorResponse } from '../../colors/dto/color-response.dto'

export class ProductVariantResponseDto {
	@ApiProperty({
		example: '123e4567-e89b-12d3-a456-426614174000',
		description: 'ID варианта'
	})
	id: string

	@ApiProperty({ example: 8, description: 'Объем ОЗУ (ГБ)' })
	ram_gb: number

	@ApiProperty({ example: 256, description: 'Объем накопителя (ГБ)' })
	storage_gb: number

	@ApiProperty({ example: 119990.0, description: 'Цена товара' })
	price: number

	@ApiProperty({ example: 10, description: 'Скидка в процентах' })
	discount: number

	@ApiProperty({ example: 15, description: 'Остаток на складе' })
	stock_quantity: number

	@ApiProperty({
		type: ColorResponse,
		description: 'Информация о цвете'
	})
	color: ColorResponse
}
