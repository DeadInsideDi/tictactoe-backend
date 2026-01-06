import { Injectable } from '@nestjs/common'
import type { Prisma } from '@prisma/client'
import { PrismaService } from '../../common/services/prisma.service'
import { MatchSearchDto } from './dto/search.dto'

@Injectable()
export class MatchService {
	constructor(private readonly prisma: PrismaService) {}

	async create(player1Id: string, player2Id: string) {
		const match = await this.prisma.match.create({
			data: { player1Id, player2Id },
		})
		return match
	}

	async search(dto: MatchSearchDto, userId: string) {
		const { createdAt, limit = 5, page = 1 } = dto

		const where: Prisma.MatchWhereInput = {
			OR: [{ player1Id: userId }, { player2Id: userId }],
		}

		if (createdAt) where.createdAt = { lt: createdAt }
		return await this.prisma.match.findMany({
			where,
			orderBy: { createdAt: 'desc' },
			take: limit,
			skip: limit * (page - 1),
			include: {
				player1: { select: { name: true } },
				player2: { select: { name: true } },
			},
		})
	}

	async changeWinnerId(id: string, winnerId: string) {
		const updatedMatch = await this.prisma.match.update({
			where: { id },
			data: { winnerId },
		})
		return updatedMatch
	}
}
