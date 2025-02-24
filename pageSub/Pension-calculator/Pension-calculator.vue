<template>
	<view class="pension-calculator">
		<uni-card>
			<!-- 基本信息输入 -->
			<uni-section title="基本信息" type="line" padding>
				<!-- 性别 -->
				<view class="form-item">
					<text class="label">性别</text>
					<uni-data-select
						v-model="gender"
						:localdata="genderOptions"
						:clear="false"
						@change="calculate" />
				</view>

				<!-- 参保时间 -->
				<view class="form-item">
					<text class="label">参保时间</text>
					<uni-datetime-picker
						type="date"
						v-model="insuranceStartDate"
						@change="calculate" />
				</view>

				<!-- 退休时间 -->
				<view class="form-item">
					<text class="label">预计退休时间</text>
					<uni-datetime-picker
						type="date"
						v-model="retirementDate"
						@change="calculate" />
				</view>

				<!-- 月平均缴费工资 -->
				<view class="form-item">
					<text class="label">月平均缴费工资（元）</text>
					<uni-easyinput
						v-model="averageSalary"
						type="number"
						placeholder="请输入月平均缴费工资"
						@change="calculate" />
				</view>

				<!-- 当地上年度职工月平均工资 -->
				<view class="form-item">
					<text class="label">当地上年度职工月平均工资（元）</text>
					<uni-easyinput
						v-model="localAverageSalary"
						type="number"
						placeholder="请输入当地上年度职工月平均工资"
						@change="calculate" />
				</view>

				<!-- 缴费年限 -->
				<view class="form-item">
					<text class="label">缴费年限（年）</text>
					<uni-easyinput
						v-model="paymentYears"
						type="number"
						placeholder="请输入缴费年限"
						@change="calculate" />
				</view>

				<!-- 个人账户累计储存额 -->
				<view class="form-item">
					<text class="label">个人账户累计储存额（元）</text>
					<uni-easyinput
						v-model="personalAccountBalance"
						type="number"
						placeholder="请输入个人账户累计储存额"
						@change="calculate" />
				</view>
			</uni-section>

			<!-- 计算结果 -->
			<uni-section title="计算结果" type="line" padding>
				<view class="result-box">
					<!-- 基础养老金 -->
					<view class="result-item">
						<text class="label">基础养老金：</text>
						<text class="value">{{ basicPension }}元/月</text>
					</view>
					<!-- 个人账户养老金 -->
					<view class="result-item">
						<text class="label">个人账户养老金：</text>
						<text class="value">{{ personalPension }}元/月</text>
					</view>
					<!-- 过渡性养老金 -->
					<view class="result-item" v-if="showTransitionalPension">
						<text class="label">过渡性养老金：</text>
						<text class="value">{{ transitionalPension }}元/月</text>
					</view>
					<!-- 月养老金合计 -->
					<view class="result-item">
						<text class="label">月养老金合计：</text>
						<text class="value">{{ totalPension }}元/月</text>
					</view>
				</view>
			</uni-section>

			<!-- 计算说明 -->
			<view class="tips">
				<text class="tips-title">计算说明：</text>
				<text class="tips-content"
					>1. 基础养老金 = 当地上年度职工月平均工资 × (1 + 个人平均缴费指数) ÷ 2
					× 1% × 缴费年限</text
				>
				<text class="tips-content"
					>2. 个人账户养老金 = 个人账户储存额 ÷ 计发月数</text
				>
				<text class="tips-content"
					>3. 过渡性养老金仅适用于1997年前参加工作的人员</text
				>
				<text class="tips-content"
					>4. 计算结果仅供参考，实际金额以社保部门核定为准</text
				>
			</view>
		</uni-card>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'

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

// 计算个人平均缴费指数
const personalIndex = computed(() => {
	if (!averageSalary.value || !localAverageSalary.value) return 0
	return Number(averageSalary.value) / Number(localAverageSalary.value)
})

// 计算基础养老金
const basicPension = computed(() => {
	if (!localAverageSalary.value || !paymentYears.value) return '0'
	const base = Number(localAverageSalary.value)
	const years = Number(paymentYears.value)
	const index = personalIndex.value
	return (((base * (1 + index)) / 2) * 0.01 * years).toFixed(2)
})

// 计算个人账户养老金
const personalPension = computed(() => {
	if (!personalAccountBalance.value) return '0'
	// 计发月数根据退休年龄确定：
	// 男性：195（60岁）、170（65岁）、139（70岁）
	// 女性：170（55岁）、139（60岁）、101（65岁）
	const divisionMonths = 139 // 这里使用139作为示例，实际应根据性别和退休年龄动态计算
	return (Number(personalAccountBalance.value) / divisionMonths).toFixed(2)
})

// 判断是否显示过渡性养老金
const showTransitionalPension = computed(() => {
	if (!insuranceStartDate.value) return false
	const startDate = new Date(insuranceStartDate.value)
	return startDate < new Date('1997-01-01')
})

// 计算过渡性养老金
const transitionalPension = computed(() => {
	if (!showTransitionalPension.value) return '0'
	// 过渡性养老金计算较复杂，这里仅作示例
	return '0.00'
})

// 计算月养老金合计
const totalPension = computed(() => {
	const total =
		Number(basicPension.value) +
		Number(personalPension.value) +
		Number(transitionalPension.value)
	return total.toFixed(2)
})

// 计算方法
const calculate = () => {
	// 触发所有计算属性重新计算
	basicPension.value
	personalPension.value
	transitionalPension.value
	totalPension.value
}
</script>

<style lang="scss">
.pension-calculator {
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
</style>
