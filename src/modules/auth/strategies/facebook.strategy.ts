import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy, type Profile, type VerifyFunction } from 'passport-facebook'
import { UserService } from '../../user/user.service'
import { AuthService } from '../auth.service'

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
	constructor(
		readonly configService: ConfigService,
		private readonly userService: UserService,
		private readonly authService: AuthService,
	) {
		const clientID = configService.get<string>('FACEBOOK_CLIENT_ID')
		if (!clientID) {
			throw new Error('FACEBOOK_CLIENT_ID environment variable is not set.')
		}

		const clientSecret = configService.get<string>('FACEBOOK_SECRET')
		if (!clientSecret) {
			throw new Error('FACEBOOK_SECRET environment variable is not set.')
		}

		const callbackURL = configService.get<string>('FACEBOOK_CALLBACK_URL')
		if (!callbackURL) {
			throw new Error('FACEBOOK_CALLBACK_URL environment variable is not set.')
		}

		super({
			clientID,
			clientSecret,
			callbackURL,
			scope: 'email',
			profileFields: ['emails'],
		})
	}

	async findOrCreateUser(profile: Profile) {
		const email = profile.emails?.[0].value
		if (!email) throw new BadRequestException('Email not found')

		const user = await this.userService.findOneByEmail(email)
		if (user) return user

		return await this.userService.create({ email, password: '' })
	}

	validate: VerifyFunction = async (
		facebookAccessToken,
		facebookRefreshToken,
		profile,
		done,
	) => {
		const { id } = await this.findOrCreateUser(profile)
		const user = await this.authService.login(id)
		done(null, user)
	}
}
