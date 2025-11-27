<template>
	<view class="mortgage-calculator">
		<!-- 贷款信息输入卡片 -->
		<view class="input-card">
			<view class="card-header">
				<uni-icons type="wallet" size="20" color="#1677ff"></uni-icons>
				<text class="card-title">贷款信息</text>
			</view>

			<!-- 贷款类型 -->
			<view class="form-item">
				<view class="label-wrapper">
					<uni-icons type="list" size="16" color="#666"></uni-icons>
					<text class="label">贷款类型</text>
				</view>
				<uni-data-select
					v-model="loanType"
					:localdata="loanTypeOptions"
					:clear="false"
					@change="handleLoanTypeChange" />
			</view>

			<!-- 商业贷款 -->
			<template v-if="loanType !== 2">
				<view class="form-item">
					<view class="label-wrapper">
						<uni-icons type="wallet" size="16" color="#666"></uni-icons>
						<text class="label">商业贷款金额（万元）</text>
					</view>
					<view class="input-wrapper">
						<uni-easyinput
							v-model="commercialAmount"
							type="digit"
							placeholder="请输入商业贷款金额"
							:clearable="true"
							@blur="validateCommercialAmount" />
						<view class="input-actions" v-if="commercialAmount">
							<view class="clear-btn" @click="clearCommercialAmount">
								<uni-icons type="clear" size="16" color="#999"></uni-icons>
							</view>
						</view>
					</view>
					<text v-if="commercialAmountError" class="error-text">{{
						commercialAmountError
					}}</text>
				</view>
				<view class="form-item">
					<view class="label-wrapper">
						<uni-icons type="percent" size="16" color="#666"></uni-icons>
						<text class="label">商业贷款利率（%）</text>
					</view>
					<view class="input-wrapper">
						<uni-easyinput
							v-model="commercialRate"
							type="digit"
							placeholder="请输入商业贷款利率"
							:clearable="true"
							@blur="validateCommercialRate" />
					</view>
					<text v-if="commercialRateError" class="error-text">{{
						commercialRateError
					}}</text>
				</view>
			</template>

			<!-- 公积金贷款 -->
			<template v-if="loanType !== 1">
				<view class="form-item">
					<view class="label-wrapper">
						<uni-icons type="wallet" size="16" color="#666"></uni-icons>
						<text class="label">公积金贷款金额（万元）</text>
					</view>
					<view class="input-wrapper">
						<uni-easyinput
							v-model="fundAmount"
							type="digit"
							placeholder="请输入公积金贷款金额"
							:clearable="true"
							@blur="validateFundAmount" />
						<view class="input-actions" v-if="fundAmount">
							<view class="clear-btn" @click="clearFundAmount">
								<uni-icons type="clear" size="16" color="#999"></uni-icons>
							</view>
						</view>
					</view>
					<text v-if="fundAmountError" class="error-text">{{
						fundAmountError
					}}</text>
				</view>
				<view class="form-item">
					<view class="label-wrapper">
						<uni-icons type="percent" size="16" color="#666"></uni-icons>
						<text class="label">公积金贷款利率（%）</text>
					</view>
					<view class="input-wrapper">
						<uni-easyinput
							v-model="fundRate"
							type="digit"
							placeholder="请输入公积金贷款利率"
							:clearable="true"
							@blur="validateFundRate" />
					</view>
					<text v-if="fundRateError" class="error-text">{{
						fundRateError
					}}</text>
				</view>
			</template>

			<!-- 贷款年限 -->
			<view class="form-item">
				<view class="label-wrapper">
					<uni-icons type="calendar" size="16" color="#666"></uni-icons>
					<text class="label">贷款年限（年）</text>
				</view>
				<uni-data-select
					v-model="loanYears"
					:localdata="yearOptions"
					:clear="false" />
			</view>

			<!-- 还款方式 -->
			<view class="form-item">
				<view class="label-wrapper">
					<uni-icons type="loop" size="16" color="#666"></uni-icons>
					<text class="label">还款方式</text>
				</view>
				<uni-data-select
					v-model="paymentMethod"
					:localdata="methodOptions"
					:clear="false" />
			</view>

			<!-- 清空按钮 -->
			<view class="action-buttons">
				<view class="clear-all-btn" @click="clearAll">
					<uni-icons type="trash" size="18" color="#fff"></uni-icons>
					<text>清空所有</text>
				</view>
			</view>
		</view>

		<!-- 计算结果卡片 -->
		<view class="result-card" v-if="hasValidInput">
			<view class="card-header">
				<uni-icons type="calculator" size="20" color="#1677ff"></uni-icons>
				<text class="card-title">计算结果</text>
			</view>

			<view class="result-content">
				<!-- 商业贷款结果 -->
				<template v-if="loanType !== 2 && Number(commercialAmount)">
					<view class="result-group commercial">
						<view class="group-header">
							<uni-icons type="wallet" size="18" color="#1677ff"></uni-icons>
							<text class="group-title">商业贷款</text>
						</view>
						<view class="result-grid">
							<view class="result-item">
								<view class="item-icon">
									<uni-icons
										type="calendar"
										size="20"
										color="#52c41a"></uni-icons>
								</view>
								<view class="item-content">
									<text class="item-label">首月还款</text>
									<text class="item-value primary"
										>{{ formatMoney(commercialFirstPayment) }}元</text
									>
								</view>
							</view>
							<view class="result-item" v-if="paymentMethod === 1">
								<view class="item-icon">
									<uni-icons
										type="calendar"
										size="20"
										color="#faad14"></uni-icons>
								</view>
								<view class="item-content">
									<text class="item-label">末月还款</text>
									<text class="item-value warning"
										>{{ formatMoney(commercialLastPayment) }}元</text
									>
								</view>
							</view>
							<view class="result-item">
								<view class="item-icon">
									<uni-icons
										type="wallet"
										size="20"
										color="#1677ff"></uni-icons>
								</view>
								<view class="item-content">
									<text class="item-label">还款总额</text>
									<text class="item-value info"
										>{{ formatMoney(commercialTotalPayment) }}元</text
									>
								</view>
							</view>
							<view class="result-item">
								<view class="item-icon">
									<uni-icons type="info" size="20" color="#f5222d"></uni-icons>
								</view>
								<view class="item-content">
									<text class="item-label">支付利息</text>
									<text class="item-value danger"
										>{{ formatMoney(commercialTotalInterest) }}元</text
									>
								</view>
							</view>
						</view>
					</view>
				</template>

				<!-- 公积金贷款结果 -->
				<template v-if="loanType !== 1 && Number(fundAmount)">
					<view class="result-group fund">
						<view class="group-header">
							<uni-icons type="wallet" size="18" color="#52c41a"></uni-icons>
							<text class="group-title">公积金贷款</text>
						</view>
						<view class="result-grid">
							<view class="result-item">
								<view class="item-icon">
									<uni-icons
										type="calendar"
										size="20"
										color="#52c41a"></uni-icons>
								</view>
								<view class="item-content">
									<text class="item-label">首月还款</text>
									<text class="item-value primary"
										>{{ formatMoney(fundFirstPayment) }}元</text
									>
								</view>
							</view>
							<view class="result-item" v-if="paymentMethod === 1">
								<view class="item-icon">
									<uni-icons
										type="calendar"
										size="20"
										color="#faad14"></uni-icons>
								</view>
								<view class="item-content">
									<text class="item-label">末月还款</text>
									<text class="item-value warning"
										>{{ formatMoney(fundLastPayment) }}元</text
									>
								</view>
							</view>
							<view class="result-item">
								<view class="item-icon">
									<uni-icons
										type="wallet"
										size="20"
										color="#1677ff"></uni-icons>
								</view>
								<view class="item-content">
									<text class="item-label">还款总额</text>
									<text class="item-value info"
										>{{ formatMoney(fundTotalPayment) }}元</text
									>
								</view>
							</view>
							<view class="result-item">
								<view class="item-icon">
									<uni-icons type="info" size="20" color="#f5222d"></uni-icons>
								</view>
								<view class="item-content">
									<text class="item-label">支付利息</text>
									<text class="item-value danger"
										>{{ formatMoney(fundTotalInterest) }}元</text
									>
								</view>
							</view>
						</view>
					</view>
				</template>

				<!-- 总计 -->
				<view class="result-group total">
					<view class="group-header">
						<uni-icons type="star" size="18" color="#f5222d"></uni-icons>
						<text class="group-title">每月还款合计</text>
					</view>
					<view class="result-grid">
						<view class="result-item highlight">
							<view class="item-icon">
								<uni-icons
									type="calendar"
									size="22"
									color="#f5222d"></uni-icons>
							</view>
							<view class="item-content">
								<text class="item-label">首月还款</text>
								<text class="item-value highlight-value"
									>{{ formatMoney(totalFirstPayment) }}元</text
								>
							</view>
						</view>
						<view class="result-item highlight" v-if="paymentMethod === 1">
							<view class="item-icon">
								<uni-icons
									type="calendar"
									size="22"
									color="#f5222d"></uni-icons>
							</view>
							<view class="item-content">
								<text class="item-label">末月还款</text>
								<text class="item-value highlight-value"
									>{{ formatMoney(totalLastPayment) }}元</text
								>
							</view>
						</view>
						<view class="result-item highlight">
							<view class="item-icon">
								<uni-icons type="wallet" size="22" color="#f5222d"></uni-icons>
							</view>
							<view class="item-content">
								<text class="item-label">还款总额</text>
								<text class="item-value highlight-value"
									>{{ formatMoney(totalAmount) }}元</text
								>
							</view>
						</view>
						<view class="result-item highlight">
							<view class="item-icon">
								<uni-icons type="info" size="22" color="#f5222d"></uni-icons>
							</view>
							<view class="item-content">
								<text class="item-label">支付利息</text>
								<text class="item-value highlight-value"
									>{{ formatMoney(totalInterestAmount) }}元</text
								>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 提示说明卡片 -->
		<view class="tips-card">
			<view class="card-header">
				<uni-icons type="info" size="20" color="#1677ff"></uni-icons>
				<text class="card-title">计算说明</text>
			</view>
			<view class="tips-content">
				<view class="tip-item">
					<text class="tip-number">1</text>
					<text class="tip-text"
						>等额本息：每月还款金额相同，其中本金比重逐月递增，利息比重逐月递减</text
					>
				</view>
				<view class="tip-item">
					<text class="tip-number">2</text>
					<text class="tip-text"
						>等额本金：每月还款本金相同，总还款额随利息减少而递减</text
					>
				</view>
				<view class="tip-item">
					<text class="tip-number">3</text>
					<text class="tip-text">商业贷款参考利率：首套4.20%，二套4.90%</text>
				</view>
				<view class="tip-item">
					<text class="tip-number">4</text>
					<text class="tip-text">公积金贷款利率：3.10%</text>
				</view>
				<view class="tip-item">
					<text class="tip-number">5</text>
					<text class="tip-text">计算结果仅供参考，实际以银行核算为准</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'

