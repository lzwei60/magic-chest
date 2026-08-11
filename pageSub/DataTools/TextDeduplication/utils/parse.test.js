import { describe, expect, it } from 'vitest'

import { parseText } from './parse'

describe('parseText', () => {
	it('keeps original casing when ignoreCase is enabled', () => {
		const result = parseText('Apple,apple,Banana', {
			trim: true,
			ignoreEmpty: true,
			ignoreCase: true,
		})

		expect(result).toEqual(['Apple', 'apple', 'Banana'])
	})

	it('supports common Chinese and English separators', () => {
		const result = parseText('A，B; C；D\nE', {
			trim: true,
			ignoreEmpty: true,
		})

		expect(result).toEqual(['A', 'B', 'C', 'D', 'E'])
	})
})
