<template>
	<view class="page">
		<view class="mode-card">
			<view
				v-for="item in modes"
				:key="item.value"
				class="mode-item"
				:class="{ active: mode === item.value }"
				@click="setMode(item.value)">
				<text>{{ item.label }}</text>
			</view>
		</view>

		<view v-if="mode === 'number'" class="card">
			<view class="section-title">随机数字</view>
			<view class="form-grid">
				<input v-model.number="numberOptions.min" class="input" type="number" placeholder="最小值" />
				<input v-model.number="numberOptions.max" class="input" type="number" placeholder="最大值" />
				<input v-model.number="numberOptions.count" class="input" type="number" placeholder="数量" />
			</view>
			<view class="switch-row">
				<text>仅整数</text>
				<switch :checked="numberOptions.integerOnly" color="#1677ff" @change="setIntegerOnly" />
			</view>
			<view class="switch-row">
				<text>允许重复</text>
				<switch :checked="numberOptions.allowDuplicate" color="#1677ff" @change="setAllowDuplicate" />
			</view>
			<button class="primary-btn" @click="generateNumbers">生成</button>
		</view>

		<view v-if="mode === 'string'" class="card">
			<view class="section-title">随机字符串</view>
			<view class="form-grid">
				<input v-model.number="stringOptions.length" class="input" type="number" placeholder="长度" />
				<input v-model.number="stringOptions.count" class="input" type="number" placeholder="数量" />
			</view>
			<checkbox-group class="checkbox-grid" :value="enabledCharsets" @change="onCharsetChange">
				<label v-for="item in charsetOptions" :key="item.key" class="checkbox-item">
					<checkbox :value="item.key" color="#1677ff" />
					<text>{{ item.label }}</text>
				</label>
			</checkbox-group>
			<button class="primary-btn" @click="generateStrings">生成</button>
		</view>

		<view v-if="mode === 'uuid'" class="card">
			<view class="section-header">
				<text class="section-title">UUID v4</text>
				<text class="action-btn" @click="generateUuids">刷新</text>
			</view>
			<button class="primary-btn" @click="generateUuids">生成 UUID</button>
		</view>

		<view v-if="results.length > 0" class="card">
			<view class="section-header">
				<text class="section-title">结果</text>
				<text class="action-btn" @click="copyAll">复制全部</text>
			</view>
			<view class="result-list">
				<view v-for="(item, index) in results" :key="`${item}-${index}`" class="result-row">
					<text class="result-value">{{ item }}</text>
					<text class="action-btn" @click="copyText(item)">复制</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

import {
	RANDOM_CHARSETS,
	generateRandomNumbers,
	generateRandomStrings,
	generateUuid,
} from './utils/random'

type Mode = 'number' | 'string' | 'uuid'

const mode = ref<Mode>('number')
const results = ref<string[]>([])
const modes: Array<{ label: string; value: Mode }> = [
	{ label: '数字', value: 'number' },
	{ label: '字符串', value: 'string' },
	{ label: 'UUID', value: 'uuid' },
]

const numberOptions = reactive({
	min: 1,
	max: 100,
	count: 5,
	integerOnly: true,
	allowDuplicate: true,
})

const stringOptions = reactive({
	length: 16,
	count: 5,
	uppercase: true,
	lowercase: true,
	digits: true,
	symbols: false,
})

const charsetOptions = [
	{ key: 'uppercase', label: '大写' },
	{ key: 'lowercase', label: '小写' },
	{ key: 'digits', label: '数字' },
	{ key: 'symbols', label: '符号' },
] as const

const enabledCharsets = computed(() =>
	(Object.keys(RANDOM_CHARSETS) as Array<keyof typeof RANDOM_CHARSETS>).filter(
		(key) => stringOptions[key]
	)
)

const setMode = (value: Mode) => {
	mode.value = value
	results.value = []
}

const setIntegerOnly = (event: { detail: { value: boolean } }) => {
	numberOptions.integerOnly = event.detail.value
}

const setAllowDuplicate = (event: { detail: { value: boolean } }) => {
	numberOptions.allowDuplicate = event.detail.value
}

const onCharsetChange = (event: { detail: { value: string[] } }) => {
	const selected = new Set(event.detail.value)
	;(Object.keys(RANDOM_CHARSETS) as Array<keyof typeof RANDOM_CHARSETS>).forEach(
		(key) => {
			stringOptions[key] = selected.has(key)
		}
	)
}

const generateNumbers = () => {
	try {
		results.value = generateRandomNumbers(numberOptions).map(String)
	} catch (error) {
		uni.showToast({
			title: error instanceof Error ? error.message : '生成失败',
			icon: 'none',
		})
	}
}

const generateStrings = () => {
	try {
		results.value = generateRandomStrings(stringOptions)
	} catch (error) {
		uni.showToast({
			title: error instanceof Error ? error.message : '生成失败',
			icon: 'none',
		})
	}
}

const generateUuids = () => {
	results.value = Array.from({ length: 5 }, generateUuid)
}

const copyText = (value: string) => {
	uni.setClipboardData({
		data: value,
		success: () => {
			uni.showToast({ title: '已复制', icon: 'success' })
		},
	})
}

const copyAll = () => {
	copyText(results.value.join('\n'))
}
</script>

<style lang="scss" scoped>
.page {
	min-height: 100vh;
	padding: 24rpx;
	background-color: #f5f6fa;
	box-sizing: border-box;
}

.mode-card {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 12rpx;
	margin-bottom: 24rpx;
	padding: 8rpx;
	background-color: #fff;
	border-radius: 16rpx;
}

.mode-item {
	height: 72rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 28rpx;
	color: #666;
	border-radius: 12rpx;
}

.mode-item.active {
	background-color: #1677ff;
	color: #fff;
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
	margin-bottom: 20rpx;
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
}

.section-header .section-title {
	margin-bottom: 0;
}

.form-grid {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 16rpx;
	margin-bottom: 24rpx;
}

.input {
	height: 80rpx;
	padding: 0 20rpx;
	font-size: 26rpx;
	color: #333;
	background-color: #f5f6fa;
	border-radius: 12rpx;
	box-sizing: border-box;
}

.switch-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 18rpx 0;
	font-size: 28rpx;
	color: #333;
	border-bottom: 1rpx solid #f0f0f0;
}

.checkbox-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 16rpx;
	margin-bottom: 24rpx;
}

.checkbox-item {
	display: flex;
	align-items: center;
	gap: 8rpx;
	padding: 16rpx;
	font-size: 26rpx;
	background-color: #f5f6fa;
	border-radius: 12rpx;
}

.primary-btn {
	width: 100%;
	height: 76rpx;
	margin-top: 24rpx;
	font-size: 28rpx;
	line-height: 76rpx;
	color: #fff;
	background-color: #1677ff;
	border-radius: 12rpx;

	&::after {
		border: none;
	}
}

.result-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 20rpx;
	padding: 20rpx 0;
	border-bottom: 1rpx solid #f0f0f0;
}

.result-row:last-child {
	border-bottom: none;
}

.result-value {
	min-width: 0;
	flex: 1;
	font-size: 28rpx;
	color: #333;
	word-break: break-all;
}

.action-btn {
	font-size: 26rpx;
	color: #1677ff;
	flex-shrink: 0;
}
</style>
