export type AmountChineseResult = {
	ok: boolean
	value?: string
	error?: string
}

const DIGITS = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
const UNITS = ['', '拾', '佰', '仟']
const BIG_UNITS = ['', '万', '亿']

export function amountToChinese(input: string): AmountChineseResult {
	const normalized = input.trim().replace(/,/g, '')
	if (!normalized) {
		return { ok: false, error: '请输入金额' }
	}
	if (!/^\d+(\.\d{1,2})?$/u.test(normalized)) {
		return { ok: false, error: '金额格式无效，最多支持两位小数' }
	}

	const [integerPart, decimalPart = ''] = normalized.split('.')
	if (integerPart.length > 12) {
		return { ok: false, error: '金额过大，暂支持到千亿级' }
	}

	const integerText = convertIntegerPart(integerPart)
	const decimalText = convertDecimalPart(decimalPart)

	if (integerText === '零' && !decimalText) {
		return { ok: true, value: '零元整' }
	}

	return {
		ok: true,
		value: `${integerText === '零' ? '' : `${integerText}元`}${decimalText || '整'}`,
	}
}

function convertIntegerPart(input: string): string {
	const value = input.replace(/^0+/u, '') || '0'
	if (value === '0') return '零'

	const groups: string[] = []
	for (let end = value.length; end > 0; end -= 4) {
		groups.unshift(value.slice(Math.max(0, end - 4), end))
	}

	let output = ''
	let pendingZero = false
	groups.forEach((group, index) => {
		const groupValue = Number(group)
		const unit = BIG_UNITS[groups.length - index - 1]
		if (groupValue === 0) {
			pendingZero = output.length > 0
			return
		}

		if (pendingZero || (output && group.length < 4)) {
			output += '零'
		}

		output += `${convertFourDigits(group)}${unit}`
		pendingZero = false
	})

	return output
}

function convertFourDigits(input: string): string {
	const padded = input.padStart(4, '0')
	let output = ''
	let pendingZero = false

	for (let index = 0; index < padded.length; index += 1) {
		const digit = Number(padded[index])
		const unit = UNITS[padded.length - index - 1]

		if (digit === 0) {
			pendingZero = output.length > 0
			continue
		}

		if (pendingZero) {
			output += '零'
		}
		output += `${DIGITS[digit]}${unit}`
		pendingZero = false
	}

	return output
}

function convertDecimalPart(input: string): string {
	const [jiao = '0', fen = '0'] = input.padEnd(2, '0')
	const jiaoValue = Number(jiao)
	const fenValue = Number(fen)

	if (jiaoValue === 0 && fenValue === 0) return ''
	if (jiaoValue === 0) return `零${DIGITS[fenValue]}分`
	if (fenValue === 0) return `${DIGITS[jiaoValue]}角`
	return `${DIGITS[jiaoValue]}角${DIGITS[fenValue]}分`
}
