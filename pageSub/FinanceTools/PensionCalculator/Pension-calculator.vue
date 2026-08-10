<template>
	<view class="pension-calculator">
		<!-- 基本信息输入卡片 -->
		<view class="input-card">
			<view class="card-header">
				<uni-icons type="wallet" size="20" color="#1677ff"></uni-icons>
				<text class="card-title">基本信息</text>
			</view>

			<!-- 性别 -->
			<view class="form-item">
				<view class="label-wrapper">
					<uni-icons type="person" size="16" color="#666"></uni-icons>
					<text class="label">性别</text>
				</view>
				<uni-data-select
					v-model="gender"
					:localdata="genderOptions"
					:clear="false" />
			</view>

			<!-- 参保时间 -->
			<view class="form-item">
				<view class="label-wrapper">
					<uni-icons type="calendar" size="16" color="#666"></uni-icons>
					<text class="label">参保时间</text>
				</view>
				<uni-datetime-picker
					type="date"
					v-model="insuranceStartDate"
					:clear-icon="true" />
			</view>

			<!-- 退休时间 -->
			<view class="form-item">
				<view class="label-wrapper">
					<uni-icons type="calendar" size="16" color="#666"></uni-icons>
					<text class="label">预计退休时间</text>
				</view>
				<uni-datetime-picker
					type="date"
					v-model="retirementDate"
					:clear-icon="true" />
			</view>

			<!-- 月平均缴费工资 -->
			<view class="form-item">
				<view class="label-wrapper">
					<uni-icons type="wallet" size="16" color="#666"></uni-icons>
					<text class="label">月平均缴费工资（元）</text>
				</view>
				<view class="input-wrapper">
					<uni-easyinput
						v-model="averageSalary"
						type="digit"
						placeholder="请输入月平均缴费工资"
						:clearable="true"
						@blur="validateAverageSalary" />
					<view class="input-actions" v-if="averageSalary">
						<view class="clear-btn" @click="clearAverageSalary">
							<uni-icons type="clear" size="16" color="#999"></uni-icons>
						</view>
					</view>
				</view>
				<text v-if="averageSalaryError" class="error-text">{{
					averageSalaryError
				}}</text>
			</view>

			<!-- 当地上年度职工月平均工资 -->
			<view class="form-item">
				<view class="label-wrapper">
					<uni-icons type="wallet" size="16" color="#666"></uni-icons>
					<text class="label">当地上年度职工月平均工资（元）</text>
				</view>
				<view class="input-wrapper">
					<uni-easyinput
						v-model="localAverageSalary"
						type="digit"
						placeholder="请输入当地上年度职工月平均工资"
						:clearable="true"
						@blur="validateLocalAverageSalary" />
					<view class="input-actions" v-if="localAverageSalary">
						<view class="clear-btn" @click="clearLocalAverageSalary">
							<uni-icons type="clear" size="16" color="#999"></uni-icons>
						</view>
					</view>
				</view>
				<text v-if="localAverageSalaryError" class="error-text">{{
					localAverageSalaryError
				}}</text>
			</view>

			<!-- 缴费年限 -->
			<view class="form-item">
				<view class="label-wrapper">
					<uni-icons type="calendar" size="16" color="#666"></uni-icons>
					<text class="label">缴费年限（年）</text>
				</view>
				<view class="input-wrapper">
					<uni-easyinput
						v-model="paymentYears"
						type="digit"
						placeholder="请输入缴费年限"
						:clearable="true"
						@blur="validatePaymentYears" />
					<view class="input-actions" v-if="paymentYears">
						<view class="clear-btn" @click="clearPaymentYears">
							<uni-icons type="clear" size="16" color="#999"></uni-icons>
						</view>
					</view>
				</view>
				<text v-if="paymentYearsError" class="error-text">{{
					paymentYearsError
				}}</text>
			</view>

			<!-- 个人账户累计储存额 -->
			<view class="form-item">
				<view class="label-wrapper">
					<uni-icons type="wallet" size="16" color="#666"></uni-icons>
					<text class="label">个人账户累计储存额（元）</text>
				</view>
				<view class="input-wrapper">
					<uni-easyinput
						v-model="personalAccountBalance"
						type="digit"
						placeholder="请输入个人账户累计储存额"
						:clearable="true"
						@blur="validatePersonalAccountBalance" />
					<view class="input-actions" v-if="personalAccountBalance">
						<view class="clear-btn" @click="clearPersonalAccountBalance">
							<uni-icons type="clear" size="16" color="#999"></uni-icons>
						</view>
					</view>
				</view>
				<text v-if="personalAccountBalanceError" class="error-text">{{
					personalAccountBalanceError
				}}</text>
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
				<!-- 基础养老金 -->
				<view class="result-item">
					<view class="item-icon">
						<uni-icons type="wallet" size="20" color="#1677ff"></uni-icons>
					</view>
					<view class="item-content">
						<text class="item-label">基础养老金</text>
						<text class="item-value info"
							>{{ formatMoney(basicPension) }}元/月</text
						>
					</view>
				</view>

				<!-- 个人账户养老金 -->
				<view class="result-item">
					<view class="item-icon">
						<uni-icons type="wallet" size="20" color="#52c41a"></uni-icons>
					</view>
					<view class="item-content">
						<text class="item-label">个人账户养老金</text>
						<text class="item-value primary"
							>{{ formatMoney(personalPension) }}元/月</text
						>
						<text class="item-desc">计发月数：{{ divisionMonths }}个月</text>
					</view>
				</view>

				<!-- 过渡性养老金 -->
				<view class="result-item" v-if="showTransitionalPension">
					<view class="item-icon">
						<uni-icons type="wallet" size="20" color="#faad14"></uni-icons>
					</view>
					<view class="item-content">
						<text class="item-label">过渡性养老金</text>
						<text class="item-value warning"
							>{{ formatMoney(transitionalPension) }}元/月</text
						>
						<text class="item-desc">1997年前参加工作</text>
					</view>
				</view>

				<!-- 月养老金合计 -->
				<view class="result-item highlight">
					<view class="item-icon">
						<uni-icons type="star" size="22" color="#f5222d"></uni-icons>
					</view>
					<view class="item-content">
						<text class="item-label">月养老金合计</text>
						<text class="item-value highlight-value"
							>{{ formatMoney(totalPension) }}元/月</text
						>
					</view>
				</view>
			</view>
		</view>

		<!-- 计算说明卡片 -->
		<view class="tips-card">
			<view class="card-header">
				<uni-icons type="info" size="20" color="#1677ff"></uni-icons>
				<text class="card-title">计算说明</text>
			</view>
			<view class="tips-content">
				<view class="tip-item">
					<text class="tip-number">1</text>
					<text class="tip-text"
						>基础养老金 = 当地上年度职工月平均工资 × (1 + 个人平均缴费指数) ÷ 2
						× 1% × 缴费年限</text
					>
				</view>
				<view class="tip-item">
					<text class="tip-number">2</text>
					<text class="tip-text"
						>个人账户养老金 = 个人账户储存额 ÷
						计发月数（根据性别和退休年龄确定）</text
					>
				</view>
				<view class="tip-item">
					<text class="tip-number">3</text>
					<text class="tip-text"
						>过渡性养老金仅适用于1997年前参加工作的人员</text
					>
				</view>
				<view class="tip-item">
					<text class="tip-number">4</text>
					<text class="tip-text"
						>计算结果仅供参考，实际金额以社保部门核定为准</text
					>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'

