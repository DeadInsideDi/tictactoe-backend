import type { GameArrayItem, MatchData } from './types/game'

export class GameMatch {
	id: string
	array: GameArrayItem[]
	player1Id: string
	player2Id: string
	isPlayer1Move = true

	private readonly WIN_PATTERNS = [
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8], // Rows
		[0, 3, 6],
		[1, 4, 7],
		[2, 5, 8], // Columns
		[0, 4, 8],
		[2, 4, 6], // Diagonals
	]

	constructor({ id, player1Id, player2Id }: MatchData) {
		this.array = new Array(9).fill('') as GameArrayItem[]
		this.id = id
		this.player1Id = player1Id
		this.player2Id = player2Id
	}

	isValidMove(position: number) {
		return position >= 0 && position <= 8 && this.array[position] === ''
	}

	makeMove(position: number) {
		this.array[position] = this.isPlayer1Move ? 'X' : 'O'
		this.isPlayer1Move = !this.isPlayer1Move
	}

	isDone() {
		if (this.getWinnerId()) return true
		const isFutureWinPossible = this.WIN_PATTERNS.some(pattern => {
			const canXWin = pattern.every(pos => this.array[pos] !== 'O')
			const canOWin = pattern.every(pos => this.array[pos] !== 'X')
			return canXWin || canOWin
		})
		return !isFutureWinPossible
	}

	getWinnerId() {
		for (const pattern of this.WIN_PATTERNS) {
			const [first, middle, last] = pattern.map(
				position => this.array[position],
			)
			if (first && first === middle && middle === last) {
				return first === 'X' ? this.player1Id : this.player2Id
			}
		}
		return null
	}
}
