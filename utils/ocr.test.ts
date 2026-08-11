import { describe, expect, it } from 'vitest'

import {
	collectTextFromOcrPayload,
	DEFAULT_WECHAT_OCR_SERVICE_ID,
	parseBaiduOcrResponse,
	parseCustomApiResponse,
	parseWechatServiceMarketResponse,
	resolveOcrProvider,
	type OcrEnv,
} from './ocr'

const baseEnv: OcrEnv = {
	apiUrl: '',
	wechatServiceId: DEFAULT_WECHAT_OCR_SERVICE_ID,
	hasServiceMarket: false,
	enableWechatServiceMarket: false,
}

describe('ocr provider resolution', () => {
	it('prefers the custom api when configured', () => {
		expect(
			resolveOcrProvider({ ...baseEnv, apiUrl: 'https://ocr.example.com' })
		).toBe('custom-api')
	})

	it('does not use wechat service market by default', () => {
		expect(
			resolveOcrProvider({ ...baseEnv, hasServiceMarket: true })
		).toBeNull()
	})

	it('uses wechat service market only when explicitly enabled', () => {
		expect(
			resolveOcrProvider({
				...baseEnv,
				hasServiceMarket: true,
				enableWechatServiceMarket: true,
			})
		).toBe('wechat-service-market')
	})

	it('returns null when nothing is available', () => {
		expect(resolveOcrProvider(baseEnv)).toBeNull()
	})

	it('does not use service market without a service id', () => {
		expect(
			resolveOcrProvider({
				...baseEnv,
				hasServiceMarket: true,
				wechatServiceId: '',
			})
		).toBeNull()
	})
})

describe('baidu ocr response parsing', () => {
	const successPayload = {
		err_code: 0,
		err_msg: 'ok',
		data: {
			words_result_num: 2,
			words_result: [{ words: '第一行' }, { words: '第二行' }],
		},
	}

	it('joins words with newlines', () => {
		expect(parseBaiduOcrResponse(successPayload)).toBe('第一行\n第二行')
	})

	it('tolerates nested payloads without err_code', () => {
		expect(
			parseBaiduOcrResponse({
				data: { words_result: [{ words: '你好' }] },
			})
		).toBe('你好')
	})

	it('rejects service errors', () => {
		expect(() =>
			parseBaiduOcrResponse({ err_code: 103, err_msg: '服务未开通' })
		).toThrow('OCR 服务调用失败')
	})

	it('rejects empty results', () => {
		expect(() =>
			parseBaiduOcrResponse({ data: { words_result: [] } })
		).toThrow('未识别到文字')
	})

	it('rejects malformed payloads', () => {
		expect(() => parseBaiduOcrResponse(null)).toThrow('返回格式异常')
	})
})

describe('custom api response parsing', () => {
	it('reads top-level text', () => {
		expect(parseCustomApiResponse({ text: '结果' })).toBe('结果')
	})

	it('reads nested data.text', () => {
		expect(parseCustomApiResponse({ data: { text: '结果' } })).toBe('结果')
	})

	it('rejects empty text with server message', () => {
		expect(() =>
			parseCustomApiResponse({ message: '服务异常' })
		).toThrow('服务异常')
	})
})

describe('wechat service market response parsing', () => {
	it('collects ticket text from nested loose payloads', () => {
		const payload = {
			data: {
				items: [
					{ Word: '01 02 03 04 05 06' },
					{ DetectedText: '蓝球 16' },
				],
			},
		}

		expect(collectTextFromOcrPayload(payload)).toEqual([
			'01 02 03 04 05 06',
			'蓝球 16',
		])
		expect(parseWechatServiceMarketResponse(payload, 'lottery-ticket')).toBe(
			'01 02 03 04 05 06\n蓝球 16'
		)
	})

	it('uses strict baidu words_result parsing for general text', () => {
		expect(
			parseWechatServiceMarketResponse(
				{ data: { words_result: [{ words: '通用文字' }] } },
				'general-text'
			)
		).toBe('通用文字')
	})
})
