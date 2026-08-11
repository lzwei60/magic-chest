export type IdCardInfo = {
	valid: boolean
	normalized: string
	birthday?: string
	age?: number
	gender?: 'male' | 'female'
	error?: string
}

const WEIGHTS = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
const CHECK_CODES = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']

export function validateIdCard(input: string, now = new Date()): IdCardInfo {
	const normalized = input.trim().toUpperCase()
	if (!/^\d{17}[\dX]$/u.test(normalized)) {
		return { valid: false, normalized, error: '身份证号码应为 18 位' }
	}

	const birthday = `${normalized.slice(6, 10)}-${normalized.slice(10, 12)}-${normalized.slice(12, 14)}`
	if (!isValidBirthday(birthday, now)) {
		return { valid: false, normalized, error: '出生日期无效' }
	}

	const expectedCheckCode = calculateCheckCode(normalized.slice(0, 17))
	if (normalized[17] !== expectedCheckCode) {
		return { valid: false, normalized, error: `校验位应为 ${expectedCheckCode}` }
	}

	return {
		valid: true,
		normalized,
		birthday,
		age: calculateAge(birthday, now),
		gender: Number(normalized[16]) % 2 === 1 ? 'male' : 'female',
	}
}

export function calculateCheckCode(first17Digits: string): string {
	const sum = first17Digits
		.split('')
		.reduce((total, digit, index) => total + Number(digit) * WEIGHTS[index], 0)
	return CHECK_CODES[sum % 11]
}

function isValidBirthday(birthday: string, now: Date): boolean {
	const [year, month, day] = birthday.split('-').map(Number)
	const date = new Date(year, month - 1, day)
	return (
		!Number.isNaN(date.getTime()) &&
		date.getFullYear() === year &&
		date.getMonth() === month - 1 &&
		date.getDate() === day &&
		date.getTime() <= now.getTime()
	)
}

function calculateAge(birthday: string, now: Date): number {
	const [year, month, day] = birthday.split('-').map(Number)
	const birthDate = new Date(year, month - 1, day)
	let age = now.getFullYear() - birthDate.getFullYear()
	const currentMonth = now.getMonth()
	const birthMonth = birthDate.getMonth()
	if (
		currentMonth < birthMonth ||
		(currentMonth === birthMonth && now.getDate() < birthDate.getDate())
	) {
		age -= 1
	}
	return age
}
