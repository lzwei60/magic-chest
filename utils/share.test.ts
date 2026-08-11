import { describe, expect, it } from 'vitest'

import { buildShareTarget } from './share'

describe('share utils', () => {
	it('builds default app share target', () => {
		expect(buildShareTarget({ route: 'pages/index/index' })).toMatchObject({
			title: '帮帮小工具',
			path: '/pages/index/index',
			query: '',
			imageUrl: '/static/logo.png',
		})
	})

	it('builds tool page share target', () => {
		expect(
			buildShareTarget({
				route: 'pageSub/DailyTools/DoubleColorBall/Double-color-ball',
			})
		).toMatchObject({
			title: '双色球中奖查询 - 帮帮小工具',
			path: '/pageSub/DailyTools/DoubleColorBall/Double-color-ball',
		})
	})

	it('keeps page query in share path and timeline query', () => {
		expect(
			buildShareTarget({
				route: '/pageSub/DailyTools/Calculator/Calculator',
				options: {
					source: 'favorite',
					empty: '',
				},
			})
		).toMatchObject({
			title: '计算器 - 帮帮小工具',
			path: '/pageSub/DailyTools/Calculator/Calculator?source=favorite',
			query: 'source=favorite',
		})
	})
})
