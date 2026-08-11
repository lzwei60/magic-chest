export type JsonOperationResult = {
	ok: boolean
	value?: string
	error?: string
}

const EMPTY_INPUT_ERROR = '请输入 JSON 内容'

export function formatJson(input: string, indent = 2): JsonOperationResult {
	return transform(input, (parsed) => JSON.stringify(parsed, null, indent))
}

export function minifyJson(input: string): JsonOperationResult {
	return transform(input, (parsed) => JSON.stringify(parsed))
}

function transform(
	input: string,
	serializer: (parsed: unknown) => string
): JsonOperationResult {
	const trimmed = input.trim()
	if (!trimmed) {
		return { ok: false, error: EMPTY_INPUT_ERROR }
	}
	try {
		const parsed = JSON.parse(trimmed)
		return { ok: true, value: serializer(parsed) }
	} catch (err) {
		return { ok: false, error: describeError(err) }
	}
}

function describeError(err: unknown): string {
	const message = err instanceof Error ? err.message : 'JSON 解析失败'
	const position = message.match(/position (\d+)/)?.[1]
	if (position) {
		return `JSON 解析失败（第 ${Number(position) + 1} 个字符附近）`
	}
	return `JSON 解析失败：${message}`
}
