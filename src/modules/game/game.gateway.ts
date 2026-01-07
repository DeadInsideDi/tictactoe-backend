import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets'
import { UserStatus } from '@prisma/client'
import type { Server, Socket } from 'socket.io'
import { AuthService } from '../auth/auth.service'
import type { JwtPayload } from '../auth/types/jwt-payload'
import { UserService } from '../user/user.service'
import { ClientToServerEvents, ServerToClientEvents } from './events'
import type { GameMatch } from './game-match'
import { GameService } from './game.service'
import type { AuthenticatedSocket, ErrorMessage } from './types/game'

@WebSocketGateway({
	cors: { origin: process.env.FRONTEND_URL, credentials: true },
	pingTimeout: 60000,
	pingInterval: 30000,
	maxHttpBufferSize: 1024 * 8,
	transports: ['websocket'],
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	readonly server: Server

	private readonly gameRoomPrefix = 'game-'

	private readonly userSocketMap = new Map<string, string>() // userId -> socketId

	constructor(
		private readonly authService: AuthService,
		private readonly userService: UserService,
		private readonly gameService: GameService,
	) {}

	handleConnection(client: AuthenticatedSocket) {
		const userId = this.extractUserIdFromSocket(client)

		if (!userId) {
			this.emitError(client, 'Authentication error')
			return client.disconnect()
		}

		client.userId = userId
		this.userSocketMap.set(userId, client.id)
		void this.userService.changeStatus(userId, UserStatus.ONLINE)

		client.on('disconnecting', () => {
			const gameRoom = this.getGameRoomFromSocket(client)
			if (gameRoom) {
				const gameId = gameRoom.replace(this.gameRoomPrefix, '')
				const gameMatch = this.gameService.getMatch(gameId)
				if (gameMatch) {
					this.endMatch(client, gameId, gameMatch)
				}

				void this.userService.changeStatus(client.userId, UserStatus.OFFLINE)
			}
		})
	}

	handleDisconnect(client: AuthenticatedSocket) {
		const { userId } = client
		if (userId) {
			this.userSocketMap.delete(userId)
			this.gameService.cleanInviteesForUser(userId)
			void this.userService.changeStatus(userId, UserStatus.OFFLINE)
		}
	}

	@SubscribeMessage(ClientToServerEvents.sendInvite)
	inviteToGame(
		@ConnectedSocket() client: AuthenticatedSocket,
		@MessageBody() player2Id: string,
	) {
		const player1Id = client.userId
		if (this.getGameRoomFromSocket(client)) {
			return this.emitError(client, 'You cannot invite while playing')
		}
		if (player1Id === player2Id) {
			return this.emitError(client, 'You cannot invite yourself')
		}
		const player2Socket = this.getSocketByUserId(player2Id)
		if (!player2Socket) {
			return this.emitError(client, 'Player not online')
		}
		this.gameService.addInviteeForInviter(player1Id, player2Id)
		player2Socket.emit(ServerToClientEvents.getInvite, player1Id)
	}

	@SubscribeMessage(ClientToServerEvents.acceptInvite)
	async acceptInvite(
		@ConnectedSocket() client: AuthenticatedSocket,
		@MessageBody() player1Id: string,
	) {
		const player2Id = client.userId
		if (!player1Id) {
			return this.emitError(client, 'Player id not provided')
		}
		if (this.getGameRoomFromSocket(client)) {
			return this.emitError(client, 'You cannot accept while playing')
		}
		if (player1Id === player2Id) {
			return this.emitError(client, 'You cannot accept your own invite')
		}
		if (!this.gameService.hasInviteeForInviter(player1Id, player2Id)) {
			return this.emitError(client, 'You dont have an invite from this player')
		}
		const player1Socket = this.getSocketByUserId(player1Id)
		if (!player1Socket) {
			return this.emitError(client, 'Player not online')
		}

		void this.userService.addDraw(player1Id)
		void this.userService.addDraw(player2Id)
		const match = await this.gameService.createMatch(player1Id, player2Id)
		const gameRoom = this.gameRoomPrefix + match.id

		void client.join(gameRoom)
		void player1Socket.join(gameRoom)
		this.server.to(gameRoom).emit(ServerToClientEvents.start, match)

		this.gameService.removeInviteeForInviter(player1Id, player2Id)
	}

	@SubscribeMessage(ClientToServerEvents.declineInvite)
	declineInvite(
		@ConnectedSocket() client: AuthenticatedSocket,
		@MessageBody() player1Id: string,
	) {
		const player2Id = client.userId
		if (!player1Id) {
			return this.emitError(client, 'Player id not provided')
		}
		if (this.getGameRoomFromSocket(client)) {
			return this.emitError(client, 'You cannot decline while playing')
		}
		if (player1Id === player2Id) {
			return this.emitError(client, 'You cannot decline yourself')
		}
		if (!this.gameService.hasInviteeForInviter(player1Id, player2Id)) {
			return this.emitError(client, 'You dont have an invite from this player')
		}
		const player1Socket = this.getSocketByUserId(player1Id)
		if (player1Socket) {
			player1Socket.emit(ServerToClientEvents.getDeclineInvite, player2Id)
		}
		this.gameService.removeInviteeForInviter(player1Id, player2Id)
	}

	@SubscribeMessage(ClientToServerEvents.move)
	move(
		@ConnectedSocket() client: AuthenticatedSocket,
		@MessageBody() notSecurePosition: number | string,
	) {
		const gameRoom = this.getGameRoomFromSocket(client)
		if (!gameRoom) {
			return this.emitError(client, 'You are not in a game')
		}
		const gameId = gameRoom.replace(this.gameRoomPrefix, '')
		const gameMatch = this.gameService.getMatch(gameId)
		if (!gameMatch) {
			return this.emitError(client, 'Server error')
		}
		const yourTurn =
			(client.userId === gameMatch.player1Id && gameMatch.isPlayer1Move) ||
			(client.userId === gameMatch.player2Id && !gameMatch.isPlayer1Move)
		if (!yourTurn) {
			return this.emitError(client, 'Not your turn')
		}
		const position = Number(notSecurePosition)
		if (!gameMatch.isValidMove(position)) {
			return this.emitError(client, 'Not valid move')
		}
		gameMatch.makeMove(position)
		if (gameMatch.isDone()) {
			return this.endMatch(client, gameId, gameMatch, position)
		}

		this.server.to(gameRoom).emit(ServerToClientEvents.state, {
			position,
			winnerId: null,
			done: false,
		})
	}

	@SubscribeMessage(ClientToServerEvents.leaveMatch)
	leaveMatch(@ConnectedSocket() client: AuthenticatedSocket) {
		const gameRoom = this.getGameRoomFromSocket(client)
		if (!gameRoom) {
			return this.emitError(client, 'You are not in a game')
		}
		const gameId = gameRoom.replace(this.gameRoomPrefix, '')
		const gameMatch = this.gameService.getMatch(gameId)
		if (!gameMatch) {
			return this.emitError(client, 'Server error')
		}

		void this.endMatch(client, gameId, gameMatch)
	}

	private endMatch(
		client: AuthenticatedSocket,
		gameId: string,
		gameMatch: GameMatch,
		lastPosition?: number,
	) {
		const gameRoom = this.gameRoomPrefix + gameId
		let winnerId = gameMatch.getWinnerId()
		const isGameEndedByLeaving = !winnerId && !gameMatch.isDone()

		if (isGameEndedByLeaving) {
			winnerId =
				client.userId === gameMatch.player1Id
					? gameMatch.player2Id
					: gameMatch.player1Id
		}

		this.server.to(gameRoom).emit(ServerToClientEvents.state, {
			position: lastPosition,
			winnerId,
			done: true,
		})

		this.gameService.endMatch(gameId, gameMatch, winnerId)

		this.server.to(gameRoom).socketsLeave(gameRoom)
	}

	private getGameRoomFromSocket(client: Socket) {
		const gameRoom =
			Array.from(client.rooms).find(room =>
				room.startsWith(this.gameRoomPrefix),
			) || null
		return gameRoom
	}

	private extractUserIdFromSocket(client: Socket) {
		const token = (client.handshake.auth['token'] ||
			client.handshake.headers.authorization) as string | undefined
		if (!token) return null
		try {
			const payload = this.authService.verifyToken<JwtPayload>(token)
			return payload?.id || null
		} catch {
			return null
		}
	}

	private getSocketByUserId(userId: string) {
		const socketId = this.userSocketMap.get(userId)
		return socketId
			? (this.server.sockets.sockets.get(socketId) as AuthenticatedSocket)
			: null
	}

	private emitError(client: Socket, message: ErrorMessage) {
		client.emit(ServerToClientEvents.error, message)
	}
}
