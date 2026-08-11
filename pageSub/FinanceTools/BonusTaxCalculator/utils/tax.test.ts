import { describe, expect, it } from 'vitest'

import {
	calcAnnualIncomeTax,
	calcBonusTaxMerged,
	calcBonusTaxSeparate,
	compareBonusTaxMethods,
} from './tax'

describe('bonus tax calculator', () => {
	it('applies the 3% bracket for a 36000 bonus', () => {
		expect(calcBonusTaxSeparate(36000)).toEqual({
			tax: 1080,
			afterTax: 34920,
			rate: 3,
			deduction: 0,
		})
	})

	it('crosses into the 10% bracket just above 36000', () => {
		const result = calcBonusTaxSeparate(36001)
		expect(result.rate).toBe(10)
		expect(result.tax).toBe(3390.1)
		expect(result.afterTax).toBe(32610.9)
	})

	it('calculates a large bonus with the 20% bracket', () => {
		const result = calcBonusTaxSeparate(120000)
		expect(result.rate).toBe(10)
		expect(result.tax).toBe(11790)
	})

	it('rejects invalid bonuses', () => {
		expect(() => calcBonusTaxSeparate(-1)).toThrow('奖金金额无效')
		expect(() => calcBonusTaxSeparate(NaN)).toThrow('奖金金额无效')
	})

	it('calculates annual comprehensive income tax', () => {
		expect(calcAnnualIncomeTax(60000)).toBe(3480)
		expect(calcAnnualIncomeTax(0)).toBe(0)
		expect(calcAnnualIncomeTax(-10000)).toBe(0)
	})

	it('calculates the incremental tax when merged into annual income', () => {
		const result = calcBonusTaxMerged({
			bonus: 100000,
			monthlyIncome: 20000,
			monthlyInsurance: 3000,
			monthlySpecialDeduction: 1000,
		})
		expect(result.annualTaxableIncome).toBe(232000)
		expect(result.tax).toBe(18800)
	})

	it('recommends the cheaper method and reports savings', () => {
		const result = compareBonusTaxMethods({
			bonus: 100000,
			monthlyIncome: 20000,
			monthlyInsurance: 3000,
			monthlySpecialDeduction: 1000,
		})
		expect(result.separate.tax).toBe(9790)
		expect(result.merged.tax).toBe(18800)
		expect(result.better).toBe('separate')
		expect(result.saving).toBe(9010)
	})

	it('recommends merging when income is low', () => {
		const result = compareBonusTaxMethods({
			bonus: 100000,
			monthlyIncome: 5000,
			monthlyInsurance: 500,
			monthlySpecialDeduction: 0,
		})
		expect(result.better).toBe('merged')
	})
})
