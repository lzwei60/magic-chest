<template>
	<view class="bmi-container">
		<!-- 输入卡片 -->
		<view class="card input-card">
			<view class="card-header">
				<view class="header-left">
					<uni-icons type="person-filled" size="20" color="#1677ff"></uni-icons>
					<text class="card-title">基本信息</text>
				</view>
				<text v-if="hasInput" class="clear-btn" @click="clearAll">清空</text>
			</view>

			<view class="card-body">
				<view class="input-item">
					<view class="label-wrapper">
						<uni-icons type="arrow-up" size="16" color="#999"></uni-icons>
						<text class="label">身高 (cm)</text>
					</view>
					<view class="input-wrapper">
						<input
							type="digit"
							v-model="height"
							placeholder="请输入身高"
							class="input"
							@input="handleInput"
							@blur="validateInput" />
						<text class="unit">cm</text>
					</view>
					<text v-if="heightError" class="error-text">{{ heightError }}</text>
				</view>

				<view class="input-item">
					<view class="label-wrapper">
						<uni-icons type="medal-filled" size="16" color="#999"></uni-icons>
						<text class="label">体重 (kg)</text>
					</view>
					<view class="input-wrapper">
						<input
							type="digit"
							v-model="weight"
							placeholder="请输入体重"
							class="input"
							@input="handleInput"
							@blur="validateInput" />
						<text class="unit">kg</text>
					</view>
					<text v-if="weightError" class="error-text">{{ weightError }}</text>
				</view>

				<button
					class="calculate-btn"
					:disabled="!canCalculate"
					@tap="calculateBMI">
					<uni-icons type="calculator" size="18" color="#fff"></uni-icons>
					<text>计算 BMI</text>
				</button>
			</view>
		</view>

		<!-- 结果卡片 -->
		<view v-if="bmiResult" class="card result-card">
			<view class="card-header">
				<view class="header-left">
					<uni-icons type="info" size="20" color="#1677ff"></uni-icons>
					<text class="card-title">BMI 结果</text>
				</view>
			</view>

			<view class="card-body">
				<!-- BMI 数值 -->
				<view class="bmi-display">
					<view class="bmi-circle" :style="{ borderColor: bmiResult.color }">
						<text class="bmi-number">{{ bmiResult.value }}</text>
						<text class="bmi-label">BMI</text>
					</view>
					<view class="bmi-status" :style="{ color: bmiResult.color }">
						<uni-icons
							:type="bmiResult.icon"
							size="20"
							:color="bmiResult.color"></uni-icons>
						<text>{{ bmiResult.status }}</text>
					</view>
				</view>

				<!-- 健康建议 -->
				<view class="health-advice">
					<view class="advice-header">
						<uni-icons
							type="heart-filled"
							size="16"
							color="#ff4d4f"></uni-icons>
						<text class="advice-title">健康建议</text>
					</view>
					<text class="advice-content">{{ bmiResult.description }}</text>
				</view>

				<!-- 理想体重范围 -->
				<view class="ideal-weight">
					<view class="ideal-weight-header">
						<uni-icons type="wallet" size="16" color="#1677ff"></uni-icons>
						<text class="ideal-weight-title">理想体重范围</text>
					</view>
					<view class="ideal-weight-range">
						<text class="range-value">{{ idealWeightRange.min }}kg</text>
						<text class="range-separator">~</text>
						<text class="range-value">{{ idealWeightRange.max }}kg</text>
					</view>
				</view>
			</view>
		</view>

		<!-- BMI 范围说明卡片 -->
		<view class="card range-card">
			<view class="card-header">
				<view class="header-left">
					<uni-icons type="list" size="20" color="#1677ff"></uni-icons>
					<text class="card-title">BMI 范围说明</text>
				</view>
			</view>

			<view class="card-body">
				<view class="range-list">
					<view
						v-for="(item, index) in bmiRanges"
						:key="index"
						class="range-item"
						:class="{ active: bmiResult && bmiResult.range === item.range }">
						<view
							class="range-indicator"
							:style="{ backgroundColor: item.color }"></view>
						<view class="range-info">
							<text class="range-label">{{ item.label }}</text>
							<text class="range-desc">{{ item.range }}</text>
						</view>
						<view
							class="range-status"
							v-if="bmiResult && bmiResult.range === item.range">
							<uni-icons
								type="checkmarkempty"
								size="16"
								:color="item.color"></uni-icons>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 提示信息卡片 -->
		<view class="card tips-card">
			<view class="card-header">
				<view class="header-left">
					<uni-icons type="info" size="20" color="#1677ff"></uni-icons>
					<text class="card-title">温馨提示</text>
				</view>
			</view>

			<view class="card-body">
				<view class="tips-content">
					<view class="tip-item">
						<text class="tip-number">1</text>
						<text class="tip-text"
							>BMI = 体重(kg) ÷ 身高(m)²，是衡量身体胖瘦程度的标准</text
						>
					</view>
					<view class="tip-item">
						<text class="tip-number">2</text>
						<text class="tip-text"
							>BMI 指数仅供参考，不能完全反映身体健康状况</text
						>
					</view>
					<view class="tip-item">
						<text class="tip-number">3</text>
						<text class="tip-text">建议结合体脂率、肌肉量等指标综合评估</text>
					</view>
					<view class="tip-item">
						<text class="tip-number">4</text>
						<text class="tip-text">如有健康疑虑，请咨询专业医生</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// 常量定义
