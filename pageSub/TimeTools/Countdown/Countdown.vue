<template>
	<view class="container">
		<!-- 统计卡片 -->
		<view class="stats-card">
			<view class="stat-item">
				<text class="stat-value">{{ tasks.length }}</text>
				<text class="stat-label">总任务</text>
			</view>
			<view class="stat-item">
				<text class="stat-value">{{ runningCount }}</text>
				<text class="stat-label">运行中</text>
			</view>
			<view class="stat-item">
				<text class="stat-value">{{ completedCount }}</text>
				<text class="stat-label">已完成</text>
			</view>
		</view>

		<!-- 添加任务输入区域 -->
		<view class="add-section">
			<view class="input-group">
				<input
					v-model="newTaskName"
					placeholder="任务名，例如：煮面"
					class="task-input"
					@confirm="addTask"
					maxlength="20" />
				<picker
					mode="multiSelector"
					:range="timeRanges"
					:value="timePickerValue"
					@change="onTimeSelect"
					@columnchange="onTimeColumnChange">
					<view class="time-picker">
						<text class="time-label">{{ newTaskTime }}</text>
						<text class="time-icon">⏱️</text>
					</view>
				</picker>
			</view>
			<button class="add-btn" @tap="addTask">
				<text class="add-icon">＋</text>
				<text>添加</text>
			</button>
		</view>

		<!-- 空状态 -->
		<view v-if="tasks.length === 0" class="empty-state">
			<text class="empty-icon">⏰</text>
			<text class="empty-text">还没有倒计时任务</text>
			<text class="empty-hint">添加第一个任务开始倒计时吧！</text>
		</view>

		<!-- 任务列表 -->
		<view class="task-list">
			<view
				v-for="task in tasks"
				:key="task.id"
				class="task-card"
				:class="{ running: task.isRunning, completed: task.remaining === 0 }">
				<view class="task-header">
					<view class="task-title-wrapper">
						<text class="task-title">{{ task.title }}</text>
						<view v-if="task.isRunning" class="running-indicator">
							<view class="pulse"></view>
							<text class="running-text">进行中</text>
						</view>
					</view>
				</view>

				<!-- 倒计时显示 -->
				<view class="countdown-display">
					<view class="time-circle" :style="getTimeCircleStyle(task)">
						<text class="time-value">{{ format(task.remaining) }}</text>
						<view class="progress-ring" :style="getProgressStyle(task)"></view>
					</view>
					<view class="time-info">
						<text class="progress-text"> 进度：{{ getProgress(task) }}% </text>
						<text class="total-time">总时长：{{ format(task.total) }}</text>
					</view>
				</view>

				<!-- 进度条 -->
				<view class="progress-bar-wrapper">
					<view
						class="progress-bar"
						:style="{ width: getProgress(task) + '%' }"></view>
				</view>

				<!-- 操作按钮 -->
				<view class="task-actions">
					<button
						class="action-btn primary-btn"
						:class="{ pause: task.isRunning }"
						@tap="toggle(task)">
						{{ task.isRunning ? '⏸ 暂停' : '▶ 开始' }}
					</button>
					<button class="action-btn reset-btn" @tap="reset(task)">
						↻ 重置
					</button>
					<button class="action-btn delete-btn" @tap="confirmRemove(task.id)">
						删除
					</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { onUnload, onHide, onShow } from '@dcloudio/uni-app'

const STORAGE_KEY = 'timer_tasks'

const tasks = ref([])
const newTaskName = ref('')
const newTaskTime = ref('00:00:10')
const timePickerValue = ref([0, 0, 10]) // [小时, 分钟, 秒]
let timer = null
let audioInstances = [] // 存储音频实例，便于管理

// 生成时分秒的选项数组
const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))
const seconds = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))
const timeRanges = [hours, minutes, seconds]

// 计算属性
const runningCount = computed(() => {
	return tasks.value.filter((t) => t.isRunning).length
})

const completedCount = computed(() => {
	return tasks.value.filter((t) => t.remaining === 0 && !t.isRunning).length
})

// 数据加载和保存
const loadData = () => {
	try {
		const data = uni.getStorageSync(STORAGE_KEY)
		if (data && data.length > 0) {
			// 兼容旧数据格式
			tasks.value = JSON.parse(data).map((task) => {
				if (!task.hasOwnProperty('createdAt')) {
					task.createdAt = Date.now()
				}
				return task
			})
		}
	} catch (e) {
		console.error('加载数据失败:', e)
		uni.showToast({ title: '加载失败', icon: 'none' })
	}
}