// 常量定义
const MIN_SALARY = 1000 // 最小工资（元）
const MAX_SALARY = 1000000 // 最大工资（元）
const MIN_YEARS = 1 // 最小缴费年限（年）
const MAX_YEARS = 50 // 最大缴费年限（年）
const MAX_BALANCE = 10000000 // 最大账户余额（元）

// 计发月数对照表（根据退休年龄）
const DIVISION_MONTHS_MAP = {
	male: {
		50: 195,
		51: 190,
		52: 185,
		53: 180,
		54: 175,
		55: 170,
		56: 164,
		57: 158,
		58: 152,
		59: 145,
		60: 139,
		61: 132,
		62: 125,
		63: 117,
		64: 109,
		65: 101,
	},
	female: {
		45: 216,
		46: 212,
		47: 208,
		48: 204,
		49: 199,
		50: 195,
		51: 190,
		52: 185,
		53: 180,
		54: 175,
		55: 170,
		56: 164,
		57: 158,
		58: 152,
		59: 145,
		60: 139,
		61: 132,
		62: 125,
		63: 117,
		64: 109,
		65: 101,
	},
}

// 选项数据
const genderOptions = [
	{ value: 'male', text: '男' },
	{ value: 'female', text: '女' },
]

// 状态变量
const gender = ref('male')
const insuranceStartDate = ref('')
const retirementDate = ref('')
const averageSalary = ref('')
const localAverageSalary = ref('')
const paymentYears = ref('')
const personalAccountBalance = ref('')

