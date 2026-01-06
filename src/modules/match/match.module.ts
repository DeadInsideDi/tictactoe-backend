import { Module } from '@nestjs/common'
import { PrismaService } from '../../common/services/prisma.service'
import { MatchController } from './match.controller'
import { MatchService } from './match.service'

@Module({
	controllers: [MatchController],
	providers: [MatchService, PrismaService],
	exports: [MatchService],
})
export class MatchModule {}
