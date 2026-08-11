export type DoubleColorBallNumbers = {
	reds: number[]
	blue: number
}

export type PrizeLevel =
	| 'first'
	| 'second'
	| 'third'
	| 'fourth'
	| 'fifth'
	| 'sixth'
	| 'fortune'
	| 'none'

export type CheckResult = {
	index: number
	ticket: DoubleColorBallNumbers
	redMatches: number
	blueMatched: boolean
	level: PrizeLevel
	levelName: string
	prizeText: string
	fixedPrize: number
}

export type CwlDrawNotice = {
	code: string
	date: string
	red: string
	blue: string
}

export type DrawInfo = {
	issue: string
	date: string
	numbers: DoubleColorBallNumbers
	display: string
}

const RED_MIN = 1
const RED_MAX = 33
const BLUE_MIN = 1
const BLUE_MAX = 16
const RED_COUNT = 6

const PRIZE_META: Record<
	PrizeLevel,
	{
		name: string
		prizeText: string
		fixedPrize: number
	}
> = {
	first: { name: '一等奖', prizeText: '浮动奖金，最高封顶500万元', fixedPrize: 0 },
	second: { name: '二等奖', prizeText: '浮动奖金，最高封顶500万元', fixedPrize: 0 },
	third: { name: '三等奖', prizeText: '3000元', fixedPrize: 3000 },
	fourth: { name: '四等奖', prizeText: '200元', fixedPrize: 200 },
	fifth: { name: '五等奖', prizeText: '10元', fixedPrize: 10 },
	sixth: { name: '六等奖', prizeText: '5元', fixedPrize: 5 },
	fortune: { name: '福运奖', prizeText: '5元', fixedPrize: 5 },
	none: { name: '未中奖', prizeText: '0元', fixedPrize: 0 },
}

export function formatBall(value: number) {
	return String(value).padStart(2, '0')
}

export function formatNumbers(numbers: DoubleColorBallNumbers) {
	return `${numbers.reds.map(formatBall).join(' ')} + ${formatBall(numbers.blue)}`
}

