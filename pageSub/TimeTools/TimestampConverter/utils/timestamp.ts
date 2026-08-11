export type TimestampUnit = 'second' | 'millisecond'

export type TimestampParseResult = {
	ok: boolean
	value?: Date
	unit?: TimestampUnit
	error?: string
}

export function parseTimestamp(input: string): TimestampParseResult {
	const normalized = input.trim()
	if (!normalized) {
		return { ok: false, error: '请输入时间戳' }
	}

	if (!/^-?\d+$/u.test(normalized)) {
		return { ok: false, error: '时间戳只能包含整数' }
	}

	const value = Number(normalized)
	if (!Number.isSafeInteger(value)) {
		return { ok: false, error: '时间戳超出安全整数范围' }
	}

	const unit: TimestampUnit = Math.abs(value) < 100000000000 ? 'second' : 'millisecond'
	const date = new Date(unit === 'second' ? value * 1000 : value)

	if (Number.isNaN(date.getTime())) {
		return { ok: false, error: '时间戳无法转换为有效日期' }
	}

	return { ok: true, value: date, unit }
}

export function dateToTimestamp(date: Date): {
	seconds: number
	milliseconds: number
} {
	const milliseconds = date.getTime()
	return {
		seconds: Math.floor(milliseconds / 1000),
		milliseconds,
	}
}

export function formatDateTime(date: Date): string {
	const pad = (value: number) => String(value).padStart(2, '0')
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
		date.getHours()
	)}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}