// 常量定义
const MIN_AMOUNT = 1 // 最小贷款金额（万元）
const MAX_AMOUNT = 10000 // 最大贷款金额（万元）
const MIN_RATE = 0.1 // 最小利率（%）
const MAX_RATE = 20 // 最大利率（%）

// 贷款类型选项
const loanTypeOptions = [
	{ value: 1, text: '商业贷款' },
	{ value: 2, text: '公积金贷款' },
	{ value: 3, text: '组合贷款' },
]

// 贷款年限选项
const yearOptions = [
	{ value: 1, text: '1年' },
	{ value: 2, text: '2年' },
	{ value: 3, text: '3年' },
	{ value: 5, text: '5年' },
	{ value: 10, text: '10年' },
	{ value: 15, text: '15年' },
	{ value: 20, text: '20年' },
	{ value: 25, text: '25年' },
	{ value: 30, text: '30年' },
]

// 还款方式选项
const methodOptions = [
	{ value: 0, text: '等额本息' },
	{ value: 1, text: '等额本金' },
]

// 表单数据
const loanType = ref(1) // 贷款类型：1-商业贷款，2-公积金贷款，3-组合贷款
const commercialAmount = ref('') // 商业贷款金额
const commercialRate = ref('4.20') // 商业贷款利率
const fundAmount = ref('') // 公积金贷款金额
const fundRate = ref('3.10') // 公积金贷款利率
const loanYears = ref(30)
const paymentMethod = ref(0)

