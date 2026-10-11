import {
	Body,
	Controller,
	Delete,
	Get,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	Query
} from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Auth } from '../auth/decorators/auth.decorator'
import { Roles } from '../roles/decorators/roles.decorator'
import { Roles as RolesEnum } from '../roles/types/role.type'
import { CreateFullProductDto } from './dto/create-full-product.dto'
import { ProductsService } from './products.service'
import { UpdateFullProductDto } from './dto/update-full-product.dto'
import { ProductResponseDto } from './dto/product-response.dto'
import { ProductDeleteResponseDto } from './dto/product-delete-response.dto'

@Controller('products')
export class ProductsController {
	constructor(private readonly productsService: ProductsService) {}

	@Auth()
	@Roles(RolesEnum.ADMIN)
	@Post()
	@ApiOperation({
		summary: 'Создать новый товар со всеми вариантами и характеристиками'
	})
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'Товар успешно создан в базе данных',
		type: ProductResponseDto
	})
	@ApiResponse({
		status: HttpStatus.FORBIDDEN,
		description: 'Недостаточно прав'
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Не авторизован'
	})
	create(@Body() dto: CreateFullProductDto) {
		return this.productsService.createFullProduct(dto)
	}

	@Get()
	@ApiOperation({ summary: 'Получить список всех товаров с вариациями' })
	@ApiQuery({ name: 'limit', required: false, example: 20 })
	@ApiQuery({ name: 'offset', required: false, example: 0 })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Список товаров успешно получен',
		type: [ProductResponseDto]
	})
	findAll(@Query('limit') limit?: number, @Query('offset') offset?: number) {
		return this.productsService.findAll(
			limit ? Number(limit) : 20,
			offset ? Number(offset) : 0
		)
	}

	@Get(':idOrSku')
	@ApiOperation({
		summary:
			'Получить полный товар по id или слогану (с вариантами и характеристиками)'
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Товар успешно получен',
		type: ProductResponseDto
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Товар не найден'
	})
	findOne(@Param('idOrSku') idOrSku: string) {
		return this.productsService.findFullById(idOrSku)
	}

	@Auth()
	@Roles(RolesEnum.ADMIN)
	@Patch(':id')
	@ApiOperation({
		summary: 'Комплексное обновление товара, спецификаций и вариантов'
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Товар и его вложенные сущности успешно обновлены',
		type: ProductResponseDto
	})
	@ApiResponse({
		status: HttpStatus.FORBIDDEN,
		description: 'Недостаточно прав'
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Не авторизован'
	})
	update(
		@Param('id', new ParseUUIDPipe()) id: string,
		@Body() dto: UpdateFullProductDto
	) {
		return this.productsService.updateFullProduct(id, dto)
	}

	@Auth()
	@Roles(RolesEnum.ADMIN)
	@Delete(':id')
	@ApiOperation({ summary: 'Удалить товар по id' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Товар успешно удален',
		type: ProductDeleteResponseDto
	})
	@ApiResponse({
		status: HttpStatus.FORBIDDEN,
		description: 'Недостаточно прав'
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Не авторизован'
	})
	remove(@Param('id', new ParseUUIDPipe()) id: string) {
		return this.productsService.remove(id)
	}
}
