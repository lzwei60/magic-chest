import { describe, expect, it } from 'vitest'

import {
	buildCwlDrawNoticeUrl,
	checkTicket,
	formatNumbers,
	parseDrawNotice,
	parseNumbers,
	parseTicketBetCount,
	parseTicketIssue,
	parseTicketsFromQrText,
	parseTicketLines,
} from './check'

const draw = parseNumbers('01 02 03 04 05 06 07')

describe('double color ball checker', () => {
	it('parses red balls and blue ball with common separators', () => {
		expect(parseNumbers('06,05,04,03,02,01 + 07')).toEqual(draw)
	})

	it('rejects invalid tickets', () => {
		expect(() => parseNumbers('01 01 03 04 05 06 07')).toThrow('红球号码不能重复')
		expect(() => parseNumbers('01 02 03 04 05 34 07')).toThrow('红球范围为01-33')
		expect(() => parseNumbers('01 02 03 04 05 06 17')).toThrow('蓝球范围为01-16')
	})

	it('detects standard prize levels', () => {
		expect(checkTicket(draw, parseNumbers('01 02 03 04 05 06 07')).level).toBe('first')
		expect(checkTicket(draw, parseNumbers('01 02 03 04 05 06 08')).level).toBe('second')
		expect(checkTicket(draw, parseNumbers('01 02 03 04 05 08 07')).level).toBe('third')
		expect(checkTicket(draw, parseNumbers('01 02 03 04 08 09 07')).level).toBe('fourth')
		expect(checkTicket(draw, parseNumbers('01 02 03 08 09 10 07')).level).toBe('fifth')
		expect(checkTicket(draw, parseNumbers('08 09 10 11 12 13 07')).level).toBe('sixth')
		expect(checkTicket(draw, parseNumbers('08 09 10 11 12 13 08')).level).toBe('none')
	})

	it('only enables fortune prize when the special rule switch is on', () => {
		const ticket = parseNumbers('01 02 03 08 09 10 08')

		expect(checkTicket(draw, ticket, 0, false).level).toBe('none')
		expect(checkTicket(draw, ticket, 0, true).level).toBe('fortune')
	})

	it('parses multiple tickets line by line', () => {
		expect(
			parseTicketLines('01 02 03 04 05 06 07\n08 09 10 11 12 13 07')
		).toHaveLength(2)
	})

	it('extracts ticket numbers from scanned qr text', () => {
		expect(parseTicketsFromQrText('SSQ:01,02,03,04,05,06|07')).toEqual([draw])
		expect(parseTicketsFromQrText('2026091;01 02 03 04 05 06+07')).toEqual([draw])
		expect(parseTicketsFromQrText('2026091;01,02,03,04,05,06,07')).toEqual([])
		expect(parseTicketsFromQrText('ticket id 83802141 14880446')).toEqual([])
		expect(
			parseTicketsFromQrText(
				'http://B001.url.cn/?code=6bu7V6Zl/A9E9V4MQz66X1SAotIioYP8m7K23sOy54bs8HYVIw0V504/dBS2qv1lDdHLwsF+buTM3hPgYLS9XbfEO1Zm63zN'
			)
		).toEqual([])
	})

	it('extracts ticket numbers from lottery ticket face text', () => {
		const tickets = parseTicketsFromQrText(`
开奖期:2025111 25-09-25
A. 04 08 10 14 24 30+12 x1
B. 01 04 08 09 12 29+12 x1
C. 03 05 06 12 23 25+02 x1
D. 09 11 13 23 24 31+10 x1
E. 03 08 10 15 24 29+06 x1
`)

		expect(tickets.map((ticket) => ticket.blue)).toEqual([12, 12, 2, 10, 6])
		expect(tickets).toHaveLength(5)
		expect(parseTicketsFromQrText('not a lottery qr')).toEqual([])
	})

	it('extracts ticket numbers when ocr drops plus signs in labeled rows', () => {
		const tickets = parseTicketsFromQrText(`
A 04 08 10 14 24 30 12 x1
B 01 04 08 09 12 29 12 x1
C 03 05 06 12 23 25 02 x1
D 09 11 13 23 24 31+10 x1
E 03 08 10 15 24 29 06 x1
`)

		expect(tickets.map(formatNumbers)).toEqual([
			'04 08 10 14 24 30 + 12',
			'01 04 08 09 12 29 + 12',
			'03 05 06 12 23 25 + 02',
			'09 11 13 23 24 31 + 10',
			'03 08 10 15 24 29 + 06',
		])
	})

	it('extracts ticket numbers from fragmented duplicated ocr lines', () => {
		const tickets = parseTicketsFromQrText(`
玩法:双色球-单式
83802141
A.04 08
A.04 08
10
14
24
30+12
30+12
x1
x1
B.01 04
B.01 04
08
08
09
09
12
29+12
29+12
x1
x1
C.03
C.03
05
05
06
06
12
23
25+02
25+02
x1
x1
D.09 11
D.09 11
13
23
24
31+10
31+10
x1
x1
E.03 08 10 15
E.03 08 10 15
24
29+06 x1
29+06 x1
开奖期:2025111 25-09-25
合计:10元
`)

		expect(tickets.map(formatNumbers)).toEqual([
			'04 08 10 14 24 30 + 12',
			'01 04 08 09 12 29 + 12',
			'03 05 06 12 23 25 + 02',
			'09 11 13 23 24 31 + 10',
			'03 08 10 15 24 29 + 06',
		])
	})

	it('extracts ticket bet count from ticket face text', () => {
		expect(parseTicketBetCount('单式 5注 10元')).toBe(5)
		expect(parseTicketBetCount('合计 10 注')).toBe(10)
		expect(parseTicketBetCount('not a lottery ticket')).toBe(0)
	})

	it('extracts draw issue from lottery ticket face text', () => {
		expect(parseTicketIssue('开奖期:2025111 25-09-25')).toBe('2025111')
		expect(parseTicketIssue('开奖 期 2025111')).toBe('2025111')
		expect(parseTicketIssue('not a lottery ticket')).toBe('')
	})

	it('builds cwl draw notice query url', () => {
		const url = buildCwlDrawNoticeUrl({
			issueCount: 30,
			dayStart: '2026-08-01',
			dayEnd: '2026-08-10',
		})

		expect(url).toContain('name=ssq')
		expect(url).toContain('issueCount=30')
		expect(url).toContain('dayStart=2026-08-01')
		expect(url).toContain('dayEnd=2026-08-10')
	})

	it('builds cwl draw notice query url by issue', () => {
		const url = buildCwlDrawNoticeUrl({
			issueStart: '2025111',
			issueEnd: '2025111',
			pageSize: 1,
		})

		expect(url).toContain('issueCount=')
		expect(url).toContain('issueStart=2025111')
		expect(url).toContain('issueEnd=2025111')
		expect(url).toContain('pageSize=1')
	})

	it('normalizes draw notice payload', () => {
		expect(
			parseDrawNotice({
				code: '2026090',
				date: '2026-08-09',
				red: '01,02,03,04,05,06',
				blue: '07',
			})
		).toMatchObject({
			issue: '2026090',
			date: '2026-08-09',
			numbers: draw,
		})
	})
})
