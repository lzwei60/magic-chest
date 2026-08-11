import { describe, expect, it } from 'vitest'

import { testRegex } from './regex'

describe('testRegex', () => {
	it('collects matches and replacement preview', () => {
		const result = testRegex('(\\d+)', 'a12 b34', {
			global: true,
			ignoreCase: false,
			multiline: false,
		}, '#')

		expect(result.ok).toBe(true)
		expect(result.matches).toHaveLength(2)
		expect(result.replaced).toBe('a# b#')
	})

	it('returns regex errors', () => {
		expect(
			testRegex('[', 'text', {
				global: true,
				ignoreCase: false,
				multiline: false,
			}).ok
		).toBe(false)
	})
})
