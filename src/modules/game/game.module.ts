import { Module } from '@nestjs/common'

import { AuthModule } from '../auth/auth.module'
import { MatchModule } from '../match/match.module'
import { UserModule } from '../user/user.module'
import { GameGateway } from './game.gateway'
import { GameService } from './game.service'

@Module({
	imports: [AuthModule, UserModule, MatchModule],
	providers: [GameGateway, GameService],
})
export class GameModule {}
