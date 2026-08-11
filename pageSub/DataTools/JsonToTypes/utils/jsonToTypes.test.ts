import { describe, expect, it } from 'vitest'

import { jsonToTypeScript } from './jsonToTypes'

describe('jsonToTypeScript', () => {
	it('generates an interface for object json', () => {
		const result = jsonToTypeScript('{"id":1,"name":"A","tags":["x"]}', 'user')

		expect(result.ok).toBe(true)
		expect(result.value).toContain('export interface User')
		expect(result.value).toContain('id: number')
		expect(result.value).toContain('tags: string[]')
	})

	it('generates a type alias for array roots', () => {
		const result = jsonToTypeScript('[1,2]', 'ids')

		expect(result.ok).toBe(true)
		expect(result.value).toBe('export type Ids = number[]')
	})
})
