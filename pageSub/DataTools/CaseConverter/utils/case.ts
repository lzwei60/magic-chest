export type CaseMode =
	| 'lower'
	| 'upper'
	| 'camel'
	| 'pascal'
	| 'kebab'
	| 'snake'
	| 'constant'

export function convertCase(input: string, mode: CaseMode): string {
	const words = splitWords(input)

	if (mode === 'lower') return input.toLowerCase()
	if (mode === 'upper') return input.toUpperCase()
	if (mode === 'camel') return toCamel(words)
	if (mode === 'pascal') return words.map(capitalize).join('')
	if (mode === 'kebab') return words.map((word) => word.toLowerCase()).join('-')
	if (mode === 'snake') return words.map((word) => word.toLowerCase()).join('_')
	return words.map((word) => word.toUpperCase()).join('_')
}

export function splitWords(input: string): string[] {
	return input
		.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
		.replace(/[_-]+/g, ' ')
		.trim()
		.split(/\s+/u)
		.map((word) => word.replace(/[^\p{L}\p{N}]/gu, ''))
		.filter(Boolean)
}

function toCamel(words: string[]): string {
	return words
		.map((word, index) =>
			index === 0 ? word.toLowerCase() : capitalize(word.toLowerCase())
		)
		.join('')
}

function capitalize(input: string): string {
	return input ? `${input[0].toUpperCase()}${input.slice(1).toLowerCase()}` : ''
}
