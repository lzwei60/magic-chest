<template>
	<view class="page">
		<view class="card">
			<view class="section-header">
				<text class="section-title">JSON 输入</text>
				<view class="input-actions">
					<text v-if="input" class="action-btn" @click="clearInput">清空</text>
					<text class="action-btn" @click="pasteText">粘贴</text>
				</view>
			</view>
			<input
				v-model="rootName"
				class="input"
				placeholder="根类型名，例如 Root"
				placeholder-style="color: #999" />
			<textarea
				v-model="input"
				class="textarea"
				maxlength="-1"
				placeholder="输入 JSON 内容"
				placeholder-style="color: #999"
				:disable-default-padding="true"></textarea>
		</view>

		<view v-if="error" class="error-box">
			<uni-icons type="info" size="18" color="#f56c6c"></uni-icons>
			<text class="error-text">{{ error }}</text>
		</view>

		<view v-if="result" class="card">
			<view class="section-header">
				<text class="section-title">TypeScript 类型</text>
				<text class="action-btn" @click="copyResult">复制</text>
			</view>
			<textarea
				:value="result"
				class="textarea result-textarea"
				maxlength="-1"
				:disable-default-padding="true"
				readonly></textarea>
		</view>
	</view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import { jsonToTypeScript } from './utils/jsonToTypes'

const rootName = ref('Root')
const input = ref('')
const converted = computed(() => jsonToTypeScript(input.value, rootName.value))
const result = computed(() => (converted.value.ok ? converted.value.value ?? '' : ''))
const error = computed(() => (input.value && !converted.value.ok ? converted.value.error : ''))

const clearInput = () => {
	input.value = ''
}

const pasteText = () => {
	uni.getClipboardData({
		success: (res) => {
			input.value = res.data
		},
	})
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

.input-actions {
	display: flex;
	align-items: center;
	gap: 32rpx;
}

.action-btn {
	font-size: 26rpx;
	color: #1677ff;
}

.input {
	height: 80rpx;
	padding: 0 24rpx;
	margin-bottom: 20rpx;
	font-size: 28rpx;
	color: #333;
	background-color: #f5f6fa;
	border-radius: 12rpx;
	box-sizing: border-box;
}

.textarea {
	width: 100%;
	min-height: 320rpx;
	padding: 20rpx;
	font-size: 26rpx;
	line-height: 1.6;
	color: #333;
	background-color: #f5f6fa;
	border-radius: 12rpx;
	box-sizing: border-box;
}

.result-textarea {
	color: #1677ff;
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
