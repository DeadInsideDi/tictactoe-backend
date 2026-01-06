import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength } from 'class-validator'
import { AuthDto } from '../../auth/dto/auth.dto'

export class CreateUserDto extends AuthDto {
	@ApiPropertyOptional({ example: 'John', description: 'User name' })
	@IsOptional()
	@IsString()
	@MaxLength(256)
	readonly name?: string
}
