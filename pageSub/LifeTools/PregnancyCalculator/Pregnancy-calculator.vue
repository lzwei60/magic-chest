<template>
	<view class="pregnancy-calculator">
		<!-- 基本信息卡片 -->
		<view class="card input-card">
			<view class="card-header">
				<view class="header-left">
					<uni-icons type="calendar" size="20" color="#1677ff"></uni-icons>
					<text class="card-title">基本信息</text>
				</view>
			</view>

			<view class="card-body">
				<view class="form-item">
					<view class="label-wrapper">
						<uni-icons
							type="calendar-filled"
							size="16"
							color="#999"></uni-icons>
						<text class="label">末次月经时间</text>
					</view>
					<uni-datetime-picker
						type="date"
						v-model="lastPeriodDate"
						:end="today"
						@change="handleDateChange"
						class="date-picker" />
				</view>
				<view class="form-item">
					<view class="label-wrapper">
						<uni-icons type="loop" size="16" color="#999"></uni-icons>
						<text class="label">月经周期</text>
					</view>
					<uni-data-select
						v-model="cycleLength"
						:localdata="cycleLengthOptions"
						:clear="false"
						@change="handleCycleChange"
						class="custom-select" />
				</view>
			</view>
		</view>

		<!-- 计算结果卡片 -->
		<view v-if="hasResult" class="card result-card">
			<view class="card-header">
				<view class="header-left">
					<uni-icons type="heart-filled" size="20" color="#ff4d4f"></uni-icons>
					<text class="card-title">预产期信息</text>
				</view>
			</view>

			<view class="card-body">
				<!-- 主要结果 -->
				<view class="result-main">
					<view class="result-card-item">
						<view class="result-icon">
							<uni-icons type="calendar" size="32" color="#1677ff"></uni-icons>
						</view>
						<text class="result-label">当前孕周</text>
						<text class="result-value primary">{{ currentWeek }}</text>
					</view>
					<view class="result-card-item">
						<view class="result-icon">
							<uni-icons type="heart" size="32" color="#ff4d4f"></uni-icons>
						</view>
						<text class="result-label">预产期</text>
						<text class="result-value danger">{{ dueDate }}</text>
					</view>
				</view>

				<!-- 详细信息 -->
				<view class="result-details">
					<view class="detail-item">
						<view class="detail-label-wrapper">
							<uni-icons type="clock" size="14" color="#999"></uni-icons>
							<text class="detail-label">距离预产期</text>
						</view>
						<text class="detail-value" :class="getDaysClass">
							{{ daysUntilDue }}
						</text>
					</view>
					<view class="detail-item">
						<view class="detail-label-wrapper">
							<uni-icons type="calendar" size="14" color="#999"></uni-icons>
							<text class="detail-label">已怀孕天数</text>
						</view>
						<text class="detail-value">{{ pregnantDays }}天</text>
					</view>
					<view class="detail-item">
						<view class="detail-label-wrapper">
							<uni-icons type="info" size="14" color="#999"></uni-icons>
							<text class="detail-label">孕期进度</text>
						</view>
						<view class="progress-wrapper">
							<view class="progress-bar">
								<view
									class="progress-fill"
									:style="{ width: `${pregnancyProgress}%` }"></view>
							</view>
							<text class="progress-text">{{ pregnancyProgress }}%</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 孕期阶段卡片 -->
		<view v-if="hasResult" class="card stages-card">
			<view class="card-header">
				<view class="header-left">
					<uni-icons type="list" size="20" color="#1677ff"></uni-icons>
					<text class="card-title">孕期阶段</text>
				</view>
			</view>

			<view class="card-body">
				<view class="stages-box">
					<view
						v-for="(stage, index) in pregnancyStages"
						:key="index"
						class="stage-item"
						:class="{ active: isCurrentStage(stage) }">
						<view
							class="stage-indicator"
							:style="{ backgroundColor: stage.color }"></view>
						<view class="stage-content-wrapper">
							<view class="stage-header">
								<view class="stage-name-wrapper">
									<uni-icons
										:type="stage.icon"
										size="18"
										:color="
											isCurrentStage(stage) ? stage.color : '#999'
										"></uni-icons>
									<text class="stage-name">{{ stage.name }}</text>
									<text v-if="isCurrentStage(stage)" class="current-badge"
										>当前</text
									>
								</view>
								<text class="stage-week">{{ stage.weeks }}</text>
							</view>
							<view class="stage-content">
								<text class="stage-desc">{{ stage.description }}</text>
								<text class="stage-date">{{ calculateStageDate(stage) }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 提示说明卡片 -->
		<view class="card tips-card">
			<view class="card-header">
				<view class="header-left">
					<uni-icons type="info" size="20" color="#1677ff"></uni-icons>
					<text class="card-title">计算说明</text>
				</view>
			</view>

			<view class="card-body">
				<view class="tips-content">
					<view class="tip-item">
						<text class="tip-number">1</text>
						<text class="tip-text"
							>预产期计算采用奈吉尔法则：末次月经第一天 + 7天 + 9个月</text
						>
					</view>
					<view class="tip-item">
						<text class="tip-number">2</text>
						<text class="tip-text"
							>孕期从末次月经第一天开始计算，共40周（280天）</text
						>
					</view>
					<view class="tip-item">
						<text class="tip-number">3</text>
						<text class="tip-text">预产期前后2周内分娩都属于正常范围</text>
					</view>
					<view class="tip-item">
						<text class="tip-number">4</text>
						<text class="tip-text">计算结果仅供参考，实际以医生诊断为准</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'

// 常量定义
const PREGNANCY_DAYS = 280 // 孕期总天数（40周）
const PREGNANCY_WEEKS = 40 // 孕期总周数

// 月经周期选项
const cycleLengthOptions = [
	{ value: 28, text: '28天' },
	{ value: 29, text: '29天' },
	{ value: 30, text: '30天' },
	{ value: 31, text: '31天' },
	{ value: 32, text: '32天' },
]

// 孕期阶段定义
const pregnancyStages = [
	{
		name: '第一孕期',
		weeks: '1-12周',
		weekStart: 1,
		weekEnd: 12,
		description: '胚胎形成和器官发育的关键期',
		color: '#52c41a',
		icon: 'heart',
	},
	{
		name: '第二孕期',
		weeks: '13-27周',
		weekStart: 13,
		weekEnd: 27,
		description: '胎儿快速生长发育期',
		color: '#1677ff',
		icon: 'heart-filled',
	},
	{
		name: '第三孕期',
		weeks: '28-40周',
		weekStart: 28,
		weekEnd: 40,
		description: '胎儿成熟和产前准备期',
		color: '#ff4d4f',
		icon: 'heart-filled',
	},
]

// 表单数据
const lastPeriodDate = ref('') // 末次月经时间
const cycleLength = ref(28) // 月经周期
const today = new Date().toISOString().split('T')[0] // 今天日期

// 判断是否有结果
const hasResult = computed(() => {
	return (
		lastPeriodDate.value &&
		currentWeek.value !== '待计算' &&
		currentWeek.value !== '日期错误'
	)
})

// 计算已怀孕天数
const pregnantDays = computed(() => {
	if (!lastPeriodDate.value) return 0

	const start = new Date(lastPeriodDate.value)
	const now = new Date()
	// 设置时间为0点，避免时间差影响
	start.setHours(0, 0, 0, 0)
	now.setHours(0, 0, 0, 0)

	const days = Math.floor((now - start) / (1000 * 60 * 60 * 24))
	return Math.max(0, days)
})

// 计算当前孕周数（用于进度计算）
const currentWeekNumber = computed(() => {
	if (!lastPeriodDate.value) return 0

	const days = pregnantDays.value
	const weeks = Math.floor(days / 7)
	return Math.min(weeks, PREGNANCY_WEEKS)
})

// 计算孕期进度
const pregnancyProgress = computed(() => {
	if (!lastPeriodDate.value) return 0
	const progress = Math.min(
		(currentWeekNumber.value / PREGNANCY_WEEKS) * 100,
		100
	)
	return Math.round(progress)
})

// 计算预产期（使用奈吉尔法则：末次月经第一天 + 7天 + 9个月）
const dueDate = computed(() => {
	if (!lastPeriodDate.value) return '请选择末次月经时间'

	try {
		const date = new Date(lastPeriodDate.value)
		// 加9个月
		date.setMonth(date.getMonth() + 9)
		// 加7天
		date.setDate(date.getDate() + 7)

		return date.toLocaleDateString('zh-CN', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		})
	} catch (error) {
		console.error('计算预产期失败:', error)
		return '计算错误'
	}
})

