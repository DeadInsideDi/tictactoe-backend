import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { RequestWithUserResponse, UserResponse } from '../../user/types/user'

export const CurrentUser = createParamDecorator(
	(data: keyof UserResponse, ctx: ExecutionContext) => {
		const request: RequestWithUserResponse = ctx.switchToHttp().getRequest()
		const user = request.user

		return data ? user[data] : user
	},
)
