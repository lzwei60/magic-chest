<template>
	<view class="bmi-container">
		<view class="input-group">
			<view class="input-item">
				<text class="label">身高 (cm)</text>
				<input
					type="digit"
					v-model="height"
					placeholder="请输入身高"
					class="input" />
			</view>

			<view class="input-item">
				<text class="label">体重 (kg)</text>
				<input
					type="digit"
					v-model="weight"
					placeholder="请输入体重"
					class="input" />
			</view>

			<button class="calculate-btn" @tap="calculateBMI">计算 BMI</button>
		</view>

		<view class="result" v-if="bmiResult">
			<view class="bmi-value">
				<text>您的 BMI 指数</text>
				<text class="number">{{ bmiResult.value }}</text>
			</view>
			<view class="bmi-status" :style="{ color: bmiResult.color }">
				{{ bmiResult.status }}
			</view>
			<view class="bmi-desc">
				{{ bmiResult.description }}
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'

const height = ref('')
const weight = ref('')
const bmiResult = ref(null)

const calculateBMI = () => {
	if (!height.value || !weight.value) {
		uni.showToast({
			title: '请输入身高和体重',
			icon: 'none',
		})
		return
	}

	const h = parseFloat(height.value) / 100 // 转换为米
	const w = parseFloat(weight.value)

	if (h <= 0 || w <= 0) {
		uni.showToast({
			title: '请输入有效数值',
			icon: 'none',
		})
		return
	}

	const bmi = (w / (h * h)).toFixed(1)

	let status = ''
	let color = ''
	let description = ''

	if (bmi < 18.5) {
		status = '体重偏轻'
		color = '#2196F3'
		description = '建议适当增加营养摄入，保持健康饮食习惯。'
	} else if (bmi >= 18.5 && bmi < 24) {
		status = '体重正常'
		color = '#4CAF50'
		description = '请继续保持健康的生活方式。'
	} else if (bmi >= 24 && bmi < 28) {
		status = '超重'
		color = '#FF9800'
		description = '建议控制饮食，增加运动量。'
	} else {
		status = '肥胖'
		color = '#F44336'
		description = '需要注意健康风险，建议咨询医生制定减重计划。'
	}

	bmiResult.value = {
		value: bmi,
		status,
		color,
		description,
	}
}
</script>

<style lang="scss">
.bmi-container {
	padding: 30rpx;

	.input-group {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 30rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);

		.input-item {
			margin-bottom: 30rpx;

			.label {
				display: block;
				font-size: 28rpx;
				color: #666;
				margin-bottom: 16rpx;
			}

			.input {
				width: 100%;
				height: 80rpx;
				background-color: #f5f5f5;
				border-radius: 8rpx;
				padding: 0 20rpx;
				font-size: 32rpx;
			}
		}

		.calculate-btn {
			margin-top: 40rpx;
			background-color: #1677ff;
			color: #fff;
			border-radius: 8rpx;

			&:active {
				opacity: 0.8;
			}
		}
	}

	.result {
		margin-top: 40rpx;
		background-color: #fff;
		border-radius: 16rpx;
		padding: 30rpx;
		text-align: center;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);

		.bmi-value {
			margin-bottom: 20rpx;

			.number {
				display: block;
				font-size: 60rpx;
				font-weight: bold;
				color: #333;
				margin-top: 10rpx;
			}
		}

		.bmi-status {
			font-size: 36rpx;
			font-weight: bold;
			margin-bottom: 20rpx;
		}

		.bmi-desc {
			color: #666;
			font-size: 28rpx;
			line-height: 1.5;
		}
	}
}
</style>