// 错误信息
const commercialAmountError = ref('')
const commercialRateError = ref('')
const fundAmountError = ref('')
const fundRateError = ref('')

// 验证商业贷款金额
const validateCommercialAmount = () => {
	const amount = Number(commercialAmount.value)
	if (!commercialAmount.value) {
		commercialAmountError.value = ''
		return
	}
	if (isNaN(amount) || amount <= 0) {
		commercialAmountError.value = '请输入有效的贷款金额'
		commercialAmount.value = ''
		return
	}
	if (amount < MIN_AMOUNT) {
		commercialAmountError.value = `贷款金额不能小于${MIN_AMOUNT}万元`
		commercialAmount.value = ''
		return
	}
	if (amount > MAX_AMOUNT) {
		commercialAmountError.value = `贷款金额不能大于${MAX_AMOUNT}万元`
		commercialAmount.value = ''
		return
	}
	commercialAmountError.value = ''
}

// 验证商业贷款利率
const validateCommercialRate = () => {
	const rate = Number(commercialRate.value)
	if (!commercialRate.value) {
		commercialRateError.value = ''
		return
	}
	if (isNaN(rate) || rate <= 0) {
		commercialRateError.value = '请输入有效的利率'
		commercialRate.value = '4.20'
		return
	}
	if (rate < MIN_RATE || rate > MAX_RATE) {
		commercialRateError.value = `利率应在${MIN_RATE}%-${MAX_RATE}%之间`
		commercialRate.value = '4.20'
		return
	}
	commercialRateError.value = ''
}

