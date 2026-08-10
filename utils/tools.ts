export type ToolCategoryId =
	| 'daily'
	| 'finance'
	| 'life'
	| 'work'
	| 'data'
	| 'time'

export interface ToolCategory {
	id: ToolCategoryId
	name: string
}

export interface ToolItem {
	id: string
	name: string
	icon: string
	path: string
	category: ToolCategoryId
	hidden?: boolean
}

export const TOOL_CATEGORIES: ToolCategory[] = [
	{ id: 'daily', name: '日常工具' },
	{ id: 'finance', name: '理财工具' },
	{ id: 'life', name: '生活工具' },
	{ id: 'work', name: '工作工具' },
	{ id: 'data', name: '数据工具' },
	{ id: 'time', name: '时间工具' },
]

export const TOOLS: ToolItem[] = [
	{
		id: 'Kingdom',
		name: '金证门禁',
		icon: 'calendar-filled',
		path: '/pageSub/KingdomCore/Kingdom-core',
		category: 'daily',
		hidden: true,
	},
	{
		id: 'calculator',
		name: '计算器',
		icon: 'calendar-filled',
		path: '/pageSub/DailyTools/Calculator/Calculator',
		category: 'daily',
	},
	{
		id: 'unit',
		name: '单位转换器',
		icon: 'refresh',
		path: '/pageSub/DailyTools/UnitConverter/Unit-converter',
		category: 'daily',
	},
	{
		id: 'currency',
		name: '汇率转换器',
		icon: 'refresh',
		path: '/pageSub/DailyTools/CurrencyExchange/Currency-exchange',
		category: 'daily',
	},
	{
		id: 'qrcode',
		name: '二维码生成器',
		icon: 'medal',
		path: '/pageSub/DailyTools/QrcodeGenerator/Qrcode-generator',
		category: 'daily',
	},
	{
		id: 'relative',
		name: '亲戚称呼计算器',
		icon: 'medal',
		path: '/pageSub/DailyTools/RelativeCalculator/Relative-calculator',
		category: 'daily',
	},
	{
		id: 'mortgage',
		name: '房贷计算器',
		icon: 'home',
		path: '/pageSub/FinanceTools/MortgageCalculator/Mortgage-calculator',
		category: 'finance',
	},
	{
		id: 'car',
		name: '车贷计算器',
		icon: 'cart-filled',
		path: '/pageSub/FinanceTools/CarCalculator/Car-calculator',
		category: 'finance',
	},
	{
		id: 'pension',
		name: '养老金计算器',
		icon: 'wallet-filled',
		path: '/pageSub/FinanceTools/PensionCalculator/Pension-calculator',
		category: 'finance',
	},
	{
		id: 'bmi',
		name: 'BMI计算器',
		icon: 'person-filled',
		path: '/pageSub/LifeTools/BMI/BMI',
		category: 'life',
	},
	{
		id: 'pregnancy',
		name: '孕期计算器',
		icon: 'heart-filled',
		path: '/pageSub/LifeTools/PregnancyCalculator/Pregnancy-calculator',
		category: 'life',
	},
	{
		id: 'habit',
		name: '打卡器',
		icon: 'wallet',
		path: '/pageSub/LifeTools/Habit/Habit',
		category: 'life',
	},
	{
		id: 'individual',
		name: '个税计算器',
		icon: 'wallet',
		path: '/pageSub/WorkTools/IndividualCalculator/Individual-calculator',
		category: 'work',
	},
	{
		id: 'retirement',
		name: '退休年龄',
		icon: 'calendar',
		path: '/pageSub/WorkTools/RetirementAge/Retirement-age',
		category: 'work',
	},
	{
		id: 'social',
		name: '社保年限',
		icon: 'medal',
		path: '/pageSub/WorkTools/SocialSecurityPeriod/Social-security-period',
		category: 'work',
	},
	{
		id: 'deduplication',
		name: '文本去重',
		icon: 'compose',
		path: '/pageSub/DataTools/TextDeduplication/Text-deduplication',
		category: 'data',
	},
	{
		id: 'recognition',
		name: '图片文字识别',
		icon: 'compose',
		path: '/pageSub/DataTools/ImageTextRecognition/Image-text-recognition',
		category: 'data',
	},
	{
		id: 'dateCalculation',
		name: '日期计算器',
		icon: 'calendar',
		path: '/pageSub/TimeTools/DateCalculation/Date-calculation',
		category: 'time',
	},
	{
		id: 'timezoneConverter',
		name: '时区转换器',
		icon: 'refreshempty',
		path: '/pageSub/TimeTools/TimezoneConverter/TimezoneConverter',
		category: 'time',
	},
	{
		id: 'countdown',
		name: '倒计时',
		icon: 'notification',
		path: '/pageSub/TimeTools/Countdown/Countdown',
		category: 'time',
	},
]