const MIN_HEIGHT = 50 // 最小身高 (cm)
const MAX_HEIGHT = 250 // 最大身高 (cm)
const MIN_WEIGHT = 20 // 最小体重 (kg)
const MAX_WEIGHT = 300 // 最大体重 (kg)

// BMI 范围定义
const bmiRanges = [
	{
		label: '体重偏轻',
		range: 'BMI < 18.5',
		color: '#2196F3',
		icon: 'arrow-down',
		min: 0,
		max: 18.5,
	},
	{
		label: '体重正常',
		range: '18.5 ≤ BMI < 24',
		color: '#4CAF50',
		icon: 'checkmarkempty',
		min: 18.5,
		max: 24,
	},
	{
		label: '超重',
		range: '24 ≤ BMI < 28',
		color: '#FF9800',
		icon: 'arrow-up',
		min: 24,
		max: 28,
	},
	{
		label: '肥胖',
		range: 'BMI ≥ 28',
		color: '#F44336',
		icon: 'close',
		min: 28,
		max: Infinity,
	},
]

// 状态变量
const height = ref('')
const weight = ref('')
const bmiResult = ref(null)
const heightError = ref('')
const weightError = ref('')

// 判断是否有输入
const hasInput = computed(() => {
	return height.value || weight.value
})

// 判断是否可以计算
const canCalculate = computed(() => {
	return (
		height.value &&
		weight.value &&
		!heightError.value &&
		!weightError.value &&
		parseFloat(height.value) >= MIN_HEIGHT &&
		parseFloat(height.value) <= MAX_HEIGHT &&
		parseFloat(weight.value) >= MIN_WEIGHT &&
		parseFloat(weight.value) <= MAX_WEIGHT
	)
})

// 计算理想体重范围（BMI 18.5-24）
const idealWeightRange = computed(() => {
	if (!height.value || !canCalculate.value) {
		return { min: 0, max: 0 }
	}

	const h = parseFloat(height.value) / 100 // 转换为米
	const minWeight = (18.5 * h * h).toFixed(1)
	const maxWeight = (24 * h * h).toFixed(1)

	return {
		min: parseFloat(minWeight),
		max: parseFloat(maxWeight),
	}
})

// 处理输入
const handleInput = () => {
	// 清除错误信息
	heightError.value = ''
	weightError.value = ''

	// 如果两个值都有，自动计算
	if (canCalculate.value) {
		calculateBMI()
	} else {
		// 如果输入无效，清空结果
		bmiResult.value = null
	}
}

// 验证输入
const validateInput = () => {
	// 验证身高
	if (height.value) {
		const h = parseFloat(height.value)
		if (isNaN(h) || h < MIN_HEIGHT || h > MAX_HEIGHT) {
			heightError.value = `请输入 ${MIN_HEIGHT}-${MAX_HEIGHT}cm 之间的数值`
		}
	}

	// 验证体重
	if (weight.value) {
		const w = parseFloat(weight.value)
		if (isNaN(w) || w < MIN_WEIGHT || w > MAX_WEIGHT) {
			weightError.value = `请输入 ${MIN_WEIGHT}-${MAX_WEIGHT}kg 之间的数值`
		}
	}
}

