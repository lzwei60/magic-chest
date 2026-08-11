export type TextStats = {
	characters: number
	charactersNoSpaces: number
	words: number
	lines: number
	paragraphs: number
	spaces: number
	digits: number
	letters: number
	chineseCharacters: number
	punctuation: number
	estimatedReadingMinutes: number
}

const CHINESE_READING_SPEED_PER_MINUTE = 300

export function countTextStats(input: string): TextStats {
	const normalized = input.replace(/\r\n/g, '\n')
	const trimmed = normalized.trim()
	const characters = [...normalized].length
	const charactersNoSpaces = [...normalized].filter((char) => !/\s/u.test(char)).length
	const chineseCharacters = countMatches(normalized, /[\u4e00-\u9fff]/gu)
	const englishWords = trimmed.match(/[A-Za-z]+(?:[-'][A-Za-z]+)*/gu) ?? []
	const numberWords = trimmed.match(/\d+(?:\.\d+)?/gu) ?? []
	const words = chineseCharacters + englishWords.length + numberWords.length

	return {
		characters,
		charactersNoSpaces,
		words,
		lines: normalized ? normalized.split('\n').length : 0,
		paragraphs: trimmed ? trimmed.split(/\n\s*\n/u).filter(Boolean).length : 0,
		spaces: countMatches(normalized, /\s/gu),
		digits: countMatches(normalized, /\d/gu),
		letters: countMatches(normalized, /[A-Za-z]/gu),
		chineseCharacters,
		punctuation: countMatches(normalized, /[，。！？、；：“”‘’（）《》【】,.!?;:'"()[\]{}<>-]/gu),
		estimatedReadingMinutes: Math.max(
			trimmed ? 1 : 0,
			Math.ceil(words / CHINESE_READING_SPEED_PER_MINUTE)
		),
	}
}

function countMatches(input: string, pattern: RegExp): number {
	return input.match(pattern)?.length ?? 0
}
