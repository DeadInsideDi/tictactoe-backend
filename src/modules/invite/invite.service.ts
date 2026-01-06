import {
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../../common/services/prisma.service'
import { UserService } from '../user/user.service'

@Injectable()
export class InviteService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly userService: UserService,
	) {}

	async getSentMany(senderId: string) {
		return await this.prisma.friendInvite.findMany({
			where: { senderId, status: 'PENDING' },
			include: { receiverUser: { select: { name: true } } },
		})
	}

	async getSentOne(senderId: string, receiverId: string) {
		return await this.prisma.friendInvite.findFirst({
			where: { senderId, receiverId },
			include: { receiverUser: { select: { name: true } } },
		})
	}

	async getReceivedMany(receiverId: string) {
		return await this.prisma.friendInvite.findMany({
			where: { receiverId, status: 'PENDING' },
			include: { senderUser: { select: { name: true } } },
		})
	}

	async getReceivedOne(receiverId: string, senderId: string) {
		return await this.prisma.friendInvite.findFirst({
			where: { senderId, receiverId },
			include: { senderUser: { select: { name: true } } },
		})
	}

	async create(senderId: string, receiverId: string) {
		const oldInvite = await this.prisma.friendInvite.findFirst({
			where: { senderId, receiverId, status: 'PENDING' },
			select: { id: true },
		})

		if (oldInvite)
			throw new ForbiddenException('You already have an invite to accept')

		const invite = await this.prisma.friendInvite.create({
			data: { senderId, receiverId },
			include: { receiverUser: { select: { name: true } } },
		})
		return invite
	}

	async accept(senderId: string, receiverId: string) {
		const invite = await this.prisma.friendInvite.findFirst({
			where: { senderId, receiverId },
		})

		if (!invite) throw new NotFoundException('Invite not found')
		if (invite.status === 'ACCEPTED')
			throw new ForbiddenException('Invite already accepted')
		if (invite.status === 'DENIED')
			throw new ForbiddenException('Invite already denied')
		if (invite.receiverId !== receiverId)
			throw new ForbiddenException('You cannot accept this invite')

		const [updatedInvite, isAdded] = await Promise.all([
			this.prisma.friendInvite.update({
				where: { id: invite.id },
				data: { status: 'ACCEPTED' },
			}),
			this.userService.addFriend(invite.senderId, invite.receiverId),
		])

		return updatedInvite.status === 'ACCEPTED' && isAdded
	}

	async deny(senderId: string, receiverId: string) {
		const invite = await this.prisma.friendInvite.findFirst({
			where: { senderId, receiverId },
		})

		if (!invite) throw new NotFoundException('Invite not found')
		if (invite.status === 'ACCEPTED')
			throw new ForbiddenException('Invite already accepted')
		if (invite.status === 'DENIED')
			throw new ForbiddenException('Invite already denied')
		if (invite.receiverId !== receiverId)
			throw new ForbiddenException('You cannot deny this invite')

		const updatedInvite = await this.prisma.friendInvite.update({
			where: { id: invite.id },
			data: { status: 'DENIED' },
		})

		return updatedInvite.status === 'DENIED'
	}
}
