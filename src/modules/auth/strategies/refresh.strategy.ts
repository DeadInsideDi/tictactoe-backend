import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { Strategy } from 'passport-jwt'
import { COOKEI } from '../../../../config/storage.config'
import { AuthService } from '../auth.service'
import { JwtPayload } from '../types/jwt-payload'

const extractJwtFromCookie = (req: Request) => {
	const token = req.cookies[COOKEI.REFRESH_TOKEN] as string | undefined
	return token || null
}

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
	Strategy,
	'refresh-jwt',
) {
	constructor(
		readonly configService: ConfigService,
		private readonly authService: AuthService,
	) {
		const secret = configService.get<string>('JWT_SECRET')
		if (!secret) {
			throw new Error('JWT_SECRET environment variable is not set.')
		}

		super({
			jwtFromRequest: extractJwtFromCookie,
			ignoreExpiration: false,
			secretOrKey: secret,
			passReqToCallback: true,
		})
	}

	async validate(req: Request, payload: JwtPayload) {
		const { id } = payload
		return await this.authService.login(id)
	}
}
