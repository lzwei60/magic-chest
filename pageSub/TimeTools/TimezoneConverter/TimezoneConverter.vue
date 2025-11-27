<template>
	<view class="timezone-converter">
		<!-- 当前时间显示 -->
		<view class="current-time-card">
			<view class="current-time-label">当前时间</view>
			<view class="current-time-value">{{ currentTime }}</view>
			<view class="current-timezone">{{ currentTimezone }}</view>
		</view>

		<!-- 时区选择卡片 -->
		<view class="timezone-card">
			<view class="timezone-row">
				<view class="timezone-label">原时区</view>
				<picker
					mode="selector"
					:range="timezones"
					range-key="label"
					:value="sourceTZIndex"
					@change="onSourceTZChange">
					<view class="timezone-picker">
						<text class="timezone-name">{{
							timezones[sourceTZIndex].label
						}}</text>
						<text class="timezone-icon">▼</text>
					</view>
				</picker>
			</view>

			<!-- 交换按钮 -->
			<view class="swap-button" @click="swapTimezones">
				<text class="swap-icon">⇅</text>
			</view>

			<view class="timezone-row">
				<view class="timezone-label">目标时区</view>
				<picker
					mode="selector"
					:range="timezones"
					range-key="label"
					:value="targetTZIndex"
					@change="onTargetTZChange">
					<view class="timezone-picker">
						<text class="timezone-name">{{
							timezones[targetTZIndex].label
						}}</text>
						<text class="timezone-icon">▼</text>
					</view>
				</picker>
			</view>
		</view>

		<!-- 时间输入卡片 -->
		<view class="input-card">
			<view class="input-header">
				<text class="input-title">
					{{ inputMode === 'source' ? '输入原时区时间' : '输入目标时区时间' }}
				</text>
				<view class="mode-switch">
					<view
						class="mode-item"
						:class="{ active: inputMode === 'source' }"
						@click="setInputMode('source')">
						输入原时间
					</view>
					<view
						class="mode-item"
						:class="{ active: inputMode === 'target' }"
						@click="setInputMode('target')">
						输入目标时间
					</view>
				</view>
			</view>

			<view class="datetime-input-wrapper">
				<uni-datetime-picker
					v-model="inputDateTime"
					type="datetime"
					placeholder="请选择日期时间"
					@change="convertTime" />
			</view>

			<!-- 快捷操作 -->
			<view class="quick-actions">
				<button class="quick-btn" @click="useCurrentTime">使用当前时间</button>
				<view class="adjust-buttons">
					<button class="adjust-btn" @click="adjustTime(-24)">-24h</button>
					<button class="adjust-btn" @click="adjustTime(-8)">-8h</button>
					<button class="adjust-btn" @click="adjustTime(-1)">-1h</button>
					<button class="adjust-btn" @click="adjustTime(1)">+1h</button>
					<button class="adjust-btn" @click="adjustTime(8)">+8h</button>
					<button class="adjust-btn" @click="adjustTime(24)">+24h</button>
				</view>
			</view>
		</view>

		<!-- 转换结果卡片 -->
		<view v-if="convertedDateTime" class="result-card">
			<view class="result-header">
				<text class="result-title">转换结果</text>
				<view class="time-diff">
					<text class="diff-label">时差：</text>
					<text class="diff-value" :class="getTimeDiffClass()">
						{{ timeDifference }}
					</text>
				</view>
			</view>
			<view class="result-content">
				<view class="result-time">{{ convertedDateTime }}</view>
				<view class="result-meta">
					<text class="result-offset">{{ convertedOffset }}</text>
					<text class="result-weekday">{{ convertedWeekday }}</text>
				</view>
			</view>
		</view>

		<!-- 常用时区快捷选择 -->
		<view class="common-timezones">
			<view class="common-title">常用时区</view>
			<view class="common-list">
				<view
					v-for="(tz, index) in commonTimezones"
					:key="index"
					class="common-item"
					@click="selectCommonTimezone(tz)">
					<text class="common-name">{{ tz.name }}</text>
					<text class="common-time">{{ getCommonTimezoneTime(tz.value) }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import weekday from 'dayjs/plugin/weekday'
import 'dayjs/locale/zh-cn'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(weekday)
dayjs.locale('zh-cn')

const STORAGE_KEY = 'timezone_converter_config'

// 时区列表
const timezones = [
	{ label: '协调世界时 (UTC)', value: 'UTC' },
	{ label: '格林尼治标准时间 (GMT)', value: 'Etc/GMT' },
	{ label: '中国标准时间 (北京/上海)', value: 'Asia/Shanghai' },
	{ label: '日本标准时间 (东京)', value: 'Asia/Tokyo' },
	{ label: '韩国标准时间 (首尔)', value: 'Asia/Seoul' },
	{ label: '印度标准时间 (新德里)', value: 'Asia/Kolkata' },
	{ label: '新加坡时间 (新加坡)', value: 'Asia/Singapore' },
	{ label: '泰国时间 (曼谷)', value: 'Asia/Bangkok' },
	{ label: '印度尼西亚时间 (雅加达)', value: 'Asia/Jakarta' },
	{ label: '菲律宾时间 (马尼拉)', value: 'Asia/Manila' },
	{ label: '马来西亚时间 (吉隆坡)', value: 'Asia/Kuala_Lumpur' },
	{ label: '阿联酋时间 (迪拜)', value: 'Asia/Dubai' },
	{ label: '英国时间 (伦敦)', value: 'Europe/London' },
	{ label: '法国时间 (巴黎)', value: 'Europe/Paris' },
	{ label: '德国时间 (柏林)', value: 'Europe/Berlin' },
	{ label: '意大利时间 (罗马)', value: 'Europe/Rome' },
	{ label: '莫斯科时间 (莫斯科)', value: 'Europe/Moscow' },
	{ label: '西班牙时间 (马德里)', value: 'Europe/Madrid' },
	{ label: '荷兰时间 (阿姆斯特丹)', value: 'Europe/Amsterdam' },
	{ label: '瑞典时间 (斯德哥尔摩)', value: 'Europe/Stockholm' },
	{ label: '瑞士时间 (苏黎世)', value: 'Europe/Zurich' },
	{ label: '美国东部时间 (纽约)', value: 'America/New_York' },
	{ label: '美国中部时间 (芝加哥)', value: 'America/Chicago' },
	{ label: '美国山地时间 (丹佛)', value: 'America/Denver' },
	{ label: '美国太平洋时间 (洛杉矶)', value: 'America/Los_Angeles' },
	{ label: '巴西利亚时间 (巴西)', value: 'America/Sao_Paulo' },
	{ label: '墨西哥城时间 (墨西哥)', value: 'America/Mexico_City' },
	{ label: '加拿大东部时间 (多伦多)', value: 'America/Toronto' },
	{ label: '哥伦比亚时间 (波哥大)', value: 'America/Bogota' },
	{ label: '澳大利亚东部时间 (悉尼)', value: 'Australia/Sydney' },
	{ label: '澳大利亚中部时间 (阿德莱德)', value: 'Australia/Adelaide' },
	{ label: '澳大利亚西部时间 (珀斯)', value: 'Australia/Perth' },
	{ label: '新西兰标准时间 (惠灵顿)', value: 'Pacific/Auckland' },
	{ label: '夏威夷标准时间 (檀香山)', value: 'Pacific/Honolulu' },
	{ label: '斐济时间 (苏瓦)', value: 'Pacific/Fiji' },
	{ label: '南非标准时间 (开普敦)', value: 'Africa/Johannesburg' },
	{ label: '埃及标准时间 (开罗)', value: 'Africa/Cairo' },
	{ label: '尼日利亚时间 (拉各斯)', value: 'Africa/Lagos' },
	{ label: '肯尼亚时间 (内罗毕)', value: 'Africa/Nairobi' },
]

// 常用时区
const commonTimezones = [
	{ name: '北京', value: 'Asia/Shanghai' },
	{ name: '纽约', value: 'America/New_York' },
	{ name: '伦敦', value: 'Europe/London' },
	{ name: '东京', value: 'Asia/Tokyo' },
	{ name: '悉尼', value: 'Australia/Sydney' },
	{ name: '洛杉矶', value: 'America/Los_Angeles' },
	{ name: '巴黎', value: 'Europe/Paris' },
	{ name: '新加坡', value: 'Asia/Singapore' },
]

// 状态
const inputMode = ref('source')
const inputDateTime = ref('')
const sourceTZIndex = ref(2) // 默认北京
const targetTZIndex = ref(0) // 默认UTC
const convertedDateTime = ref('')
const convertedOffset = ref('')
const convertedWeekday = ref('')
const currentTime = ref('')
const currentTimezone = ref('')
let timeUpdateTimer = null

// 计算属性：时差
const timeDifference = computed(() => {
	if (!convertedDateTime.value || !inputDateTime.value) return ''
	try {
		const sourceTZ = timezones[sourceTZIndex.value].value
		const targetTZ = timezones[targetTZIndex.value].value

		// 使用同一时刻在两个时区的UTC偏移量来计算时差
		const now = dayjs()
		const sourceTime = dayjs.tz(now, sourceTZ)
		const targetTime = dayjs.tz(now, targetTZ)

		// 计算时差（目标时区相对于原时区）
		const diffMinutes = targetTime.utcOffset() - sourceTime.utcOffset()

		if (diffMinutes === 0) return '无时差'
		const hours = Math.floor(Math.abs(diffMinutes) / 60)
		const minutes = Math.abs(diffMinutes) % 60
		const sign = diffMinutes > 0 ? '+' : '-'

		if (minutes === 0) {
			return `${sign}${hours}小时`
		}
		return `${sign}${hours}小时${minutes}分钟`
	} catch (e) {
		console.error('计算时差失败:', e)
		return ''
	}
})

// 获取时差样式类
const getTimeDiffClass = () => {
	if (!timeDifference.value) return ''
	const diff = timeDifference.value
	if (diff.includes('+')) return 'diff-ahead'
	if (diff.includes('-')) return 'diff-behind'
	return 'diff-same'
}

// 更新当前时间
const updateCurrentTime = () => {
	try {
		const now = dayjs()
		currentTime.value = now.format('YYYY-MM-DD HH:mm:ss')
		// 尝试获取用户当前时区
		const userTZ = Intl.DateTimeFormat().resolvedOptions().timeZone
		if (userTZ) {
			const tzLabel =
				timezones.find((tz) => tz.value === userTZ)?.label || userTZ
			currentTimezone.value = tzLabel
		} else {
			currentTimezone.value = '本地时间'
		}
	} catch (e) {
		currentTime.value = dayjs().format('YYYY-MM-DD HH:mm:ss')
		currentTimezone.value = '本地时间'
	}
}

// 加载配置
const loadConfig = () => {
	try {
		const config = uni.getStorageSync(STORAGE_KEY)
		if (config) {
			const data = JSON.parse(config)
			if (data.sourceTZIndex !== undefined)
				sourceTZIndex.value = data.sourceTZIndex
			if (data.targetTZIndex !== undefined)
				targetTZIndex.value = data.targetTZIndex
			if (data.inputMode) inputMode.value = data.inputMode
		}
	} catch (e) {
		console.error('加载配置失败:', e)
	}
}

// 保存配置
const saveConfig = () => {
	try {
		const config = {
			sourceTZIndex: sourceTZIndex.value,
			targetTZIndex: targetTZIndex.value,
			inputMode: inputMode.value,
		}
		uni.setStorageSync(STORAGE_KEY, JSON.stringify(config))
	} catch (e) {
		console.error('保存配置失败:', e)
	}
}

// 时区选择变化
const onSourceTZChange = (e) => {
	sourceTZIndex.value = e.detail.value
	convertTime()
	saveConfig()
}

const onTargetTZChange = (e) => {
	targetTZIndex.value = e.detail.value
	convertTime()
	saveConfig()
}

// 交换时区
const swapTimezones = () => {
	;[sourceTZIndex.value, targetTZIndex.value] = [
		targetTZIndex.value,
		sourceTZIndex.value,
	]
	convertTime()
	saveConfig()
	uni.vibrateShort({ fail: () => {} })
}

// 设置输入模式
const setInputMode = (mode) => {
	inputMode.value = mode
	convertTime()
	saveConfig()
}

// 核心转换函数
const convertTime = () => {
	if (!inputDateTime.value) {
		convertedDateTime.value = ''
		convertedOffset.value = ''
		convertedWeekday.value = ''
		return
	}

	try {
		const srcTZ = timezones[sourceTZIndex.value].value
		const tgtTZ = timezones[targetTZIndex.value].value

		let converted
		if (inputMode.value === 'source') {
			// 输入的是原时区时间，转换为目标时区
			converted = dayjs.tz(inputDateTime.value, srcTZ).tz(tgtTZ)
		} else {
			// 输入的是目标时区时间，转换为原时区
			converted = dayjs.tz(inputDateTime.value, tgtTZ).tz(srcTZ)
		}

		convertedDateTime.value = converted.format('YYYY-MM-DD HH:mm')
		convertedOffset.value = converted.format('Z')
		convertedWeekday.value = converted.format('dddd')
	} catch (e) {
		console.error('时间转换失败:', e)
		uni.showToast({ title: '时间转换失败', icon: 'none' })
	}
}

// 快捷按钮调整时间
const adjustTime = (hours) => {
	if (!inputDateTime.value) {
		uni.showToast({ title: '请先选择时间', icon: 'none' })
		return
	}

	try {
		const current = dayjs(inputDateTime.value)
		const adjusted = current.add(hours, 'hour')
		inputDateTime.value = adjusted.format('YYYY-MM-DD HH:mm')
		convertTime()
	} catch (e) {
		console.error('调整时间失败:', e)
		uni.showToast({ title: '调整时间失败', icon: 'none' })
	}
}

// 使用当前时间
const useCurrentTime = () => {
	inputDateTime.value = dayjs().format('YYYY-MM-DD HH:mm')
	convertTime()
	uni.showToast({ title: '已使用当前时间', icon: 'success' })
}

// 选择常用时区
const selectCommonTimezone = (tz) => {
	const index = timezones.findIndex((t) => t.value === tz.value)
	if (index !== -1) {
		targetTZIndex.value = index
		convertTime()
		saveConfig()
		uni.showToast({ title: `已切换到${tz.name}`, icon: 'success' })
	}
}

// 获取常用时区当前时间
const getCommonTimezoneTime = (tzValue) => {
	try {
		return dayjs.tz(tzValue).format('HH:mm')
	} catch (e) {
		return ''
	}
}

// 监听变化
watch([inputDateTime, sourceTZIndex, targetTZIndex, inputMode], convertTime)

// 生命周期
onMounted(() => {
	loadConfig()
	updateCurrentTime()
	// 初始化当前时间
	if (!inputDateTime.value) {
		inputDateTime.value = dayjs().format('YYYY-MM-DD HH:mm')
		convertTime()
	}

	// 每秒更新当前时间
	timeUpdateTimer = setInterval(updateCurrentTime, 1000)
})

onUnmounted(() => {
	if (timeUpdateTimer) {
		clearInterval(timeUpdateTimer)
		timeUpdateTimer = null
	}
})
</script>

<style scoped lang="scss">
.timezone-converter {
	padding: 30rpx;
	min-height: 100vh;
	background: linear-gradient(180deg, #f5f7fa 0%, #e8ecf1 100%);
}

/* 当前时间卡片 */
.current-time-card {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-radius: 20rpx;
	padding: 40rpx 30rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
	text-align: center;
}

.current-time-label {
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.9);
	margin-bottom: 12rpx;
}

.current-time-value {
	font-size: 56rpx;
	font-weight: bold;
	color: #fff;
	font-family: 'Courier New', monospace;
	margin-bottom: 8rpx;
}

.current-timezone {
	font-size: 26rpx;
	color: rgba(255, 255, 255, 0.85);
}

/* 时区选择卡片 */
.timezone-card {
	background: #fff;
	border-radius: 20rpx;
	padding: 30rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
	position: relative;
}

.timezone-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 30rpx;

	&:last-of-type {
		margin-bottom: 0;
	}
}

