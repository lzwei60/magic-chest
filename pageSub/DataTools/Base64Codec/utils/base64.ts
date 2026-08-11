export type CodecResult = {
	ok: boolean
	value?: string
	error?: string
}

const EMPTY_INPUT_ERROR = '请输入要处理的内容'
const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

export function encodeBase64(input: string): CodecResult {
	if (!input) {
		return { ok: false, error: EMPTY_INPUT_ERROR }
	}

	try {
		return { ok: true, value: bytesToBase64(utf8Encode(input)) }
	} catch {
		return { ok: false, error: 'Base64 编码失败' }
	}
}

export function decodeBase64(input: string): CodecResult {
	const normalized = input.trim()
	if (!normalized) {
		return { ok: false, error: EMPTY_INPUT_ERROR }
	}

	try {
		const bytes = base64ToBytes(normalized)
		return { ok: true, value: utf8Decode(bytes) }
	} catch {
		return { ok: false, error: 'Base64 格式无效或内容不是 UTF-8 文本' }
	}
}

function bytesToBase64(bytes: Uint8Array): string {
	let output = ''

	for (let index = 0; index < bytes.length; index += 3) {
		const first = bytes[index]
		const second = bytes[index + 1]
		const third = bytes[index + 2]

		const triple =
			(first << 16) | ((second ?? 0) << 8) | ((third ?? 0) << 0)

		output += BASE64_CHARS[(triple >> 18) & 63]
		output += BASE64_CHARS[(triple >> 12) & 63]
		output += index + 1 < bytes.length ? BASE64_CHARS[(triple >> 6) & 63] : '='
		output += index + 2 < bytes.length ? BASE64_CHARS[triple & 63] : '='
	}

	return output
}

function base64ToBytes(input: string): Uint8Array {
	const normalized = input.replace(/\s/g, '')
	if (!/^[A-Za-z0-9+/]*={0,2}$/u.test(normalized) || normalized.length % 4 !== 0) {
		throw new Error('Invalid Base64')
	}

	const bytes: number[] = []
	for (let index = 0; index < normalized.length; index += 4) {
		const chunk = normalized.slice(index, index + 4)
		const values = [...chunk].map((char) =>
			char === '=' ? 0 : BASE64_CHARS.indexOf(char)
		)

		if (values.some((value) => value < 0)) {
			throw new Error('Invalid Base64')
		}

		const triple =
			(values[0] << 18) | (values[1] << 12) | (values[2] << 6) | values[3]

		bytes.push((triple >> 16) & 255)
		if (chunk[2] !== '=') {
			bytes.push((triple >> 8) & 255)
		}
		if (chunk[3] !== '=') {
			bytes.push(triple & 255)
		}
	}

	return new Uint8Array(bytes)
}

function utf8Encode(input: string): Uint8Array {
	const bytes: number[] = []

	for (const char of input) {
		const codePoint = char.codePointAt(0)
		if (codePoint == null) continue

		if (codePoint <= 0x7f) {
			bytes.push(codePoint)
		} else if (codePoint <= 0x7ff) {
			bytes.push(0xc0 | (codePoint >> 6), 0x80 | (codePoint & 0x3f))
		} else if (codePoint <= 0xffff) {
			bytes.push(
				0xe0 | (codePoint >> 12),
				0x80 | ((codePoint >> 6) & 0x3f),
				0x80 | (codePoint & 0x3f)
			)
		} else {
			bytes.push(
				0xf0 | (codePoint >> 18),
				0x80 | ((codePoint >> 12) & 0x3f),
				0x80 | ((codePoint >> 6) & 0x3f),
				0x80 | (codePoint & 0x3f)
			)
		}
	}

	return new Uint8Array(bytes)
}

function utf8Decode(bytes: Uint8Array): string {
	let output = ''

	for (let index = 0; index < bytes.length; ) {
		const first = bytes[index]

		if (first <= 0x7f) {
			output += String.fromCodePoint(first)
			index += 1
			continue
		}

		if (first >= 0xc2 && first <= 0xdf) {
			const second = readContinuationByte(bytes, index + 1)
			output += String.fromCodePoint(((first & 0x1f) << 6) | second)
			index += 2
			continue
		}

		if (first >= 0xe0 && first <= 0xef) {
			const second = readContinuationByte(bytes, index + 1)
			const third = readContinuationByte(bytes, index + 2)
			output += String.fromCodePoint(
				((first & 0x0f) << 12) | (second << 6) | third
			)
			index += 3
			continue
		}

		if (first >= 0xf0 && first <= 0xf4) {
			const second = readContinuationByte(bytes, index + 1)
			const third = readContinuationByte(bytes, index + 2)
			const fourth = readContinuationByte(bytes, index + 3)
			output += String.fromCodePoint(
				((first & 0x07) << 18) | (second << 12) | (third << 6) | fourth
			)
			index += 4
			continue
		}

		throw new Error('Invalid UTF-8')
	}

	return output
}

function readContinuationByte(bytes: Uint8Array, index: number): number {
	const byte = bytes[index]
	if (byte == null || (byte & 0xc0) !== 0x80) {
		throw new Error('Invalid UTF-8')
	}
	return byte & 0x3f
}
