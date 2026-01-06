export type BaseJwtPayload = {
	iat: number
	exp: number
}

export type SignJwtPayload = {
	id: string
}

export type JwtPayload = BaseJwtPayload & SignJwtPayload