.timezone-label {
	font-size: 28rpx;
	color: #666;
	font-weight: 500;
}

.timezone-picker {
	display: flex;
	align-items: center;
	justify-content: space-between;
	flex: 1;
	padding: 20rpx 24rpx;
	background: linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%);
	border-radius: 12rpx;
	margin-left: 20rpx;
}

.timezone-name {
	font-size: 28rpx;
	color: #333;
	font-weight: 500;
}

.timezone-icon {
	font-size: 20rpx;
	color: #667eea;
}

.swap-button {
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
	width: 80rpx;
	height: 80rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
	z-index: 10;
}

.swap-icon {
	font-size: 36rpx;
	color: #fff;
	font-weight: bold;
}

.swap-button:active {
	transform: translate(-50%, -50%) scale(0.95);
	opacity: 0.8;
}

/* 输入卡片 */
.input-card {
	background: #fff;
	border-radius: 20rpx;
	padding: 30rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.input-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 24rpx;
}

.input-title {
	font-size: 28rpx;
	color: #333;
	font-weight: 600;
}

.mode-switch {
	display: flex;
	background: #f0f0f0;
	border-radius: 12rpx;
	padding: 4rpx;
	gap: 4rpx;
}

.mode-item {
	padding: 12rpx 20rpx;
	border-radius: 8rpx;
	font-size: 24rpx;
	color: #666;
	transition: all 0.3s;
}