// 计算预产期日期对象（用于计算距离）
const dueDateObj = computed(() => {
	if (!lastPeriodDate.value) return null

	try {
		const date = new Date(lastPeriodDate.value)
		date.setMonth(date.getMonth() + 9)
		date.setDate(date.getDate() + 7)
		date.setHours(0, 0, 0, 0)
		return date
	} catch {
		return null
	}
})

// 计算当前孕周
const currentWeek = computed(() => {
	if (!lastPeriodDate.value) return '待计算'

	try {
		const days = pregnantDays.value

		if (days < 0) return '日期错误'
		if (days > PREGNANCY_DAYS + 14) return '已超过预产期'

		const weeks = Math.floor(days / 7)
		const remainDays = days % 7

		if (weeks === 0 && remainDays === 0) {
			return '刚刚开始'
		}

		if (remainDays === 0) {
			return `${weeks}周`
		}

		return `${weeks}周${remainDays}天`
	} catch (error) {
		console.error('计算孕周失败:', error)
		return '计算错误'
	}
})

// 计算距离预产期天数
const daysUntilDue = computed(() => {
	if (!lastPeriodDate.value || !dueDateObj.value) return '待计算'

	try {
		const now = new Date()
		now.setHours(0, 0, 0, 0)

		const days = Math.ceil((dueDateObj.value - now) / (1000 * 60 * 60 * 24))

		if (days < 0) {
			return `已超过${Math.abs(days)}天`
		}
		if (days === 0) {
			return '今天就是预产期'
		}
		if (days <= 7) {
			return `还有${days}天（即将临产）`
		}
		return `还有${days}天`
	} catch (error) {
		console.error('计算距离预产期失败:', error)
		return '计算错误'
	}
})

