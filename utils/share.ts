import { TOOLS } from './tools'

type RoutePage = {
	route?: string
	options?: Record<string, string | number | boolean | undefined>
}

export type ShareTarget = {
	title: string
	path: string
	query: string
	imageUrl: string
}

const APP_NAME = '帮帮小工具'
const DEFAULT_SHARE_IMAGE = '/static/logo.png'

const normalizeRoute = (route = 'pages/index/index') => {
	return route.startsWith('/') ? route.slice(1) : route
}

const stringifyQuery = (options: RoutePage['options'] = {}) => {
	return Object.entries(options)
		.filter(([, value]) => value !== undefined && value !== '')
		.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
		.join('&')
}

const getCurrentPage = (): RoutePage | null => {
	const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : []
	return (pages[pages.length - 1] as RoutePage | undefined) || null
}

export const buildShareTarget = (page: RoutePage | null = getCurrentPage()): ShareTarget => {
	const route = normalizeRoute(page?.route)
	const query = stringifyQuery(page?.options)
	const tool = TOOLS.find((item) => normalizeRoute(item.path) === route)
	const title = tool ? `${tool.name} - ${APP_NAME}` : APP_NAME
	const path = `/${route}${query ? `?${query}` : ''}`

	return {
		title,
		path,
		query,
		imageUrl: DEFAULT_SHARE_IMAGE,
	}
}

export const createShareMixin = () => ({
	onShow() {
		// 微信小程序需要显式打开右上角菜单，朋友圈入口才会出现在分享面板中。
		if (typeof wx !== 'undefined' && wx.showShareMenu) {
			wx.showShareMenu({
				withShareTicket: true,
				menus: ['shareAppMessage', 'shareTimeline'],
			})
		}
	},
	onShareAppMessage() {
		const target = buildShareTarget()

		return {
			title: target.title,
			path: target.path,
			imageUrl: target.imageUrl,
		}
	},
	onShareTimeline() {
		const target = buildShareTarget()

		return {
			title: target.title,
			query: target.query,
			imageUrl: target.imageUrl,
		}
	},
})
