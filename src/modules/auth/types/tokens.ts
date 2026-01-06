export type AccessTokenType = {
	accessToken: string
}

export type RefreshTokenType = {
	refreshToken: string
}

export type LoginResponse = {
	id: string
} & AccessTokenType

export type FullTokenResponse = LoginResponse & RefreshTokenType

export type RequestWithTokens = Request & { user: FullTokenResponse }
