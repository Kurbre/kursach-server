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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Auth } from '../auth/decorators/auth.decorator'
import { Roles } from '../roles/decorators/roles.decorator'
import { Roles as RolesEnum } from '../roles/types/role.type'
import { ColorsService } from './colors.service'
import { CreateColorDto } from './dto/create-color.dto'
import { UpdateColorDto } from './dto/update-color.dto'
import { ColorResponse } from './dto/color-response.dto'
import { PaginationDto } from '../common/dto/pagination.dto'
import { ColorDeleteResponse } from './dto/color-delete-response.dto'

export class PaginatedColorResponseDto {
  data: ColorResponse[];
  total: number;
}

@Controller('colors')
export class ColorsController {
	constructor(private readonly colorsService: ColorsService) {}

	@Auth()
	@Roles(RolesEnum.ADMIN)
	@Post()
	@ApiOperation({ summary: 'Создать новый цвет' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'Цвет успешно создан',
		type: ColorResponse
	})
	@ApiResponse({
		status: HttpStatus.FORBIDDEN,
		description: 'Недостаточно прав'
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Не авторизован'
	})
	create(@Body() dto: CreateColorDto) {
		return this.colorsService.create(dto)
	}

	@Get()
	@ApiOperation({ summary: 'Получить все цвета' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Цвета успешно получены',
		type: PaginatedColorResponseDto
	})
	findAll(@Query() pagination: PaginationDto) {
		return this.colorsService.findAll(pagination);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Получить цвет по id' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Цвет успешно получен',
		type: ColorResponse
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Цвет не найден'
	})
	findOne(@Param('id', new ParseUUIDPipe()) id: string) {
		return this.colorsService.findById(id)
	}

	@Auth()
	@Roles(RolesEnum.ADMIN)
	@Patch(':id')
	@ApiOperation({ summary: 'Обновить цвет по id' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Цвет успешно обновлен',
		type: ColorResponse
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
		@Body() dto: UpdateColorDto
	) {
		return this.colorsService.update(id, dto)
	}

	@Auth()
	@Roles(RolesEnum.ADMIN)
	@Delete(':id')
	@ApiOperation({ summary: 'Удалить цвет по id' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Цвет успешно удален',
		type: ColorDeleteResponse
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
		return this.colorsService.remove(id)
	}
}
