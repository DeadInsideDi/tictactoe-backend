import {
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Post,
	Req,
	Res,
	UseGuards,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Response } from 'express'
import { AuthService } from './auth.service'
import { FacebookAuthGuard } from './guards/facebook.guard'
import { GoogleAuthGuard } from './guards/google.guard'
import { LocalAuthGuard } from './guards/local.guard'
import { RefreshAuthGuard } from './guards/refresh.guard'
import { RequestWithTokens } from './types/tokens'

@ApiTags('Authorization')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@HttpCode(HttpStatus.OK)
	@UseGuards(LocalAuthGuard)
	@Post('login')
	login(
		@Req() req: RequestWithTokens,
		@Res({ passthrough: true }) res: Response,
	) {
		const { id, accessToken, refreshToken } = req.user
		this.authService.addRefreshTokenToResponse(res, refreshToken)
		return { id, accessToken }
	}

	@HttpCode(HttpStatus.OK)
	@UseGuards(RefreshAuthGuard)
	@Post('refresh')
	refreshToken(
		@Req() req: RequestWithTokens,
		@Res({ passthrough: true }) res: Response,
	) {
		const { id, accessToken, refreshToken } = req.user
		this.authService.addRefreshTokenToResponse(res, refreshToken)
		return { id, accessToken }
	}

	@UseGuards(GoogleAuthGuard)
	@Get('google/login')
	googleLogin() {}

	@UseGuards(GoogleAuthGuard)
	@Get('google/callback')
	googleCallback(
		@Req() req: RequestWithTokens,
		@Res({ passthrough: true }) res: Response,
	) {
		const { id, accessToken, refreshToken } = req.user
		this.authService.addRefreshTokenToResponse(res, refreshToken)

		this.authService.redirectToFrontend(res, id, accessToken)
	}

	@UseGuards(FacebookAuthGuard)
	@Get('facebook/login')
	facebookLogin() {}

	@UseGuards(FacebookAuthGuard)
	@Get('facebook/callback')
	facebookCallback(
		@Req() req: RequestWithTokens,
		@Res({ passthrough: true }) res: Response,
	) {
		const { id, accessToken, refreshToken } = req.user
		this.authService.addRefreshTokenToResponse(res, refreshToken)

		this.authService.redirectToFrontend(res, id, accessToken)
	}

	@Post('logout')
	logout(@Res({ passthrough: true }) res: Response) {
		this.authService.removeRefreshTokenFromResponse(res)
	}
}
