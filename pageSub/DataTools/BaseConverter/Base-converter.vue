<template>
	<view class="page">
		<view class="card">
			<view class="section-header">
				<text class="section-title">数字输入</text>
				<text v-if="input" class="action-btn" @click="clearInput">清空</text>
			</view>
			<input
				v-model="input"
				class="input"
				placeholder="输入要转换的数字"
				placeholder-style="color: #999" />
			<view class="base-grid">
				<view
					v-for="item in baseOptions"
					:key="item.value"
					class="base-item"
					:class="{ active: fromBase === item.value }"
					@click="setBase(item.value)">
					<text>{{ item.label }}</text>
				</view>
			</view>
		</view>

		<view v-if="error" class="error-box">
			<uni-icons type="info" size="18" color="#f56c6c"></uni-icons>
			<text class="error-text">{{ error }}</text>
		</view>

		<view v-if="values" class="card">
			<view class="section-header">
				<text class="section-title">转换结果</text>
				<text class="action-btn" @click="copyAll">复制全部</text>
			</view>
			<view class="result-list">
				<view v-for="item in resultItems" :key="item.label" class="result-row">
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

import { convertBase, type NumberBase } from './utils/base'

const input = ref('')
const fromBase = ref<NumberBase>(10)
const baseOptions: Array<{ label: string; value: NumberBase }> = [
	{ label: '二进制', value: 2 },
	{ label: '八进制', value: 8 },
	{ label: '十进制', value: 10 },
	{ label: '十六进制', value: 16 },
]

const converted = computed(() => convertBase(input.value, fromBase.value))
const values = computed(() => converted.value.values)
const error = computed(() => (input.value && !converted.value.ok ? converted.value.error : ''))
const resultItems = computed(() =>
	values.value
		? baseOptions.map((item) => ({
				label: item.label,
				value: values.value?.[item.value] ?? '',
			}))
		: []
)

const setBase = (value: NumberBase) => {
	fromBase.value = value
}

const clearInput = () => {
	input.value = ''
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
	copyText(resultItems.value.map((item) => `${item.label}: ${item.value}`).join('\n'))
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
	flex-shrink: 0;
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

.base-grid {
	display: grid;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	gap: 12rpx;
	margin-top: 24rpx;
}

.base-item {
	height: 68rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 24rpx;
	color: #666;
	background-color: #f5f6fa;
	border-radius: 12rpx;
}

.base-item.active {
	color: #fff;
	background-color: #1677ff;
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
