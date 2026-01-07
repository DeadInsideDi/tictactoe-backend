import { CookieOptions } from 'express'

export const COOKEI = {
	COOKIE_OPTIONS: {
		httpOnly: true,
		// domain: process.env.DOMAIN,
		secure: true,
		sameSite: 'none',
	} as CookieOptions,

	ACCESS_TOKEN: 'access_token',
	REFRESH_TOKEN: 'refresh_token',
} as const
