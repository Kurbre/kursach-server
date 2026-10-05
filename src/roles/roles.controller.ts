import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	ParseUUIDPipe
} from '@nestjs/common'
import { RolesService } from './roles.service'
import { CreateRoleDto } from './dto/create-role.dto'
import { Roles } from './decorators/roles.decorator'
import { Roles as RolesEnum } from './types/role.type'
import { Auth } from '../auth/decorators/auth.decorator'

@Controller('roles')
export class RolesController {
	constructor(private readonly rolesService: RolesService) {}

	@Auth()
	@Roles(RolesEnum.ADMIN)
	@Post()
	create(@Body() createRoleDto: CreateRoleDto) {
		return this.rolesService.create(createRoleDto)
	}

	@Auth()
	@Roles(RolesEnum.ADMIN)
	@Get()
	findAll() {
		return this.rolesService.findAll()
	}

	@Auth()
	@Roles(RolesEnum.ADMIN)
	@Get(':id')
	findOne(@Param('id', new ParseUUIDPipe()) id: string) {
		return this.rolesService.findById(id)
	}

	@Auth()
	@Roles(RolesEnum.ADMIN)
	@Patch(':id')
	update(
		@Param('id', new ParseUUIDPipe()) id: string,
		@Body() updateRoleDto: CreateRoleDto
	) {
		return this.rolesService.update(id, updateRoleDto)
	}

	@Auth()
	@Roles(RolesEnum.ADMIN)
	@Delete(':id')
	remove(@Param('id', new ParseUUIDPipe()) id: string) {
		return this.rolesService.remove(id)
	}
}
