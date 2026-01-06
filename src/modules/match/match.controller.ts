import { Controller, Get, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Auth } from '../auth/decorators/auth.decorator'
import { CurrentUser } from '../auth/decorators/user.decorator'
import { MatchSearchDto } from './dto/search.dto'
import { MatchService } from './match.service'

@ApiTags('Game Matches')
@Auth()
@Controller('match')
export class MatchController {
	constructor(private readonly matchService: MatchService) {}

	@Get('search')
	async search(
		@Query() dto: MatchSearchDto,
		@CurrentUser('id') userId: string,
	) {
		return await this.matchService.search(dto, userId)
	}
}
