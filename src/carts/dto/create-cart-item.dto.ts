import { IsInt, IsPositive, Matches } from 'class-validator'

export class CreateCartItemDto {
	@Matches(
		/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
		{ message: 'productVariantId must be a UUID' }
	)
	productVariantId: string

	@IsInt()
	@IsPositive()
	quantity: number = 1
}