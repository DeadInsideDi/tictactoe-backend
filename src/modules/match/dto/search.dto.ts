import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsOptional } from 'class-validator'
import { PaginationDto } from '../../../common/dto/pagination.dto'

export class MatchSearchDto extends PaginationDto {
	@ApiPropertyOptional({
		example: '05.01.2023',
		description: 'Match created at date',
	})
	@IsOptional()
	@Type(() => Date)
	readonly createdAt?: Date
}
