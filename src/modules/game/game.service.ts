import { Injectable } from '@nestjs/common'
import { UserStatus } from '@prisma/client'
import { MatchService } from '../match/match.service'
import { UserService } from '../user/user.service'
import { GameMatch } from './game-match'

@Injectable()
export class GameService {
	// In-memory stores (use Redis for production scaling)
	private readonly inviteesMap = new Map<string, Set<string>>() // inviterId -> Set<inviteeId>
	private readonly matchMap = new Map<string, GameMatch>() // matchId -> GameMatch

	constructor(
		private readonly userService: UserService,
		private readonly matchService: MatchService,
	) {}

	addInviteeForInviter(inviterId: string, inviteeId: string) {
		let invitees = this.inviteesMap.get(inviterId)
		if (!invitees) {
			invitees = new Set()
			this.inviteesMap.set(inviterId, invitees)
		}
		invitees.add(inviteeId)
	}

	removeInviteeForInviter(inviterId: string, inviteeId: string) {
		const invitees = this.inviteesMap.get(inviterId)
		if (invitees) {
			invitees.delete(inviteeId)
		}
	}

	hasInviteeForInviter(inviterId: string, inviteeId: string) {
		return this.inviteesMap.get(inviterId)?.has(inviteeId) ?? false
	}

	async createMatch(player1Id: string, player2Id: string) {
		void this.userService.changeStatus(player1Id, UserStatus.IS_PLAYING)
		void this.userService.changeStatus(player2Id, UserStatus.IS_PLAYING)

		const { id } = await this.matchService.create(player1Id, player2Id)
		const match = { id, player1Id, player2Id }

		this.matchMap.set(id, new GameMatch(match))
		return match
	}

	getMatch(gameId: string) {
		return this.matchMap.get(gameId) || null
	}

	endMatch(gameId: string, gameMatch: GameMatch, winnerId: string | null) {
		if (winnerId) {
			const loserId =
				winnerId === gameMatch.player1Id
					? gameMatch.player2Id
					: gameMatch.player1Id

			void this.userService.removeDraw(winnerId)
			void this.userService.removeDraw(loserId)
			void this.userService.addVictory(winnerId)
			void this.userService.addDefeat(loserId)
			void this.matchService.changeWinnerId(gameId, winnerId)
		}

		void this.userService.changeStatus(gameMatch.player1Id, UserStatus.ONLINE)
		void this.userService.changeStatus(gameMatch.player2Id, UserStatus.ONLINE)

		this.matchMap.delete(gameId)
	}

	cleanInviteesForUser(userId: string) {
		this.inviteesMap.delete(userId)
	}
}
