import { describe, expect, it } from 'vitest'

import { countTextStats } from './counter'

describe('countTextStats', () => {
	it('counts mixed Chinese and English text', () => {
		const stats = countTextStats('你好 world 123!\n第二行')

		expect(stats.characters).toBe(17)
		expect(stats.chineseCharacters).toBe(5)
		expect(stats.letters).toBe(5)
		expect(stats.digits).toBe(3)
		expect(stats.lines).toBe(2)
		expect(stats.words).toBe(7)
		expect(stats.estimatedReadingMinutes).toBe(1)
	})

	it('returns zero values for empty input', () => {
		const stats = countTextStats('')

		expect(stats.characters).toBe(0)
		expect(stats.lines).toBe(0)
		expect(stats.paragraphs).toBe(0)
		expect(stats.estimatedReadingMinutes).toBe(0)
	})
})
