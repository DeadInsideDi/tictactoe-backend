import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './modules/auth/auth.module'
import { GameModule } from './modules/game/game.module'
import { InviteModule } from './modules/invite/invite.module'
import { MatchModule } from './modules/match/match.module'
import { UserModule } from './modules/user/user.module'

@Module({
	imports: [
		ScheduleModule.forRoot(),
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
	providers: [AppService],
})
export class AppModule {}
