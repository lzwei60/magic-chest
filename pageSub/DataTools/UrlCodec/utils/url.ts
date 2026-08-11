export type UrlCodecResult = {
	ok: boolean
	value?: string
	error?: string
}

const EMPTY_INPUT_ERROR = '请输入要处理的内容'

export function encodeUrl(input: string): UrlCodecResult {
	if (!input) {
		return { ok: false, error: EMPTY_INPUT_ERROR }
	}

	try {
		return { ok: true, value: encodeURIComponent(input) }
	} catch {
		return { ok: false, error: 'URL 编码失败' }
	}
}

export function decodeUrl(input: string): UrlCodecResult {
	if (!input) {
		return { ok: false, error: EMPTY_INPUT_ERROR }
	}

	try {
		return { ok: true, value: decodeURIComponent(input.replace(/\+/g, ' ')) }
	} catch {
		return { ok: false, error: 'URL 编码格式无效' }
	}
}
