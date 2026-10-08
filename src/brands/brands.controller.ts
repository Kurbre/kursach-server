import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	ParseUUIDPipe,
	HttpStatus
} from '@nestjs/common'
import { BrandsService } from './brands.service'
import { CreateBrandDto } from './dto/create-brand.dto'
import { Auth } from '../auth/decorators/auth.decorator'
import { Roles } from '../roles/decorators/roles.decorator'
import { Roles as RolesEnum } from '../roles/types/role.type'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'
import { BrandResponse } from './dto/brand-response.dto'
import { BrandDeleteResponse } from './dto/brand-delete-response.dto'

@Controller('brands')
export class BrandsController {
	constructor(private readonly brandsService: BrandsService) {}

	@Auth()
	@Roles(RolesEnum.ADMIN)
	@Post()
	@ApiOperation({ summary: 'Создать новый бренд' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'Роль успешно создана',
		type: BrandResponse
	})
	@ApiResponse({
		status: HttpStatus.FORBIDDEN,
		description: 'Недостаточно прав'
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Не авторизован'
	})
	create(@Body() createBrandDto: CreateBrandDto) {
		return this.brandsService.create(createBrandDto)
	}

	@Get()
	@ApiOperation({ summary: 'Получить все бренды' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Бренды успешно получены',
		type: [BrandResponse]
	})
	findAll() {
		return this.brandsService.findAll()
	}

	@Get(':id')
	@ApiOperation({ summary: 'Получить бренд по id' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Роль успешно получена',
		type: BrandResponse
	})
	findOne(@Param('id', new ParseUUIDPipe()) id: string) {
		return this.brandsService.findById(id)
	}

	@Auth()
	@Roles(RolesEnum.ADMIN)
	@Patch(':id')
	@ApiOperation({ summary: 'Обновить бренд' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'Роль успешно обновлена',
		type: BrandResponse
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
		@Body() updateBrandDto: CreateBrandDto
	) {
		return this.brandsService.update(id, updateBrandDto)
	}

	@Auth()
	@Roles(RolesEnum.ADMIN)
	@Delete(':id')
	@ApiOperation({ summary: 'Удалить бренд' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'Роль успешно удалена',
		type: BrandDeleteResponse
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
		return this.brandsService.remove(id)
	}
}