// 验证公积金贷款金额
const validateFundAmount = () => {
	const amount = Number(fundAmount.value)
	if (!fundAmount.value) {
		fundAmountError.value = ''
		return
	}
	if (isNaN(amount) || amount <= 0) {
		fundAmountError.value = '请输入有效的贷款金额'
		fundAmount.value = ''
		return
	}
	if (amount < MIN_AMOUNT) {
		fundAmountError.value = `贷款金额不能小于${MIN_AMOUNT}万元`
		fundAmount.value = ''
		return
	}
	if (amount > MAX_AMOUNT) {
		fundAmountError.value = `贷款金额不能大于${MAX_AMOUNT}万元`
		fundAmount.value = ''
		return
	}
	fundAmountError.value = ''
}

// 验证公积金贷款利率
const validateFundRate = () => {
	const rate = Number(fundRate.value)
	if (!fundRate.value) {
		fundRateError.value = ''
		return
	}
	if (isNaN(rate) || rate <= 0) {
		fundRateError.value = '请输入有效的利率'
		fundRate.value = '3.10'
		return
	}
	if (rate < MIN_RATE || rate > MAX_RATE) {
		fundRateError.value = `利率应在${MIN_RATE}%-${MAX_RATE}%之间`
		fundRate.value = '3.10'
		return
	}
	fundRateError.value = ''
}

// 清空商业贷款金额
const clearCommercialAmount = () => {
	commercialAmount.value = ''
	commercialAmountError.value = ''
}

// 清空公积金贷款金额
const clearFundAmount = () => {
	fundAmount.value = ''
	fundAmountError.value = ''
}

// 清空所有
const clearAll = () => {
	uni.showModal({
		title: '提示',
		content: '确定要清空所有输入吗？',
		success: (res) => {
			if (res.confirm) {
				commercialAmount.value = ''
				commercialRate.value = '4.20'
				fundAmount.value = ''
				fundRate.value = '3.10'
				loanYears.value = 30
				paymentMethod.value = 0
				commercialAmountError.value = ''
				commercialRateError.value = ''
				fundAmountError.value = ''
				fundRateError.value = ''
				uni.showToast({
					title: '已清空',
					icon: 'success',
				})
			}
		},
	})
}

// 处理贷款类型变化
const handleLoanTypeChange = () => {
	if (loanType.value === 1) {
		fundAmount.value = ''
		fundRate.value = '3.10'
		fundAmountError.value = ''
		fundRateError.value = ''
	} else if (loanType.value === 2) {
		commercialAmount.value = ''
		commercialRate.value = '4.20'
		commercialAmountError.value = ''
		commercialRateError.value = ''
	}
}

// 格式化金额（添加千分位）
const formatMoney = (value) => {
	if (!value || value === '0') return '0.00'
	const num = Number(value)
	if (isNaN(num)) return '0.00'
	return num.toLocaleString('zh-CN', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})
}

