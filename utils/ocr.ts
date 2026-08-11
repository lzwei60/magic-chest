export type OcrProvider = 'custom-api' | 'wechat-service-market'
export type OcrFeature = 'general-text' | 'lottery-ticket'

export type OcrEnv = {
	apiUrl: string
	wechatServiceId: string
	hasServiceMarket: boolean
	enableWechatServiceMarket: boolean
}

export type OcrRecognizeOptions = {
	env: OcrEnv
	imagePath: string
	feature: OcrFeature
}

// 微信服务市场固定服务 ID：百度 OCR（通用文字识别）
export const DEFAULT_WECHAT_OCR_SERVICE_ID = 'wx79ac3de8be320b71'

export const OCR_SETUP_GUIDE =
	'当前未配置可用 OCR 通道。\n' +
	'若保持零额外费用，建议暂时不启用图片文字识别。\n' +
	'如后续允许接入服务，可配置自建 OCR 代理接口，或显式开启微信服务市场 OCR。'

// 根据运行环境选择 OCR 通道：优先自建 API，其次微信服务市场
export function resolveOcrProvider(env: OcrEnv): OcrProvider | null {
	if (env.apiUrl.trim()) {
		return 'custom-api'
	}
	if (
		env.enableWechatServiceMarket &&
		env.hasServiceMarket &&
		env.wechatServiceId.trim()
	) {
		return 'wechat-service-market'
	}
	return null
}

export function createOcrEnv(readEnv: (key: string) => string): OcrEnv {
	const readBooleanEnv = (key: string) => readEnv(key).toLowerCase() === 'true'

	return {
		apiUrl: readEnv('VUE_APP_OCR_API_URL'),
		wechatServiceId:
			readEnv('VUE_APP_WECHAT_OCR_SERVICE_ID') || DEFAULT_WECHAT_OCR_SERVICE_ID,
		hasServiceMarket: typeof wx !== 'undefined' && Boolean(wx.serviceMarket),
		enableWechatServiceMarket: readBooleanEnv('VUE_APP_ENABLE_WECHAT_OCR'),
	}
}

export async function recognizeImageText(
	options: OcrRecognizeOptions
): Promise<string> {
	const provider = resolveOcrProvider(options.env)
	if (!provider) {
		throw new Error('OCR 服务未配置')
	}

	return provider === 'custom-api'
		? recognizeWithCustomApi(options)
		: recognizeWithWechatServiceMarket(options)
}

// 解析微信服务市场（百度 OCR）返回结果，多行文本用换行拼接
export function parseBaiduOcrResponse(payload: unknown): string {
	if (!payload || typeof payload !== 'object') {
		throw new Error('OCR 服务返回格式异常')
	}

	const body = payload as Record<string, unknown>
	if (body.err_code !== undefined && body.err_code !== 0) {
		throw new Error(`OCR 服务调用失败：${String(body.err_msg || body.err_code)}`)
	}

	const data = (body.data ?? body) as Record<string, unknown> | undefined
	const wordsResult = data?.words_result
	if (!Array.isArray(wordsResult)) {
		throw new Error('未识别到文字')
	}

	const lines = wordsResult
		.map((item) => {
			if (!item || typeof item !== 'object') return ''
			return String((item as Record<string, unknown>).words ?? '')
		})
		.filter((line) => line.trim())

	if (lines.length === 0) {
		throw new Error('未识别到文字')
	}
	return lines.join('\n')
}

export function collectTextFromOcrPayload(payload: unknown): string[] {
	if (!payload) return []

	if (typeof payload === 'string') {
		try {
			return collectTextFromOcrPayload(JSON.parse(payload))
		} catch {
			return [payload]
		}
	}

	if (Array.isArray(payload)) {
		return payload.flatMap(collectTextFromOcrPayload)
	}

	if (typeof payload === 'object') {
		const record = payload as Record<string, unknown>
		const textKeys = ['text', 'DetectedText', 'Word', 'words']
		const directText = textKeys.flatMap((key) => {
			const value = record[key]
			return typeof value === 'string' ? [value] : []
		})

		return [
			...directText,
			...Object.entries(record)
				.filter(([key]) => !textKeys.includes(key))
				.flatMap(([, value]) => collectTextFromOcrPayload(value)),
		]
	}

	return []
}

