import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { User } from '../types/user.type'

export const GetAuthUser = createParamDecorator(
	(data: keyof User, ctx: ExecutionContext) => {
		const req = ctx.switchToHttp().getRequest()

		const user = req.user

		return data ? user?.[data] : user
	}
)
