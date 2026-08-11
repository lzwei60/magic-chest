<template>
	<view class="page">
		<view class="card">
			<view class="section-header">
				<text class="section-title">输入文本</text>
				<view class="input-actions">
					<text v-if="input" class="action-btn" @click="clearInput">清空</text>
					<text class="action-btn" @click="pasteText">粘贴</text>
				</view>
			</view>
			<textarea
				v-model="input"
				class="textarea"
				maxlength="-1"
				placeholder="输入 helloWorld、hello_world 或普通文本"
				placeholder-style="color: #999"
				:disable-default-padding="true"></textarea>
		</view>

		<view class="card">
			<view class="section-header">
				<text class="section-title">转换结果</text>
				<text class="action-btn" @click="copyAll">复制全部</text>
			</view>
			<view class="result-list">
				<view v-for="item in results" :key="item.label" class="result-row">
					<view class="result-main">
						<text class="result-label">{{ item.label }}</text>
						<text class="result-value">{{ item.value }}</text>
					</view>
					<text class="action-btn" @click="copyText(item.value)">复制</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import { convertCase, type CaseMode } from './utils/case'

const input = ref('')
const modes: Array<{ label: string; mode: CaseMode }> = [
	{ label: '小写', mode: 'lower' },
	{ label: '大写', mode: 'upper' },
	{ label: 'camelCase', mode: 'camel' },
	{ label: 'PascalCase', mode: 'pascal' },
	{ label: 'kebab-case', mode: 'kebab' },
	{ label: 'snake_case', mode: 'snake' },
	{ label: 'CONSTANT_CASE', mode: 'constant' },
]

const results = computed(() =>
	modes.map((item) => ({
		label: item.label,
		value: input.value ? convertCase(input.value, item.mode) : '',
	}))
)

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

const copyText = (value: string) => {
	if (!value) return
	uni.setClipboardData({
		data: value,
		success: () => {
			uni.showToast({ title: '已复制', icon: 'success' })
		},
	})
}

const copyAll = () => {
	const text = results.value.map((item) => `${item.label}: ${item.value}`).join('\n')
	copyText(text)
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
	flex-shrink: 0;
}

.textarea {
	width: 100%;
	min-height: 260rpx;
	padding: 20rpx;
	font-size: 26rpx;
	line-height: 1.6;
	color: #333;
	background-color: #f5f6fa;
	border-radius: 12rpx;
	box-sizing: border-box;
}

.result-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 20rpx;
	padding: 22rpx 0;
	border-bottom: 1rpx solid #f0f0f0;
}

.result-row:last-child {
	border-bottom: none;
}

.result-main {
	min-width: 0;
	flex: 1;
}

.result-label {
	display: block;
	margin-bottom: 8rpx;
	font-size: 24rpx;
	color: #666;
}

.result-value {
	display: block;
	font-size: 28rpx;
	color: #333;
	word-break: break-all;
}
</style>
