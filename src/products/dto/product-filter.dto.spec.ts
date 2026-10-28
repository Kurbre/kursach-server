import 'reflect-metadata'
import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { ProductFilterDto } from './product-filter.dto'

describe('ProductFilterDto', () => {
	it('converts price query values to numbers and accepts supported sorting', async () => {
		const dto = plainToInstance(ProductFilterDto, {
			minPrice: '5000',
			maxPrice: '15000',
			sortBy: 'price-asc'
		})

		await expect(validate(dto)).resolves.toHaveLength(0)
		expect(dto.minPrice).toBe(5000)
		expect(dto.maxPrice).toBe(15000)
	})

	it('rejects unsupported sort expressions', async () => {
		const dto = plainToInstance(ProductFilterDto, {
			sortBy: 'price-asc; DROP TABLE products'
		})

		const errors = await validate(dto)

		expect(errors.map(error => error.property)).toContain('sortBy')
	})
})
