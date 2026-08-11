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
				placeholder="输入或粘贴要统计的文本"
				placeholder-style="color: #999"
				:disable-default-padding="true"></textarea>
		</view>

		<view class="card">
			<view class="section-header">
				<text class="section-title">统计结果</text>
				<text class="action-btn" @click="copySummary">复制摘要</text>
			</view>
			<view class="stats-grid">
				<view v-for="item in statItems" :key="item.label" class="stat-item">
					<text class="stat-value">{{ item.value }}</text>
					<text class="stat-label">{{ item.label }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import { countTextStats } from './utils/counter'

const input = ref('')
const stats = computed(() => countTextStats(input.value))

const statItems = computed(() => [
	{ label: '字符数', value: stats.value.characters },
	{ label: '不含空白', value: stats.value.charactersNoSpaces },
	{ label: '词数估算', value: stats.value.words },
	{ label: '行数', value: stats.value.lines },
	{ label: '段落数', value: stats.value.paragraphs },
	{ label: '中文字符', value: stats.value.chineseCharacters },
	{ label: '英文字符', value: stats.value.letters },
	{ label: '数字', value: stats.value.digits },
	{ label: '空白符', value: stats.value.spaces },
	{ label: '标点符号', value: stats.value.punctuation },
	{ label: '阅读分钟', value: stats.value.estimatedReadingMinutes },
])

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

const copySummary = () => {
	const summary = statItems.value.map((item) => `${item.label}: ${item.value}`).join('\n')
	uni.setClipboardData({
		data: summary,
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
	min-height: 360rpx;
	padding: 20rpx;
	font-size: 26rpx;
	line-height: 1.6;
	color: #333;
	background-color: #f5f6fa;
	border-radius: 12rpx;
	box-sizing: border-box;
}

.stats-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 20rpx;
}

.stat-item {
	min-height: 132rpx;
	padding: 20rpx;
	background-color: #f5f6fa;
	border-radius: 12rpx;
	box-sizing: border-box;
}

.stat-value {
	display: block;
	margin-bottom: 8rpx;
	font-size: 36rpx;
	font-weight: 600;
	color: #1677ff;
	word-break: break-all;
}

.stat-label {
	font-size: 24rpx;
	color: #666;
}
</style>
