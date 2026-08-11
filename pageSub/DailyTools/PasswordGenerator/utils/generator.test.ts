import { describe, expect, it } from 'vitest'

import { CHARSETS, estimateStrength, generatePassword, getPoolSize } from './generator'

const defaultOptions = {
	length: 16,
	uppercase: true,
	lowercase: true,
	digits: true,
	symbols: true,
}

describe('password generator', () => {
	it('generates a password with the requested length', () => {
		expect(generatePassword(defaultOptions)).toHaveLength(16)
		expect(
			generatePassword({ ...defaultOptions, length: 4 })
		).toHaveLength(4)
		expect(
			generatePassword({ ...defaultOptions, length: 64 })
		).toHaveLength(64)
	})

	it('rejects invalid lengths', () => {
		expect(() => generatePassword({ ...defaultOptions, length: 3 })).toThrow(
			'密码长度'
		)
		expect(() => generatePassword({ ...defaultOptions, length: 65 })).toThrow(
			'密码长度'
		)
	})

	it('rejects options without any charset', () => {
		expect(() =>
			generatePassword({
				length: 16,
				uppercase: false,
				lowercase: false,
				digits: false,
				symbols: false,
			})
		).toThrow('至少选择一种字符类型')
	})

	it('only uses enabled charsets', () => {
		const password = generatePassword({
			length: 16,
			uppercase: false,
			lowercase: false,
			digits: true,
			symbols: false,
		})
		expect(password).toMatch(new RegExp(`^[${CHARSETS.digits}]+$`))
	})

	it('always includes at least one character from each enabled charset', () => {
		for (let i = 0; i < 100; i++) {
			const password = generatePassword(defaultOptions)
			const hasCharFrom = (charset: string) =>
				password.split('').some((char) => charset.includes(char))
			expect(hasCharFrom(CHARSETS.uppercase)).toBe(true)
			expect(hasCharFrom(CHARSETS.lowercase)).toBe(true)
			expect(hasCharFrom(CHARSETS.digits)).toBe(true)
			expect(hasCharFrom(CHARSETS.symbols)).toBe(true)
		}
	})

	it('estimates strength from length and pool size', () => {
		expect(estimateStrength(4, 26)).toBe('weak')
		expect(estimateStrength(8, 62)).toBe('medium')
		expect(estimateStrength(12, 62)).toBe('strong')
		expect(estimateStrength(16, getPoolSize(defaultOptions))).toBe(
			'very-strong'
		)
	})
})