const saveData = () => {
	try {
		uni.setStorageSync(STORAGE_KEY, JSON.stringify(tasks.value))
	} catch (e) {
		console.error('保存数据失败:', e)
		uni.showToast({ title: '保存失败', icon: 'none' })
	}
}

// 格式化时间显示
const format = (sec) => {
	if (sec < 0) sec = 0
	const h = Math.floor(sec / 3600)
	const m = Math.floor((sec % 3600) / 60)
	const s = sec % 60
	if (h > 0) {
		return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
	}
	return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// 获取进度百分比
const getProgress = (task) => {
	if (!task.total || task.total === 0) return 0
	const remaining = Math.max(0, task.remaining)
	return Math.round(((task.total - remaining) / task.total) * 100)
}

// 获取进度条样式
const getProgressStyle = (task) => {
	const progress = getProgress(task)
	const circumference = 2 * Math.PI * 45 // 半径45
	const offset = circumference - (progress / 100) * circumference
	return {
		strokeDashoffset: offset,
	}
}

// 获取时间圆环样式
const getTimeCircleStyle = (task) => {
	if (task.remaining === 0) {
		return { borderColor: '#52c41a' }
	}
	if (task.isRunning) {
		return { borderColor: '#1677ff' }
	}
	return { borderColor: '#d9d9d9' }
}

// 更新时间显示
const updateTimeDisplay = () => {
	const [h, m, s] = timePickerValue.value
	newTaskTime.value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// 时间选择器列变化事件
const onTimeColumnChange = (e) => {
	const { column, value } = e.detail
	timePickerValue.value[column] = value
	updateTimeDisplay()
}

// 时间选择器确认事件
const onTimeSelect = (e) => {
	timePickerValue.value = e.detail.value
	updateTimeDisplay()
}

// 添加任务
const addTask = () => {
	const name = newTaskName.value.trim()
	if (!name) {
		return uni.showToast({ title: '请输入任务名', icon: 'none' })
	}

	const [h, m, s] = newTaskTime.value.split(':').map(Number)
	const total = h * 3600 + m * 60 + s

	if (total === 0) {
		return uni.showToast({ title: '倒计时时间不能为0', icon: 'none' })
	}

	// 检查任务名是否重复
	if (tasks.value.some((t) => t.title === name)) {
		return uni.showToast({ title: '该任务已存在', icon: 'none' })
	}

	tasks.value.push({
		id: Date.now(),
		title: name,
		total,
		remaining: total,
		isRunning: false,
		notify: true,
		createdAt: Date.now(),
	})

	saveData()
	newTaskName.value = ''
	// 重置时间为默认值
	timePickerValue.value = [0, 0, 10]
	updateTimeDisplay()
	uni.showToast({ title: '添加成功', icon: 'success' })
}

// 确认删除
const confirmRemove = (id) => {
	const task = tasks.value.find((t) => t.id === id)
	if (!task) return

	uni.showModal({
		title: '删除任务',
		content: `确定要删除"${task.title}"吗？`,
		success: (res) => {
			if (res.confirm) {
				remove(id)
			}
		},
	})
}

// 删除任务
const remove = (id) => {
	const index = tasks.value.findIndex((t) => t.id === id)
	if (index === -1) return

	// 如果任务正在运行，先停止
	const task = tasks.value[index]
	if (task.isRunning) {
		task.isRunning = false
	}

	tasks.value.splice(index, 1)
	saveData()
	uni.showToast({ title: '删除成功', icon: 'success' })
}

// 重置任务
const reset = (task) => {
	if (task.isRunning) {
		uni.showModal({
			title: '重置任务',
			content: '任务正在运行，确定要重置吗？',
			success: (res) => {
				if (res.confirm) {
					task.remaining = task.total
					task.isRunning = false
					saveData()
					checkAndStartTimer()
					uni.showToast({ title: '已重置', icon: 'success' })
				}
			},
		})
	} else {
		task.remaining = task.total
		task.isRunning = false
		saveData()
		checkAndStartTimer()
	}
}

// 切换运行状态
const toggle = (task) => {
	if (task.remaining === 0) {
		// 如果已完成，重置后再开始
		task.remaining = task.total
	}
	task.isRunning = !task.isRunning
	saveData()
	checkAndStartTimer()

	if (task.isRunning) {
		uni.vibrateShort({ fail: () => {} })
	}
}

// 播放提醒音
const playAlarm = () => {
	// 震动反馈
	uni.vibrateLong({ fail: () => {} })

	try {
		// 使用 InnerAudioContext（支持本地文件，前台播放）
		const innerAudio = uni.createInnerAudioContext()
		innerAudio.src = '/static/audio/alarm.mp3'
		innerAudio.volume = 1.0
		innerAudio.loop = false

		innerAudio.onError((err) => {
			console.error('音频播放失败:', err)
			uni.showToast({
				title: '音频播放失败',
				icon: 'none',
			})
			try {
				if (innerAudio) {
					innerAudio.destroy()
				}
			} catch (e) {
				console.error('销毁音频失败:', e)
			}
			// 从数组中移除
			const index = audioInstances.indexOf(innerAudio)
			if (index > -1) {
				audioInstances.splice(index, 1)
			}
		})

		innerAudio.onEnded(() => {
			try {
				if (innerAudio) {
					innerAudio.destroy()
				}
			} catch (e) {
				console.error('销毁音频失败:', e)
			}
			// 从数组中移除
			const index = audioInstances.indexOf(innerAudio)
			if (index > -1) {
				audioInstances.splice(index, 1)
			}
		})

		// 存储音频实例
		audioInstances.push(innerAudio)

		// 尝试播放
		innerAudio.play()
	} catch (e) {
		console.error('创建音频实例失败:', e)
	}
}

// 清理音频实例
const cleanupAudio = () => {
	if (!audioInstances || audioInstances.length === 0) {
		return
	}
	
	// 创建数组副本，避免在遍历时修改原数组
	const instancesToClean = [...audioInstances]
	audioInstances = []
	
	instancesToClean.forEach((audio) => {
		try {
			// 检查音频实例是否存在且有效
			if (audio && typeof audio === 'object' && typeof audio.destroy === 'function') {
				audio.destroy()
			}
		} catch (e) {
			// 忽略已经销毁的音频实例的错误
			console.warn('清理音频实例失败（可能已销毁）:', e)
		}
	})
}

// 定时器运行函数
const run = () => {
	let hasChanges = false

	tasks.value.forEach((t) => {
		if (t.isRunning && t.remaining > 0) {
			t.remaining--
			hasChanges = true

			// 倒计时结束
			if (t.remaining === 0) {
				t.isRunning = false
				if (t.notify) {
					playAlarm()
					uni.showToast({
						title: `${t.title} 倒计时结束！`,
						icon: 'none',
						duration: 3000,
					})
				}
			}
		}
	})

	// 只在有变化时保存，减少存储操作
	if (hasChanges) {
		saveData()
	}
}

// 启动定时器
const startTimer = () => {
	if (timer) return
	timer = setInterval(run, 1000)
}

// 停止定时器
const stopTimer = () => {
	if (timer) {
		clearInterval(timer)
		timer = null
	}
}

// 检查是否需要启动定时器
const checkAndStartTimer = () => {
	const hasRunningTask = tasks.value.some((t) => t.isRunning && t.remaining > 0)
	if (hasRunningTask && !timer) {
		startTimer()
	} else if (!hasRunningTask && timer) {
		stopTimer()
	}
}

onShow(() => {
	// 页面显示时检查是否有运行中的任务
	checkAndStartTimer()
})

onHide(() => {
	// 页面隐藏时保存数据
	saveData()
})

onUnload(() => {
	// 页面卸载时清理资源
	stopTimer()
	cleanupAudio()
	saveData()
})

// 监听任务变化，自动启动/停止定时器
watch(
	() =>
		tasks.value.map((t) => ({
			isRunning: t.isRunning,
			remaining: t.remaining,
		})),
	() => {
		checkAndStartTimer()
	},
	{ deep: true }
)

// 初始化
onMounted(() => {
	loadData()
	updateTimeDisplay()
	nextTick(() => {
		checkAndStartTimer()
	})
})
</script>

<style scoped>
.container {
	padding: 30rpx;
	min-height: 100vh;
	background: linear-gradient(180deg, #f5f7fa 0%, #e8ecf1 100%);
}

/* 统计卡片 */
.stats-card {
	display: flex;
	justify-content: space-around;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-radius: 20rpx;
	padding: 40rpx 20rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
}

.stat-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 10rpx;
}

.stat-value {
	font-size: 48rpx;
	font-weight: bold;
	color: #fff;
}

.stat-label {
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.9);
}

/* 添加区域 */
.add-section {
	background: #fff;
	border-radius: 20rpx;
	padding: 30rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.input-group {
	display: flex;
	gap: 16rpx;
	margin-bottom: 20rpx;
}

.task-input {
	flex: 1;
	border: 2rpx solid #e0e6ed;
	border-radius: 12rpx;
	padding: 20rpx 24rpx;
	background: #f8f9fa;
	font-size: 28rpx;
	transition: all 0.3s;
}

.task-input:focus {
	border-color: #1677ff;
	background: #fff;
}

.time-picker {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12rpx;
	padding: 20rpx 24rpx;
	border-radius: 12rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #fff;
	min-width: 180rpx;
}

.time-label {
	font-size: 28rpx;
	font-weight: 600;
}

.time-icon {
	font-size: 32rpx;
}

.add-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8rpx;
	width: 100%;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #fff;
	padding: 24rpx;
	border-radius: 12rpx;
	font-size: 30rpx;
	font-weight: 500;
	border: none;
	box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
	transition: all 0.3s;
}

.add-btn:active {
	opacity: 0.8;
	transform: scale(0.98);
}

.add-icon {
	font-size: 36rpx;
	font-weight: bold;
}

/* 空状态 */
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 120rpx 40rpx;
}

