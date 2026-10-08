import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY } from '../decorators/roles.decorator'
import { Roles } from '../types/role.type'

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

	canActivate(context: ExecutionContext) {
		const requiredRoles = this.reflector.getAllAndOverride<Roles[]>(ROLES_KEY, [
			context.getHandler(),
			context.getClass()
		])

		// Если у эндпоинта нет декоратора @Roles(), доступ разрешен всем авторизованным
		if (!requiredRoles || requiredRoles.length === 0) {
			return true
		}

		// 2. Достаем пользователя из request (помещен туда JwtAuthGuard)
		const request = context.switchToHttp().getRequest()
		const user = request.user

		if (!user || !user.role) {
			throw new ForbiddenException('The user lacks the role.')
		}

		// 3. Проверяем, есть ли роль пользователя в списке разрешенных
		const hasRole = requiredRoles.includes(user.role as Roles)

		if (!hasRole) {
			throw new ForbiddenException(
				'Insufficient privileges to perform the operation.'
			)
		}

		return true
	}
}
