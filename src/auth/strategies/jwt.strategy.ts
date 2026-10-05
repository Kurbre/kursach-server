import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { UsersService } from '../../users/users.service'
import { Injectable } from '@nestjs/common'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor(
		configService: ConfigService,
		private readonly usersService: UsersService
	) {
		super({
			secretOrKey: configService.getOrThrow('JWT_SECRET'),
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
		})
	}

	async validate({ sub }: { sub: string }) {
		const user = await this.usersService.findById(sub)

		return user
	}
}