.empty-icon {
	font-size: 120rpx;
	margin-bottom: 30rpx;
}

.empty-text {
	font-size: 32rpx;
	color: #666;
	margin-bottom: 10rpx;
	font-weight: 500;
}

.empty-hint {
	font-size: 26rpx;
	color: #999;
}

/* 任务列表 */
.task-list {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
}

.task-card {
	background: #fff;
	border-radius: 24rpx;
	padding: 32rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
	transition: all 0.3s;
	position: relative;
	overflow: hidden;
}

.task-card::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 6rpx;
	background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
	opacity: 0;
	transition: opacity 0.3s;
}

.task-card.running::before {
	opacity: 1;
}

.task-card.completed {
	background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
}

.task-header {
	margin-bottom: 24rpx;
}

.task-title-wrapper {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16rpx;
}

.task-title {
	font-size: 36rpx;
	font-weight: 600;
	color: #1a202c;
	flex: 1;
}

.running-indicator {
	display: flex;
	align-items: center;
	gap: 8rpx;
	padding: 8rpx 16rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-radius: 20rpx;
}

.pulse {
	width: 12rpx;
	height: 12rpx;
	background: #fff;
	border-radius: 50%;
	animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
	0%,
	100% {
		opacity: 1;
		transform: scale(1);
	}
	50% {
		opacity: 0.5;
		transform: scale(0.8);
	}
}

