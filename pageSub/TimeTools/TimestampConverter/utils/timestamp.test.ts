import { describe, expect, it } from 'vitest'

import { dateToTimestamp, formatDateTime, parseTimestamp } from './timestamp'

describe('timestamp utils', () => {
	it('parses second timestamp', () => {
		const result = parseTimestamp('1704067200')

		expect(result.ok).toBe(true)
		expect(result.unit).toBe('second')
		expect(result.value?.getTime()).toBe(1704067200000)
	})

	it('parses millisecond timestamp', () => {
		const result = parseTimestamp('1704067200000')

		expect(result.ok).toBe(true)
		expect(result.unit).toBe('millisecond')
		expect(result.value?.getTime()).toBe(1704067200000)
	})

	it('formats date and timestamps', () => {
		const date = new Date(1704067200000)

		expect(dateToTimestamp(date)).toEqual({
			seconds: 1704067200,
			milliseconds: 1704067200000,
		})
		expect(formatDateTime(date)).toMatch(/2024-01-01/)
	})
})