// 错误信息
const averageSalaryError = ref('')
const localAverageSalaryError = ref('')
const paymentYearsError = ref('')
const personalAccountBalanceError = ref('')

// 验证月平均缴费工资
const validateAverageSalary = () => {
	const salary = Number(averageSalary.value)
	if (!averageSalary.value) {
		averageSalaryError.value = ''
		return
	}
	if (isNaN(salary) || salary <= 0) {
		averageSalaryError.value = '请输入有效的工资'
		averageSalary.value = ''
		return
	}
	if (salary < MIN_SALARY || salary > MAX_SALARY) {
		averageSalaryError.value = `工资应在${MIN_SALARY}-${MAX_SALARY}元之间`
		averageSalary.value = ''
		return
	}
	averageSalaryError.value = ''
}

// 验证当地上年度职工月平均工资
const validateLocalAverageSalary = () => {
	const salary = Number(localAverageSalary.value)
	if (!localAverageSalary.value) {
		localAverageSalaryError.value = ''
		return
	}
	if (isNaN(salary) || salary <= 0) {
		localAverageSalaryError.value = '请输入有效的工资'
		localAverageSalary.value = ''
		return
	}
	if (salary < MIN_SALARY || salary > MAX_SALARY) {
		localAverageSalaryError.value = `工资应在${MIN_SALARY}-${MAX_SALARY}元之间`
		localAverageSalary.value = ''
		return
	}
	localAverageSalaryError.value = ''
}

// 验证缴费年限
const validatePaymentYears = () => {
	const years = Number(paymentYears.value)
	if (!paymentYears.value) {
		paymentYearsError.value = ''
		return
	}
	if (isNaN(years) || years <= 0) {
		paymentYearsError.value = '请输入有效的缴费年限'
		paymentYears.value = ''
		return
	}
	if (years < MIN_YEARS || years > MAX_YEARS) {
		paymentYearsError.value = `缴费年限应在${MIN_YEARS}-${MAX_YEARS}年之间`
		paymentYears.value = ''
		return
	}
	paymentYearsError.value = ''
}

// 验证个人账户累计储存额
const validatePersonalAccountBalance = () => {
	const balance = Number(personalAccountBalance.value)
	if (!personalAccountBalance.value) {
		personalAccountBalanceError.value = ''
		return
	}
	if (isNaN(balance) || balance < 0) {
		personalAccountBalanceError.value = '请输入有效的账户余额'
		personalAccountBalance.value = ''
		return
	}
	if (balance > MAX_BALANCE) {
		personalAccountBalanceError.value = `账户余额不能大于${MAX_BALANCE}元`
		personalAccountBalance.value = ''
		return
	}
	personalAccountBalanceError.value = ''
}

// 清空函数
const clearAverageSalary = () => {
	averageSalary.value = ''
	averageSalaryError.value = ''
}

const clearLocalAverageSalary = () => {
	localAverageSalary.value = ''
	localAverageSalaryError.value = ''
}

const clearPaymentYears = () => {
	paymentYears.value = ''
	paymentYearsError.value = ''
}

const clearPersonalAccountBalance = () => {
	personalAccountBalance.value = ''
	personalAccountBalanceError.value = ''
}

