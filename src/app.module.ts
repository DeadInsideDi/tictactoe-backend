import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { AuthModule } from './modules/auth/auth.module'
import { GameModule } from './modules/game/game.module'
import { InviteModule } from './modules/invite/invite.module'
import { MatchModule } from './modules/match/match.module'
import { UserModule } from './modules/user/user.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			envFilePath: `.env`,
			isGlobal: true,
		}),
		UserModule,
		AuthModule,
		InviteModule,
		MatchModule,
		GameModule,
	],
	controllers: [AppController],
})
export class AppModule {}
