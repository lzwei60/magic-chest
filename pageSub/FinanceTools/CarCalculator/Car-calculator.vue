<template>
	<view class="car-calculator">
		<!-- 贷款信息输入卡片 -->
		<view class="input-card">
			<view class="card-header">
				<uni-icons type="car" size="20" color="#1677ff"></uni-icons>
				<text class="card-title">贷款信息</text>
			</view>

			<!-- 车辆价格 -->
			<view class="form-item">
				<view class="label-wrapper">
					<uni-icons type="wallet" size="16" color="#666"></uni-icons>
					<text class="label">车辆价格（万元）</text>
				</view>
				<view class="input-wrapper">
					<uni-easyinput
						v-model="carPrice"
						type="digit"
						placeholder="请输入车辆价格"
						:clearable="true"
						@blur="validateCarPrice" />
					<view class="input-actions" v-if="carPrice">
						<view class="clear-btn" @click="clearCarPrice">
							<uni-icons type="clear" size="16" color="#999"></uni-icons>
						</view>
					</view>
				</view>
				<text v-if="carPriceError" class="error-text">{{ carPriceError }}</text>
			</view>

			<!-- 首付比例 -->
			<view class="form-item">
				<view class="label-wrapper">
					<uni-icons type="percent" size="16" color="#666"></uni-icons>
					<text class="label">首付比例</text>
				</view>
				<uni-data-select
					v-model="downPaymentRate"
					:localdata="downPaymentOptions"
					:clear="false" />
			</view>

			<!-- 贷款年限 -->
			<view class="form-item">
				<view class="label-wrapper">
					<uni-icons type="calendar" size="16" color="#666"></uni-icons>
					<text class="label">贷款年限</text>
				</view>
				<uni-data-select
					v-model="loanYears"
					:localdata="yearOptions"
					:clear="false" />
			</view>

			<!-- 贷款利率 -->
			<view class="form-item">
				<view class="label-wrapper">
					<uni-icons type="percent" size="16" color="#666"></uni-icons>
					<text class="label">年利率（%）</text>
				</view>
				<view class="input-wrapper">
					<uni-easyinput
						v-model="interestRate"
						type="digit"
						placeholder="请输入年利率"
						:clearable="true"
						@blur="validateInterestRate" />
				</view>
				<text v-if="interestRateError" class="error-text">{{
					interestRateError
				}}</text>
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
				<!-- 基本信息 -->
				<view class="result-group basic">
					<view class="group-header">
						<uni-icons type="info" size="18" color="#1677ff"></uni-icons>
						<text class="group-title">基本信息</text>
					</view>
					<view class="result-grid">
						<view class="result-item">
							<view class="item-icon">
								<uni-icons type="wallet" size="20" color="#52c41a"></uni-icons>
							</view>
							<view class="item-content">
								<text class="item-label">首付金额</text>
								<text class="item-value primary"
									>{{ formatMoney(downPayment) }}元</text
								>
							</view>
						</view>
						<view class="result-item">
							<view class="item-icon">
								<uni-icons type="wallet" size="20" color="#1677ff"></uni-icons>
							</view>
							<view class="item-content">
								<text class="item-label">贷款金额</text>
								<text class="item-value info"
									>{{ formatMoney(loanAmount) }}元</text
								>
							</view>
						</view>
					</view>
				</view>

				<!-- 还款信息 -->
				<view class="result-group payment">
					<view class="group-header">
						<uni-icons type="calendar" size="18" color="#f5222d"></uni-icons>
						<text class="group-title">还款信息</text>
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
									>{{ formatMoney(firstPayment) }}元</text
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
									>{{ formatMoney(lastPayment) }}元</text
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
									>{{ formatMoney(totalPayment) }}元</text
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
									>{{ formatMoney(totalInterest) }}元</text
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
					<text class="tip-text">参考利率：新车4.35%，二手车4.85%</text>
				</view>
				<view class="tip-item">
					<text class="tip-number">4</text>
					<text class="tip-text">计算结果仅供参考，实际以银行核算为准</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'

// 常量定义
const MIN_PRICE = 1 // 最小车辆价格（万元）
const MAX_PRICE = 10000 // 最大车辆价格（万元）
const MIN_RATE = 0.1 // 最小利率（%）
const MAX_RATE = 20 // 最大利率（%）

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

// 错误信息
const carPriceError = ref('')
const interestRateError = ref('')

