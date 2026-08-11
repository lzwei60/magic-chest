<template>
	<view class="page">
		<view class="card">
			<view class="section-header">
				<text class="section-title">当前时间</text>
				<text class="action-btn" @click="refreshNow">刷新</text>
			</view>
			<view class="current-time">
				<text class="current-value">{{ currentDateTime }}</text>
				<text class="current-desc">秒 {{ nowSeconds }} / 毫秒 {{ nowMilliseconds }}</text>
			</view>
			<view class="copy-grid">
				<button class="secondary-btn" @click="copyText(String(nowSeconds))">复制秒</button>
				<button class="secondary-btn" @click="copyText(String(nowMilliseconds))">
					复制毫秒
				</button>
			</view>
		</view>

		<view class="card">
			<view class="section-header">
				<text class="section-title">时间戳转日期</text>
				<text v-if="timestampInput" class="action-btn" @click="clearInput">清空</text>
			</view>
			<input
				v-model="timestampInput"
				class="input"
				type="number"
				placeholder="输入 10 位秒或 13 位毫秒时间戳"
				placeholder-style="color: #999" />
			<button class="primary-btn block-btn" :disabled="!timestampInput" @click="convertTimestamp">
				转换
			</button>
		</view>

		<view v-if="error" class="error-box">
			<uni-icons type="info" size="18" color="#f56c6c"></uni-icons>
			<text class="error-text">{{ error }}</text>
		</view>

		<view v-if="convertedDate" class="card">
			<view class="section-header">
				<text class="section-title">转换结果</text>
				<text class="action-btn" @click="copyText(convertedDate)">复制日期</text>
			</view>
			<view class="result-box">
				<text class="result-value">{{ convertedDate }}</text>
				<text class="result-desc">识别为{{ parsedUnitText }}时间戳</text>
			</view>
		</view>

		<view class="card">
			<view class="section-header">
				<text class="section-title">日期转时间戳</text>
			</view>
			<uni-datetime-picker v-model="dateInput" type="datetime" @change="convertDate" />
			<view class="timestamp-list">
				<view class="timestamp-row">
					<text class="timestamp-label">秒</text>
					<text class="timestamp-value">{{ dateSeconds }}</text>
					<text class="action-btn" @click="copyText(String(dateSeconds))">复制</text>
				</view>
				<view class="timestamp-row">
					<text class="timestamp-label">毫秒</text>
					<text class="timestamp-value">{{ dateMilliseconds }}</text>
					<text class="action-btn" @click="copyText(String(dateMilliseconds))">复制</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onHide, onShow, onUnload } from '@dcloudio/uni-app'

import { dateToTimestamp, formatDateTime, parseTimestamp } from './utils/timestamp'

const now = ref(new Date())
let timer: ReturnType<typeof setInterval> | undefined
const timestampInput = ref('')
const convertedDate = ref('')
const parsedUnit = ref('')
const error = ref('')
const dateInput = ref(formatDateTime(new Date()))

const nowTimestamps = computed(() => dateToTimestamp(now.value))
const nowSeconds = computed(() => nowTimestamps.value.seconds)
const nowMilliseconds = computed(() => nowTimestamps.value.milliseconds)
const currentDateTime = computed(() => formatDateTime(now.value))

const selectedDate = computed(() => new Date(dateInput.value.replace(/-/g, '/')))
const selectedTimestamps = computed(() => dateToTimestamp(selectedDate.value))
const dateSeconds = computed(() => selectedTimestamps.value.seconds)
const dateMilliseconds = computed(() => selectedTimestamps.value.milliseconds)
const parsedUnitText = computed(() => (parsedUnit.value === 'second' ? '秒级' : '毫秒级'))

const refreshNow = () => {
	now.value = new Date()
}

const startClock = () => {
	stopClock()
	refreshNow()
	timer = setInterval(refreshNow, 1000)
}

const stopClock = () => {
	if (timer) {
		clearInterval(timer)
		timer = undefined
	}
}

const convertTimestamp = () => {
	const result = parseTimestamp(timestampInput.value)
	if (!result.ok || !result.value) {
		error.value = result.error ?? '转换失败'
		convertedDate.value = ''
		return
	}

	convertedDate.value = formatDateTime(result.value)
	parsedUnit.value = result.unit ?? ''
	error.value = ''
}

const convertDate = () => {
	if (Number.isNaN(selectedDate.value.getTime())) {
		uni.showToast({ title: '日期格式无效', icon: 'none' })
	}
}

const clearInput = () => {
	timestampInput.value = ''
	convertedDate.value = ''
	error.value = ''
}

const copyText = (value: string) => {
	uni.setClipboardData({
		data: value,
		success: () => {
			uni.showToast({ title: '已复制', icon: 'success' })
		},
	})
}

onShow(startClock)
onHide(stopClock)
onUnload(stopClock)
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

.current-time,
.result-box {
	padding: 24rpx;
	background-color: #f5f6fa;
	border-radius: 12rpx;
}

.current-value,
.result-value {
	display: block;
	margin-bottom: 12rpx;
	font-size: 36rpx;
	font-weight: 600;
	color: #1677ff;
	word-break: break-all;
}

.current-desc,
.result-desc {
	font-size: 24rpx;
	color: #666;
}

.copy-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 20rpx;
	margin-top: 24rpx;
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

.primary-btn,
.secondary-btn {
	height: 72rpx;
	margin: 0;
	padding: 0 32rpx;
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

.block-btn {
	width: 100%;
	margin-top: 24rpx;
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

.timestamp-list {
	margin-top: 24rpx;
}

.timestamp-row {
	display: grid;
	grid-template-columns: 90rpx minmax(0, 1fr) 64rpx;
	align-items: center;
	gap: 16rpx;
	padding: 20rpx 0;
	border-bottom: 1rpx solid #f0f0f0;
}

.timestamp-row:last-child {
	border-bottom: none;
}

.timestamp-label {
	font-size: 26rpx;
	color: #666;
}

.timestamp-value {
	font-size: 28rpx;
	color: #333;
	word-break: break-all;
}
</style>
