<template>
	<view class="page">
		<view class="card">
			<view class="section-header">
				<text class="section-title">输入内容</text>
				<view class="input-actions">
					<text v-if="input" class="action-btn" @click="clearInput">清空</text>
					<text class="action-btn" @click="pasteText">粘贴</text>
				</view>
			</view>
			<textarea
				v-model="input"
				class="textarea"
				maxlength="-1"
				placeholder="输入 URL 参数、中文或已编码内容"
				placeholder-style="color: #999"
				:disable-default-padding="true"></textarea>
			<view class="action-buttons">
				<button class="secondary-btn" :disabled="!input" @click="runDecode">解码</button>
				<button class="primary-btn" :disabled="!input" @click="runEncode">编码</button>
			</view>
		</view>

		<view v-if="error" class="error-box">
			<uni-icons type="info" size="18" color="#f56c6c"></uni-icons>
			<text class="error-text">{{ error }}</text>
		</view>

		<view v-if="result" class="card">
			<view class="section-header">
				<text class="section-title">结果</text>
				<text class="action-btn" @click="copyResult">复制结果</text>
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
import { ref } from 'vue'

import { decodeUrl, encodeUrl } from './utils/url'

const input = ref('')
const result = ref('')
const error = ref('')

const applyResult = (res: ReturnType<typeof encodeUrl>) => {
	if (res.ok) {
		result.value = res.value ?? ''
		error.value = ''
	} else {
		error.value = res.error ?? '处理失败'
	}
}

const runEncode = () => {
	applyResult(encodeUrl(input.value))
}

const runDecode = () => {
	applyResult(decodeUrl(input.value))
}

const clearInput = () => {
	input.value = ''
	result.value = ''
	error.value = ''
}

const pasteText = () => {
	uni.getClipboardData({
		success: (res) => {
			input.value = res.data
		},
	})
}

const copyResult = () => {
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

.input-actions,
.action-buttons {
	display: flex;
	align-items: center;
	gap: 24rpx;
}

.input-actions {
	gap: 32rpx;
}

.action-btn {
	font-size: 26rpx;
	color: #1677ff;
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

.action-buttons {
	justify-content: flex-end;
	margin-top: 24rpx;
}

.primary-btn,
.secondary-btn {
	height: 72rpx;
	margin: 0;
	padding: 0 40rpx;
	font-size: 28rpx;
	line-height: 72rpx;
	border-radius: 12rpx;

	&::after {
		border: none;
	}
}

.primary-btn {
	background-color: #1677ff;
	color: #fff;
}

.secondary-btn {
	background-color: #f5f6fa;
	color: #333;
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
