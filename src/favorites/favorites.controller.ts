import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseUUIDPipe,
	Post
} from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Auth } from '../auth/decorators/auth.decorator'
import { GetAuthUser } from '../users/decorators/users.decorator'
import { FavoritesService } from './favorites.service'
import { AddFavoriteDto } from './dto/add-favorite.dto'
import { FavoriteResponseDto } from './dto/favorite-response.dto'
import { FavoriteActionResponseDto } from './dto/favorite-action-response.dto'
import { IsFavoriteResponseDto } from './dto/is-favorite-response.dto'

@Controller('favorites')
export class FavoritesController {
	constructor(private readonly favoritesService: FavoritesService) {}

	@Get()
	@ApiOperation({ summary: 'Получить все избранные товары пользователя' })
	@ApiResponse({
		status: 200,
		description: 'Список избранных товаров успешно получен',
		type: [FavoriteResponseDto]
	})
	@Auth()
	async getFavorites(@GetAuthUser('id') userId: string) {
		return this.favoritesService.getFavorites(userId)
	}

	@Post()
	@ApiOperation({ summary: 'Добавить товар в избранное' })
	@ApiResponse({
		status: 201,
		description: 'Товар успешно добавлен в избранное',
		type: FavoriteActionResponseDto
	})
	@ApiResponse({
		status: 400,
		description: 'Неверные данные'
	})
	@ApiResponse({
		status: 404,
		description: 'Товар не найден'
	})
	@Auth()
	async addToFavorites(
		@GetAuthUser('id') userId: string,
		@Body() dto: AddFavoriteDto
	) {
		return this.favoritesService.addToFavorites(userId, dto)
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Удалить товар из избранного' })
	@ApiResponse({
		status: 200,
		description: 'Товар успешно удален из избранного',
		type: FavoriteActionResponseDto
	})
	@ApiResponse({
		status: 404,
		description: 'Товар не найден в избранном'
	})
	@Auth()
	async removeFromFavorites(
		@GetAuthUser('id') userId: string,
		@Param('id', new ParseUUIDPipe()) id: string
	) {
		return this.favoritesService.removeFromFavorites(userId, id)
	}

	@Get(':id/check')
	@ApiOperation({ summary: 'Проверить, находится ли товар в избранном' })
	@ApiResponse({
		status: 200,
		description: 'Проверка завершена',
		type: IsFavoriteResponseDto
	})
	@Auth()
	async isFavorite(
		@GetAuthUser('id') userId: string,
		@Param('id', new ParseUUIDPipe()) id: string
	) {
		return this.favoritesService.isFavorite(userId, id)
	}
}
