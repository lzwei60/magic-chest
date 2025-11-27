<template>
	<view class="social-security">
		<!-- 开始缴费时间卡片 -->
		<view class="card">
			<view class="card-header">
				<view class="header-left">
					<uni-icons type="calendar" size="20" color="#1677ff"></uni-icons>
					<text class="card-title">开始缴费时间</text>
				</view>
			</view>

			<view class="card-body">
				<view class="date-select">
					<view class="date-select-item">
						<uni-data-select
							v-model="year"
							:localdata="yearOptions"
							:clear="false"
							@change="calculateEndDates"
							class="custom-select" />
						<text class="date-label">年</text>
					</view>
					<view class="date-select-item">
						<uni-data-select
							v-model="month"
							:localdata="monthOptions"
							:clear="false"
							@change="calculateEndDates"
							class="custom-select" />
						<text class="date-label">月</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 计算结果卡片 -->
		<view v-if="hasResult" class="card result-card">
			<view class="card-header">
				<view class="header-left">
					<uni-icons
						type="calendar-filled"
						size="20"
						color="#1677ff"></uni-icons>
					<text class="card-title">预计达到年限时间</text>
				</view>
			</view>

			<view class="card-body">
				<!-- 养老保险 -->
				<view class="insurance-card pension-card">
					<view class="insurance-header">
						<view class="insurance-icon">
							<uni-icons
								type="wallet-filled"
								size="24"
								color="#1677ff"></uni-icons>
						</view>
						<view class="insurance-info">
							<text class="insurance-name">养老保险</text>
							<text class="insurance-desc">需缴满15年</text>
						</view>
						<view
							class="insurance-status"
							:class="{ completed: pensionCompleted }">
							<text class="status-text">{{
								pensionCompleted ? '已完成' : '进行中'
							}}</text>
						</view>
					</view>
					<view class="insurance-content">
						<view class="date-info">
							<text class="date-label">达到年限时间</text>
							<text class="date-value">{{ pensionDate }}</text>
						</view>
						<view class="progress-info">
							<text class="progress-label">已缴费年限</text>
							<text class="progress-value">{{ pensionYears }}</text>
						</view>
						<view class="remaining-info">
							<text class="remaining-label">距离达到年限</text>
							<text class="remaining-value">{{ pensionRemaining }}</text>
						</view>
					</view>
				</view>

				<!-- 医疗保险 -->
				<view class="insurance-card medical-card">
					<view class="insurance-header">
						<view class="insurance-icon">
							<uni-icons
								type="heart-filled"
								size="24"
								color="#ff4d4f"></uni-icons>
						</view>
						<view class="insurance-info">
							<text class="insurance-name">医疗保险</text>
							<text class="insurance-desc">需缴满25年</text>
						</view>
						<view
							class="insurance-status"
							:class="{ completed: medicalCompleted }">
							<text class="status-text">{{
								medicalCompleted ? '已完成' : '进行中'
							}}</text>
						</view>
					</view>
					<view class="insurance-content">
						<view class="date-info">
							<text class="date-label">达到年限时间</text>
							<text class="date-value">{{ medicalDate }}</text>
						</view>
						<view class="progress-info">
							<text class="progress-label">已缴费年限</text>
							<text class="progress-value">{{ medicalYears }}</text>
						</view>
						<view class="remaining-info">
							<text class="remaining-label">距离达到年限</text>
							<text class="remaining-value">{{ medicalRemaining }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 提示信息卡片 -->
		<view class="card tips-card">
			<view class="card-header">
				<view class="header-left">
					<uni-icons type="info" size="20" color="#1677ff"></uni-icons>
					<text class="card-title">温馨提示</text>
				</view>
			</view>

			<view class="card-body">
				<view class="tips-content">
					<view class="tip-item">
						<text class="tip-number">1</text>
						<text class="tip-text">养老保险缴满15年可以领取养老金</text>
					</view>
					<view class="tip-item">
						<text class="tip-number">2</text>
						<text class="tip-text">医疗保险缴满25年可以享受退休后医保待遇</text>
					</view>
					<view class="tip-item">
						<text class="tip-number">3</text>
						<text class="tip-text">实际缴费年限以社保部门记录为准</text>
					</view>
					<view class="tip-item">
						<text class="tip-number">4</text>
						<text class="tip-text">本计算结果仅供参考</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'

// 常量定义
const PENSION_YEARS = 15 // 养老保险年限
const MEDICAL_YEARS = 25 // 医疗保险年限
const PENSION_MONTHS = PENSION_YEARS * 12 // 180个月
const MEDICAL_MONTHS = MEDICAL_YEARS * 12 // 300个月

// 生成年份选项（1900年到当前年份+10年）
const yearOptions = computed(() => {
	const currentYear = new Date().getFullYear()
	const years = []
	for (let year = currentYear + 10; year >= 1900; year--) {
		years.push({
			value: year,
			text: year.toString(),
		})
	}
	return years
})

// 生成月份选项
const monthOptions = computed(() => {
	return Array.from({ length: 12 }, (_, i) => ({
		value: i + 1,
		text: `${i + 1}月`,
	}))
})

// 状态变量
const year = ref(new Date().getFullYear())
const month = ref(new Date().getMonth() + 1)
const pensionDate = ref('') // 养老保险满15年的日期
const medicalDate = ref('') // 医疗保险满25年的日期

// 判断是否有结果
const hasResult = computed(() => {
	return year.value && month.value && pensionDate.value && medicalDate.value
})

/**
 * 计算指定月数后的日期
 * @param {number} startYear - 开始年份
 * @param {number} startMonth - 开始月份
 * @param {number} months - 需要增加的月数
 * @returns {Object} - 包含年份和月份的对象
 */
const addMonths = (startYear, startMonth, months) => {
	const startDate = new Date(startYear, startMonth - 1, 1)
	const endDate = new Date(startDate)
	endDate.setMonth(startDate.getMonth() + months)

	return {
		year: endDate.getFullYear(),
		month: endDate.getMonth() + 1,
	}
}

/**
 * 格式化日期
 */
const formatDate = (dateObj) => {
	return `${dateObj.year}年${String(dateObj.month).padStart(2, '0')}月`
}

/**
 * 计算已缴费年限（从开始缴费到当前时间）
 */
const getPaidYears = computed(() => {
	if (!year.value || !month.value) return { years: 0, months: 0 }

	const startDate = new Date(year.value, month.value - 1, 1)
	const now = new Date()

	let years = now.getFullYear() - startDate.getFullYear()
	let months = now.getMonth() - startDate.getMonth()

	if (months < 0) {
		years--
		months += 12
	}

	// 如果当前日期小于开始日期的日期，月份减1
	if (now.getDate() < startDate.getDate()) {
		months--
		if (months < 0) {
			years--
			months += 12
		}
	}

	return { years: Math.max(0, years), months: Math.max(0, months) }
})

/**
 * 计算养老保险相关信息
 */
const pensionInfo = computed(() => {
	if (!year.value || !month.value) return null

	const endDate = addMonths(year.value, month.value, PENSION_MONTHS)
	const paid = getPaidYears.value
	const paidMonths = paid.years * 12 + paid.months
	const remainingMonths = Math.max(0, PENSION_MONTHS - paidMonths)

	return {
		date: formatDate(endDate),
		years: paid.years,
		months: paid.months,
		remaining: remainingMonths,
		completed: remainingMonths === 0,
	}
})

/**
 * 计算医疗保险相关信息
 */
const medicalInfo = computed(() => {
	if (!year.value || !month.value) return null

	const endDate = addMonths(year.value, month.value, MEDICAL_MONTHS)
	const paid = getPaidYears.value
	const paidMonths = paid.years * 12 + paid.months
	const remainingMonths = Math.max(0, MEDICAL_MONTHS - paidMonths)

	return {
		date: formatDate(endDate),
		years: paid.years,
		months: paid.months,
		remaining: remainingMonths,
		completed: remainingMonths === 0,
	}
})

// 格式化已缴费年限显示
const pensionYears = computed(() => {
	if (!pensionInfo.value) return '0年0个月'
	const { years, months } = pensionInfo.value
	if (months === 0) {
		return `${years}年`
	}
	return `${years}年${months}个月`
})

const medicalYears = computed(() => {
	if (!medicalInfo.value) return '0年0个月'
	const { years, months } = medicalInfo.value
	if (months === 0) {
		return `${years}年`
	}
	return `${years}年${months}个月`
})

// 格式化剩余时间显示
const pensionRemaining = computed(() => {
	if (!pensionInfo.value) return ''
	const { remaining, completed } = pensionInfo.value
	if (completed) return '已完成'
	const years = Math.floor(remaining / 12)
	const months = remaining % 12
	if (years === 0) {
		return `${months}个月`
	}
	if (months === 0) {
		return `${years}年`
	}
	return `${years}年${months}个月`
})

const medicalRemaining = computed(() => {
	if (!medicalInfo.value) return ''
	const { remaining, completed } = medicalInfo.value
	if (completed) return '已完成'
	const years = Math.floor(remaining / 12)
	const months = remaining % 12
	if (years === 0) {
		return `${months}个月`
	}
	if (months === 0) {
		return `${years}年`
	}
	return `${years}年${months}个月`
})

// 判断是否已完成
const pensionCompleted = computed(() => {
	return pensionInfo.value?.completed || false
})

const medicalCompleted = computed(() => {
	return medicalInfo.value?.completed || false
})

/**
 * 计算达到年限的时间
 */
const calculateEndDates = () => {
	if (!year.value || !month.value) {
		pensionDate.value = ''
		medicalDate.value = ''
		return
	}

	try {
		// 养老保险15年 = 180个月
		const pensionEndDate = addMonths(year.value, month.value, PENSION_MONTHS)
		pensionDate.value = formatDate(pensionEndDate)

		// 医疗保险25年 = 300个月
		const medicalEndDate = addMonths(year.value, month.value, MEDICAL_MONTHS)
		medicalDate.value = formatDate(medicalEndDate)
	} catch (error) {
		console.error('计算失败:', error)
		uni.showToast({
			title: '计算失败，请检查输入',
			icon: 'none',
		})
	}
}

// 初始计算
calculateEndDates()
</script>

<style lang="scss">
.social-security {
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

// 日期选择样式
.date-select {
	display: flex;
	gap: 16rpx;
}

.date-select-item {
	flex: 1;
	position: relative;
}

.date-label {
	position: absolute;
	right: 24rpx;
	top: 50%;
	transform: translateY(-50%);
	font-size: 26rpx;
	color: #999;
	pointer-events: none;
	z-index: 1;
}

// 结果显示样式
.result-card {
	animation: fadeIn 0.5s ease;
}

.insurance-card {
	background: linear-gradient(135deg, #f8f9fa 0%, #fff 100%);
	border-radius: 16rpx;
	padding: 24rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
	transition: all 0.3s ease;

	&:last-child {
		margin-bottom: 0;
	}

	&.pension-card {
		border-left: 6rpx solid #1677ff;
	}

	&.medical-card {
		border-left: 6rpx solid #ff4d4f;
	}
}

.insurance-header {
	display: flex;
	align-items: center;
	margin-bottom: 24rpx;
	padding-bottom: 20rpx;
	border-bottom: 1rpx solid #e8e8e8;
}

.insurance-icon {
	width: 56rpx;
	height: 56rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(22, 119, 255, 0.1);
	border-radius: 12rpx;
	margin-right: 16rpx;
}

.medical-card .insurance-icon {
	background: rgba(255, 77, 79, 0.1);
}

.insurance-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 4rpx;
}

.insurance-name {
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
}

.insurance-desc {
	font-size: 24rpx;
	color: #999;
}

.insurance-status {
	padding: 8rpx 20rpx;
	border-radius: 20rpx;
	background: rgba(22, 119, 255, 0.1);

	&.completed {
		background: rgba(82, 196, 26, 0.1);
	}
}

.status-text {
	font-size: 24rpx;
	color: #1677ff;
	font-weight: 500;
}

.insurance-status.completed .status-text {
	color: #52c41a;
}

.insurance-content {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.date-info,
.progress-info,
.remaining-info {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16rpx;
	background: #fff;
	border-radius: 12rpx;
}

.date-label,
.progress-label,
.remaining-label {
	font-size: 26rpx;
	color: #666;
}

.date-value {
	font-size: 32rpx;
	color: #1677ff;
	font-weight: 600;
}

.progress-value {
	font-size: 30rpx;
	color: #333;
	font-weight: 500;
}

.remaining-value {
	font-size: 30rpx;
	color: #ff4d4f;
	font-weight: 600;
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

// 下拉选择器样式
:deep(.custom-select .uni-data-select) {
	.uni-select--selector {
		height: 88rpx !important;
		background-color: #fafafa !important;
		border-radius: 12rpx !important;
		border: 2rpx solid transparent !important;
		padding: 0 24rpx !important;
		display: flex !important;
		align-items: center !important;
		justify-content: space-between !important;
		transition: all 0.3s ease !important;

		&:active {
			border-color: #1677ff !important;
			background-color: #fff !important;
			box-shadow: 0 0 0 4rpx rgba(22, 119, 255, 0.1) !important;
		}
	}

	.uni-select__input-text {
		font-size: 30rpx !important;
		color: #333 !important;
		flex: 1 !important;
		text-align: left !important;
		font-weight: 500 !important;
	}

	.uni-icons {
		color: #999 !important;
	}
}

:deep(.uni-select__popper) {
	position: absolute !important;
	left: 0 !important;
	right: 0 !important;
	top: 100% !important;
	margin-top: 8rpx !important;
	z-index: 999 !important;
	background-color: #fff !important;
	border-radius: 12rpx !important;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.12) !important;
	max-height: 400rpx !important;
	overflow-y: auto !important;
	border: 1rpx solid #e8e8e8 !important;

	.uni-popper__arrow {
		display: none !important;
	}

	.uni-select__selector-item {
		padding: 24rpx !important;
		font-size: 28rpx !important;
		color: #333 !important;
		text-align: left !important;
		border-bottom: 1rpx solid #f5f5f5 !important;
		display: flex !important;
		align-items: center !important;
		justify-content: space-between !important;
		transition: all 0.2s ease !important;

		&:last-child {
			border-bottom: none !important;
		}

		&:active,
		&.uni-select__selector-item--hover {
			background-color: #f0f7ff !important;
			color: #1677ff !important;
		}

		&.uni-select__selector-item--disabled {
			color: #999 !important;
			background-color: #f5f5f5 !important;
		}
	}
}

// 隐藏遮罩层
:deep(.uni-select--mask) {
	display: none !important;
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
