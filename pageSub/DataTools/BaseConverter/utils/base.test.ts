import { describe, expect, it } from 'vitest'

import { convertBase } from './base'

describe('convertBase', () => {
	it('converts hexadecimal value to all bases', () => {
		expect(convertBase('ff', 16)).toEqual({
			ok: true,
			values: {
				2: '11111111',
				8: '377',
				10: '255',
				16: 'FF',
			},
		})
	})

	it('rejects invalid input for base', () => {
		expect(convertBase('102', 2)).toEqual({
			ok: false,
			error: '不是有效的 2 进制数字',
		})
	})
})
