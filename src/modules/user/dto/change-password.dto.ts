import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, Length } from 'class-validator'

export class ChangePasswordDto {
	@ApiProperty({ description: 'Current password for verification' })
	@IsNotEmpty()
	@IsString()
	@Length(1, 256)
	readonly currentPassword: string

	@ApiProperty({ description: 'New password' })
	@IsNotEmpty()
	@IsString()
	@Length(1, 256)
	readonly newPassword: string
}
