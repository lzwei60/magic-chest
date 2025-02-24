<template>
	<view class="car-calculator">
		<uni-card>
			<!-- 基本信息输入 -->
			<uni-section title="贷款信息" type="line" padding>
				<!-- 车辆价格 -->
				<view class="form-item">
					<text class="label">车辆价格（万元）</text>
					<uni-easyinput
						v-model="carPrice"
						type="number"
						placeholder="请输入车辆价格"
						@change="calculate" />
				</view>

				<!-- 首付比例 -->
				<view class="form-item">
					<text class="label">首付比例</text>
					<uni-data-select
						v-model="downPaymentRate"
						:localdata="downPaymentOptions"
						:clear="false"
						@change="calculate" />
				</view>

				<!-- 贷款年限 -->
				<view class="form-item">
					<text class="label">贷款年限</text>
					<uni-data-select
						v-model="loanYears"
						:localdata="yearOptions"
						:clear="false"
						@change="calculate" />
				</view>

				<!-- 贷款利率 -->
				<view class="form-item">
					<text class="label">年利率（%）</text>
					<uni-easyinput
						v-model="interestRate"
						type="number"
						placeholder="请输入年利率"
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
					<!-- 贷款金额 -->
					<view class="result-item">
						<text class="label">首付金额：</text>
						<text class="value">{{ downPayment }}元</text>
					</view>
					<view class="result-item">
						<text class="label">贷款金额：</text>
						<text class="value">{{ loanAmount }}元</text>
					</view>

					<!-- 还款信息 -->
					<view class="result-item">
						<text class="label">首月还款：</text>
						<text class="value highlight">{{ firstPayment }}元</text>
					</view>
					<view class="result-item" v-if="paymentMethod === 1">
						<text class="label">末月还款：</text>
						<text class="value">{{ lastPayment }}元</text>
					</view>
					<view class="result-item">
						<text class="label">还款总额：</text>
						<text class="value highlight">{{ totalPayment }}元</text>
					</view>
					<view class="result-item">
						<text class="label">支付利息：</text>
						<text class="value">{{ totalInterest }}元</text>
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
				<text class="tips-content">3. 参考利率：新车4.35%，二手车4.85%</text>
				<text class="tips-content"
					>4. 计算结果仅供参考，实际以银行核算为准</text
				>
			</view>
		</uni-card>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'

// 首付比例选项
const downPaymentOptions = [
	{ value: 0.3, text: '30%' },
	{ value: 0.4, text: '40%' },
	{ value: 0.5, text: '50%' },
	{ value: 0.6, text: '60%' },
]

// 贷款年限选项
const yearOptions = [
	{ value: 1, text: '1年' },
	{ value: 2, text: '2年' },
	{ value: 3, text: '3年' },
	{ value: 4, text: '4年' },
	{ value: 5, text: '5年' },
]

// 还款方式选项
const methodOptions = [
	{ value: 0, text: '等额本息' },
	{ value: 1, text: '等额本金' },
]

// 表单数据
const carPrice = ref('') // 车辆价格（万元）
const downPaymentRate = ref(0.3) // 首付比例
const loanYears = ref(3) // 贷款年限
const interestRate = ref('4.35') // 年利率（%）
const paymentMethod = ref(0) // 还款方式：0-等额本息，1-等额本金

// 计算月利率
const monthlyRate = computed(() => {
	return Number(interestRate.value) / 100 / 12
})

// 计算还款月数
const totalMonths = computed(() => {
	return Number(loanYears.value) * 12
})

// 计算首付金额
const downPayment = computed(() => {
	if (!carPrice.value) return '0'
	return (Number(carPrice.value) * 10000 * downPaymentRate.value).toFixed(2)
})

// 计算贷款金额
const loanAmount = computed(() => {
	if (!carPrice.value) return '0'
	return (Number(carPrice.value) * 10000 * (1 - downPaymentRate.value)).toFixed(
		2
	)
})

// 计算首月还款
const firstPayment = computed(() => {
	if (!loanAmount.value || !monthlyRate.value) return '0'

	if (paymentMethod.value === 0) {
		// 等额本息
		const payment =
			(Number(loanAmount.value) *
				monthlyRate.value *
				Math.pow(1 + monthlyRate.value, totalMonths.value)) /
			(Math.pow(1 + monthlyRate.value, totalMonths.value) - 1)
		return payment.toFixed(2)
	} else {
		// 等额本金
		const payment =
			Number(loanAmount.value) / totalMonths.value +
			Number(loanAmount.value) * monthlyRate.value
		return payment.toFixed(2)
	}
})

// 计算末月还款（仅等额本金需要）
const lastPayment = computed(() => {
	if (!loanAmount.value || !monthlyRate.value || paymentMethod.value !== 1)
		return '0'

	const payment =
		Number(loanAmount.value) / totalMonths.value +
		(Number(loanAmount.value) / totalMonths.value) * monthlyRate.value
	return payment.toFixed(2)
})

// 计算还款总额
const totalPayment = computed(() => {
	if (!loanAmount.value || !monthlyRate.value) return '0'

	if (paymentMethod.value === 0) {
		// 等额本息：月供 × 还款月数
		return (Number(firstPayment.value) * totalMonths.value).toFixed(2)
	} else {
		// 等额本金：(首月月供 + 末月月供) × 还款月数 ÷ 2
		return (
			((Number(firstPayment.value) + Number(lastPayment.value)) *
				totalMonths.value) /
			2
		).toFixed(2)
	}
})

// 计算支付利息
const totalInterest = computed(() => {
	if (!totalPayment.value || !loanAmount.value) return '0'
	return (Number(totalPayment.value) - Number(loanAmount.value)).toFixed(2)
})

// 计算方法
const calculate = () => {
	// 触发所有计算属性重新计算
	downPayment.value
	loanAmount.value
	firstPayment.value
	lastPayment.value
	totalPayment.value
	totalInterest.value
}
</script>

<style lang="scss">
.car-calculator {
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
		padding: 20rpx;
		background-color: #f8f8f8;
		border-radius: 8rpx;

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

				&.highlight {
					color: #f5222d;
					font-size: 36rpx;
				}
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
</style>
