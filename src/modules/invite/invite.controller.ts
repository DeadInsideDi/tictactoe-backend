import { Controller, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Auth } from '../auth/decorators/auth.decorator'
import { CurrentUser } from '../auth/decorators/user.decorator'
import { InviteService } from './invite.service'

@ApiTags('Friend Invites')
@Auth()
@Controller('invite')
export class InviteController {
	constructor(private readonly inviteService: InviteService) {}

	@Get('sent')
	async getSentInvites(@CurrentUser('id') userId: string) {
		return await this.inviteService.getSentMany(userId)
	}

	@Get('sent/:receiverId')
	async getSentInvite(
		@CurrentUser('id') userId: string,
		@Param('receiverId') receiverId: string,
	) {
		return await this.inviteService.getSentOne(userId, receiverId)
	}

	@Get('received')
	async getReceivedInvites(@CurrentUser('id') userId: string) {
		return await this.inviteService.getReceivedMany(userId)
	}

	@Get('received/:senderId')
	async getReceivedInvite(
		@CurrentUser('id') userId: string,
		@Param('senderId') senderId: string,
	) {
		return await this.inviteService.getReceivedOne(userId, senderId)
	}

	@Post('send')
	async send(
		@Query('receiverId') receiverId: string,
		@CurrentUser('id') senderId: string,
	) {
		return await this.inviteService.create(senderId, receiverId)
	}

	@Patch('accept')
	async accept(
		@Query('senderId') senderId: string,
		@CurrentUser('id') receiverId: string,
	) {
		return await this.inviteService.accept(senderId, receiverId)
	}

	@Patch('deny')
	async deny(
		@Query('senderId') senderId: string,
		@CurrentUser('id') receiverId: string,
	) {
		return await this.inviteService.deny(senderId, receiverId)
	}
}
