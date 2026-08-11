import { describe, expect, it } from 'vitest'

import { decodeBase64, encodeBase64 } from './base64'

describe('base64 codec', () => {
	it('encodes and decodes UTF-8 text', () => {
		const encoded = encodeBase64('你好，Magic Chest')

		expect(encoded.ok).toBe(true)
		expect(decodeBase64(encoded.value ?? '')).toEqual({
			ok: true,
			value: '你好，Magic Chest',
		})
	})

	it('rejects invalid base64 input', () => {
		expect(decodeBase64('%%%').ok).toBe(false)
	})
})
