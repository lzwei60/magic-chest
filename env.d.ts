/// <reference types="@dcloudio/types" />

declare module '*.vue' {
	import type { DefineComponent } from 'vue'

	const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
	export default component
}

declare const wx:
	| {
			showShareMenu?: (options: {
				withShareTicket?: boolean
				menus?: Array<'shareAppMessage' | 'shareTimeline'>
			}) => void
			serviceMarket?: {
				invokeService: (options: {
					service: string
					api: string
					data?: Record<string, unknown>
				}) => Promise<{ data?: unknown }>
				CDN: new (options: { type: 'filePath'; filePath: string }) => unknown
			}
	  }
	| undefined