// 计算 BMI
const calculateBMI = () => {
	if (!canCalculate.value) {
		if (!height.value || !weight.value) {
			uni.showToast({
				title: '请输入身高和体重',
				icon: 'none',
			})
		} else {
			uni.showToast({
				title: '请输入有效数值',
				icon: 'none',
			})
		}
		return
	}

	try {
		const h = parseFloat(height.value) / 100 // 转换为米
		const w = parseFloat(weight.value)

		const bmi = parseFloat((w / (h * h)).toFixed(1))

		// 查找对应的BMI范围
		const range =
			bmiRanges.find(
				(item) => bmi >= item.min && (item.max === Infinity || bmi < item.max)
			) || bmiRanges[0]

		// 根据BMI值获取详细信息
		let description = ''
		let advice = []

		if (bmi < 18.5) {
			description = '建议适当增加营养摄入，保持健康饮食习惯，适量运动增强体质。'
			advice = [
				'增加优质蛋白质摄入（如鸡蛋、瘦肉、豆类）',
				'保持规律作息，充足睡眠',
				'适量运动，增强肌肉量',
			]
		} else if (bmi >= 18.5 && bmi < 24) {
			description = '恭喜！您的体重在正常范围内，请继续保持健康的生活方式。'
			advice = [
				'保持均衡饮食，多吃蔬菜水果',
				'每周至少150分钟中等强度运动',
				'定期体检，关注身体健康',
			]
		} else if (bmi >= 24 && bmi < 28) {
			description = '建议控制饮食，增加运动量，逐步将体重调整到正常范围。'
			advice = [
				'减少高热量食物摄入',
				'增加有氧运动（如快走、慢跑）',
				'保持规律作息，避免熬夜',
			]
		} else {
			description = '需要注意健康风险，建议咨询医生或营养师制定科学的减重计划。'
			advice = [
				'咨询专业医生，制定个性化减重方案',
				'控制饮食，减少高糖高脂食物',
				'增加运动量，循序渐进',
				'定期监测体重和健康指标',
			]
		}

		bmiResult.value = {
			value: bmi,
			status: range.label,
			color: range.color,
			icon: range.icon,
			range: range.range,
			description,
			advice,
		}
	} catch (error) {
		console.error('计算BMI失败:', error)
		uni.showToast({
			title: '计算失败，请检查输入',
			icon: 'none',
		})
	}
}

// 清空所有输入
const clearAll = () => {
	uni.showModal({
		title: '确认清空',
		content: '确定要清空所有输入吗？',
		success: (res) => {
			if (res.confirm) {
				height.value = ''
				weight.value = ''
				bmiResult.value = null
				heightError.value = ''
				weightError.value = ''
				uni.showToast({
					title: '已清空',
					icon: 'success',
					duration: 1500,
				})
			}
		},
	})
}
</script>

