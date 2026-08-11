export type RandomNumberOptions = {
	min: number
	max: number
	count: number
	integerOnly: boolean
	allowDuplicate: boolean
}

export type RandomStringOptions = {
	length: number
	count: number
	uppercase: boolean
	lowercase: boolean
	digits: boolean
	symbols: boolean
}

export const RANDOM_CHARSETS = {
	uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
	lowercase: 'abcdefghijklmnopqrstuvwxyz',
	digits: '0123456789',
	symbols: '!@#$%^&*_-+=',
} as const

export function generateRandomNumbers(options: RandomNumberOptions): number[] {
	const min = Math.min(options.min, options.max)
	const max = Math.max(options.min, options.max)
	const count = clampInteger(options.count, 1, 100)

	if (options.integerOnly && !options.allowDuplicate) {
		const size = Math.floor(max) - Math.ceil(min) + 1
		if (size < count) {
			throw new Error('不重复整数数量超过可用范围')
		}
	}

	const numbers: number[] = []
	const used = new Set<number>()
	while (numbers.length < count) {
		const value = options.integerOnly
			? randomInteger(Math.ceil(min), Math.floor(max))
			: roundTo(Math.random() * (max - min) + min, 4)

		if (!options.allowDuplicate && used.has(value)) continue
		used.add(value)
		numbers.push(value)
	}

	return numbers
}

export function generateRandomStrings(options: RandomStringOptions): string[] {
	const pool = getStringPool(options)
	if (!pool) {
		throw new Error('请至少选择一种字符类型')
	}

	const length = clampInteger(options.length, 1, 128)
	const count = clampInteger(options.count, 1, 50)

	return Array.from({ length: count }, () =>
		Array.from({ length }, () => pool[randomInteger(0, pool.length - 1)]).join('')
	)
}

export function generateUuid(): string {
	const bytes = new Uint8Array(16)
	for (let index = 0; index < bytes.length; index += 1) {
		bytes[index] = randomInteger(0, 255)
	}

	bytes[6] = (bytes[6] & 0x0f) | 0x40
	bytes[8] = (bytes[8] & 0x3f) | 0x80

	const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0'))
	return [
		hex.slice(0, 4).join(''),
		hex.slice(4, 6).join(''),
		hex.slice(6, 8).join(''),
		hex.slice(8, 10).join(''),
		hex.slice(10).join(''),
	].join('-')
}

function getStringPool(options: RandomStringOptions): string {
	return (Object.keys(RANDOM_CHARSETS) as Array<keyof typeof RANDOM_CHARSETS>)
		.filter((key) => options[key])
		.map((key) => RANDOM_CHARSETS[key])
		.join('')
}

function randomInteger(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min
}

function clampInteger(value: number, min: number, max: number): number {
	return Math.min(Math.max(Math.floor(value), min), max)
}

function roundTo(value: number, digits: number): number {
	const scale = 10 ** digits
	return Math.round(value * scale) / scale
}
