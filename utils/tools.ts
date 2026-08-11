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
		id: 'doubleColorBall',
		name: '双色球中奖查询',
		icon: 'gift',
		path: '/pageSub/DailyTools/DoubleColorBall/Double-color-ball',
		category: 'daily',
	},
	{
		id: 'passwordGenerator',
		name: '密码生成器',
		icon: 'locked',
		path: '/pageSub/DailyTools/PasswordGenerator/Password-generator',
		category: 'daily',
	},
	{
		id: 'randomGenerator',
		name: '随机生成器',
		icon: 'refresh',
		path: '/pageSub/DailyTools/RandomGenerator/Random-generator',
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
		id: 'bonusTax',
		name: '年终奖个税',
		icon: 'wallet',
		path: '/pageSub/FinanceTools/BonusTaxCalculator/Bonus-tax-calculator',
		category: 'finance',
	},
	{
		id: 'amountChinese',
		name: '金额大写转换器',
		icon: 'wallet',
		path: '/pageSub/FinanceTools/AmountChinese/Amount-chinese',
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
		id: 'idCardValidator',
		name: '身份证校验器',
		icon: 'person',
		path: '/pageSub/WorkTools/IdCardValidator/Id-card-validator',
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
		id: 'jsonFormatter',
		name: 'JSON格式化',
		icon: 'tune',
		path: '/pageSub/DataTools/JsonFormatter/Json-formatter',
		category: 'data',
	},
	{
		id: 'textCounter',
		name: '文本统计器',
		icon: 'list',
		path: '/pageSub/DataTools/TextCounter/Text-counter',
		category: 'data',
	},
	{
		id: 'base64Codec',
		name: 'Base64编解码',
		icon: 'paperclip',
		path: '/pageSub/DataTools/Base64Codec/Base64-codec',
		category: 'data',
	},
	{
		id: 'urlCodec',
		name: 'URL编解码',
		icon: 'link',
		path: '/pageSub/DataTools/UrlCodec/Url-codec',
		category: 'data',
	},
	{
		id: 'caseConverter',
		name: '大小写转换器',
		icon: 'compose',
		path: '/pageSub/DataTools/CaseConverter/Case-converter',
		category: 'data',
	},
	{
		id: 'colorConverter',
		name: '颜色转换器',
		icon: 'color',
		path: '/pageSub/DataTools/ColorConverter/Color-converter',
		category: 'data',
	},
	{
		id: 'baseConverter',
		name: '进制转换器',
		icon: 'tune',
		path: '/pageSub/DataTools/BaseConverter/Base-converter',
		category: 'data',
	},
	{
		id: 'regexTester',
		name: '正则测试器',
		icon: 'search',
		path: '/pageSub/DataTools/RegexTester/Regex-tester',
		category: 'data',
	},
	{
		id: 'jsonToTypes',
		name: 'JSON转TS类型',
		icon: 'compose',
		path: '/pageSub/DataTools/JsonToTypes/Json-to-types',
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
	{
		id: 'timestampConverter',
		name: '时间戳转换器',
		icon: 'calendar',
		path: '/pageSub/TimeTools/TimestampConverter/Timestamp-converter',
		category: 'time',
	},
]
