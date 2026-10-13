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
import { ApiOperation, ApiResponse } from '@nestjs/swagger'
import { Auth } from '../auth/decorators/auth.decorator'
import { Roles } from '../roles/decorators/roles.decorator'
import { Roles as RolesEnum } from '../roles/types/role.type'
import { CreateModelDto } from './dto/create-model.dto'
import { ModelDeleteResponse } from './dto/model-delete-response.dto'
import { ModelResponse } from './dto/model-response.dto'
import { UpdateModelDto } from './dto/update-model.dto'
import { ModelsService } from './models.service'
import { PaginationDto } from '../common/dto/pagination.dto'

@Controller('models')
export class ModelsController {
	constructor(private readonly modelsService: ModelsService) {}

	@Auth()
	@Roles(RolesEnum.ADMIN)
	@Post()
	@ApiOperation({ summary: 'Создать новую модель' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'Роль успешно создана',
		type: ModelResponse
	})
	@ApiResponse({
		status: HttpStatus.FORBIDDEN,
		description: 'Недостаточно прав'
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Не авторизован'
	})
	create(@Body() createRoleDto: CreateModelDto) {
		return this.modelsService.create(createRoleDto)
	}

	@Auth()
	@Roles(RolesEnum.ADMIN)
	@Get()
	@ApiOperation({ summary: 'Получить все роли' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Роли успешно получены',
		type: [ModelResponse]
	})
	@ApiResponse({
		status: HttpStatus.FORBIDDEN,
		description: 'Недостаточно прав'
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Не авторизован'
	})
	findAll(@Query() pagination: PaginationDto) {
		return this.modelsService.findAll(pagination);
	}

	@Auth()
	@Roles(RolesEnum.ADMIN)
	@Get(':id')
	@ApiOperation({ summary: 'Получить роль по id' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Роль успешно получена',
		type: ModelResponse
	})
	@ApiResponse({
		status: HttpStatus.FORBIDDEN,
		description: 'Недостаточно прав'
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Не авторизован'
	})
	findOne(@Param('id', new ParseUUIDPipe()) id: string) {
		return this.modelsService.findById(id)
	}

	@Auth()
	@Roles(RolesEnum.ADMIN)
	@Patch(':id')
	@ApiOperation({ summary: 'Обновить роль по id' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'Роль успешно обновлена',
		type: ModelResponse
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
		@Body() updateRoleDto: UpdateModelDto
	) {
		return this.modelsService.update(id, updateRoleDto)
	}

	@Auth()
	@Roles(RolesEnum.ADMIN)
	@Delete(':id')
	@ApiOperation({ summary: 'Удалить роль по id' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'Роль успешно удалена',
		type: ModelDeleteResponse
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
		return this.modelsService.remove(id)
	}
}
