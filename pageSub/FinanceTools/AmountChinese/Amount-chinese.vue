<template>
	<view class="page">
		<view class="card">
			<view class="section-header">
				<text class="section-title">金额</text>
				<text v-if="amount" class="action-btn" @click="clearInput">清空</text>
			</view>
			<input
				v-model="amount"
				class="input"
				type="digit"
				placeholder="请输入数字金额，例如 1234.56"
				placeholder-style="color: #999" />
		</view>

		<view v-if="error" class="error-box">
			<uni-icons type="info" size="18" color="#f56c6c"></uni-icons>
			<text class="error-text">{{ error }}</text>
		</view>

		<view v-if="result" class="card">
			<view class="section-header">
				<text class="section-title">人民币大写</text>
				<text class="action-btn" @click="copyResult">复制</text>
			</view>
			<view class="result-box">
				<text class="result-text">{{ result }}</text>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import { amountToChinese } from './utils/amount'

const amount = ref('')
const converted = computed(() => amountToChinese(amount.value))
const result = computed(() => (converted.value.ok ? converted.value.value ?? '' : ''))
const error = computed(() => (amount.value && !converted.value.ok ? converted.value.error : ''))

const clearInput = () => {
	amount.value = ''
}

const copyResult = () => {
	if (!result.value) return
	uni.setClipboardData({
		data: result.value,
		success: () => {
			uni.showToast({ title: '已复制', icon: 'success' })
		},
	})
}
</script>

<style lang="scss" scoped>
.page {
	min-height: 100vh;
	padding: 24rpx;
	background-color: #f5f6fa;
	box-sizing: border-box;
}

.card {
	margin-bottom: 24rpx;
	padding: 32rpx;
	background-color: #fff;
	border-radius: 16rpx;
}

.section-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20rpx;
}

.section-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
}

.action-btn {
	font-size: 26rpx;
	color: #1677ff;
}

.input {
	height: 88rpx;
	padding: 0 24rpx;
	font-size: 28rpx;
	color: #333;
	background-color: #f5f6fa;
	border-radius: 12rpx;
	box-sizing: border-box;
}

.result-box {
	padding: 28rpx;
	background-color: #f5f6fa;
	border-radius: 12rpx;
}

.result-text {
	font-size: 34rpx;
	font-weight: 600;
	line-height: 1.7;
	color: #1677ff;
	word-break: break-all;
}

.error-box {
	display: flex;
	align-items: flex-start;
	padding: 20rpx 24rpx;
	margin-bottom: 24rpx;
	background-color: #fff2f0;
	border-radius: 12rpx;
}

.error-text {
	flex: 1;
	margin-left: 12rpx;
	font-size: 26rpx;
	line-height: 1.5;
	color: #f56c6c;
}
</style>
