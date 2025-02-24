<template>
	<view class="mortgage-calculator">
		<uni-card>
			<!-- 基本信息输入 -->
			<uni-section title="贷款信息" type="line" padding>
				<!-- 贷款类型 -->
				<view class="form-item">
					<text class="label">贷款类型</text>
					<uni-data-select
						v-model="loanType"
						:localdata="loanTypeOptions"
						:clear="false"
						@change="handleLoanTypeChange" />
				</view>

				<!-- 商业贷款 -->
				<template v-if="loanType !== 2">
					<view class="form-item">
						<text class="label">商业贷款金额（万元）</text>
						<uni-easyinput
							v-model="commercialAmount"
							type="number"
							placeholder="请输入商业贷款金额"
							@change="calculate" />
					</view>
					<view class="form-item">
						<text class="label">商业贷款利率（%）</text>
						<uni-easyinput
							v-model="commercialRate"
							type="number"
							placeholder="请输入商业贷款利率"
							@change="calculate" />
					</view>
				</template>

				<!-- 公积金贷款 -->
				<template v-if="loanType !== 1">
					<view class="form-item">
						<text class="label">公积金贷款金额（万元）</text>
						<uni-easyinput
							v-model="fundAmount"
							type="number"
							placeholder="请输入公积金贷款金额"
							@change="calculate" />
					</view>
					<view class="form-item">
						<text class="label">公积金贷款利率（%）</text>
						<uni-easyinput
							v-model="fundRate"
							type="number"
							placeholder="请输入公积金贷款利率"
							@change="calculate" />
					</view>
				</template>

				<!-- 贷款年限 -->
				<view class="form-item">
					<text class="label">贷款年限（年）</text>
					<uni-data-select
						v-model="loanYears"
						:localdata="yearOptions"
						:clear="false"
						@change="calculate" />
				</view>

				<!-- 还款方式 -->
				<view class="form-item">
					<text class="label">还款方式</text>
					<uni-data-select
						v-model="paymentMethod"
						:localdata="methodOptions"
						:clear="false"
						@change="calculate" />
				</view>
			</uni-section>

			<!-- 计算结果 -->
			<uni-section title="计算结果" type="line" padding>
				<view class="result-box">
					<!-- 商业贷款结果 -->
					<template v-if="loanType !== 2 && Number(commercialAmount)">
						<view class="result-group">
							<view class="group-title">商业贷款</view>
							<view class="result-item">
								<text class="label">首月还款：</text>
								<text class="value">{{ commercialFirstPayment }}元</text>
							</view>
							<view class="result-item" v-if="paymentMethod === 1">
								<text class="label">末月还款：</text>
								<text class="value">{{ commercialLastPayment }}元</text>
							</view>
							<view class="result-item">
								<text class="label">还款总额：</text>
								<text class="value">{{ commercialTotalPayment }}元</text>
							</view>
							<view class="result-item">
								<text class="label">支付利息：</text>
								<text class="value">{{ commercialTotalInterest }}元</text>
							</view>
						</view>
					</template>

					<!-- 公积金贷款结果 -->
					<template v-if="loanType !== 1 && Number(fundAmount)">
						<view class="result-group">
							<view class="group-title">公积金贷款</view>
							<view class="result-item">
								<text class="label">首月还款：</text>
								<text class="value">{{ fundFirstPayment }}元</text>
							</view>
							<view class="result-item" v-if="paymentMethod === 1">
								<text class="label">末月还款：</text>
								<text class="value">{{ fundLastPayment }}元</text>
							</view>
							<view class="result-item">
								<text class="label">还款总额：</text>
								<text class="value">{{ fundTotalPayment }}元</text>
							</view>
							<view class="result-item">
								<text class="label">支付利息：</text>
								<text class="value">{{ fundTotalInterest }}元</text>
							</view>
						</view>
					</template>

					<!-- 总计 -->
					<view class="result-group total">
						<view class="group-title">每月还款合计</view>
						<view class="result-item">
							<text class="label">首月还款：</text>
							<text class="value highlight">{{ totalFirstPayment }}元</text>
						</view>
						<view class="result-item" v-if="paymentMethod === 1">
							<text class="label">末月还款：</text>
							<text class="value highlight">{{ totalLastPayment }}元</text>
						</view>
						<view class="result-item">
							<text class="label">还款总额：</text>
							<text class="value highlight">{{ totalAmount }}元</text>
						</view>
						<view class="result-item">
							<text class="label">支付利息：</text>
							<text class="value highlight">{{ totalInterestAmount }}元</text>
						</view>
					</view>
				</view>
			</uni-section>

			<!-- 提示说明 -->
			<view class="tips">
				<text class="tips-title">计算说明：</text>
				<text class="tips-content"
					>1.
					等额本息：每月还款金额相同，其中本金比重逐月递增，利息比重逐月递减</text
				>
				<text class="tips-content"
					>2. 等额本金：每月还款本金相同，总还款额随利息减少而递减</text
				>
				<text class="tips-content"
					>3. 商业贷款参考利率：首套4.20%，二套4.90%</text
				>
				<text class="tips-content">4. 公积金贷款利率：3.10%</text>
				<text class="tips-content"
					>5. 计算结果仅供参考，实际以银行核算为准</text
				>
			</view>
		</uni-card>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'

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

