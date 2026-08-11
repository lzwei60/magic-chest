export type TaxBracket = {
	max: number
	rate: number
	deduction: number
}

// 月度税率表：全年一次性奖金单独计税时，按奖金 ÷ 12 的商数查表
export const MONTHLY_TAX_BRACKETS: TaxBracket[] = [
	{ max: 3000, rate: 3, deduction: 0 },
	{ max: 12000, rate: 10, deduction: 210 },
	{ max: 25000, rate: 20, deduction: 1410 },
	{ max: 35000, rate: 25, deduction: 2660 },
	{ max: 55000, rate: 30, deduction: 4410 },
	{ max: 80000, rate: 35, deduction: 7160 },
	{ max: Infinity, rate: 45, deduction: 15160 },
]

// 年度综合所得税率表
export const ANNUAL_TAX_BRACKETS: TaxBracket[] = [
	{ max: 36000, rate: 3, deduction: 0 },
	{ max: 144000, rate: 10, deduction: 2520 },
	{ max: 300000, rate: 20, deduction: 16920 },
	{ max: 420000, rate: 25, deduction: 31920 },
	{ max: 660000, rate: 30, deduction: 52920 },
	{ max: 960000, rate: 35, deduction: 85920 },
	{ max: Infinity, rate: 45, deduction: 181920 },
]

const ANNUAL_BASIC_DEDUCTION = 60000

export function findBracket(
	amount: number,
	brackets: TaxBracket[]
): TaxBracket {
	return (
		brackets.find((bracket) => amount <= bracket.max) ??
		brackets[brackets.length - 1]
	)
}

export type SeparateResult = {
	tax: number
	afterTax: number
	rate: number
	deduction: number
}

// 单独计税：应纳税额 = 奖金 × 适用税率 - 速算扣除数
export function calcBonusTaxSeparate(bonus: number): SeparateResult {
	if (!Number.isFinite(bonus) || bonus < 0) {
		throw new Error('奖金金额无效')
	}
	if (bonus === 0) {
		return { tax: 0, afterTax: 0, rate: 3, deduction: 0 }
	}
	const bracket = findBracket(bonus / 12, MONTHLY_TAX_BRACKETS)
	const tax = roundToCent(
		Math.max(bonus * (bracket.rate / 100) - bracket.deduction, 0)
	)
	return {
		tax,
		afterTax: roundToCent(bonus - tax),
		rate: bracket.rate,
		deduction: bracket.deduction,
	}
}

export function calcAnnualIncomeTax(annualTaxableIncome: number): number {
	if (!Number.isFinite(annualTaxableIncome)) {
		throw new Error('应纳税所得额无效')
	}
	if (annualTaxableIncome <= 0) {
		return 0
	}
	const bracket = findBracket(annualTaxableIncome, ANNUAL_TAX_BRACKETS)
	return roundToCent(
		Math.max(
			annualTaxableIncome * (bracket.rate / 100) - bracket.deduction,
			0
		)
	)
}

export type MergedInput = {
	bonus: number
	monthlyIncome: number
	monthlyInsurance: number
	monthlySpecialDeduction: number
}

export type MergedResult = {
	tax: number
	afterTax: number
	annualTaxableIncome: number
}

// 并入综合所得：年终奖的增量税 = 含奖金的全年个税 - 不含奖金的全年个税
export function calcBonusTaxMerged(input: MergedInput): MergedResult {
	const { bonus, monthlyIncome, monthlyInsurance, monthlySpecialDeduction } =
		input
	if (!Number.isFinite(bonus) || bonus < 0) {
		throw new Error('奖金金额无效')
	}
	if (
		monthlyIncome < 0 ||
		monthlyInsurance < 0 ||
		monthlySpecialDeduction < 0
	) {
		throw new Error('收入信息无效')
	}

	const annualBase =
		monthlyIncome * 12 -
		ANNUAL_BASIC_DEDUCTION -
		monthlyInsurance * 12 -
		monthlySpecialDeduction * 12
	const taxWithoutBonus = calcAnnualIncomeTax(annualBase)
	const taxWithBonus = calcAnnualIncomeTax(annualBase + bonus)
	const tax = roundToCent(Math.max(taxWithBonus - taxWithoutBonus, 0))

	return {
		tax,
		afterTax: roundToCent(bonus - tax),
		annualTaxableIncome: annualBase + bonus,
	}
}

export type CompareResult = {
	separate: SeparateResult
	merged: MergedResult
	better: 'separate' | 'merged'
	saving: number
}

export function compareBonusTaxMethods(input: MergedInput): CompareResult {
	const separate = calcBonusTaxSeparate(input.bonus)
	const merged = calcBonusTaxMerged(input)
	const better = merged.tax <= separate.tax ? 'merged' : 'separate'
	return {
		separate,
		merged,
		better,
		saving: roundToCent(Math.abs(separate.tax - merged.tax)),
	}
}

function roundToCent(value: number): number {
	return Math.round(value * 100) / 100
}
