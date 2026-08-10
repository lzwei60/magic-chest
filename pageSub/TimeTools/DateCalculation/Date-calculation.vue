<template>
	<view class="date-calculator">
		<!-- 模式切换卡片 -->
		<view class="mode-card">
			<view
				class="mode-item"
				:class="{ active: mode === 'forward' }"
				@click="setMode('forward')">
				<text class="mode-icon">➜</text>
				<text class="mode-label">日期计算</text>
			</view>
			<view
				class="mode-item"
				:class="{ active: mode === 'backward' }"
				@click="setMode('backward')">
				<text class="mode-icon">⇄</text>
				<text class="mode-label">日期差值</text>
			</view>
		</view>

		<!-- 日期计算模式 -->
		<view v-if="mode === 'forward'" class="content-card">
			<!-- 起始日期 -->
			<view class="input-section">
				<view class="section-label">
					<text class="label-icon">📅</text>
					<text>起始日期</text>
				</view>
				<view class="date-input-wrapper">
					<uni-datetime-picker
						v-model="inputDate"
						type="date"
						@change="calculateResult" />
					<button class="quick-date-btn" @click="useToday">今天</button>
				</view>
			</view>

			<!-- 运算设置 -->
			<view class="operation-section">
				<view class="operation-row">
					<view class="operation-label">运算</view>
					<view class="operation-buttons">
						<view
							class="operation-btn"
							:class="{ active: operationType === 'add' }"
							@click="setOperation('add')">
							<text class="btn-icon">➕</text>
							<text>加</text>
						</view>
						<view
							class="operation-btn"
							:class="{ active: operationType === 'subtract' }"
							@click="setOperation('subtract')">
							<text class="btn-icon">➖</text>
							<text>减</text>
						</view>
					</view>
				</view>

				<view class="operation-row">
					<view class="operation-label">单位</view>
					<view class="unit-buttons">
						<view
							v-for="u in units"
							:key="u.value"
							class="unit-btn"
							:class="{ active: unit === u.value }"
							@click="setUnit(u.value)">
							<text>{{ u.label }}</text>
						</view>
					</view>
				</view>

				<view class="amount-input-wrapper">
					<view class="operation-label">数量</view>
					<view class="amount-controls">
						<button class="amount-btn" @click="adjustAmount(-1)">−</button>
						<input
							v-model="amount"
							type="number"
							class="amount-input"
							@input="calculateResult" />
						<button class="amount-btn" @click="adjustAmount(1)">+</button>
					</view>
				</view>
			</view>

			<!-- 快捷操作 -->
			<view class="shortcut-section">
				<view class="section-label">
					<text class="label-icon">⚡</text>
					<text>快捷操作</text>
				</view>
				<view class="shortcut-grid">
					<view
						v-for="(shortcut, index) in shortcuts"
						:key="index"
						class="shortcut-item"
						@click="applyShortcut(shortcut.value, shortcut.unit)">
						<text class="shortcut-value">{{ shortcut.label }}</text>
						<text class="shortcut-unit">{{ shortcut.unitLabel }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 日期差值模式 -->
		<view v-else class="content-card">
			<!-- 起始日期 -->
			<view class="input-section">
				<view class="section-label">
					<text class="label-icon">📅</text>
					<text>起始日期</text>
				</view>
				<view class="date-input-wrapper">
					<uni-datetime-picker
						v-model="inputDate"
						type="date"
						@change="calculateResult" />
					<button class="quick-date-btn" @click="useToday">今天</button>
				</view>
			</view>

			<!-- 目标日期 -->
			<view class="input-section">
				<view class="section-label">
					<text class="label-icon">🎯</text>
					<text>目标日期</text>
				</view>
				<view class="date-input-wrapper">
					<uni-datetime-picker
						v-model="targetDate"
						type="date"
						@change="calculateResult" />
					<button class="quick-date-btn" @click="useTodayTarget">今天</button>
				</view>
			</view>

			<!-- 快捷日期 -->
			<view class="shortcut-section">
				<view class="section-label">
					<text class="label-icon">⚡</text>
					<text>快捷选择</text>
				</view>
				<view class="shortcut-grid">
					<view
						v-for="dateShortcut in dateShortcuts"
						:key="dateShortcut.label"
						class="shortcut-item"
						@click="applyDateShortcut(dateShortcut)">
						<text class="shortcut-value">{{ dateShortcut.label }}</text>
						<text class="shortcut-unit">{{ dateShortcut.date }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 结果显示卡片 -->
		<view v-if="resultText || diffResult" class="result-card">
			<view class="result-header">
				<text class="result-icon">✨</text>
				<text class="result-title">计算结果</text>
			</view>

			<!-- 日期计算模式结果 -->
			<view v-if="mode === 'forward' && resultText" class="result-content">
				<view class="result-date-flow">
					<view class="date-item">
						<text class="date-value">{{ inputDate }}</text>
						<text class="date-weekday">{{ getWeekday(inputDate) }}</text>
					</view>
					<view class="arrow">
						<text class="arrow-icon">{{
							operationType === 'add' ? '→' : '←'
						}}</text>
						<text class="arrow-desc">{{ resultDescription }}</text>
					</view>
					<view class="date-item result-date">
						<text class="date-value">{{ resultDate }}</text>
						<text class="date-weekday">{{ getWeekday(resultDate) }}</text>
					</view>
				</view>
				<view class="result-detail">
					<text class="detail-text">{{ resultText }}</text>
				</view>
			</view>

			<!-- 日期差值模式结果 -->
			<view v-if="mode === 'backward' && diffResult" class="result-content">
				<view class="diff-summary">
					<text class="diff-value">{{ diffResult.days }}</text>
					<text class="diff-label">天</text>
				</view>
				<view class="diff-details">
					<view class="diff-item">
						<text class="diff-icon">📊</text>
						<text class="diff-text">{{ diffResult.details }}</text>
					</view>
					<view v-if="diffResult.weeks" class="diff-item">
						<text class="diff-icon">📅</text>
						<text class="diff-text">{{ diffResult.weeks }}</text>
					</view>
					<view class="date-item-group">
						<view class="date-item">
							<text class="date-label">起始</text>
							<text class="date-value">{{ inputDate }}</text>
							<text class="date-weekday">{{ getWeekday(inputDate) }}</text>
						</view>
						<view class="date-item">
							<text class="date-label">目标</text>
							<text class="date-value">{{ targetDate }}</text>
							<text class="date-weekday">{{ getWeekday(targetDate) }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import dayjs from 'dayjs'
import weekday from 'dayjs/plugin/weekday'
import 'dayjs/locale/zh-cn'

dayjs.extend(weekday)
dayjs.locale('zh-cn')

// 基本状态
const inputDate = ref(dayjs().format('YYYY-MM-DD'))
const targetDate = ref('')
const mode = ref('forward') // forward: 日期计算, backward: 日期差值
const operationType = ref('add') // add / subtract
const unit = ref('day') // day / week / month / year
const amount = ref(1)

// 单位配置
const units = [
	{ label: '天', value: 'day' },
	{ label: '周', value: 'week' },
	{ label: '月', value: 'month' },
	{ label: '年', value: 'year' },
]

// 快捷操作配置
const shortcuts = [
	{ label: '1', value: 1, unit: 'day', unitLabel: '天' },
	{ label: '7', value: 7, unit: 'day', unitLabel: '天' },
	{ label: '30', value: 30, unit: 'day', unitLabel: '天' },
	{ label: '365', value: 365, unit: 'day', unitLabel: '天' },
	{ label: '1', value: 1, unit: 'week', unitLabel: '周' },
	{ label: '1', value: 1, unit: 'month', unitLabel: '月' },
	{ label: '1', value: 1, unit: 'year', unitLabel: '年' },
	{ label: '3', value: 3, unit: 'month', unitLabel: '月' },
]

// 日期快捷选择
const dateShortcuts = computed(() => {
	const today = dayjs()
	return [
		{
			label: '今天',
			date: today.format('YYYY-MM-DD'),
			value: today,
		},
		{
			label: '明天',
			date: today.add(1, 'day').format('YYYY-MM-DD'),
			value: today.add(1, 'day'),
		},
		{
			label: '后天',
			date: today.add(2, 'day').format('YYYY-MM-DD'),
			value: today.add(2, 'day'),
		},
		{
			label: '7天后',
			date: today.add(7, 'day').format('YYYY-MM-DD'),
			value: today.add(7, 'day'),
		},
		{
			label: '30天后',
			date: today.add(30, 'day').format('YYYY-MM-DD'),
			value: today.add(30, 'day'),
		},
		{
			label: '1年后',
			date: today.add(1, 'year').format('YYYY-MM-DD'),
			value: today.add(1, 'year'),
		},
	]
})

// 计算结果
const resultDate = ref('')
const resultText = ref('')
const resultDescription = ref('')
const diffResult = ref(null)

// 获取星期
const getWeekday = (dateStr) => {
	if (!dateStr) return ''
	try {
		const date = dayjs(dateStr)
		const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
		return weekdays[date.day()]
	} catch {
		return ''
	}
}

// 设置模式
const setMode = (value) => {
	mode.value = value
	calculateResult()
}

// 设置运算类型
const setOperation = (value) => {
	operationType.value = value
	calculateResult()
}

// 设置单位
const setUnit = (value) => {
	unit.value = value
	calculateResult()
}

// 调整数量
const adjustAmount = (delta) => {
	const current = parseInt(amount.value) || 0
	const newValue = Math.max(1, current + delta)
	amount.value = newValue
	calculateResult()
	uni.vibrateShort({ fail: () => {} })
}

// 使用今天日期
const useToday = () => {
	inputDate.value = dayjs().format('YYYY-MM-DD')
	calculateResult()
	uni.vibrateShort({ fail: () => {} })
}

// 目标日期设为今天
const useTodayTarget = () => {
	targetDate.value = dayjs().format('YYYY-MM-DD')
	calculateResult()
	uni.vibrateShort({ fail: () => {} })
}

// 应用快捷操作
const applyShortcut = (val, shortcutUnit) => {
	amount.value = val
	unit.value = shortcutUnit
	operationType.value = 'add'
	calculateResult()
	uni.vibrateShort({ fail: () => {} })
}

// 应用日期快捷选择
const applyDateShortcut = (shortcut) => {
	targetDate.value = shortcut.date
	calculateResult()
	uni.vibrateShort({ fail: () => {} })
}

// 格式化时间差描述
const formatTimeDiff = (days) => {
	if (days === 0) return '同一天'
	const absDays = Math.abs(days)
	const isPast = days < 0

	let desc = isPast ? '已过去' : '还有'
	let details = []

	if (absDays >= 365) {
		const years = Math.floor(absDays / 365)
		const remainingDays = absDays % 365
		details.push(`${years}年`)
		if (remainingDays > 0) {
			const months = Math.floor(remainingDays / 30)
			if (months > 0) {
				details.push(`${months}个月`)
			}
		}
	} else if (absDays >= 30) {
		const months = Math.floor(absDays / 30)
		const remainingDays = absDays % 30
		details.push(`${months}个月`)
		if (remainingDays > 0) {
			details.push(`${remainingDays}天`)
		}
	} else if (absDays >= 7) {
		const weeks = Math.floor(absDays / 7)
		const remainingDays = absDays % 7
		details.push(`${weeks}周`)
		if (remainingDays > 0) {
			details.push(`${remainingDays}天`)
		}
	} else {
		details.push(`${absDays}天`)
	}

	return desc + details.join(' ')
}

// 核心计算函数
const calculateResult = () => {
	if (mode.value === 'forward') {
		// 日期计算模式
		if (!inputDate.value) {
			resultText.value = ''
			resultDate.value = ''
			return
		}

		try {
			const num = parseInt(amount.value) || 0
			if (num === 0) {
				resultText.value = ''
				resultDate.value = ''
				return
			}

			const sign = operationType.value === 'subtract' ? -1 : 1
			const actualNum = num * sign
			let newDate = dayjs(inputDate.value)

			// 根据单位计算
			switch (unit.value) {
				case 'day':
					newDate = newDate.add(actualNum, 'day')
					resultDescription.value = `${sign > 0 ? '+' : '-'}${num} 天`
					break
				case 'week':
					newDate = newDate.add(actualNum * 7, 'day')
					resultDescription.value = `${sign > 0 ? '+' : '-'}${num} 周`
					break
				case 'month':
					newDate = newDate.add(actualNum, 'month')
					resultDescription.value = `${sign > 0 ? '+' : '-'}${num} 个月`
					break
				case 'year':
					newDate = newDate.add(actualNum, 'year')
					resultDescription.value = `${sign > 0 ? '+' : '-'}${num} 年`
					break
			}

			resultDate.value = newDate.format('YYYY-MM-DD')
			const diffDays = newDate.diff(dayjs(inputDate.value), 'day')
			resultText.value = `相差 ${Math.abs(diffDays)} 天`
		} catch (e) {
			console.error('计算失败:', e)
			resultText.value = ''
			resultDate.value = ''
		}
	} else {
		// 日期差值模式
		if (!inputDate.value || !targetDate.value) {
			diffResult.value = null
			return
		}

		try {
			const start = dayjs(inputDate.value)
			const end = dayjs(targetDate.value)
			const diffDays = end.diff(start, 'day')

			const absDays = Math.abs(diffDays)
			let details = formatTimeDiff(diffDays)

			// 计算周数
			let weeks = ''
			if (absDays >= 7) {
				const weekCount = Math.floor(absDays / 7)
				const remainingDays = absDays % 7
				if (remainingDays === 0) {
					weeks = `共 ${weekCount} 周`
				} else {
					weeks = `${weekCount} 周 ${remainingDays} 天`
				}
			}

			diffResult.value = {
				days: diffDays,
				absDays: absDays,
				details: details,
				weeks: weeks,
			}
		} catch (e) {
			console.error('计算失败:', e)
			diffResult.value = null
		}
	}
}

// 监听变化，实时计算
watch(
	[inputDate, targetDate, operationType, unit, amount, mode],
	calculateResult,
	{
		immediate: true,
	}
)
</script>

<style scoped lang="scss">
.date-calculator {
	padding: 30rpx;
	min-height: 100vh;
	background: linear-gradient(180deg, #f5f7fa 0%, #e8ecf1 100%);
}

/* 模式切换卡片 */
.mode-card {
	display: flex;
	gap: 20rpx;
	margin-bottom: 30rpx;
}

.mode-item {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 12rpx;
	padding: 30rpx 20rpx;
	background: #fff;
	border-radius: 20rpx;
	border: 2rpx solid transparent;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
	transition: all 0.3s;
}

.mode-item.active {
	border-color: #1677ff;
	background: linear-gradient(135deg, #f0f7ff 0%, #e0f2fe 100%);
	box-shadow: 0 4rpx 16rpx rgba(22, 119, 255, 0.2);
}

.mode-icon {
	font-size: 48rpx;
}

.mode-label {
	font-size: 28rpx;
	color: #333;
	font-weight: 500;
}

.mode-item.active .mode-label {
	color: #1677ff;
	font-weight: 600;
}

/* 内容卡片 */
.content-card {
	background: #fff;
	border-radius: 24rpx;
	padding: 30rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

/* 输入区域 */
.input-section {
	margin-bottom: 30rpx;
}

.section-label {
	display: flex;
	align-items: center;
	gap: 8rpx;
	font-size: 28rpx;
	color: #333;
	font-weight: 500;
	margin-bottom: 20rpx;
}

.label-icon {
	font-size: 32rpx;
}

.date-input-wrapper {
	display: flex;
	gap: 16rpx;
	align-items: center;
}

.quick-date-btn {
	padding: 20rpx 32rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #fff;
	border-radius: 12rpx;
	font-size: 26rpx;
	font-weight: 500;
	border: none;
	box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
	white-space: nowrap;
}

.quick-date-btn:active {
	opacity: 0.8;
	transform: scale(0.98);
}

/* 运算区域 */
.operation-section {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
	margin-bottom: 30rpx;
}

.operation-row {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.operation-label {
	font-size: 26rpx;
	color: #666;
	font-weight: 500;
}

.operation-buttons {
	display: flex;
	gap: 16rpx;
}

.operation-btn {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8rpx;
	padding: 24rpx;
	background: #f0f0f0;
	border-radius: 12rpx;
	font-size: 28rpx;
	font-weight: 500;
	color: #666;
	transition: all 0.3s;
}

.operation-btn.active {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #fff;
	box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
}

.btn-icon {
	font-size: 32rpx;
}

.unit-buttons {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 12rpx;
}

.unit-btn {
	padding: 20rpx 12rpx;
	background: #f8f9fa;
	border-radius: 12rpx;
	text-align: center;
	font-size: 26rpx;
	color: #666;
	font-weight: 500;
	transition: all 0.3s;
}

.unit-btn.active {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #fff;
	box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
}

.amount-input-wrapper {
	.amount-controls {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.amount-btn {
		width: 80rpx;
		height: 80rpx;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: #fff;
		border-radius: 12rpx;
		font-size: 36rpx;
		font-weight: bold;
		border: none;
		box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
	}

	.amount-btn:active {
		opacity: 0.8;
		transform: scale(0.95);
	}

	.amount-input {
		flex: 1;
		height: 80rpx;
		background: #f8f9fa;
		border-radius: 12rpx;
		padding: 0 24rpx;
		font-size: 36rpx;
		font-weight: 600;
		color: #333;
		text-align: center;
		border: 2rpx solid transparent;
	}

	.amount-input:focus {
		border-color: #1677ff;
		background: #fff;
	}
}

/* 快捷操作区域 */
.shortcut-section {
	margin-top: 30rpx;
}

.shortcut-grid {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 16rpx;
}

.shortcut-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 6rpx;
	padding: 24rpx 12rpx;
	background: linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%);
	border-radius: 12rpx;
	border: 2rpx solid transparent;
	transition: all 0.3s;
}

.shortcut-item:active {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-color: #667eea;
	transform: scale(0.95);
}

.shortcut-item:active .shortcut-value,
.shortcut-item:active .shortcut-unit {
	color: #fff;
}

.shortcut-value {
	font-size: 32rpx;
	font-weight: bold;
	color: #667eea;
}

.shortcut-unit {
	font-size: 22rpx;
	color: #999;
}

/* 结果卡片 */
.result-card {
	background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
	border-radius: 24rpx;
	padding: 40rpx 30rpx;
	box-shadow: 0 8rpx 24rpx rgba(22, 119, 255, 0.15);
	border: 2rpx solid #1677ff;
}

.result-header {
	display: flex;
	align-items: center;
	gap: 12rpx;
	margin-bottom: 30rpx;
}

.result-icon {
	font-size: 36rpx;
}

.result-title {
	font-size: 32rpx;
	color: #1677ff;
	font-weight: 600;
}

/* 日期计算模式结果 */
.result-date-flow {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
	align-items: center;
	margin-bottom: 24rpx;
}

.date-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8rpx;
	padding: 24rpx 32rpx;
	background: #fff;
	border-radius: 16rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.date-item.result-date {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.3);
}

.date-value {
	font-size: 40rpx;
	font-weight: bold;
	color: #333;
	font-family: 'Courier New', monospace;
}

.date-item.result-date .date-value {
	color: #fff;
}

.date-weekday {
	font-size: 24rpx;
	color: #999;
}

.date-item.result-date .date-weekday {
	color: rgba(255, 255, 255, 0.9);
}

.arrow {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8rpx;
}

.arrow-icon {
	font-size: 48rpx;
	color: #1677ff;
}

.arrow-desc {
	font-size: 24rpx;
	color: #666;
}

.result-detail {
	text-align: center;
	padding: 20rpx;
	background: #fff;
	border-radius: 12rpx;
}

.detail-text {
	font-size: 28rpx;
	color: #1677ff;
	font-weight: 500;
}

/* 日期差值模式结果 */
.diff-summary {
	display: flex;
	align-items: baseline;
	justify-content: center;
	gap: 12rpx;
	margin-bottom: 30rpx;
	padding: 30rpx;
	background: #fff;
	border-radius: 16rpx;
}

.diff-value {
	font-size: 72rpx;
	font-weight: bold;
	color: #1677ff;
	font-family: 'Courier New', monospace;
}

.diff-label {
	font-size: 32rpx;
	color: #666;
}

.diff-details {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.diff-item {
	display: flex;
	align-items: center;
	gap: 12rpx;
	padding: 20rpx;
	background: #fff;
	border-radius: 12rpx;
}

.diff-icon {
	font-size: 32rpx;
}

.diff-text {
	font-size: 28rpx;
	color: #333;
	font-weight: 500;
}

.date-item-group {
	display: flex;
	gap: 16rpx;
}

.date-item-group .date-item {
	flex: 1;
	padding: 20rpx;
}

.date-label {
	font-size: 24rpx;
	color: #999;
	margin-bottom: 8rpx;
}

/* uni-datetime-picker 样式优化 */
:deep(.uni-datetime-picker) {
	flex: 1;

	.uni-date-editor {
		background-color: #f8f9fa !important;
		border-radius: 12rpx !important;
		padding: 20rpx 24rpx !important;
		min-height: 88rpx !important;
		border: 2rpx solid transparent !important;
		transition: all 0.3s !important;
	}

	.uni-date-editor:focus-within {
		border-color: #1677ff !important;
		background-color: #fff !important;
	}

	.uni-date-editor__text {
		font-size: 28rpx !important;
		color: #333 !important;
		font-weight: 500 !important;
	}
}
</style>