// 处理贷款类型变化
const handleLoanTypeChange = () => {
	if (loanType.value === 1) {
		fundAmount.value = ''
		fundRate.value = '3.10'
	} else if (loanType.value === 2) {
		commercialAmount.value = ''
		commercialRate.value = '4.20'
	}
	calculate()
}

// 计算月利率
const getMonthlyRate = (rate) => {
	return Number(rate) / 100 / 12
}

// 计算还款月数
const totalMonths = computed(() => {
	return Number(loanYears.value) * 12
})

// 计算商业贷款月供
const calculateMonthlyPayment = (amount, rate, isFirst = true) => {
	if (!amount) return '0'
	const loan = Number(amount) * 10000
	const monthlyRate = getMonthlyRate(rate)

	if (paymentMethod.value === 0) {
		// 等额本息
		const payment =
			(loan * monthlyRate * Math.pow(1 + monthlyRate, totalMonths.value)) /
			(Math.pow(1 + monthlyRate, totalMonths.value) - 1)
		return payment.toFixed(2)
	} else {
		// 等额本金
		if (isFirst) {
			// 首月
			return (loan / totalMonths.value + loan * monthlyRate).toFixed(2)
		} else {
			// 末月
			return (
				loan / totalMonths.value +
				(loan / totalMonths.value) * monthlyRate
			).toFixed(2)
		}
	}
}

// 商业贷款计算结果
const commercialFirstPayment = computed(() =>
	calculateMonthlyPayment(commercialAmount.value, commercialRate.value)
)
const commercialLastPayment = computed(() =>
	calculateMonthlyPayment(commercialAmount.value, commercialRate.value, false)
)
const commercialTotalPayment = computed(() => {
	if (!commercialAmount.value) return '0'
	if (paymentMethod.value === 0) {
		return (Number(commercialFirstPayment.value) * totalMonths.value).toFixed(2)
	} else {
		return (
			((Number(commercialFirstPayment.value) +
				Number(commercialLastPayment.value)) *
				totalMonths.value) /
			2
		).toFixed(2)
	}
})
const commercialTotalInterest = computed(() => {
	if (!commercialAmount.value) return '0'
	return (
		Number(commercialTotalPayment.value) -
		Number(commercialAmount.value) * 10000
	).toFixed(2)
})

