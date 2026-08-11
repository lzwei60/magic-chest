import { describe, expect, it } from 'vitest'

import { formatHsl, formatRgb, parseColor, rgbToHex, rgbToHsl } from './color'

describe('color converter', () => {
	it('parses short and long hex colors', () => {
		expect(parseColor('#1677ff').rgb).toEqual({ r: 22, g: 119, b: 255 })
		expect(parseColor('#fff').rgb).toEqual({ r: 255, g: 255, b: 255 })
	})

	it('parses rgb colors', () => {
		expect(parseColor('rgb(22, 119, 255)').rgb).toEqual({
			r: 22,
			g: 119,
			b: 255,
		})
	})

	it('formats color values', () => {
		const rgb = { r: 22, g: 119, b: 255 }
		const hsl = rgbToHsl(rgb)

		expect(rgbToHex(rgb)).toBe('#1677FF')
		expect(formatRgb(rgb)).toBe('rgb(22, 119, 255)')
		expect(formatHsl(hsl)).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/u)
	})
})
