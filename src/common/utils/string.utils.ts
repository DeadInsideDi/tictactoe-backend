export const extractNameFromEmail = (
	email: string,
	defaltName = 'Anonymous',
) => {
	const name = email.split('@')[0].replace(/[\W\d]+/g, '')
	return name || defaltName
}