.running-text {
	font-size: 22rpx;
	color: #fff;
	font-weight: 500;
}

/* 倒计时显示 */
.countdown-display {
	display: flex;
	align-items: center;
	gap: 32rpx;
	margin-bottom: 24rpx;
}

.time-circle {
	width: 160rpx;
	height: 160rpx;
	border-radius: 50%;
	border: 8rpx solid #1677ff;
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
	background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
	transition: all 0.3s;
}

.time-value {
	font-size: 48rpx;
	font-weight: bold;
	color: #1677ff;
	font-family: 'Courier New', monospace;
}

.time-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}

.progress-text {
	font-size: 28rpx;
	color: #1677ff;
	font-weight: 600;
}

.total-time {
	font-size: 24rpx;
	color: #718096;
}

/* 进度条 */
.progress-bar-wrapper {
	height: 8rpx;
	background: #e0e6ed;
	border-radius: 4rpx;
	overflow: hidden;
	margin-bottom: 24rpx;
}

.progress-bar {
	height: 100%;
	background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
	border-radius: 4rpx;
	transition: width 1s linear;
}

/* 操作按钮 */
.task-actions {
	display: flex;
	gap: 16rpx;
}

.action-btn {
	flex: 1;
	padding: 20rpx;
	border-radius: 12rpx;
	font-size: 26rpx;
	font-weight: 500;
	border: none;
	transition: all 0.3s;
}

.primary-btn {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #fff;
	box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
}

.primary-btn.pause {
	background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
	box-shadow: 0 4rpx 12rpx rgba(245, 158, 11, 0.3);
}

.reset-btn {
	background: #f0f4ff;
	color: #6366f1;
}

.delete-btn {
	background: #fef2f2;
	color: #ef4444;
}

.action-btn:active {
	opacity: 0.7;
	transform: scale(0.95);
}
</style>
