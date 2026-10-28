import { validate } from 'class-validator'
import { CreateCartItemDto } from './create-cart-item.dto'

describe('CreateCartItemDto', () => {
	it('accepts UUID-shaped variant IDs used by PostgreSQL', async () => {
		const dto = Object.assign(new CreateCartItemDto(), {
			productVariantId: 'f0000000-0000-0000-0000-000000000001',
			quantity: 1
		})

		await expect(validate(dto)).resolves.toHaveLength(0)
	})

	it('rejects malformed variant IDs', async () => {
		const dto = Object.assign(new CreateCartItemDto(), {
			productVariantId: 'not-a-uuid',
			quantity: 1
		})

		const errors = await validate(dto)

		expect(errors.map(error => error.property)).toContain('productVariantId')
	})
})