// 获取距离预产期天数的样式类
const getDaysClass = computed(() => {
	if (!daysUntilDue.value || daysUntilDue.value === '待计算') return ''
	if (daysUntilDue.value.includes('已超过')) return 'overdue'
	if (daysUntilDue.value.includes('今天就是')) return 'today'
	if (daysUntilDue.value.includes('即将临产')) return 'urgent'
	return 'normal'
})

// 判断是否当前阶段
const isCurrentStage = (stage) => {
	if (!lastPeriodDate.value) return false

	const weeks = currentWeekNumber.value
	return weeks >= stage.weekStart && weeks <= stage.weekEnd
}

// 计算阶段日期范围
const calculateStageDate = (stage) => {
	if (!lastPeriodDate.value) return ''

	try {
		const start = new Date(lastPeriodDate.value)
		start.setHours(0, 0, 0, 0)

		const stageStart = new Date(start)
		stageStart.setDate(start.getDate() + (stage.weekStart - 1) * 7)

		const stageEnd = new Date(start)
		stageEnd.setDate(start.getDate() + stage.weekEnd * 7 - 1)

		return `${stageStart.toLocaleDateString('zh-CN', {
			month: '2-digit',
			day: '2-digit',
		})} ~ ${stageEnd.toLocaleDateString('zh-CN', {
			month: '2-digit',
			day: '2-digit',
		})}`
	} catch (error) {
		console.error('计算阶段日期失败:', error)
		return ''
	}
}

// 处理日期变化
const handleDateChange = () => {
	if (lastPeriodDate.value) {
		// 验证日期不能超过今天
		const selectedDate = new Date(lastPeriodDate.value)
		const todayDate = new Date()
		todayDate.setHours(0, 0, 0, 0)

		if (selectedDate > todayDate) {
			uni.showToast({
				title: '日期不能超过今天',
				icon: 'none',
			})
			lastPeriodDate.value = today
		}
	}
}

// 处理周期变化
const handleCycleChange = () => {
	// 周期变化不影响预产期计算（预产期基于末次月经时间）
	// 但可以用于其他计算，如排卵期等
}
</script>

