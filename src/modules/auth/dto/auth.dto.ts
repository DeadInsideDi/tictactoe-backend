import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class AuthDto {
	@ApiProperty({
		example: 'test@gmail.com',
		description: 'Email for user',
	})
	@IsNotEmpty()
	@IsEmail()
	@MaxLength(255)
	readonly email: string

	@ApiProperty({ example: '1234', description: 'Password for user' })
	@IsNotEmpty()
	@IsString()
	@MaxLength(255)
	readonly password: string
}