// 检查是否有有效输入
const hasValidInput = computed(() => {
	if (loanType.value === 1) {
		return Number(commercialAmount.value) > 0
	} else if (loanType.value === 2) {
		return Number(fundAmount.value) > 0
	} else {
		return Number(commercialAmount.value) > 0 || Number(fundAmount.value) > 0
	}
})

// 计算月利率
const getMonthlyRate = (rate) => {
	const numRate = Number(rate)
	if (isNaN(numRate) || numRate <= 0) return 0
	return numRate / 100 / 12
}

// 计算还款月数
const totalMonths = computed(() => {
	return Number(loanYears.value) * 12
})

// 计算月供（等额本息）
const calculateEqualPayment = (loan, monthlyRate, months) => {
	if (monthlyRate === 0) {
		return loan / months
	}
	const factor = Math.pow(1 + monthlyRate, months)
	return (loan * monthlyRate * factor) / (factor - 1)
}

// 计算月供（等额本金）
const calculateEqualPrincipal = (loan, monthlyRate, months, monthIndex) => {
	const principalPerMonth = loan / months
	const remainingPrincipal = loan - (monthIndex - 1) * principalPerMonth
	return principalPerMonth + remainingPrincipal * monthlyRate
}

// 计算商业贷款月供
const calculateMonthlyPayment = (amount, rate, isFirst = true) => {
	if (!amount || Number(amount) <= 0) return '0'
	const loan = Number(amount) * 10000
	const monthlyRate = getMonthlyRate(rate)

	if (paymentMethod.value === 0) {
		// 等额本息
		const payment = calculateEqualPayment(loan, monthlyRate, totalMonths.value)
		return payment.toFixed(2)
	} else {
		// 等额本金
		if (isFirst) {
			// 首月
			return calculateEqualPrincipal(
				loan,
				monthlyRate,
				totalMonths.value,
				1
			).toFixed(2)
		} else {
			// 末月
			return calculateEqualPrincipal(
				loan,
				monthlyRate,
				totalMonths.value,
				totalMonths.value
			).toFixed(2)
		}
	}
}

// 商业贷款计算结果
const commercialFirstPayment = computed(() => {
	if (!commercialAmount.value || Number(commercialAmount.value) <= 0) return '0'
	return calculateMonthlyPayment(
		commercialAmount.value,
		commercialRate.value,
		true
	)
})

const commercialLastPayment = computed(() => {
	if (!commercialAmount.value || Number(commercialAmount.value) <= 0) return '0'
	return calculateMonthlyPayment(
		commercialAmount.value,
		commercialRate.value,
		false
	)
})

const commercialTotalPayment = computed(() => {
	if (!commercialAmount.value || Number(commercialAmount.value) <= 0) return '0'
	const loan = Number(commercialAmount.value) * 10000
	const monthlyRate = getMonthlyRate(commercialRate.value)

	if (paymentMethod.value === 0) {
		// 等额本息：月供 × 月数
		const monthlyPayment = calculateEqualPayment(
			loan,
			monthlyRate,
			totalMonths.value
		)
		return (monthlyPayment * totalMonths.value).toFixed(2)
	} else {
		// 等额本金：首月 + 末月，然后除以2，再乘以月数
		const firstPayment = calculateEqualPrincipal(
			loan,
			monthlyRate,
			totalMonths.value,
			1
		)
		const lastPayment = calculateEqualPrincipal(
			loan,
			monthlyRate,
			totalMonths.value,
			totalMonths.value
		)
		return (((firstPayment + lastPayment) * totalMonths.value) / 2).toFixed(2)
	}
})

const commercialTotalInterest = computed(() => {
	if (!commercialAmount.value || Number(commercialAmount.value) <= 0) return '0'
	const total = Number(commercialTotalPayment.value)
	const principal = Number(commercialAmount.value) * 10000
	return (total - principal).toFixed(2)
})

// 公积金贷款计算结果
const fundFirstPayment = computed(() => {
	if (!fundAmount.value || Number(fundAmount.value) <= 0) return '0'
	return calculateMonthlyPayment(fundAmount.value, fundRate.value, true)
})

const fundLastPayment = computed(() => {
	if (!fundAmount.value || Number(fundAmount.value) <= 0) return '0'
	return calculateMonthlyPayment(fundAmount.value, fundRate.value, false)
})