// 验证车辆价格
const validateCarPrice = () => {
	const price = Number(carPrice.value)
	if (!carPrice.value) {
		carPriceError.value = ''
		return
	}
	if (isNaN(price) || price <= 0) {
		carPriceError.value = '请输入有效的车辆价格'
		carPrice.value = ''
		return
	}
	if (price < MIN_PRICE) {
		carPriceError.value = `车辆价格不能小于${MIN_PRICE}万元`
		carPrice.value = ''
		return
	}
	if (price > MAX_PRICE) {
		carPriceError.value = `车辆价格不能大于${MAX_PRICE}万元`
		carPrice.value = ''
		return
	}
	carPriceError.value = ''
}

// 验证年利率
const validateInterestRate = () => {
	const rate = Number(interestRate.value)
	if (!interestRate.value) {
		interestRateError.value = ''
		return
	}
	if (isNaN(rate) || rate <= 0) {
		interestRateError.value = '请输入有效的利率'
		interestRate.value = '4.35'
		return
	}
	if (rate < MIN_RATE || rate > MAX_RATE) {
		interestRateError.value = `利率应在${MIN_RATE}%-${MAX_RATE}%之间`
		interestRate.value = '4.35'
		return
	}
	interestRateError.value = ''
}

// 清空车辆价格
const clearCarPrice = () => {
	carPrice.value = ''
	carPriceError.value = ''
}

// 清空所有
const clearAll = () => {
	uni.showModal({
		title: '提示',
		content: '确定要清空所有输入吗？',
		success: (res) => {
			if (res.confirm) {
				carPrice.value = ''
				downPaymentRate.value = 0.3
				loanYears.value = 3
				interestRate.value = '4.35'
				paymentMethod.value = 0
				carPriceError.value = ''
				interestRateError.value = ''
				uni.showToast({
					title: '已清空',
					icon: 'success',
				})
			}
		},
	})
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
	return Number(carPrice.value) > 0
})

// 计算月利率
const monthlyRate = computed(() => {
	const rate = Number(interestRate.value)
	if (isNaN(rate) || rate <= 0) return 0
	return rate / 100 / 12
})

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

// 计算首付金额
const downPayment = computed(() => {
	if (!carPrice.value || Number(carPrice.value) <= 0) return '0'
	return (Number(carPrice.value) * 10000 * downPaymentRate.value).toFixed(2)
})

// 计算贷款金额
const loanAmount = computed(() => {
	if (!carPrice.value || Number(carPrice.value) <= 0) return '0'
	return (Number(carPrice.value) * 10000 * (1 - downPaymentRate.value)).toFixed(
		2
	)
})

// 计算首月还款
const firstPayment = computed(() => {
	const amount = Number(loanAmount.value)
	if (!amount || amount <= 0 || monthlyRate.value <= 0) return '0'

	if (paymentMethod.value === 0) {
		// 等额本息
		return calculateEqualPayment(
			amount,
			monthlyRate.value,
			totalMonths.value
		).toFixed(2)
	} else {
		// 等额本金
		return calculateEqualPrincipal(
			amount,
			monthlyRate.value,
			totalMonths.value,
			1
		).toFixed(2)
	}
})

// 计算末月还款（仅等额本金需要）
const lastPayment = computed(() => {
	const amount = Number(loanAmount.value)
	if (
		!amount ||
		amount <= 0 ||
		monthlyRate.value <= 0 ||
		paymentMethod.value !== 1
	) {
		return '0'
	}
	return calculateEqualPrincipal(
		amount,
		monthlyRate.value,
		totalMonths.value,
		totalMonths.value
	).toFixed(2)
})

// 计算还款总额
const totalPayment = computed(() => {
	const amount = Number(loanAmount.value)
	if (!amount || amount <= 0 || monthlyRate.value <= 0) return '0'

	if (paymentMethod.value === 0) {
		// 等额本息：月供 × 还款月数
		const monthlyPayment = calculateEqualPayment(
			amount,
			monthlyRate.value,
			totalMonths.value
		)
		return (monthlyPayment * totalMonths.value).toFixed(2)
	} else {
		// 等额本金：(首月月供 + 末月月供) × 还款月数 ÷ 2
		const first = calculateEqualPrincipal(
			amount,
			monthlyRate.value,
			totalMonths.value,
			1
		)
		const last = calculateEqualPrincipal(
			amount,
			monthlyRate.value,
			totalMonths.value,
			totalMonths.value
		)
		return (((first + last) * totalMonths.value) / 2).toFixed(2)
	}
})

// 计算支付利息
const totalInterest = computed(() => {
	const total = Number(totalPayment.value)
	const principal = Number(loanAmount.value)
	if (!total || !principal || total <= principal) return '0'
	return (total - principal).toFixed(2)
})
</script>

<style lang="scss">
.car-calculator {
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

			&.basic {
				background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
			}

			&.payment {
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
