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
import { RolesService } from './roles.service'
import { CreateRoleDto } from './dto/create-role.dto'
import { Roles } from './decorators/roles.decorator'
import { Roles as RolesEnum } from './types/role.type'
import { Auth } from '../auth/decorators/auth.decorator'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'
import { RoleResponse } from './dto/role-response.dto'
import { DeleteRoleResponse } from './dto/delete-role-response.dto'

@Controller('roles')
export class RolesController {
	constructor(private readonly rolesService: RolesService) {}

	@Auth()
	@Roles(RolesEnum.ADMIN)
	@Post()
	@ApiOperation({ summary: 'Создать новую роль' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'Роль успешно создана',
		type: RoleResponse
	})
	@ApiResponse({
		status: HttpStatus.FORBIDDEN,
		description: 'Недостаточно прав'
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Не авторизован'
	})
	create(@Body() createRoleDto: CreateRoleDto) {
		return this.rolesService.create(createRoleDto)
	}

	@Auth()
	@Roles(RolesEnum.ADMIN)
	@Get()
	@ApiOperation({ summary: 'Получить все роли' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Роли успешно получены',
		type: [RoleResponse]
	})
	@ApiResponse({
		status: HttpStatus.FORBIDDEN,
		description: 'Недостаточно прав'
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Не авторизован'
	})
	findAll() {
		return this.rolesService.findAll()
	}

	@Auth()
	@Roles(RolesEnum.ADMIN)
	@Get(':id')
	@ApiOperation({ summary: 'Получить роль по id' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Роль успешно получена',
		type: RoleResponse
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
		return this.rolesService.findById(id)
	}

	@Auth()
	@Roles(RolesEnum.ADMIN)
	@Patch(':id')
	@ApiOperation({ summary: 'Обновить роль по id' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'Роль успешно обновлена',
		type: RoleResponse
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
		@Body() updateRoleDto: CreateRoleDto
	) {
		return this.rolesService.update(id, updateRoleDto)
	}

	@Auth()
	@Roles(RolesEnum.ADMIN)
	@Delete(':id')
	@ApiOperation({ summary: 'Удалить роль по id' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'Роль успешно удалена',
		type: DeleteRoleResponse
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
		return this.rolesService.remove(id)
	}
}
