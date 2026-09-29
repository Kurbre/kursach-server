import { Controller, Get } from '@nestjs/common'
import { Auth } from '../auth/decorators/auth.decorator'
import { GetAuthUser } from './decorators/users.decorator'
import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Auth()
	@Get('me')
	getProfile(@GetAuthUser('id') id: string) {
		return this.usersService.findById(id)
	}
}
