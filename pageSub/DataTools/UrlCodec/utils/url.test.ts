import { describe, expect, it } from 'vitest'

import { decodeUrl, encodeUrl } from './url'

describe('url codec', () => {
	it('encodes and decodes URL components', () => {
		const encoded = encodeUrl('a=你好&b=1 2')

		expect(encoded.ok).toBe(true)
		expect(decodeUrl(encoded.value ?? '')).toEqual({
			ok: true,
			value: 'a=你好&b=1 2',
		})
	})

	it('decodes plus as space for form-style content', () => {
		expect(decodeUrl('hello+world')).toEqual({
			ok: true,
			value: 'hello world',
		})
	})
})
