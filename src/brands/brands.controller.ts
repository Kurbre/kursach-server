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
import { BrandsService } from './brands.service'
import { CreateBrandDto } from './dto/create-brand.dto'
import { Auth } from '../auth/decorators/auth.decorator'
import { Roles } from '../roles/decorators/roles.decorator'
import { Roles as RolesEnum } from '../roles/types/role.type'

@Controller('brands')
export class BrandsController {
	constructor(private readonly brandsService: BrandsService) {}

	@Auth()
	@Roles(RolesEnum.ADMIN)
	@Post()
	create(@Body() createBrandDto: CreateBrandDto) {
		return this.brandsService.create(createBrandDto)
	}

	@Get()
	findAll() {
		return this.brandsService.findAll()
	}

	@Get(':id')
	findOne(@Param('id', new ParseUUIDPipe()) id: string) {
		return this.brandsService.findById(id)
	}

	@Auth()
	@Roles(RolesEnum.ADMIN)
	@Patch(':id')
	update(
		@Param('id', new ParseUUIDPipe()) id: string,
		@Body() updateBrandDto: CreateBrandDto
	) {
		return this.brandsService.update(id, updateBrandDto)
	}

	@Auth()
	@Roles(RolesEnum.ADMIN)
	@Delete(':id')
	remove(@Param('id', new ParseUUIDPipe()) id: string) {
		return this.brandsService.remove(id)
	}
}
