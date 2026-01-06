import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { UserService } from '../../user/user.service'
import { JwtPayload } from '../types/jwt-payload'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor(
		readonly configService: ConfigService,
		private readonly userService: UserService,
	) {
		const secret = configService.get<string>('JWT_SECRET')
		if (!secret) {
			throw new Error('JWT_SECRET environment variable is not set.')
		}

		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: secret,
		})
	}

	async validate(payload: JwtPayload) {
		const { id } = payload
		if (!id) throw new UnauthorizedException()
		const user = await this.userService.findOneById(id)
		if (!user) throw new UnauthorizedException()
		return user
	}
}
