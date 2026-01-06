import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { verify } from 'argon2'
import { Strategy } from 'passport-local'
import { UserService } from '../../user/user.service'
import { AuthService } from '../auth.service'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
	constructor(
		private readonly userService: UserService,
		private readonly authService: AuthService,
	) {
		super({
			usernameField: 'email',
			passwordField: 'password',
			passReqToCallback: true,
		})
	}

	async findOrCreateUser(email: string, password: string) {
		const user = await this.userService.findOneByEmailWithPassword(email)
		if (user) {
			const isValid = await verify(user.password, password)
			if (!isValid) throw new UnauthorizedException('Invalid password')
			return user
		}

		return await this.userService.create({ email, password })
	}

	async validate(req: Request, email: string, password: string) {
		if (!password)
			throw new UnauthorizedException('Please Provide The Password')

		const { id } = await this.findOrCreateUser(email, password)

		return await this.authService.login(id)
	}
}

// const user = await this.userService.findOneByEmailWithPassword(dto.email)
// if (!user)
//   throw new NotFoundException('An account with this email not found')

// const isValid = await verify(user.password, dto.password)
// if (!isValid) throw new UnauthorizedException('Invalid password')

// return user
