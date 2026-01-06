export const ClientToServerEvents = {
	sendInvite: 'sendInvite',
	acceptInvite: 'acceptInvite',
	declineInvite: 'declineInvite',
	move: 'game:move',
	leaveMatch: 'game:leave',
} as const

export const ServerToClientEvents = {
	getInvite: 'getInvite',
	getDeclineInvite: 'getDeclineInvite',
	start: 'game:start',
	state: 'game:state',
	error: 'error',
} as const
