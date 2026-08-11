<template>
	<view class="page">
		<view class="card">
			<view class="section-title">正则表达式</view>
			<input
				v-model="pattern"
				class="input"
				placeholder="例如 \\d+"
				placeholder-style="color: #999" />
			<checkbox-group class="flag-row" :value="enabledFlags" @change="onFlagChange">
				<label v-for="item in flagOptions" :key="item.key" class="flag-item">
					<checkbox :value="item.key" color="#1677ff" />
					<text>{{ item.label }}</text>
				</label>
			</checkbox-group>
		</view>

		<view class="card">
			<view class="section-title">测试文本</view>
			<textarea
				v-model="text"
				class="textarea"
				maxlength="-1"
				placeholder="输入要匹配的文本"
				placeholder-style="color: #999"
				:disable-default-padding="true"></textarea>
		</view>

		<view class="card">
			<view class="section-title">替换预览</view>
			<input
				v-model="replacement"
				class="input"
				placeholder="替换内容，可留空"
				placeholder-style="color: #999" />
		</view>

		<view v-if="result.error" class="error-box">
			<uni-icons type="info" size="18" color="#f56c6c"></uni-icons>
			<text class="error-text">{{ result.error }}</text>
		</view>

		<view v-if="result.ok" class="card">
			<view class="section-header">
				<text class="section-title">匹配结果 {{ result.matches?.length ?? 0 }}</text>
				<text class="action-btn" @click="copyReplace">复制替换结果</text>
			</view>
			<view v-if="result.matches?.length" class="match-list">
				<view v-for="(item, index) in result.matches" :key="index" class="match-row">
					<text class="match-main">{{ item.text }}</text>
					<text class="match-pos">位置 {{ item.index }}</text>
				</view>
			</view>
			<view v-else class="empty-text">未匹配到内容</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

import { testRegex } from './utils/regex'

const pattern = ref('\\d+')
const text = ref('订单 A123，订单 B456')
const replacement = ref('#')
const flags = reactive({
	global: true,
	ignoreCase: false,
	multiline: false,
})

const flagOptions = [
	{ key: 'global', label: 'g' },
	{ key: 'ignoreCase', label: 'i' },
	{ key: 'multiline', label: 'm' },
] as const

const enabledFlags = computed(() =>
	flagOptions.filter((item) => flags[item.key]).map((item) => item.key)
)
const result = computed(() => testRegex(pattern.value, text.value, flags, replacement.value))

const onFlagChange = (event: { detail: { value: string[] } }) => {
	const selected = new Set(event.detail.value)
	flagOptions.forEach((item) => {
		flags[item.key] = selected.has(item.key)
	})
}

const copyReplace = () => {
	if (!result.value.replaced) return
	uni.setClipboardData({
		data: result.value.replaced,
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
	margin-bottom: 20rpx;
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
}

.section-header .section-title {
	margin-bottom: 0;
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

.textarea {
	width: 100%;
	min-height: 280rpx;
	padding: 20rpx;
	font-size: 26rpx;
	line-height: 1.6;
	color: #333;
	background-color: #f5f6fa;
	border-radius: 12rpx;
	box-sizing: border-box;
}

.flag-row {
	display: flex;
	gap: 16rpx;
	margin-top: 20rpx;
}

.flag-item {
	display: flex;
	align-items: center;
	gap: 8rpx;
	padding: 12rpx 18rpx;
	background-color: #f5f6fa;
	border-radius: 12rpx;
	font-size: 26rpx;
	color: #333;
}

.match-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 20rpx;
	padding: 18rpx 0;
	border-bottom: 1rpx solid #f0f0f0;
}

.match-row:last-child {
	border-bottom: none;
}

.match-main {
	min-width: 0;
	flex: 1;
	font-size: 28rpx;
	color: #333;
	word-break: break-all;
}

.match-pos,
.empty-text {
	font-size: 24rpx;
	color: #999;
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
