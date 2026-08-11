import { describe, expect, it } from 'vitest'

import { convertCase, splitWords } from './case'

describe('case converter', () => {
	it('splits mixed case words', () => {
		expect(splitWords('helloWorld_text-case')).toEqual([
			'hello',
			'World',
			'text',
			'case',
		])
	})

	it('converts to common naming formats', () => {
		expect(convertCase('hello world text', 'camel')).toBe('helloWorldText')
		expect(convertCase('hello world text', 'pascal')).toBe('HelloWorldText')
		expect(convertCase('hello world text', 'kebab')).toBe('hello-world-text')
		expect(convertCase('hello world text', 'snake')).toBe('hello_world_text')
		expect(convertCase('hello world text', 'constant')).toBe('HELLO_WORLD_TEXT')
	})
})
