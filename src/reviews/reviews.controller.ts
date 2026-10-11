import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseUUIDPipe,
	Post,
	Put
} from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Auth } from '../auth/decorators/auth.decorator'
import { GetAuthUser } from '../users/decorators/users.decorator'
import { ReviewsService } from './reviews.service'
import { CreateReviewDto } from './dto/create-review.dto'
import { UpdateReviewDto } from './dto/update-review.dto'
import { ReviewResponseDto } from './dto/review-response.dto'

@Controller('reviews')
export class ReviewsController {
	constructor(private readonly reviewsService: ReviewsService) {}

	@Get('product/:id')
	@ApiOperation({ summary: 'Получить все отзывы для товара' })
	@ApiResponse({
		status: 200,
		description: 'Список отзывов успешно получен',
		type: [ReviewResponseDto]
	})
	@Auth()
	async getReviewsByProduct(@Param('id', new ParseUUIDPipe()) id: string) {
		return this.reviewsService.getReviewsByProduct(id)
	}

	@Get()
	@ApiOperation({ summary: 'Получить все отзывы пользователя' })
	@ApiResponse({
		status: 200,
		description: 'Список отзывов успешно получен',
		type: [ReviewResponseDto]
	})
	@Auth()
	async getReviewsByUser(@GetAuthUser('id') userId: string) {
		return this.reviewsService.getReviewsByUser(userId)
	}

	@Post(':productId')
	@ApiOperation({ summary: 'Создать отзыв для товара' })
	@ApiResponse({
		status: 201,
		description: 'Отзыв успешно создан',
		type: ReviewResponseDto
	})
	@ApiResponse({
		status: 400,
		description: 'Неверные данные'
	})
	@ApiResponse({
		status: 404,
		description: 'Пользователь или товар не найден'
	})
	@Auth()
	async createReview(
		@GetAuthUser('id') userId: string,
		@Param('productId', new ParseUUIDPipe()) productId: string,
		@Body() dto: CreateReviewDto
	) {
		return this.reviewsService.createReview(userId, productId, dto)
	}

	@Put(':id')
	@ApiOperation({ summary: 'Обновить отзыв' })
	@ApiResponse({
		status: 200,
		description: 'Отзыв успешно обновлен',
		type: ReviewResponseDto
	})
	@ApiResponse({
		status: 400,
		description: 'Неверные данные'
	})
	@ApiResponse({
		status: 404,
		description: 'Отзыв не найден или доступ запрещен'
	})
	@Auth()
	async updateReview(
		@GetAuthUser('id') userId: string,
		@Param('id', new ParseUUIDPipe()) id: string,
		@Body() dto: UpdateReviewDto
	) {
		return this.reviewsService.updateReview(userId, id, dto)
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Удалить отзыв' })
	@ApiResponse({
		status: 200,
		description: 'Отзыв успешно удален',
		type: Object
	})
	@ApiResponse({
		status: 404,
		description: 'Отзыв не найден или доступ запрещен'
	})
	@Auth()
	async deleteReview(
		@GetAuthUser('id') userId: string,
		@Param('id', new ParseUUIDPipe()) id: string
	) {
		return this.reviewsService.deleteReview(userId, id)
	}
}