const fundTotalPayment = computed(() => {
	if (!fundAmount.value || Number(fundAmount.value) <= 0) return '0'
	const loan = Number(fundAmount.value) * 10000
	const monthlyRate = getMonthlyRate(fundRate.value)

	if (paymentMethod.value === 0) {
		// 等额本息：月供 × 月数
		const monthlyPayment = calculateEqualPayment(
			loan,
			monthlyRate,
			totalMonths.value
		)
		return (monthlyPayment * totalMonths.value).toFixed(2)
	} else {
		// 等额本金：首月 + 末月，然后除以2，再乘以月数
		const firstPayment = calculateEqualPrincipal(
			loan,
			monthlyRate,
			totalMonths.value,
			1
		)
		const lastPayment = calculateEqualPrincipal(
			loan,
			monthlyRate,
			totalMonths.value,
			totalMonths.value
		)
		return (((firstPayment + lastPayment) * totalMonths.value) / 2).toFixed(2)
	}
})

const fundTotalInterest = computed(() => {
	if (!fundAmount.value || Number(fundAmount.value) <= 0) return '0'
	const total = Number(fundTotalPayment.value)
	const principal = Number(fundAmount.value) * 10000
	return (total - principal).toFixed(2)
})

// 总计
const totalFirstPayment = computed(() => {
	const commercial = Number(commercialFirstPayment.value) || 0
	const fund = Number(fundFirstPayment.value) || 0
	return (commercial + fund).toFixed(2)
})

const totalLastPayment = computed(() => {
	const commercial = Number(commercialLastPayment.value) || 0
	const fund = Number(fundLastPayment.value) || 0
	return (commercial + fund).toFixed(2)
})

const totalAmount = computed(() => {
	const commercial = Number(commercialTotalPayment.value) || 0
	const fund = Number(fundTotalPayment.value) || 0
	return (commercial + fund).toFixed(2)
})

const totalInterestAmount = computed(() => {
	const commercial = Number(commercialTotalInterest.value) || 0
	const fund = Number(fundTotalInterest.value) || 0
	return (commercial + fund).toFixed(2)
})
</script>

