<template>
	<view class="pregnancy-calculator">
		<uni-card>
			<!-- 基本信息输入 -->
			<uni-section title="基本信息" type="line" padding>
				<view class="form-item">
					<text class="label">末次月经时间</text>
					<uni-datetime-picker
						type="date"
						v-model="lastPeriodDate"
						:end="today"
						@change="calculate" />
				</view>
				<view class="form-item">
					<text class="label">月经规律</text>
					<uni-data-select
						v-model="cycleLength"
						:localdata="cycleLengthOptions"
						:clear="false"
						@change="calculate" />
				</view>
			</uni-section>

			<!-- 计算结果 -->
			<uni-section title="预产期信息" type="line" padding>
				<view class="result-box">
					<view class="result-item">
						<text class="label">当前孕周：</text>
						<text class="value highlight">{{ currentWeek }}</text>
					</view>
					<view class="result-item">
						<text class="label">预产期：</text>
						<text class="value">{{ dueDate }}</text>
					</view>
					<view class="result-item">
						<text class="label">距离预产期：</text>
						<text class="value">{{ daysUntilDue }}</text>
					</view>
				</view>
			</uni-section>

			<!-- 孕期阶段 -->
			<uni-section title="孕期阶段" type="line" padding>
				<view class="stages-box">
					<view
						v-for="(stage, index) in pregnancyStages"
						:key="index"
						class="stage-item"
						:class="{ active: isCurrentStage(stage) }">
						<view class="stage-header">
							<text class="stage-name">{{ stage.name }}</text>
							<text class="stage-week">{{ stage.weeks }}</text>
						</view>
						<view class="stage-content">
							<text class="stage-desc">{{ stage.description }}</text>
							<text class="stage-date">{{ calculateStageDate(stage) }}</text>
						</view>
					</view>
				</view>
			</uni-section>

			<!-- 提示说明 -->
			<view class="tips">
				<text class="tips-title">计算说明：</text>
				<text class="tips-content"
					>1. 预产期计算采用奈吉尔法则：末次月经第一天 + 7天 + 9个月</text
				>
				<text class="tips-content"
					>2. 孕期从末次月经第一天开始计算，共40周</text
				>
				<text class="tips-content"
					>3. 计算结果仅供参考，实际以医生诊断为准</text
				>
			</view>
		</uni-card>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'

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
	},
	{
		name: '第二孕期',
		weeks: '13-27周',
		weekStart: 13,
		weekEnd: 27,
		description: '胎儿快速生长发育期',
	},
	{
		name: '第三孕期',
		weeks: '28-40周',
		weekStart: 28,
		weekEnd: 40,
		description: '胎儿成熟和产前准备期',
	},
]

// 表单数据
const lastPeriodDate = ref('') // 末次月经时间
const cycleLength = ref(28) // 月经周期
const today = new Date().toISOString().split('T')[0] // 今天日期

// 计算预产期
const dueDate = computed(() => {
	if (!lastPeriodDate.value) return '请选择末次月经时间'

	const date = new Date(lastPeriodDate.value)
	date.setDate(date.getDate() + 7) // 加7天
	date.setMonth(date.getMonth() + 9) // 加9个月

	return date.toLocaleDateString('zh-CN', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	})
})

// 计算当前孕周
const currentWeek = computed(() => {
	if (!lastPeriodDate.value) return '待计算'

	const start = new Date(lastPeriodDate.value)
	const now = new Date()
	const days = Math.floor((now - start) / (1000 * 60 * 60 * 24))
	const weeks = Math.floor(days / 7)
	const remainDays = days % 7

	if (weeks < 0) return '日期错误'
	if (weeks > 42) return '已超过预产期'

	return `${weeks}周${remainDays}天`
})

// 计算距离预产期天数
const daysUntilDue = computed(() => {
	if (!lastPeriodDate.value) return '待计算'

	const dueDateTime = new Date(lastPeriodDate.value)
	dueDateTime.setDate(dueDateTime.getDate() + 7 + 280) // 40周 = 280天

	const now = new Date()
	const days = Math.ceil((dueDateTime - now) / (1000 * 60 * 60 * 24))

	if (days < 0) return '已超过预产期'
	return `还有${days}天`
})

// 判断是否当前阶段
const isCurrentStage = (stage) => {
	if (!lastPeriodDate.value) return false

	const start = new Date(lastPeriodDate.value)
	const now = new Date()
	const weeks = Math.floor((now - start) / (1000 * 60 * 60 * 24 * 7))

	return weeks >= stage.weekStart && weeks <= stage.weekEnd
}

// 计算阶段日期范围
const calculateStageDate = (stage) => {
	if (!lastPeriodDate.value) return ''

	const start = new Date(lastPeriodDate.value)
	const stageStart = new Date(start)
	stageStart.setDate(start.getDate() + (stage.weekStart - 1) * 7)

	const stageEnd = new Date(start)
	stageEnd.setDate(start.getDate() + stage.weekEnd * 7)

	return `${stageStart.toLocaleDateString('zh-CN')} ~ ${stageEnd.toLocaleDateString('zh-CN')}`
}

// 计算方法
const calculate = () => {
	// 触发所有计算属性重新计算
	dueDate.value
	currentWeek.value
	daysUntilDue.value
}
</script>

<style lang="scss">
.pregnancy-calculator {
	padding: 30rpx;
	min-height: 100vh;
	background-color: #f5f5f5;

	// 表单项样式
	.form-item {
		margin-bottom: 30rpx;

		&:last-child {
			margin-bottom: 0;
		}

		.label {
			display: block;
			font-size: 28rpx;
			color: #666;
			margin-bottom: 16rpx;
		}
	}

	// 结果显示样式
	.result-box {
		padding: 20rpx;
		background-color: #f8f8f8;
		border-radius: 8rpx;

		.result-item {
			display: flex;
			align-items: center;
			margin-bottom: 20rpx;

			&:last-child {
				margin-bottom: 0;
			}

			.label {
				font-size: 28rpx;
				color: #666;
				min-width: 180rpx;
			}

			.value {
				font-size: 32rpx;
				color: #1677ff;
				font-weight: 500;

				&.highlight {
					color: #f5222d;
					font-size: 36rpx;
				}
			}
		}
	}

	// 孕期阶段样式
	.stages-box {
		display: flex;
		flex-direction: column;
		gap: 16rpx;

		.stage-item {
			background-color: #f8f8f8;
			padding: 20rpx;
			border-radius: 8rpx;
			border-left: 6rpx solid #d9d9d9;

			&.active {
				background-color: #e6f7ff;
				border-left-color: #1677ff;
			}

			.stage-header {
				display: flex;
				align-items: center;
				justify-content: space-between;
				margin-bottom: 12rpx;

				.stage-name {
					font-size: 28rpx;
					color: #333;
					font-weight: 500;
				}

				.stage-week {
					font-size: 26rpx;
					color: #666;
				}
			}

			.stage-content {
				display: flex;
				flex-direction: column;
				gap: 8rpx;

				.stage-desc {
					font-size: 26rpx;
					color: #666;
				}

				.stage-date {
					font-size: 24rpx;
					color: #999;
				}
			}
		}
	}

	// 提示信息样式
	.tips {
		margin-top: 30rpx;
		padding: 20rpx;
		background-color: #f8f8f8;
		border-radius: 8rpx;

		.tips-title {
			display: block;
			font-size: 28rpx;
			color: #333;
			font-weight: 500;
			margin-bottom: 16rpx;
		}

		.tips-content {
			display: block;
			font-size: 26rpx;
			color: #666;
			line-height: 1.6;
		}
	}
}
</style>