function normalizeLine(input: string) {
	return input
		.replace(/[＋+|/\\，,;；、]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
}

export function parseNumbers(input: string): DoubleColorBallNumbers {
	const normalized = normalizeLine(input)
	const values = normalized
		.split(' ')
		.filter(Boolean)
		.map((item) => Number(item))

	if (values.length !== RED_COUNT + 1 || values.some((value) => !Number.isInteger(value))) {
		throw new Error('请输入6个红球和1个蓝球')
	}

	const reds = values.slice(0, RED_COUNT)
	const blue = values[RED_COUNT]
	const uniqueReds = new Set(reds)

	if (uniqueReds.size !== RED_COUNT) {
		throw new Error('红球号码不能重复')
	}

	if (reds.some((value) => value < RED_MIN || value > RED_MAX)) {
		throw new Error('红球范围为01-33')
	}

	if (blue < BLUE_MIN || blue > BLUE_MAX) {
		throw new Error('蓝球范围为01-16')
	}

	return {
		reds: [...reds].sort((a, b) => a - b),
		blue,
	}
}

export function parseTicketLines(input: string) {
	return input
		.split(/\n+/)
		.map((line) => line.trim())
		.filter(Boolean)
		.map((line) => parseNumbers(line))
}

function pushUniqueTicket(
	tickets: DoubleColorBallNumbers[],
	ticket: DoubleColorBallNumbers
) {
	const ticketKey = formatNumbers(ticket)
	if (!tickets.some((item) => formatNumbers(item) === ticketKey)) {
		tickets.push(ticket)
	}
}

function parseTicketCandidate(input: string) {
	const values = String(input || '').match(/\d{1,2}/g) ?? []
	if (values.length < RED_COUNT + 1) return null

	for (let index = 0; index <= values.length - (RED_COUNT + 1); index += 1) {
		try {
			return parseNumbers(values.slice(index, index + RED_COUNT + 1).join(' '))
		} catch {
			// 单行 OCR 可能夹杂倍数、序号等噪声，继续尝试下一组连续号码。
		}
	}

	return null
}

function parseFragmentedTicketCandidate(input: string) {
	const values = String(input || '').match(/\d{1,2}/g) ?? []
	// 微信 OCR 会把同一张票的局部文本重复返回，相邻去重后再组装号码。
	const dedupedValues = values.filter((value, index) => value !== values[index - 1])

	if (dedupedValues.length < RED_COUNT + 1) return null

	for (let length = RED_COUNT + 1; length <= dedupedValues.length; length += 1) {
		const candidate = parseTicketCandidate(dedupedValues.slice(0, length).join(' '))
		if (candidate) return candidate
	}

	return null
}

export function parseTicketsFromQrText(input: string) {
	const text = String(input || '')
	const tickets: DoubleColorBallNumbers[] = []
	const isUrlPayload = /^https?:\/\//i.test(text.trim())
	// 票面 OCR 常把 A-E 每注拆成多行，必须先按注标记分组，避免单行正则漏掉碎片号码。
	const fragmentedRowPattern =
		/(?:^|[\n\r])\s*[A-Z][.、:]?([\s\S]*?)(?=(?:[\n\r]\s*[A-Z][.、:]?)|开奖期|销售期|合计|$)/gi

	for (const match of text.matchAll(fragmentedRowPattern)) {
		const ticket = parseFragmentedTicketCandidate(match[1])
		if (ticket) {
			pushUniqueTicket(tickets, ticket)
		}
	}

	if (tickets.length > 0) return tickets

	const rowPattern =
		/(?:^|[\n\r])\s*[A-Z][.、:]?\s*([^\n\r]*?\d{1,2}[^\n\r]*?\d{1,2}[^\n\r]*?\d{1,2}[^\n\r]*?\d{1,2}[^\n\r]*?\d{1,2}[^\n\r]*?\d{1,2}[^\n\r]*?\d{1,2}[^\n\r]*)/gi

	for (const match of text.matchAll(rowPattern)) {
		const ticket = parseTicketCandidate(match[1])
		if (ticket) {
			pushUniqueTicket(tickets, ticket)
		}
	}

	if (tickets.length > 0) return tickets

	const linePattern =
		/(?:^|[\n\r])?\s*[A-Z]?[.、:]?\s*(\d{1,2}[\s,，、;；]+\d{1,2}[\s,，、;；]+\d{1,2}[\s,，、;；]+\d{1,2}[\s,，、;；]+\d{1,2}[\s,，、;；]+\d{1,2})\s*[+＋|]\s*(\d{1,2})/gi

	for (const match of text.matchAll(linePattern)) {
		try {
			pushUniqueTicket(tickets, parseNumbers(`${match[1]} ${match[2]}`))
		} catch {
			// 票面文本可能包含识别噪声，跳过非法行。
		}
	}

	if (tickets.length > 0) return tickets

	if (isUrlPayload) return []
	if (!/[+＋]/.test(text)) return []

	const values = text.match(/\d{1,2}/g) ?? []
	for (let index = 0; index <= values.length - (RED_COUNT + 1); index += 1) {
		try {
			pushUniqueTicket(
				tickets,
				parseNumbers(values.slice(index, index + RED_COUNT + 1).join(' '))
			)
		} catch {
			// 二维码格式不统一，无法组成合法一注时继续尝试下一组。
		}
	}

	return tickets
}

export function parseTicketBetCount(input: string) {
	const text = String(input || '')
	const countMatch = text.match(/(?:单式|复式|胆拖|投注|合计|共)?\s*(\d{1,2})\s*注/)
	if (!countMatch?.[1]) return 0

	const count = Number(countMatch[1])
	return Number.isInteger(count) && count > 0 ? count : 0
}

export function parseTicketIssue(input: string) {
	const text = String(input || '')
		.replace(/[：:]/g, ':')
		.replace(/\s+/g, ' ')
		.trim()

	const issueMatch = text.match(/开奖\s*期\s*:?\s*(\d{7})/)
	if (issueMatch?.[1]) return issueMatch[1]

	const fallbackMatch = text.match(/(?:^|[^\d])((?:20)?\d{5})(?:[^\d]|$)/)
	const issue = fallbackMatch?.[1] || ''
	return issue.length === 5 ? `20${issue}` : issue
}

export function parseDrawNotice(notice: CwlDrawNotice): DrawInfo {
	const numbers = parseNumbers(`${notice.red} ${notice.blue}`)

	return {
		issue: String(notice.code || ''),
		date: String(notice.date || ''),
		numbers,
		display: `${notice.code}期 ${notice.date} ${formatNumbers(numbers)}`,
	}
}

export function buildCwlDrawNoticeUrl(options: {
	issueCount?: number
	issueStart?: string
	issueEnd?: string
	dayStart?: string
	dayEnd?: string
	pageSize?: number
}) {
	const issueStart = options.issueStart ?? ''
	const issueEnd = options.issueEnd ?? ''
	const issueCount = issueStart || issueEnd ? '' : String(options.issueCount ?? 1)
	const pageSize = options.pageSize ?? Math.max(Number(issueCount) || 1, 1)
	const params = [
		['name', 'ssq'],
		['issueCount', issueCount],
		['issueStart', issueStart],
		['issueEnd', issueEnd],
		['dayStart', options.dayStart ?? ''],
		['dayEnd', options.dayEnd ?? ''],
		['pageNo', '1'],
		['pageSize', String(pageSize)],
		['systemType', 'PC'],
	]

	return `https://www.cwl.gov.cn/cwl_admin/front/cwlkj/search/kjxx/findDrawNotice?${params
		.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
		.join('&')}`
}

export function getPrizeLevel(
	redMatches: number,
	blueMatched: boolean,
	enableFortunePrize = false
): PrizeLevel {
	if (redMatches === 6 && blueMatched) return 'first'
	if (redMatches === 6) return 'second'
	if (redMatches === 5 && blueMatched) return 'third'
	if (redMatches === 5 || (redMatches === 4 && blueMatched)) return 'fourth'
	if (redMatches === 4 || (redMatches === 3 && blueMatched)) return 'fifth'
	if (blueMatched) return 'sixth'
	if (enableFortunePrize && redMatches === 3) return 'fortune'
	return 'none'
}

export function checkTicket(
	draw: DoubleColorBallNumbers,
	ticket: DoubleColorBallNumbers,
	index = 0,
	enableFortunePrize = false
): CheckResult {
	const drawRedSet = new Set(draw.reds)
	const redMatches = ticket.reds.filter((red) => drawRedSet.has(red)).length
	const blueMatched = ticket.blue === draw.blue
	const level = getPrizeLevel(redMatches, blueMatched, enableFortunePrize)
	const meta = PRIZE_META[level]

	return {
		index,
		ticket,
		redMatches,
		blueMatched,
		level,
		levelName: meta.name,
		prizeText: meta.prizeText,
		fixedPrize: meta.fixedPrize,
	}
}

export function summarizeResults(results: CheckResult[]) {
	return results.reduce(
		(summary, result) => {
			summary.total += 1
			if (result.level !== 'none') {
				summary.winning += 1
			}
			if (result.fixedPrize > 0) {
				summary.fixedPrize += result.fixedPrize
			}
			if (result.level === 'first' || result.level === 'second') {
				summary.floating += 1
			}
			return summary
		},
		{
			total: 0,
			winning: 0,
			fixedPrize: 0,
			floating: 0,
		}
	)
}
