import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy, VerifyCallback, type Profile } from 'passport-google-oauth20'
import { UserService } from '../../user/user.service'
import { AuthService } from '../auth.service'

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
	constructor(
		readonly configService: ConfigService,
		private readonly userService: UserService,
		private readonly authService: AuthService,
	) {
		const clientID = configService.get<string>('GOOGLE_CLIENT_ID')
		if (!clientID) {
			throw new Error('GOOGLE_CLIENT_ID environment variable is not set.')
		}

		const clientSecret = configService.get<string>('GOOGLE_SECRET')
		if (!clientSecret) {
			throw new Error('GOOGLE_SECRET environment variable is not set.')
		}

		super({
			clientID,
			clientSecret,
			callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
			scope: ['email'],
		})
	}

	async findOrCreateUser(profile: Profile) {
		const email = profile.emails?.[0].value
		if (!email) throw new BadRequestException('Email not found')

		const user = await this.userService.findOneByEmail(email)
		if (user) return user

		return await this.userService.create({ email, password: '' })
	}

	async validate(
		googleAccessToken: string,
		googleRefreshToken: string | undefined,
		profile: Profile,
		done: VerifyCallback,
	) {
		const { id } = await this.findOrCreateUser(profile)
		const user = await this.authService.login(id)
		done(null, user)
	}
}
