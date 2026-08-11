import { describe, expect, it } from 'vitest'

import { formatJson, minifyJson } from './format'

describe('json formatter', () => {
	it('formats json with indentation', () => {
		const result = formatJson('{"a":1,"b":[1,2]}', 2)
		expect(result.ok).toBe(true)
		expect(result.value).toBe('{\n  "a": 1,\n  "b": [\n    1,\n    2\n  ]\n}')
	})

	it('formats json with custom indentation', () => {
		const result = formatJson('{"a":1}', 4)
		expect(result.value).toBe('{\n    "a": 1\n}')
	})

	it('minifies formatted json', () => {
		const result = minifyJson('{ \n  "a" : 1, \n  "b" : [ 1, 2 ] \n}')
		expect(result.ok).toBe(true)
		expect(result.value).toBe('{"a":1,"b":[1,2]}')
	})

	it('rejects empty input', () => {
		expect(formatJson('   ')).toEqual({
			ok: false,
			error: '请输入 JSON 内容',
		})
	})

	it('reports invalid json with position info', () => {
		const result = formatJson('{"a": 1,,}')
		expect(result.ok).toBe(false)
		expect(result.error).toContain('JSON 解析失败')
	})

	it('round trips through format and minify', () => {
		const formatted = formatJson('{"name":"x","list":[1,2,3]}')
		const minified = minifyJson(formatted.value ?? '')
		expect(minified.value).toBe('{"name":"x","list":[1,2,3]}')
	})
})