<style lang="scss">
.mortgage-calculator {
	padding: 30rpx;
	min-height: 100vh;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

	// 卡片通用样式
	.input-card,
	.result-card,
	.tips-card {
		background: #fff;
		border-radius: 24rpx;
		padding: 32rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
		animation: fadeInUp 0.5s ease-out;

		&:last-child {
			margin-bottom: 0;
		}
	}

	// 卡片头部
	.card-header {
		display: flex;
		align-items: center;
		margin-bottom: 32rpx;
		padding-bottom: 24rpx;
		border-bottom: 2rpx solid #f0f0f0;

		.card-title {
			font-size: 32rpx;
			font-weight: 600;
			color: #333;
			margin-left: 12rpx;
		}
	}

	// 表单项样式
	.form-item {
		margin-bottom: 32rpx;

		&:last-child {
			margin-bottom: 0;
		}

		.label-wrapper {
			display: flex;
			align-items: center;
			margin-bottom: 16rpx;

			.label {
				font-size: 28rpx;
				color: #333;
				font-weight: 500;
				margin-left: 8rpx;
			}
		}

		.input-wrapper {
			position: relative;
		}

		.input-actions {
			position: absolute;
			right: 20rpx;
			top: 50%;
			transform: translateY(-50%);
			z-index: 10;

			.clear-btn {
				width: 48rpx;
				height: 48rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				background: rgba(0, 0, 0, 0.05);
				border-radius: 50%;
				transition: all 0.3s;

				&:active {
					background: rgba(0, 0, 0, 0.1);
					transform: scale(0.95);
				}
			}
		}

		.error-text {
			display: block;
			font-size: 24rpx;
			color: #f5222d;
			margin-top: 8rpx;
			padding-left: 4rpx;
		}
	}

	// 操作按钮
	.action-buttons {
		margin-top: 32rpx;
		padding-top: 32rpx;
		border-top: 2rpx solid #f0f0f0;

		.clear-all-btn {
			width: 100%;
			height: 88rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			background: linear-gradient(135deg, #f5222d 0%, #ff4d4f 100%);
			border-radius: 16rpx;
			color: #fff;
			font-size: 28rpx;
			font-weight: 500;
			box-shadow: 0 4rpx 16rpx rgba(245, 34, 45, 0.3);
			transition: all 0.3s;

			&:active {
				transform: translateY(2rpx);
				box-shadow: 0 2rpx 8rpx rgba(245, 34, 45, 0.3);
			}

			text {
				margin-left: 8rpx;
			}
		}
	}

	// 结果显示
	.result-content {
		.result-group {
			margin-bottom: 24rpx;
			padding: 24rpx;
			border-radius: 16rpx;
			background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
			box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);

			&:last-child {
				margin-bottom: 0;
			}

			&.commercial {
				background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
			}

			&.fund {
				background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
			}

			&.total {
				background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
				border: 2rpx solid #ff9800;
			}

			.group-header {
				display: flex;
				align-items: center;
				margin-bottom: 24rpx;
				padding-bottom: 16rpx;
				border-bottom: 2rpx solid rgba(0, 0, 0, 0.1);

				.group-title {
					font-size: 30rpx;
					font-weight: 600;
					color: #333;
					margin-left: 12rpx;
				}
			}

			.result-grid {
				display: grid;
				grid-template-columns: 1fr 1fr;
				gap: 20rpx;
			}

			.result-item {
				display: flex;
				align-items: center;
				padding: 20rpx;
				background: rgba(255, 255, 255, 0.8);
				border-radius: 12rpx;
				box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
				transition: all 0.3s;

				&:active {
					transform: scale(0.98);
				}

				&.highlight {
					background: linear-gradient(135deg, #fff5f5 0%, #ffe0e0 100%);
					border: 2rpx solid #ff4d4f;
				}

				.item-icon {
					width: 64rpx;
					height: 64rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					background: rgba(255, 255, 255, 0.9);
					border-radius: 12rpx;
					margin-right: 16rpx;
					box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
				}

				.item-content {
					flex: 1;
					display: flex;
					flex-direction: column;

					.item-label {
						font-size: 24rpx;
						color: #666;
						margin-bottom: 8rpx;
					}

					.item-value {
						font-size: 28rpx;
						font-weight: 600;

						&.primary {
							color: #52c41a;
						}

						&.warning {
							color: #faad14;
						}

						&.info {
							color: #1677ff;
						}

						&.danger {
							color: #f5222d;
						}

						&.highlight-value {
							color: #f5222d;
							font-size: 32rpx;
						}
					}
				}
			}
		}
	}

	// 提示说明
	.tips-content {
		.tip-item {
			display: flex;
			margin-bottom: 20rpx;
			align-items: flex-start;

			&:last-child {
				margin-bottom: 0;
			}

			.tip-number {
				width: 40rpx;
				height: 40rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
				color: #fff;
				font-size: 24rpx;
				font-weight: 600;
				border-radius: 50%;
				margin-right: 16rpx;
				flex-shrink: 0;
			}

			.tip-text {
				flex: 1;
				font-size: 26rpx;
				color: #666;
				line-height: 1.8;
			}
		}
	}
}

// 输入框样式
:deep(.uni-easyinput) {
	.uni-easyinput__content {
		height: 88rpx !important;
		background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
		border-radius: 16rpx !important;
		border: 2rpx solid transparent !important;
		padding: 0 24rpx !important;
		transition: all 0.3s !important;

		&:focus-within {
			border-color: #1677ff !important;
			background: #fff !important;
			box-shadow: 0 0 0 4rpx rgba(22, 119, 255, 0.1) !important;
		}

		.uni-easyinput__content-input {
			font-size: 28rpx !important;
			color: #333 !important;
		}
	}
}

// uni-data-select 样式
:deep(.uni-data-select) {
	.uni-stat__select {
		height: 88rpx !important;
		background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
		border-radius: 16rpx !important;
		border: 2rpx solid transparent !important;
		transition: all 0.3s !important;

		&:focus-within {
			border-color: #1677ff !important;
			background: #fff !important;
			box-shadow: 0 0 0 4rpx rgba(22, 119, 255, 0.1) !important;
		}
	}

	.uni-stat__actived {
		color: #333 !important;
		font-size: 28rpx !important;
	}
}

// 下拉框样式
:deep(.uni-select__popper) {
	z-index: 9999 !important;

	.uni-select__popper__mask {
		display: none !important;
	}
}

// 动画
@keyframes fadeInUp {
	from {
		opacity: 0;
		transform: translateY(30rpx);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}
</style>
