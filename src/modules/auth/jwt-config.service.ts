import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtModuleOptions, JwtOptionsFactory } from '@nestjs/jwt'
import type { StringValue } from 'ms'

@Injectable()
export class JwtConfigService implements JwtOptionsFactory {
	constructor(private readonly configService: ConfigService) {}

	createJwtOptions(): JwtModuleOptions {
		const secret = this.configService.get<string>('JWT_SECRET')
		if (!secret) {
			throw new Error('JWT_SECRET environment variable is not set.')
		}

		const expiresIn = this.configService.get<StringValue>('JWT_EXPIRATION_TIME')
		if (!expiresIn) {
			throw new Error('JWT_EXPIRATION_TIME environment variable is not set.')
		}

		return {
			secret,
			signOptions: { expiresIn },
		}
	}
}
