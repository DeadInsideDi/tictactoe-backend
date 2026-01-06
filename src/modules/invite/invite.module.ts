import { Module } from '@nestjs/common'
import { PrismaService } from '../../common/services/prisma.service'
import { UserService } from '../user/user.service'
import { InviteController } from './invite.controller'
import { InviteService } from './invite.service'

@Module({
	controllers: [InviteController],
	providers: [InviteService, PrismaService, UserService],
})
export class InviteModule {}
