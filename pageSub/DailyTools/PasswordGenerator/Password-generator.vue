<template>
	<view class="page">
		<!-- 生成结果 -->
		<view class="card">
			<view class="card-header">
				<view class="header-left">
					<uni-icons type="locked" size="20" color="#1677ff"></uni-icons>
					<text class="card-title">生成的密码</text>
				</view>
				<view class="header-actions">
					<uni-icons
						:type="showPassword ? 'eye' : 'eye-slash'"
						size="20"
						color="#999"
						@click="toggleVisible"></uni-icons>
					<uni-icons
						type="refresh"
						size="20"
						color="#1677ff"
						@click="generate"></uni-icons>
				</view>
			</view>

			<view class="password-box">
				<text class="password-text">{{ visiblePassword }}</text>
			</view>

			<!-- 强度指示 -->
			<view class="strength-row">
				<view class="strength-bars">
					<view
						v-for="index in 4"
						:key="index"
						class="strength-bar"
						:class="{ active: index <= strengthLevel }"
						:style="{ backgroundColor: index <= strengthLevel ? strengthColor : '#e5e6eb' }"></view>
				</view>
				<text class="strength-label" :style="{ color: strengthColor }"
					>强度：{{ strengthLabel }}</text
				>
			</view>

			<button class="primary-btn" @click="copyPassword">复制密码</button>
		</view>

		<!-- 生成选项 -->
		<view class="card">
			<view class="card-header">
				<view class="header-left">
					<uni-icons type="gear" size="20" color="#1677ff"></uni-icons>
					<text class="card-title">生成选项</text>
				</view>
			</view>

			<view class="card-body">
				<!-- 长度 -->
				<view class="length-row">
					<view class="label-wrapper">
						<text class="label">密码长度</text>
						<text class="length-value">{{ options.length }} 位</text>
					</view>
					<slider
						:value="options.length"
						min="4"
						max="64"
						step="1"
						activeColor="#1677ff"
						backgroundColor="#e5e6eb"
						block-size="20"
						@changing="onLengthChanging"
						@change="onLengthChange" />
				</view>

				<!-- 字符类型 -->
				<view class="charset-section">
					<text class="section-label">包含字符</text>
					<checkbox-group
						class="charset-group"
						:value="enabledCharsets"
						@change="onCharsetChange">
						<label
							v-for="item in charsetOptions"
							:key="item.key"
							class="charset-item"
							:class="{ active: options[item.key] }">
							<checkbox :value="item.key" color="#1677ff" />
							<text class="charset-label">{{ item.label }}</text>
						</label>
					</checkbox-group>
				</view>

				<view class="tip-box">
					<uni-icons type="info" size="16" color="#999"></uni-icons>
					<text class="tip-text"
						>建议长度不低于 12 位，并启用全部字符类型。密码仅在本机生成，不会上传。</text
					>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

import {
	CHARSETS,
	estimateStrength,
	generatePassword,
	getEnabledCharsets,
	getPoolSize,
	type PasswordStrength,
} from './utils/generator'

const options = reactive({
	length: 16,
	uppercase: true,
	lowercase: true,
	digits: true,
	symbols: true,
})

const password = ref('')
const showPassword = ref(true)

const charsetOptions = [
	{ key: 'uppercase', label: '大写字母' },
	{ key: 'lowercase', label: '小写字母' },
	{ key: 'digits', label: '数字' },
	{ key: 'symbols', label: '特殊符号' },
] as const

const enabledCharsets = computed(() => getEnabledCharsets(options))

const visiblePassword = computed(() =>
	showPassword.value ? password.value : '•'.repeat(options.length)
)

const strength = computed<PasswordStrength>(() =>
	estimateStrength(options.length, getPoolSize(options))
)

const strengthLevel = computed(() => {
	const levels: Record<PasswordStrength, number> = {
		weak: 1,
		medium: 2,
		strong: 3,
		'very-strong': 4,
	}
	return levels[strength.value]
})

