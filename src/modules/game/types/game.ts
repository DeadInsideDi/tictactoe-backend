import type { Match } from '@prisma/client'
import type { Socket } from 'socket.io'

export interface AuthenticatedSocket extends Socket {
	userId: string
}

export type ErrorMessage =
	| 'Authentication error'
	| 'Player id not provided'
	| 'You dont have an invite from this player'
	| 'Player not online'
	| 'You cannot accept your own invite'
	| 'You cannot invite yourself'
	| 'You cannot decline yourself'
	| 'You cannot accept while playing'
	| 'You cannot invite while playing'
	| 'You cannot decline while playing'
	| 'You are not in a game'
	| 'Not valid move'
	| 'Not your turn'
	| 'Server error'

export type GameArrayItem = 'X' | 'O' | ''

export type MatchData = Omit<Match, 'winnerId' | 'createdAt'>
