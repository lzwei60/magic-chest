export type RgbColor = {
	r: number
	g: number
	b: number
}

export type HslColor = {
	h: number
	s: number
	l: number
}

export type ColorParseResult = {
	ok: boolean
	rgb?: RgbColor
	error?: string
}

export function parseColor(input: string): ColorParseResult {
	const value = input.trim()
	if (!value) {
		return { ok: false, error: '请输入颜色值' }
	}

	const hexResult = parseHex(value)
	if (hexResult.ok) return hexResult

	const rgbResult = parseRgb(value)
	if (rgbResult.ok) return rgbResult

	return { ok: false, error: '仅支持 HEX 或 RGB 格式' }
}

export function rgbToHex(color: RgbColor): string {
	return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`
}

export function rgbToHsl(color: RgbColor): HslColor {
	const r = color.r / 255
	const g = color.g / 255
	const b = color.b / 255
	const max = Math.max(r, g, b)
	const min = Math.min(r, g, b)
	const lightness = (max + min) / 2

	if (max === min) {
		return { h: 0, s: 0, l: Math.round(lightness * 100) }
	}

	const delta = max - min
	const saturation =
		lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min)
	let hue = 0

	if (max === r) {
		hue = (g - b) / delta + (g < b ? 6 : 0)
	} else if (max === g) {
		hue = (b - r) / delta + 2
	} else {
		hue = (r - g) / delta + 4
	}

	return {
		h: Math.round(hue * 60),
		s: Math.round(saturation * 100),
		l: Math.round(lightness * 100),
	}
}

export function formatRgb(color: RgbColor): string {
	return `rgb(${color.r}, ${color.g}, ${color.b})`
}

export function formatHsl(color: HslColor): string {
	return `hsl(${color.h}, ${color.s}%, ${color.l}%)`
}

function parseHex(input: string): ColorParseResult {
	const normalized = input.startsWith('#') ? input.slice(1) : input
	if (!/^([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/u.test(normalized)) {
		return { ok: false }
	}

	const full =
		normalized.length === 3
			? normalized
					.split('')
					.map((char) => `${char}${char}`)
					.join('')
			: normalized

	return {
		ok: true,
		rgb: {
			r: Number.parseInt(full.slice(0, 2), 16),
			g: Number.parseInt(full.slice(2, 4), 16),
			b: Number.parseInt(full.slice(4, 6), 16),
		},
	}
}

function parseRgb(input: string): ColorParseResult {
	const match = input.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/iu)
	if (!match) {
		return { ok: false }
	}

	const rgb = {
		r: Number(match[1]),
		g: Number(match[2]),
		b: Number(match[3]),
	}

	if (Object.values(rgb).some((value) => value < 0 || value > 255)) {
		return { ok: false }
	}

	return { ok: true, rgb }
}

function toHex(value: number): string {
	return Math.round(value).toString(16).padStart(2, '0').toUpperCase()
}
