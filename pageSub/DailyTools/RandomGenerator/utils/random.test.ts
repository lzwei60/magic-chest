import { describe, expect, it } from 'vitest'

import {
	generateRandomNumbers,
	generateRandomStrings,
	generateUuid,
} from './random'

describe('random generator', () => {
	it('generates unique integers within range', () => {
		const values = generateRandomNumbers({
			min: 1,
			max: 5,
			count: 5,
			integerOnly: true,
			allowDuplicate: false,
		})

		expect(new Set(values).size).toBe(5)
		expect(values.every((value) => value >= 1 && value <= 5)).toBe(true)
	})

	it('rejects impossible unique integer requests', () => {
		expect(() =>
			generateRandomNumbers({
				min: 1,
				max: 2,
				count: 3,
				integerOnly: true,
				allowDuplicate: false,
			})
		).toThrow('不重复整数数量超过可用范围')
	})

	it('generates strings from selected pool', () => {
		const values = generateRandomStrings({
			length: 8,
			count: 2,
			uppercase: false,
			lowercase: false,
			digits: true,
			symbols: false,
		})

		expect(values).toHaveLength(2)
		expect(values.every((value) => /^\d{8}$/u.test(value))).toBe(true)
	})

	it('generates version 4 uuid', () => {
		expect(generateUuid()).toMatch(
			/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u
		)
	})
})