<style lang="scss">
.pregnancy-calculator {
	padding: 24rpx;
	min-height: 100vh;
	background: linear-gradient(to bottom, #f8f9fa 0%, #f5f5f5 100%);
}

// 卡片样式
.card {
	background: #fff;
	border-radius: 16rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
	overflow: hidden;
	transition: all 0.3s ease;

	&:active {
		transform: scale(0.99);
	}
}

.card-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24rpx;
	border-bottom: 1rpx solid #f0f0f0;
	background: linear-gradient(135deg, #f8f9fa 0%, #fff 100%);
}

.header-left {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.card-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
}

.card-body {
	padding: 24rpx;
}

// 表单项样式
.form-item {
	margin-bottom: 32rpx;

	&:last-child {
		margin-bottom: 0;
	}
}

.label-wrapper {
	display: flex;
	align-items: center;
	gap: 8rpx;
	margin-bottom: 16rpx;
}

.label {
	font-size: 28rpx;
	color: #333;
	font-weight: 500;
}

// 日期选择器和下拉选择器样式
:deep(.date-picker .uni-datetime-picker),
:deep(.custom-select .uni-data-select) {
	.uni-select--selector,
	.uni-datetime-picker__selector {
		height: 88rpx !important;
		background-color: #fafafa !important;
		border-radius: 12rpx !important;
		border: 2rpx solid transparent !important;
		transition: all 0.3s ease !important;

		&:active {
			border-color: #1677ff !important;
			background-color: #fff !important;
			box-shadow: 0 0 0 4rpx rgba(22, 119, 255, 0.1) !important;
		}
	}
}

// 结果显示样式
.result-card {
	animation: fadeIn 0.5s ease;
}

.result-main {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
	margin-bottom: 24rpx;
}

.result-card-item {
	background: linear-gradient(135deg, #f8f9fa 0%, #fff 100%);
	border-radius: 16rpx;
	padding: 32rpx;
	text-align: center;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
	transition: all 0.3s ease;
	border-left: 6rpx solid #1677ff;
}

.result-icon {
	margin-bottom: 16rpx;
}

.result-label {
	display: block;
	font-size: 26rpx;
	color: #666;
	margin-bottom: 16rpx;
}

.result-value {
	display: block;
	font-size: 48rpx;
	font-weight: 600;
	line-height: 1.2;

	&.primary {
		color: #1677ff;
	}

	&.danger {
		color: #ff4d4f;
	}
}

// 详细信息
.result-details {
	background: linear-gradient(135deg, #f8f9fa 0%, #fff 100%);
	border-radius: 12rpx;
	padding: 24rpx;
}

.detail-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20rpx;

	&:last-child {
		margin-bottom: 0;
	}
}

.detail-label-wrapper {
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.detail-label {
	font-size: 28rpx;
	color: #666;
}

.detail-value {
	font-size: 30rpx;
	color: #333;
	font-weight: 500;

	&.overdue {
		color: #ff4d4f;
		font-weight: 600;
	}

	&.today {
		color: #ff4d4f;
		font-weight: 600;
	}

	&.urgent {
		color: #ff9800;
		font-weight: 600;
	}

	&.normal {
		color: #52c41a;
	}
}

.progress-wrapper {
	display: flex;
	align-items: center;
	gap: 16rpx;
	flex: 1;
	justify-content: flex-end;
}

.progress-bar {
	flex: 1;
	height: 12rpx;
	background: #e8e8e8;
	border-radius: 6rpx;
	overflow: hidden;
	max-width: 200rpx;
}

.progress-fill {
	height: 100%;
	background: linear-gradient(90deg, #1677ff 0%, #52c41a 100%);
	border-radius: 6rpx;
	transition: width 0.3s ease;
}

.progress-text {
	font-size: 26rpx;
	color: #1677ff;
	font-weight: 600;
	min-width: 60rpx;
	text-align: right;
}

// 孕期阶段样式
.stages-box {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.stage-item {
	display: flex;
	background: #fafafa;
	padding: 24rpx;
	border-radius: 12rpx;
	border: 2rpx solid transparent;
	transition: all 0.3s ease;
	position: relative;
	overflow: hidden;

	&.active {
		background: linear-gradient(135deg, #f0f7ff 0%, #fff 100%);
		border-color: #1677ff;
		box-shadow: 0 4rpx 12rpx rgba(22, 119, 255, 0.15);
	}
}

.stage-indicator {
	width: 8rpx;
	height: 100%;
	border-radius: 4rpx 0 0 4rpx;
	margin-right: 16rpx;
	flex-shrink: 0;
}

.stage-content-wrapper {
	flex: 1;
}

.stage-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16rpx;
}

.stage-name-wrapper {
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.stage-name {
	font-size: 30rpx;
	color: #333;
	font-weight: 600;
}

.current-badge {
	padding: 4rpx 12rpx;
	background: linear-gradient(135deg, #1677ff 0%, #0958d9 100%);
	color: #fff;
	border-radius: 12rpx;
	font-size: 20rpx;
	margin-left: 8rpx;
}

.stage-week {
	font-size: 26rpx;
	color: #999;
	font-weight: 500;
}

.stage-content {
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}

.stage-desc {
	font-size: 26rpx;
	color: #666;
	line-height: 1.6;
}

.stage-date {
	font-size: 24rpx;
	color: #999;
}

// 提示信息样式
.tips-card {
	.card-body {
		padding: 24rpx;
	}
}

.tips-content {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.tip-item {
	display: flex;
	align-items: flex-start;
	gap: 16rpx;
}

.tip-number {
	flex-shrink: 0;
	width: 40rpx;
	height: 40rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #1677ff 0%, #0958d9 100%);
	color: #fff;
	border-radius: 50%;
	font-size: 24rpx;
	font-weight: 600;
}

.tip-text {
	flex: 1;
	font-size: 26rpx;
	color: #666;
	line-height: 1.8;
}

@keyframes fadeIn {
	from {
		opacity: 0;
		transform: translateY(-10rpx);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}
</style>