// 公积金贷款计算结果
const fundFirstPayment = computed(() =>
	calculateMonthlyPayment(fundAmount.value, fundRate.value)
)
const fundLastPayment = computed(() =>
	calculateMonthlyPayment(fundAmount.value, fundRate.value, false)
)
const fundTotalPayment = computed(() => {
	if (!fundAmount.value) return '0'
	if (paymentMethod.value === 0) {
		return (Number(fundFirstPayment.value) * totalMonths.value).toFixed(2)
	} else {
		return (
			((Number(fundFirstPayment.value) + Number(fundLastPayment.value)) *
				totalMonths.value) /
			2
		).toFixed(2)
	}
})
const fundTotalInterest = computed(() => {
	if (!fundAmount.value) return '0'
	return (
		Number(fundTotalPayment.value) -
		Number(fundAmount.value) * 10000
	).toFixed(2)
})

// 总计
const totalFirstPayment = computed(() => {
	return (
		Number(commercialFirstPayment.value) + Number(fundFirstPayment.value)
	).toFixed(2)
})
const totalLastPayment = computed(() => {
	return (
		Number(commercialLastPayment.value) + Number(fundLastPayment.value)
	).toFixed(2)
})
const totalAmount = computed(() => {
	return (
		Number(commercialTotalPayment.value) + Number(fundTotalPayment.value)
	).toFixed(2)
})
const totalInterestAmount = computed(() => {
	return (
		Number(commercialTotalInterest.value) + Number(fundTotalInterest.value)
	).toFixed(2)
})

// 计算方法
const calculate = () => {
	// 触发所有计算属性重新计算
	commercialFirstPayment.value
	commercialLastPayment.value
	commercialTotalPayment.value
	commercialTotalInterest.value
	fundFirstPayment.value
	fundLastPayment.value
	fundTotalPayment.value
	fundTotalInterest.value
	totalFirstPayment.value
	totalLastPayment.value
	totalAmount.value
	totalInterestAmount.value
}
</script>

<style lang="scss">
.mortgage-calculator {
	padding: 30rpx;
	min-height: 100vh;
	background-color: #f5f5f5;

	// 表单项样式
	.form-item {
		margin-bottom: 30rpx;

		&:last-child {
			margin-bottom: 0;
		}

		.label {
			display: block;
			font-size: 28rpx;
			color: #666;
			margin-bottom: 16rpx;
		}
	}

	// 结果显示样式
	.result-box {
		padding: 20rpx 0;

		.result-item {
			display: flex;
			align-items: center;
			margin-bottom: 20rpx;

			&:last-child {
				margin-bottom: 0;
			}

			.label {
				font-size: 28rpx;
				color: #666;
				min-width: 200rpx;
			}

			.value {
				font-size: 32rpx;
				color: #1677ff;
				font-weight: 500;
			}
		}
	}

	// 提示信息样式
	.tips {
		margin-top: 30rpx;
		padding: 20rpx;
		background-color: #f8f8f8;
		border-radius: 8rpx;

		.tips-title {
			display: block;
			font-size: 28rpx;
			color: #333;
			font-weight: 500;
			margin-bottom: 16rpx;
		}

		.tips-content {
			display: block;
			font-size: 26rpx;
			color: #666;
			line-height: 1.6;
		}
	}
}

// 输入框样式
:deep(.uni-easyinput) {
	.uni-easyinput__content {
		height: 88rpx !important;
		background-color: #f8f8f8 !important;
		border-radius: 8rpx !important;
		border: none !important;
		padding: 0 24rpx !important;

		.uni-easyinput__content-input {
			font-size: 28rpx !important;
			color: #333 !important;
		}
	}
}

.result-group {
	margin-bottom: 30rpx;
	padding: 20rpx;
	background-color: #f8f8f8;
	border-radius: 8rpx;

	&:last-child {
		margin-bottom: 0;
	}

	&.total {
		background-color: #e6f7ff;

		.highlight {
			color: #f5222d !important;
			font-size: 36rpx !important;
		}
	}

	.group-title {
		font-size: 28rpx;
		color: #333;
		font-weight: 500;
		margin-bottom: 16rpx;
		padding-left: 16rpx;
		border-left: 6rpx solid #1677ff;
	}
}
</style>
