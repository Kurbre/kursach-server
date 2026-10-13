import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseUUIDPipe,
	Post,
	Put,
	Query
} from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Auth } from '../auth/decorators/auth.decorator'
import { GetAuthUser } from '../users/decorators/users.decorator'
import { OrdersService } from './orders.service'
import { UpdateOrderStatusDto } from './dto/update-order-status.dto'
import { OrderResponseDto } from './dto/order-response.dto'
import { CreateOrderDto } from './dto/create-order.dto'
import { PaginationDto } from '../common/dto/pagination.dto'

export class PaginatedOrderResponseDto {
  data: OrderResponseDto[];
  total: number;
}

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
	constructor(private readonly ordersService: OrdersService) {}

	@Get()
	@ApiOperation({ summary: 'Получить все заказы пользователя' })
	@ApiResponse({
		status: 200,
		description: 'Список заказов успешно получен',
		type: PaginatedOrderResponseDto
	})
	@Auth()
	async getUserOrders(
		@GetAuthUser('id') userId: string,
		@Query() pagination: PaginationDto
	) {
		return this.ordersService.getUserOrders(userId, pagination);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Получить заказ по ID' })
	@ApiResponse({
		status: 200,
		description: 'Заказ успешно получен',
		type: OrderResponseDto
	})
	@ApiResponse({
		status: 404,
		description: 'Заказ не найден'
	})
	@Auth()
	async getOrderById(
		@GetAuthUser('id') userId: string,
		@Param('id', new ParseUUIDPipe()) id: string
	) {
		return this.ordersService.getOrderById(id, userId)
	}

	@Post()
	@ApiOperation({ summary: 'Создать заказ из корзины' })
	@ApiResponse({
		status: 201,
		description: 'Заказ успешно создан',
		type: OrderResponseDto
	})
	@ApiResponse({
		status: 400,
		description: 'Корзина пуста'
	})
	@Auth()
	async createOrderFromCart(
		@GetAuthUser('id') userId: string,
		@Body() dto: CreateOrderDto
	) {
		return this.ordersService.createOrderFromCart(userId, dto)
	}

	@Put(':id/status')
	@ApiOperation({ summary: 'Обновить статус заказа' })
	@ApiResponse({
		status: 200,
		description: 'Статус заказа успешно обновлен',
		type: OrderResponseDto
	})
	@ApiResponse({
		status: 400,
		description: 'Неверный статус'
	})
	@ApiResponse({
		status: 404,
		description: 'Заказ не найден'
	})
	@Auth()
	async updateOrderStatus(
		@GetAuthUser('id') userId: string,
		@Param('id', new ParseUUIDPipe()) id: string,
		@Body() dto: UpdateOrderStatusDto
	) {
		return this.ordersService.updateOrderStatus(id, userId, dto)
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Отменить заказ' })
	@ApiResponse({
		status: 200,
		description: 'Заказ успешно отменен',
		type: OrderResponseDto
	})
	@ApiResponse({
		status: 404,
		description: 'Заказ не найден'
	})
	@Auth()
	async cancelOrder(
		@GetAuthUser('id') userId: string,
		@Param('id', new ParseUUIDPipe()) id: string
	) {
		return this.ordersService.cancelOrder(id, userId)
	}
}
