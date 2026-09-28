import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { DatabaseService } from '../../database/database.service'

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		private readonly jwtService: JwtService,
		private readonly db: DatabaseService
	) {}

	async canActivate(ctx: ExecutionContext): Promise<boolean> {
		const req = ctx.switchToHttp().getRequest()

		const token = req.cookies?.accessToken
		if (!token) throw new UnauthorizedException('You are not logged in.')

		try {
			const decoded = await this.jwtService.verifyAsync(token)

			const { rows } = await this.db.query(
				`
                SELECT id, email, login, name, surname, created_at, updated_at FROM users 
                WHERE id = $1
            `,
				[decoded.sub]
			)

			if (!rows[0]) {
				throw new UnauthorizedException('User not found.')
			}

			req.user = rows[0]

			return true
		} catch {
			throw new UnauthorizedException('You are not logged in.')
		}
	}
}
