import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsBoolean, IsOptional, IsString } from 'class-validator'
import { PaginationDto } from '../../../common/dto/pagination.dto'

export class UserSearchDto extends PaginationDto {
	@ApiPropertyOptional({ example: 'John', description: 'Contain user name' })
	@IsOptional()
	@IsString()
	readonly name?: string

	@ApiPropertyOptional({ example: true, description: 'Only online users' })
	@IsOptional()
	@Transform(({ value }) => value === 'true')
	@IsBoolean()
	readonly onlineOnly?: boolean
}
