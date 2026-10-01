import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { User } from '../types/user.type'

export const getAuthUser = (
	data: keyof User | undefined,
	ctx: ExecutionContext
) => {
	const req = ctx.switchToHttp().getRequest()

	const user = req.user

	return data ? user?.[data] : user
}

export const GetAuthUser = createParamDecorator(getAuthUser)