export function parseWechatServiceMarketResponse(
	payload: unknown,
	feature: OcrFeature
): string {
	if (feature === 'general-text') {
		return parseBaiduOcrResponse(payload)
	}

	const text = collectTextFromOcrPayload(payload).join('\n').trim()
	if (!text) {
		throw new Error('OCR未返回可用文本')
	}
	return text
}

// 解析自建 API 返回结果，兼容 { text } 与 { data: { text } } 两种结构
export function parseCustomApiResponse(payload: unknown): string {
	if (!payload || typeof payload !== 'object') {
		throw new Error('OCR 服务返回格式异常')
	}

	const body = payload as Record<string, unknown>
	const data = (body.data ?? body) as Record<string, unknown>
	const text = data?.text

	if (typeof text !== 'string' || !text.trim()) {
		throw new Error(String(body.message || '未识别到文字'))
	}
	return text
}

// 读取本地图片为 base64（不含 data:image 前缀），供自建 API 通道使用
export function readImageAsBase64(imagePath: string): Promise<string> {
	const fsManager = uni.getFileSystemManager?.()
	if (fsManager) {
		return new Promise((resolve, reject) => {
			fsManager.readFile({
				filePath: imagePath,
				encoding: 'base64',
				success: (res) => resolve(String(res.data)),
				fail: () => reject(new Error('读取图片失败')),
			})
		})
	}

	if (typeof FileReader !== 'undefined' && typeof fetch !== 'undefined') {
		return readImageAsBase64ByFileReader(imagePath)
	}

	return Promise.reject(new Error('当前平台不支持读取本地图片'))
}

function readImageAsBase64ByFileReader(imagePath: string): Promise<string> {
	return new Promise((resolve, reject) => {
		fetch(imagePath)
			.then((response) => {
				if (!response.ok) {
					throw new Error('读取图片失败')
				}
				return response.blob()
			})
			.then((blob) => {
				const reader = new FileReader()
				reader.onload = () => {
					const result = String(reader.result || '')
					resolve(result.includes(',') ? result.split(',')[1] : result)
				}
				reader.onerror = () => reject(new Error('读取图片失败'))
				reader.readAsDataURL(blob)
			})
			.catch(() => reject(new Error('读取图片失败')))
	})
}

async function recognizeWithCustomApi(
	options: OcrRecognizeOptions
): Promise<string> {
	const base64 = await readImageAsBase64(options.imagePath)
	const response = await requestCustomApi(options.env.apiUrl, base64)
	if (response.statusCode !== 200) {
		const body = response.data as Record<string, unknown> | undefined
		throw new Error(
			String(body?.message || `服务返回错误（${response.statusCode}）`)
		)
	}
	return parseCustomApiResponse(response.data)
}

function requestCustomApi(apiUrl: string, base64: string) {
	return new Promise<{ statusCode: number; data: unknown }>((resolve, reject) => {
		uni.request({
			url: apiUrl,
			method: 'POST',
			header: {
				'Content-Type': 'application/json',
			},
			data: {
				image: base64,
				type: 'general',
			},
			timeout: 30000,
			success: (apiRes) => {
				resolve({ statusCode: apiRes.statusCode, data: apiRes.data })
			},
			fail: (err) => {
				reject(new Error(err.errMsg || '网络请求失败'))
			},
		})
	})
}

async function recognizeWithWechatServiceMarket(
	options: OcrRecognizeOptions
): Promise<string> {
	if (!wx?.serviceMarket) {
		throw new Error('当前环境不支持微信服务市场')
	}

	try {
		const response = await wx.serviceMarket.invokeService({
			service: options.env.wechatServiceId,
			api: 'OcrAllInOne',
			data: {
				img_url: new wx.serviceMarket.CDN({
					type: 'filePath',
					filePath: options.imagePath,
				}),
				data_type: 3,
				ocr_type: getWechatOcrType(options.feature),
			},
		})
		return parseWechatServiceMarketResponse(response.data ?? response, options.feature)
	} catch (error) {
		if (error instanceof Error && /未识别到文字|格式异常|OCR未返回/.test(error.message)) {
			throw error
		}
		throw new Error(
			'OCR 调用失败，请确认小程序后台已开通「云开发-服务平台」并启用百度 OCR'
		)
	}
}

function getWechatOcrType(feature: OcrFeature): number {
	return feature === 'lottery-ticket' ? 8 : 1
}
