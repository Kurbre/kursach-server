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
					SELECT
						u.id,
						u.email,
						u.login,
						u.name,
						u.surname,
						u.role_id,
						r.name AS role,
						u.created_at,
						u.updated_at
					FROM users u
					LEFT JOIN roles r ON u.role_id = r.id
					WHERE u.id = $1
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
