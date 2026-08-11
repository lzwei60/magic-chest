import { describe, expect, it } from 'vitest'

import { amountToChinese } from './amount'

describe('amountToChinese', () => {
	it('converts integer and decimal amounts', () => {
		expect(amountToChinese('1234.56')).toEqual({
			ok: true,
			value: '壹仟贰佰叁拾肆元伍角陆分',
		})
	})

	it('handles zero and leading zero decimals', () => {
		expect(amountToChinese('0')).toEqual({ ok: true, value: '零元整' })
		expect(amountToChinese('0.05')).toEqual({ ok: true, value: '零伍分' })
	})

	it('rejects invalid amount', () => {
		expect(amountToChinese('12.345').ok).toBe(false)
	})
})
