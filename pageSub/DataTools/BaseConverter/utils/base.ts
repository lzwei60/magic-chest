export type NumberBase = 2 | 8 | 10 | 16

export type BaseConvertResult = {
	ok: boolean
	values?: Record<NumberBase, string>
	error?: string
}

export function convertBase(input: string, fromBase: NumberBase): BaseConvertResult {
	const normalized = input.trim().replace(/\s/g, '').toLowerCase()
	if (!normalized) {
		return { ok: false, error: '请输入数字' }
	}

	if (!isValidForBase(normalized, fromBase)) {
		return { ok: false, error: `不是有效的 ${fromBase} 进制数字` }
	}

	const value = Number.parseInt(normalized, fromBase)
	if (!Number.isSafeInteger(value)) {
		return { ok: false, error: '数字超出安全整数范围' }
	}

	return {
		ok: true,
		values: {
			2: value.toString(2),
			8: value.toString(8),
			10: value.toString(10),
			16: value.toString(16).toUpperCase(),
		},
	}
}

function isValidForBase(input: string, base: NumberBase): boolean {
	const patterns: Record<NumberBase, RegExp> = {
		2: /^[01]+$/u,
		8: /^[0-7]+$/u,
		10: /^\d+$/u,
		16: /^[0-9a-f]+$/u,
	}
	return patterns[base].test(input)
}
