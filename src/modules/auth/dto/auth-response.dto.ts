import { AccessTokenType } from '../types/tokens'

export class AuthResponseDto {
	id: string
	accessToken: AccessTokenType['accessToken']
}