.mode-item.active {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #fff;
	font-weight: 500;
}

.datetime-input-wrapper {
	margin-bottom: 24rpx;
}

.quick-actions {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.quick-btn {
	width: 100%;
	padding: 20rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #fff;
	border-radius: 12rpx;
	font-size: 26rpx;
	font-weight: 500;
	border: none;
	box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
}

.quick-btn:active {
	opacity: 0.8;
	transform: scale(0.98);
}

.adjust-buttons {
	display: flex;
	gap: 12rpx;
	flex-wrap: wrap;
}

.adjust-btn {
	flex: 1;
	min-width: calc(33.33% - 8rpx);
	padding: 16rpx 12rpx;
	background: #f0f4ff;
	color: #667eea;
	border-radius: 8rpx;
	font-size: 24rpx;
	font-weight: 500;
	border: none;
}

.adjust-btn:active {
	background: #e0e7ff;
	opacity: 0.8;
}

/* 结果卡片 */
.result-card {
	background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
	border-radius: 20rpx;
	padding: 30rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
	border: 2rpx solid #1677ff;
}

.result-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
}

.result-title {
	font-size: 28rpx;
	color: #1677ff;
	font-weight: 600;
}

.time-diff {
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.diff-label {
	font-size: 24rpx;
	color: #666;
}

.diff-value {
	font-size: 26rpx;
	font-weight: 600;
	padding: 6rpx 16rpx;
	border-radius: 8rpx;
}

.diff-value.diff-ahead {
	background: #dcfce7;
	color: #16a34a;
}

.diff-value.diff-behind {
	background: #fee2e2;
	color: #dc2626;
}

.diff-value.diff-same {
	background: #f3f4f6;
	color: #6b7280;
}

.result-content {
	text-align: center;
}

.result-time {
	font-size: 48rpx;
	font-weight: bold;
	color: #1677ff;
	font-family: 'Courier New', monospace;
	margin-bottom: 12rpx;
}

.result-meta {
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 20rpx;
}

.result-offset {
	font-size: 26rpx;
	color: #666;
	background: #fff;
	padding: 8rpx 16rpx;
	border-radius: 8rpx;
}

.result-weekday {
	font-size: 26rpx;
	color: #1677ff;
	font-weight: 500;
}

/* 常用时区 */
.common-timezones {
	background: #fff;
	border-radius: 20rpx;
	padding: 30rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.common-title {
	font-size: 28rpx;
	color: #333;
	font-weight: 600;
	margin-bottom: 20rpx;
}

.common-list {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 16rpx;
}

.common-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx;
	background: #f8f9fa;
	border-radius: 12rpx;
	border: 2rpx solid transparent;
	transition: all 0.3s;
}

.common-item:active {
	background: #f0f4ff;
	border-color: #667eea;
	transform: scale(0.98);
}

.common-name {
	font-size: 28rpx;
	color: #333;
	font-weight: 500;
}

.common-time {
	font-size: 26rpx;
	color: #667eea;
	font-weight: 600;
	font-family: 'Courier New', monospace;
}

/* uni-datetime-picker 样式优化 */
:deep(.uni-datetime-picker) {
	.uni-date-editor {
		background-color: #f8f9fa !important;
		border-radius: 12rpx !important;
		padding: 20rpx 24rpx !important;
		min-height: 88rpx !important;
	}

	.uni-date-editor__text {
		font-size: 28rpx !important;
		color: #333 !important;
	}
}
</style>
