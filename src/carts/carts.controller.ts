import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	Req,
	Query
} from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Auth } from '../auth/decorators/auth.decorator'
import { CartsService } from './carts.service'
import { CreateCartItemDto } from './dto/create-cart-item.dto'
import { UpdateCartItemDto } from './dto/update-cart-item.dto'
import { CartItemResponseDto } from './dto/cart-item-response.dto'
import { GetAuthUser } from '../users/decorators/users.decorator'
import { DeleteCartsResponseDto } from './dto/delete-carts-response.dto'

@Controller('carts')
export class CartsController {
	constructor(private readonly cartsService: CartsService) {}

	@Get()
	@ApiOperation({ summary: 'Получить все позиции в корзине пользователя' })
	@ApiResponse({
		status: 200,
		description: 'Список позиций в корзине успешно получен',
		type: [CartItemResponseDto]
	})
	@Auth()
	async getCartItems(@GetAuthUser('id') userId: string) {
		return this.cartsService.getCartItems(userId)
	}

	@Post()
	@ApiOperation({ summary: 'Добавить товар в корзину' })
	@ApiResponse({
		status: 201,
		description: 'Товар успешно добавлен в корзину',
		type: CartItemResponseDto
	})
	@ApiResponse({
		status: 400,
		description: 'Неверные данные'
	})
	@Auth()
	async addItemToCart(
		@GetAuthUser('id') userId: string,
		@Body() dto: CreateCartItemDto
	) {
		return this.cartsService.addItemToCart(userId, dto)
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Обновить количество товара в корзине' })
	@ApiResponse({
		status: 200,
		description: 'Количество товара в корзине успешно обновлено',
		type: CartItemResponseDto
	})
	@ApiResponse({
		status: 400,
		description: 'Неверные данные'
	})
	@ApiResponse({
		status: 404,
		description: 'Позиция в корзине не найдена'
	})
	@Auth()
	async updateCartItem(
		@GetAuthUser('id') userId: string,
		@Param('id', new ParseUUIDPipe()) id: string,
		@Body() dto: UpdateCartItemDto
	) {
		return this.cartsService.updateCartItem(userId, id, dto)
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Удалить товар из корзины' })
	@ApiResponse({
		status: 200,
		description: 'Товар успешно удален из корзины',
		type: DeleteCartsResponseDto
	})
	@ApiResponse({
		status: 404,
		description: 'Позиция в корзине не найдена'
	})
	@Auth()
	async removeItemFromCart(
		@GetAuthUser('id') userId: string,
		@Param('id', new ParseUUIDPipe()) id: string
	) {
		return this.cartsService.removeItemFromCart(userId, id)
	}

	@Delete()
	@ApiOperation({ summary: 'Очистить корзину пользователя' })
	@ApiResponse({
		status: 200,
		description: 'Корзина успешно очищена',
		type: DeleteCartsResponseDto
	})
	@Auth()
	async clearCart(@GetAuthUser('id') userId: string) {
		return this.cartsService.clearCart(userId)
	}
}
