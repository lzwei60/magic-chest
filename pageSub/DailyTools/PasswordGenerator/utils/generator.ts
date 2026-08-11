export type PasswordOptions = {
	length: number
	uppercase: boolean
	lowercase: boolean
	digits: boolean
	symbols: boolean
}

export const CHARSETS = {
	uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
	lowercase: 'abcdefghijklmnopqrstuvwxyz',
	digits: '0123456789',
	symbols: '!@#$%^&*()-_=+[]{};:,.<>?/~',
} as const

export type CharsetKey = keyof typeof CHARSETS

export const PASSWORD_MIN_LENGTH = 4
export const PASSWORD_MAX_LENGTH = 64

export type PasswordStrength = 'weak' | 'medium' | 'strong' | 'very-strong'

export function getEnabledCharsets(options: PasswordOptions): CharsetKey[] {
	return (Object.keys(CHARSETS) as CharsetKey[]).filter((key) => options[key])
}

export function getPoolSize(options: PasswordOptions): number {
	return getEnabledCharsets(options).reduce(
		(size, key) => size + CHARSETS[key].length,
		0
	)
}

export function generatePassword(options: PasswordOptions): string {
	if (
		!Number.isInteger(options.length) ||
		options.length < PASSWORD_MIN_LENGTH ||
		options.length > PASSWORD_MAX_LENGTH
	) {
		throw new Error(
			`密码长度需在 ${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} 之间`
		)
	}

	const charsets = getEnabledCharsets(options)
	if (charsets.length === 0) {
		throw new Error('至少选择一种字符类型')
	}

	const pool = charsets.map((key) => CHARSETS[key]).join('')
	// 先保证每类字符至少出现一次，再填充随机字符并洗牌
	const password: string[] = charsets.map((key) =>
		pickRandomChar(CHARSETS[key])
	)
	while (password.length < options.length) {
		password.push(pickRandomChar(pool))
	}
	shuffle(password)
	return password.join('')
}

export function estimateStrength(
	length: number,
	poolSize: number
): PasswordStrength {
	const entropy = length * Math.log2(Math.max(poolSize, 1))
	if (entropy < 40) return 'weak'
	if (entropy < 60) return 'medium'
	if (entropy < 80) return 'strong'
	return 'very-strong'
}

function pickRandomChar(charset: string): string {
	return charset[Math.floor(Math.random() * charset.length)]
}

function shuffle(list: string[]): void {
	for (let i = list.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[list[i], list[j]] = [list[j], list[i]]
	}
}