const strengthLabel = computed(() => {
	const labels: Record<PasswordStrength, string> = {
		weak: '弱',
		medium: '中',
		strong: '强',
		'very-strong': '很强',
	}
	return labels[strength.value]
})

const strengthColor = computed(() => {
	const colors: Record<PasswordStrength, string> = {
		weak: '#f56c6c',
		medium: '#f0ad4e',
		strong: '#4cd964',
		'very-strong': '#1677ff',
	}
	return colors[strength.value]
})

const generate = () => {
	try {
		password.value = generatePassword(options)
	} catch (err) {
		uni.showToast({
			title: err instanceof Error ? err.message : '生成失败',
			icon: 'none',
		})
	}
}

const onLengthChanging = (e: { detail: { value: number } }) => {
	options.length = e.detail.value
}

const onLengthChange = (e: { detail: { value: number } }) => {
	options.length = e.detail.value
	generate()
}

const onCharsetChange = (e: { detail: { value: string[] } }) => {
	const selected = new Set(e.detail.value)
	;(Object.keys(CHARSETS) as Array<keyof typeof CHARSETS>).forEach((key) => {
		options[key] = selected.has(key)
	})
	generate()
}

const toggleVisible = () => {
	showPassword.value = !showPassword.value
}

const copyPassword = () => {
	if (!password.value) return
	uni.setClipboardData({
		data: password.value,
		success: () => {
			uni.showToast({ title: '已复制', icon: 'success' })
		},
	})
}

generate()
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

.card-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 24rpx;

	.header-left {
		display: flex;
		align-items: center;
	}
}

.card-title {
	margin-left: 12rpx;
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
}

.header-actions {
	display: flex;
	align-items: center;
	gap: 32rpx;
}

.password-box {
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 120rpx;
	padding: 24rpx;
	margin-bottom: 24rpx;
	background-color: #f5f6fa;
	border-radius: 12rpx;
}

.password-text {
	font-size: 40rpx;
	font-weight: 600;
	color: #1677ff;
	letter-spacing: 2rpx;
	word-break: break-all;
}

.strength-row {
	display: flex;
	align-items: center;
	margin-bottom: 32rpx;
}

.strength-bars {
	display: flex;
	flex: 1;
	gap: 12rpx;
}

.strength-bar {
	height: 12rpx;
	border-radius: 6rpx;
	transition: background-color 0.2s;
}

.strength-label {
	margin-left: 24rpx;
	font-size: 26rpx;
}

.primary-btn {
	background-color: #1677ff;
	color: #fff;
	font-size: 30rpx;
	border-radius: 12rpx;

	&::after {
		border: none;
	}
}

.length-row {
	margin-bottom: 32rpx;
}

.label-wrapper {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16rpx;
}

.label {
	font-size: 28rpx;
	color: #333;
}

.length-value {
	font-size: 28rpx;
	font-weight: 600;
	color: #1677ff;
}

.charset-section {
	margin-bottom: 24rpx;
}

.section-label {
	display: block;
	margin-bottom: 16rpx;
	font-size: 28rpx;
	color: #333;
}

.charset-group {
	display: flex;
	flex-wrap: wrap;
}

.charset-item {
	display: flex;
	align-items: center;
	padding: 12rpx 24rpx;
	margin: 0 16rpx 16rpx 0;
	background-color: #f5f6fa;
	border-radius: 12rpx;

	&.active {
		background-color: rgba(22, 119, 255, 0.08);
	}
}

.charset-label {
	font-size: 26rpx;
	color: #333;
}

.tip-box {
	display: flex;
	align-items: flex-start;
	padding: 20rpx;
	background-color: #f5f6fa;
	border-radius: 12rpx;
}

.tip-text {
	margin-left: 12rpx;
	font-size: 24rpx;
	color: #999;
	line-height: 1.6;
}
</style>
