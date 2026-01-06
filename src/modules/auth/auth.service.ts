import { Injectable } from '@nestjs/common'
import { JwtService, JwtSignOptions } from '@nestjs/jwt'

import { ConfigService } from '@nestjs/config'
import type { Response } from 'express'
import ms from 'ms'
import { COOKEI } from '../../../config/storage.config'
import type { BaseJwtPayload, SignJwtPayload } from './types/jwt-payload'

@Injectable()
export class AuthService {
	private readonly refreshTokenConfig: JwtSignOptions
	private readonly expiresInMs: number

	constructor(
		private readonly configService: ConfigService,
		private readonly jwtService: JwtService,
	) {
		const expiresIn = this.configService.get<ms.StringValue>(
			'JWT_REFRESH_EXPIRES_IN',
			'7d',
		)
		this.refreshTokenConfig = { expiresIn }
		this.expiresInMs = +ms(expiresIn)
	}

	private async generateTokens(userId: string) {
		const payload: SignJwtPayload = { id: userId }

		const [accessToken, refreshToken] = await Promise.all([
			this.jwtService.signAsync(payload),
			this.jwtService.signAsync(payload, this.refreshTokenConfig),
		])

		return { accessToken, refreshToken }
	}

	verifyToken<T>(token: string) {
		return this.jwtService.verify<T & BaseJwtPayload>(token)
	}

	async login(userId: string) {
		const tokens = await this.generateTokens(userId)
		return { id: userId, ...tokens }
	}

	redirectToFrontend(res: Response, id: string, accessToken: string) {
		const url = this.configService.get<string>('FRONTEND_URL')
		return res.redirect(`${url}/login?token=${accessToken}&id=${id}`)
	}

	addRefreshTokenToResponse(res: Response, refreshToken: string) {
		res.cookie(COOKEI.REFRESH_TOKEN, refreshToken, {
			...COOKEI.COOKIE_OPTIONS,
			expires: new Date(Date.now() + this.expiresInMs),
		})
	}

	removeRefreshTokenFromResponse(res: Response) {
		res.cookie(COOKEI.REFRESH_TOKEN, '', {
			...COOKEI.COOKIE_OPTIONS,
			expires: new Date(0),
		})
	}
}