// 清空所有
const clearAll = () => {
	uni.showModal({
		title: '提示',
		content: '确定要清空所有输入吗？',
		success: (res) => {
			if (res.confirm) {
				gender.value = 'male'
				insuranceStartDate.value = ''
				retirementDate.value = ''
				averageSalary.value = ''
				localAverageSalary.value = ''
				paymentYears.value = ''
				personalAccountBalance.value = ''
				averageSalaryError.value = ''
				localAverageSalaryError.value = ''
				paymentYearsError.value = ''
				personalAccountBalanceError.value = ''
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

// 计算退休年龄
const retirementAge = computed(() => {
	if (!retirementDate.value || !insuranceStartDate.value) return null
	try {
		const retirement = new Date(retirementDate.value)
		const start = new Date(insuranceStartDate.value)
		if (retirement <= start) return null
		const age = retirement.getFullYear() - start.getFullYear()
		const monthDiff = retirement.getMonth() - start.getMonth()
		return monthDiff < 0 ? age - 1 : age
	} catch {
		return null
	}
})

// 计算计发月数
const divisionMonths = computed(() => {
	if (!retirementAge.value) return 139 // 默认值
	const age = retirementAge.value
	const genderKey = gender.value
	const monthsMap = DIVISION_MONTHS_MAP[genderKey]

	// 查找最接近的年龄对应的计发月数
	for (let i = age; i >= 45; i--) {
		if (monthsMap[i]) {
			return monthsMap[i]
		}
	}
	// 如果找不到，使用默认值
	return genderKey === 'male' ? 139 : 170
})

// 检查是否有有效输入
const hasValidInput = computed(() => {
	return (
		Number(localAverageSalary.value) > 0 &&
		Number(paymentYears.value) > 0 &&
		Number(personalAccountBalance.value) > 0
	)
})

// 计算个人平均缴费指数
const personalIndex = computed(() => {
	if (!averageSalary.value || !localAverageSalary.value) return 0
	const avg = Number(averageSalary.value)
	const local = Number(localAverageSalary.value)
	if (local <= 0) return 0
	return avg / local
})

// 计算基础养老金
const basicPension = computed(() => {
	if (!localAverageSalary.value || !paymentYears.value) return '0'
	const base = Number(localAverageSalary.value)
	const years = Number(paymentYears.value)
	const index = personalIndex.value
	if (base <= 0 || years <= 0) return '0'
	return (((base * (1 + index)) / 2) * 0.01 * years).toFixed(2)
})

// 计算个人账户养老金
const personalPension = computed(() => {
	if (!personalAccountBalance.value || divisionMonths.value <= 0) return '0'
	const balance = Number(personalAccountBalance.value)
	return (balance / divisionMonths.value).toFixed(2)
})

// 判断是否显示过渡性养老金
const showTransitionalPension = computed(() => {
	if (!insuranceStartDate.value) return false
	try {
		const startDate = new Date(insuranceStartDate.value)
		const threshold = new Date('1997-01-01')
		return startDate < threshold
	} catch {
		return false
	}
})

// 计算过渡性养老金（简化计算）
const transitionalPension = computed(() => {
	if (!showTransitionalPension.value) return '0'
	if (!localAverageSalary.value || !paymentYears.value) return '0'

	// 过渡性养老金简化计算：基础养老金的10%-20%
	// 这里使用15%作为示例
	const base = Number(basicPension.value)
	return (base * 0.15).toFixed(2)
})

// 计算月养老金合计
const totalPension = computed(() => {
	const basic = Number(basicPension.value) || 0
	const personal = Number(personalPension.value) || 0
	const transitional = Number(transitionalPension.value) || 0
	return (basic + personal + transitional).toFixed(2)
})
</script>

<style lang="scss">
.pension-calculator {
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
		.result-item {
			display: flex;
			align-items: center;
			padding: 24rpx;
			margin-bottom: 20rpx;
			background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
			border-radius: 16rpx;
			box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
			transition: all 0.3s;

			&:last-child {
				margin-bottom: 0;
			}

			&:active {
				transform: scale(0.98);
			}

			&.highlight {
				background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
				border: 2rpx solid #ff9800;
			}

			.item-icon {
				width: 80rpx;
				height: 80rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				background: rgba(255, 255, 255, 0.9);
				border-radius: 16rpx;
				margin-right: 20rpx;
				box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
				flex-shrink: 0;
			}

			.item-content {
				flex: 1;
				display: flex;
				flex-direction: column;

				.item-label {
					font-size: 26rpx;
					color: #666;
					margin-bottom: 8rpx;
				}

				.item-value {
					font-size: 32rpx;
					font-weight: 600;
					margin-bottom: 4rpx;

					&.primary {
						color: #52c41a;
					}

					&.warning {
						color: #faad14;
					}

					&.info {
						color: #1677ff;
					}

					&.highlight-value {
						color: #f5222d;
						font-size: 36rpx;
					}
				}

				.item-desc {
					font-size: 24rpx;
					color: #999;
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

// uni-datetime-picker 样式
:deep(.uni-datetime-picker) {
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
