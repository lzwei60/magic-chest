<template>
	<view class="page">
		<view class="card">
			<view class="section-header">
				<text class="section-title">身份证号码</text>
				<text v-if="idCard" class="action-btn" @click="clearInput">清空</text>
			</view>
			<input
				v-model="idCard"
				class="input"
				placeholder="请输入 18 位身份证号码"
				placeholder-style="color: #999"
				maxlength="18" />
			<view class="privacy-tip">仅本地校验，不保存历史记录</view>
		</view>

		<view v-if="idCard" class="card">
			<view class="status-box" :class="{ valid: info.valid }">
				<text class="status-title">{{ info.valid ? '校验通过' : '校验失败' }}</text>
				<text class="status-desc">{{ info.valid ? info.normalized : info.error }}</text>
			</view>
			<view v-if="info.valid" class="info-list">
				<view class="info-row">
					<text>生日</text>
					<text>{{ info.birthday }}</text>
				</view>
				<view class="info-row">
					<text>年龄</text>
					<text>{{ info.age }}</text>
				</view>
				<view class="info-row">
					<text>性别</text>
					<text>{{ info.gender === 'male' ? '男' : '女' }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import { validateIdCard } from './utils/idCard'

const idCard = ref('')
const info = computed(() => validateIdCard(idCard.value))

const clearInput = () => {
	idCard.value = ''
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

.privacy-tip {
	margin-top: 16rpx;
	font-size: 24rpx;
	color: #999;
}

.status-box {
	padding: 28rpx;
	background-color: #fff2f0;
	border-radius: 12rpx;
}

.status-box.valid {
	background-color: #f0f9eb;
}

.status-title {
	display: block;
	margin-bottom: 8rpx;
	font-size: 34rpx;
	font-weight: 600;
	color: #333;
}

.status-desc {
	font-size: 26rpx;
	color: #666;
	word-break: break-all;
}

.info-list {
	margin-top: 24rpx;
}

.info-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 0;
	font-size: 28rpx;
	color: #333;
	border-bottom: 1rpx solid #f0f0f0;
}

.info-row:last-child {
	border-bottom: none;
}
</style>
