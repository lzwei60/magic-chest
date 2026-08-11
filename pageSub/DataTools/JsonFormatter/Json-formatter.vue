<template>
	<view class="page">
		<!-- 输入区域 -->
		<view class="card">
			<view class="section-header">
				<text class="section-title">输入 JSON</text>
				<view class="input-actions">
					<text v-if="input" class="action-btn" @click="clearInput">清空</text>
					<text class="action-btn" @click="pasteText">粘贴</text>
				</view>
			</view>
			<textarea
				v-model="input"
				class="textarea"
				maxlength="-1"
				placeholder="粘贴或输入 JSON 内容"
				placeholder-style="color: #999"
				:disable-default-padding="true"></textarea>
			<view v-if="input" class="input-count">
				已输入 {{ input.length }} 个字符
			</view>

			<!-- 选项 -->
			<view class="options-row">
				<view class="picker-wrapper">
					<picker :range="indentOptions" :value="indentIndex" @change="onIndentChange">
						<view class="picker">
							<text class="picker-label">缩进</text>
							<text class="picker-value">{{ indentOptions[indentIndex] }}</text>
							<uni-icons type="bottom" size="14" color="#999"></uni-icons>
						</view>
					</picker>
				</view>
				<view class="action-buttons">
					<button class="secondary-btn" @click="runMinify" :disabled="!input">压缩</button>
					<button class="primary-btn" @click="runFormat" :disabled="!input">格式化</button>
				</view>
			</view>
		</view>

		<!-- 错误提示 -->
		<view v-if="error" class="error-box">
			<uni-icons type="info" size="18" color="#f56c6c"></uni-icons>
			<text class="error-text">{{ error }}</text>
		</view>

		<!-- 结果区域 -->
		<view v-if="result" class="card">
			<view class="section-header">
				<text class="section-title">结果</text>
				<view class="input-actions">
					<text class="action-btn" @click="copyResult">复制结果</text>
				</view>
			</view>
			<textarea
				:value="result"
				class="textarea result-textarea"
				maxlength="-1"
				:disable-default-padding="true"
				readonly></textarea>
		</view>

		<!-- 空状态 -->
		<view v-if="!input && !result" class="empty-state">
			<uni-icons type="tune" size="60" color="#ccc"></uni-icons>
			<text class="empty-text">支持格式化、压缩，并自动校验 JSON 格式</text>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { formatJson, minifyJson } from './utils/format'

const input = ref('')
const result = ref('')
const error = ref('')
const indentIndex = ref(0)
const indentOptions = ['2 空格', '4 空格']

const indent = () => (indentIndex.value === 0 ? 2 : 4)

const runFormat = () => {
	const res = formatJson(input.value, indent())
	if (res.ok) {
		result.value = res.value ?? ''
		error.value = ''
	} else {
		error.value = res.error ?? '处理失败'
	}
}

const runMinify = () => {
	const res = minifyJson(input.value)
	if (res.ok) {
		result.value = res.value ?? ''
		error.value = ''
	} else {
		error.value = res.error ?? '处理失败'
	}
}

const onIndentChange = (e: { detail: { value: number } }) => {
	indentIndex.value = e.detail.value
	if (result.value) {
		runFormat()
	}
}

const clearInput = () => {
	input.value = ''
	result.value = ''
	error.value = ''
}

const pasteText = () => {
	uni.getClipboardData({
		success: (res) => {
			if (res.data) {
				input.value = res.data
				runFormat()
			}
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

.input-actions {
	display: flex;
	align-items: center;
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

.input-count {
	margin-top: 12rpx;
	font-size: 24rpx;
	color: #999;
}

.options-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 24rpx;
}

.picker-wrapper {
	display: flex;
	align-items: center;
}

.picker {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.picker-label {
	font-size: 26rpx;
	color: #333;
}

.picker-value {
	font-size: 26rpx;
	color: #1677ff;
}

.action-buttons {
	display: flex;
	align-items: center;
	gap: 20rpx;
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
	background-color: rgba(245, 108, 108, 0.08);
	border-radius: 12rpx;
}

.error-text {
	margin-left: 12rpx;
	font-size: 26rpx;
	color: #f56c6c;
	line-height: 1.5;
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 120rpx 0;
}

.empty-text {
	margin-top: 20rpx;
	font-size: 26rpx;
	color: #999;
}
</style>
