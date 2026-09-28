import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common'
import { UsersService } from './users.service'
import { GetAuthUser } from './decorators/users.decorator'
import { Auth } from '../auth/decorators/auth.decorator'

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Auth()
	@Get('me')
	getProfile(@GetAuthUser('id') id: string) {
		return this.usersService.findById(id)
	}
}