<style lang="scss">
.bmi-container {
	padding: 24rpx;
	min-height: 100vh;
	background: linear-gradient(to bottom, #f8f9fa 0%, #f5f5f5 100%);
}

// 卡片样式
.card {
	background: #fff;
	border-radius: 16rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
	overflow: hidden;
	transition: all 0.3s ease;

	&:active {
		transform: scale(0.99);
	}
}

.card-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24rpx;
	border-bottom: 1rpx solid #f0f0f0;
	background: linear-gradient(135deg, #f8f9fa 0%, #fff 100%);
}

.header-left {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.card-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
}

.clear-btn {
	font-size: 26rpx;
	color: #1677ff;
	padding: 8rpx 16rpx;
	border-radius: 8rpx;
	transition: all 0.2s ease;

	&:active {
		background-color: rgba(22, 119, 255, 0.1);
		transform: scale(0.95);
	}
}

.card-body {
	padding: 24rpx;
}

// 输入区域
.input-item {
	margin-bottom: 32rpx;

	&:last-child {
		margin-bottom: 0;
	}
}

.label-wrapper {
	display: flex;
	align-items: center;
	gap: 8rpx;
	margin-bottom: 16rpx;
}

.label {
	font-size: 28rpx;
	color: #333;
	font-weight: 500;
}

.input-wrapper {
	position: relative;
	display: flex;
	align-items: center;
}

.input {
	width: 100%;
	height: 88rpx;
	background-color: #fafafa;
	border-radius: 12rpx;
	padding: 0 80rpx 0 24rpx;
	font-size: 32rpx;
	color: #333;
	border: 2rpx solid transparent;
	transition: all 0.3s ease;
	box-sizing: border-box;

	&:focus {
		background-color: #fff;
		border-color: #1677ff;
		box-shadow: 0 0 0 4rpx rgba(22, 119, 255, 0.1);
	}
}

.unit {
	position: absolute;
	right: 24rpx;
	font-size: 26rpx;
	color: #999;
	pointer-events: none;
}

.error-text {
	display: block;
	margin-top: 8rpx;
	font-size: 24rpx;
	color: #ff4d4f;
}

.calculate-btn {
	width: 100%;
	height: 88rpx;
	margin-top: 32rpx;
	background: linear-gradient(135deg, #1677ff 0%, #0958d9 100%);
	color: #fff;
	border-radius: 16rpx;
	font-size: 32rpx;
	font-weight: 500;
	border: none;
	box-shadow: 0 4rpx 16rpx rgba(22, 119, 255, 0.3);
	transition: all 0.3s ease;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8rpx;

	&:active {
		transform: scale(0.98);
		box-shadow: 0 2rpx 8rpx rgba(22, 119, 255, 0.4);
	}

	&[disabled] {
		background: #d9d9d9;
		box-shadow: none;
		opacity: 0.6;
	}
}

// 结果展示
.result-card {
	animation: fadeIn 0.5s ease;
}

.bmi-display {
	text-align: center;
	margin-bottom: 32rpx;
}

.bmi-circle {
	width: 200rpx;
	height: 200rpx;
	border-radius: 50%;
	border: 8rpx solid;
	margin: 0 auto 24rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #f8f9fa 0%, #fff 100%);
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.bmi-number {
	font-size: 64rpx;
	font-weight: 700;
	color: #333;
	line-height: 1;
}

.bmi-label {
	font-size: 24rpx;
	color: #999;
	margin-top: 8rpx;
}

.bmi-status {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8rpx;
	font-size: 36rpx;
	font-weight: 600;
}

.health-advice {
	background: linear-gradient(135deg, #f8f9fa 0%, #fff 100%);
	border-radius: 12rpx;
	padding: 24rpx;
	margin-bottom: 20rpx;
}

.advice-header {
	display: flex;
	align-items: center;
	gap: 8rpx;
	margin-bottom: 16rpx;
}

.advice-title {
	font-size: 28rpx;
	font-weight: 600;
	color: #333;
}

.advice-content {
	font-size: 26rpx;
	color: #666;
	line-height: 1.8;
}

.ideal-weight {
	background: linear-gradient(135deg, #f0f7ff 0%, #fff 100%);
	border-radius: 12rpx;
	padding: 24rpx;
	border-left: 4rpx solid #1677ff;
}

.ideal-weight-header {
	display: flex;
	align-items: center;
	gap: 8rpx;
	margin-bottom: 16rpx;
}

.ideal-weight-title {
	font-size: 28rpx;
	font-weight: 600;
	color: #333;
}

.ideal-weight-range {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 16rpx;
}

.range-value {
	font-size: 36rpx;
	font-weight: 600;
	color: #1677ff;
}

.range-separator {
	font-size: 32rpx;
	color: #999;
}

// BMI 范围说明
.range-list {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.range-item {
	display: flex;
	align-items: center;
	padding: 20rpx;
	background: #fafafa;
	border-radius: 12rpx;
	border: 2rpx solid transparent;
	transition: all 0.3s ease;

	&.active {
		background: linear-gradient(135deg, #f0f7ff 0%, #fff 100%);
		border-color: #1677ff;
		box-shadow: 0 2rpx 8rpx rgba(22, 119, 255, 0.1);
	}
}

.range-indicator {
	width: 8rpx;
	height: 40rpx;
	border-radius: 4rpx;
	margin-right: 16rpx;
}

.range-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 4rpx;
}

.range-label {
	font-size: 28rpx;
	font-weight: 500;
	color: #333;
}

.range-desc {
	font-size: 24rpx;
	color: #999;
}

.range-status {
	display: flex;
	align-items: center;
}

// 提示信息
.tips-card {
	.card-body {
		padding: 24rpx;
	}
}

.tips-content {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.tip-item {
	display: flex;
	align-items: flex-start;
	gap: 16rpx;
}

.tip-number {
	flex-shrink: 0;
	width: 40rpx;
	height: 40rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #1677ff 0%, #0958d9 100%);
	color: #fff;
	border-radius: 50%;
	font-size: 24rpx;
	font-weight: 600;
}

.tip-text {
	flex: 1;
	font-size: 26rpx;
	color: #666;
	line-height: 1.8;
}

@keyframes fadeIn {
	from {
		opacity: 0;
		transform: translateY(-10rpx);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}
</style>
