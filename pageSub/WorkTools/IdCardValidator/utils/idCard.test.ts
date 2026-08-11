import { describe, expect, it } from 'vitest'

import { calculateCheckCode, validateIdCard } from './idCard'

describe('id card validator', () => {
	it('calculates check code', () => {
		expect(calculateCheckCode('11010519491231002')).toBe('X')
	})

	it('validates birthday, gender, and age', () => {
		const result = validateIdCard('11010519491231002X', new Date('2026-08-11T00:00:00'))

		expect(result.valid).toBe(true)
		expect(result.birthday).toBe('1949-12-31')
		expect(result.gender).toBe('female')
		expect(result.age).toBe(76)
	})

	it('rejects invalid check code', () => {
		expect(validateIdCard('110105194912310021').valid).toBe(false)
	})
})
