import {
	ForbiddenException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common'
import { Prisma, UserStatus } from '@prisma/client'
import { hash, verify } from 'argon2'
import { PrismaService } from '../../common/services/prisma.service'
import { extractNameFromEmail } from '../../common/utils/string.utils'
import { ChangePasswordDto } from './dto/change-password.dto'
import { CreateUserDto } from './dto/create-user.dto'
import { UserSearchDto } from './dto/search.dto'

@Injectable()
export class UserService {
	constructor(private readonly prisma: PrismaService) {}

	async create(dto: CreateUserDto) {
		const { email } = dto
		const name = extractNameFromEmail(email)
		const password = await hash(dto.password)

		const user = await this.prisma.user.create({
			data: { name, password, email },
			omit: { password: true, email: true },
		})
		return user
	}

	async findOneById(id: string) {
		const user = await this.prisma.user.findUnique({
			where: { id },
			omit: { password: true, email: true },
		})
		return user
	}

	async findOneByEmail(email: string) {
		const user = await this.prisma.user.findUnique({
			where: { email },
			omit: { password: true, email: true },
		})
		return user
	}

	async findOneByEmailWithPassword(email: string) {
		const user = await this.prisma.user.findUnique({ where: { email } })
		return user
	}

	async findOneByIdWithPassword(id: string) {
		const user = await this.prisma.user.findUnique({ where: { id } })
		return user
	}

	async search(dto: UserSearchDto) {
		const { name, onlineOnly, limit = 5, page = 1 } = dto

		let where: Prisma.UserWhereInput | undefined = undefined
		if (name || onlineOnly) {
			where = {}
			if (name) where.name = { contains: name }
			if (onlineOnly) where.status = UserStatus.ONLINE
		}

		return await this.prisma.user.findMany({
			where,
			orderBy: { score: 'desc' },
			take: limit,
			skip: limit * (page - 1),
			omit: { password: true, email: true },
		})
	}

	async getFriends(id: string) {
		const userWithFriends = await this.prisma.user.findUnique({
			where: { id },
			select: {
				friends: { omit: { password: true, email: true } },
				friendOf: { omit: { password: true, email: true } },
			},
		})
		if (!userWithFriends) return []
		return userWithFriends.friends.concat(userWithFriends.friendOf)
	}

	async changeName(id: string, name: string) {
		const updatedUser = await this.prisma.user.update({
			where: { id },
			data: { name },
			omit: { password: true, email: true },
		})
		return updatedUser
	}

	async changeEmail(id: string, email: string) {
		const updatedUser = await this.prisma.user.update({
			where: { id },
			data: { email },
			omit: { password: true, email: true },
		})
		return updatedUser
	}

	async changePassword(id: string, dto: ChangePasswordDto) {
		const user = await this.findOneByIdWithPassword(id)
		if (!user) throw new NotFoundException('User not found')

		const isValid = await verify(user.password, dto.currentPassword)
		if (!isValid) throw new UnauthorizedException('Invalid password')

		const updatedUser = await this.prisma.user.update({
			where: { id },
			data: { password: await hash(dto.newPassword) },
			omit: { password: true, email: true },
		})
		return updatedUser
	}

	async changeStatus(id: string, status: UserStatus) {
		const updatedUser = await this.prisma.user.update({
			where: { id },
			data: { status },
			omit: { password: true, email: true },
		})
		return updatedUser
	}

	async addFriend(id: string, friendId: string) {
		const friendUser = await this.prisma.user.findUnique({
			where: { id: friendId },
			select: { friends: { select: { id: true } } },
		})

		for (const user of friendUser?.friends || []) {
			if (user.id === id)
				throw new ForbiddenException('Friend already added you')
		}

		await this.prisma.user.update({
			where: { id },
			data: { friends: { connect: { id: friendId } } },
			select: { id: true },
		})

		return true
	}

	async removeFriend(id: string, friendId: string) {
		await Promise.all([
			this.prisma.user.update({
				where: { id },
				data: { friends: { disconnect: { id: friendId } } },
				select: { id: true },
			}),
			this.prisma.user.update({
				where: { id: friendId },
				data: { friends: { disconnect: { id } } },
				select: { id: true },
			}),
			this.prisma.friendInvite.deleteMany({
				where: {
					OR: [
						{ senderId: friendId, receiverId: id },
						{ senderId: id, receiverId: friendId },
					],
				},
			}),
		])
		return true
	}

	async addVictory(id: string) {
		const updatedUser = await this.prisma.user.update({
			where: { id },
			data: { score: { increment: 1 }, wins: { increment: 1 } },
			omit: { password: true, email: true },
		})
		return updatedUser
	}

	async addDefeat(id: string) {
		const updatedUser = await this.prisma.user.update({
			where: { id },
			data: { score: { decrement: 1 }, losses: { increment: 1 } },
			omit: { password: true, email: true },
		})
		return updatedUser
	}

	async addDraw(id: string) {
		const updatedUser = await this.prisma.user.update({
			where: { id },
			data: { draws: { increment: 1 } },
			omit: { password: true, email: true },
		})
		return updatedUser
	}

	async removeDraw(id: string) {
		const updatedUser = await this.prisma.user.update({
			where: { id },
			data: { draws: { decrement: 1 } },
			omit: { password: true, email: true },
		})
		return updatedUser
	}

	async remove(id: string) {
		const deletedUser = await this.prisma.user.delete({
			where: { id },
			omit: { password: true, email: true },
		})
		return deletedUser
	}
}
