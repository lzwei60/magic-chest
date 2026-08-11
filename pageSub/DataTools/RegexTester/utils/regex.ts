export type RegexFlags = {
	ignoreCase: boolean
	multiline: boolean
	global: boolean
}

export type RegexMatch = {
	text: string
	index: number
	groups: string[]
}

export type RegexTestResult = {
	ok: boolean
	matches?: RegexMatch[]
	replaced?: string
	error?: string
}

export function testRegex(
	pattern: string,
	text: string,
	flags: RegexFlags,
	replacement = ''
): RegexTestResult {
	if (!pattern) {
		return { ok: false, error: '请输入正则表达式' }
	}

	try {
		const flagText = `${flags.global ? 'g' : ''}${flags.ignoreCase ? 'i' : ''}${flags.multiline ? 'm' : ''}`
		const regex = new RegExp(pattern, flagText || undefined)
		const matchRegex = flags.global ? regex : new RegExp(pattern, `${flagText}g`)
		const matches = collectMatches(matchRegex, text)

		return {
			ok: true,
			matches,
			replaced: text.replace(regex, replacement),
		}
	} catch (error) {
		return {
			ok: false,
			error: error instanceof Error ? error.message : '正则表达式无效',
		}
	}
}

function collectMatches(regex: RegExp, text: string): RegexMatch[] {
	const matches: RegexMatch[] = []
	for (const match of text.matchAll(regex)) {
		matches.push({
			text: match[0],
			index: match.index ?? 0,
			groups: match.slice(1),
		})
		if (match[0] === '') break
		if (matches.length >= 100) break
	}
	return matches
}
