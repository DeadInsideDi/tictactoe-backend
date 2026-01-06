import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common'
import { AuthService } from '../../auth/auth.service'
import type { JwtPayload } from '../../auth/types/jwt-payload'
import type { AuthenticatedSocket } from '../types/game'

@Injectable()
export class WsAuthGuard implements CanActivate {
	constructor(readonly authService: AuthService) {}

	canActivate(context: ExecutionContext) {
		const client = context.switchToWs().getClient<AuthenticatedSocket>()
		const { authorization } = client.handshake.headers
		const token = authorization?.split(' ')[1]

		try {
			if (!token) throw new UnauthorizedException('Token not provided')
			const { id } = this.authService.verifyToken<JwtPayload>(token)
			return !!id
		} catch {
			return false
		}
	}
}
