<template>
	<view class="retirement-age">
		<!-- 基本信息卡片 -->
		<view class="card">
			<view class="card-header">
				<view class="header-left">
					<uni-icons type="person-filled" size="20" color="#1677ff"></uni-icons>
					<text class="card-title">基本信息</text>
				</view>
			</view>

			<view class="card-body">
				<!-- 性别选择 -->
				<view class="form-item">
					<view class="label-wrapper">
						<uni-icons type="person" size="16" color="#999"></uni-icons>
						<text class="label">性别</text>
					</view>
					<uni-data-select
						v-model="gender"
						:localdata="genderOptions"
						:clear="false"
						@change="calculateRetirement"
						class="custom-select" />
				</view>

				<!-- 工种选择 -->
				<view class="form-item">
					<view class="label-wrapper">
						<uni-icons type="briefcase" size="16" color="#999"></uni-icons>
						<text class="label">工种</text>
					</view>
					<uni-data-select
						v-model="workType"
						:localdata="workTypeOptions"
						:clear="false"
						@change="calculateRetirement"
						class="custom-select" />
				</view>

				<!-- 出生年月选择 -->
				<view class="form-item">
					<view class="label-wrapper">
						<uni-icons type="calendar" size="16" color="#999"></uni-icons>
						<text class="label">出生年月</text>
					</view>
					<view class="date-select">
						<view class="date-select-item">
							<uni-data-select
								v-model="birthYear"
								:localdata="yearOptions"
								:clear="false"
								@change="calculateRetirement"
								class="custom-select" />
							<text class="date-label">年</text>
						</view>
						<view class="date-select-item">
							<uni-data-select
								v-model="birthMonth"
								:localdata="monthOptions"
								:clear="false"
								@change="calculateRetirement"
								class="custom-select" />
							<text class="date-label">月</text>
						</view>
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
					<text class="card-title">退休时间</text>
				</view>
			</view>

			<view class="card-body">
				<!-- 主要结果 -->
				<view class="result-main">
					<view class="result-card-item">
						<view class="result-icon">
							<uni-icons type="calendar" size="32" color="#1677ff"></uni-icons>
						</view>
						<text class="result-label">退休时间</text>
						<text class="result-value primary">{{ retirementDate }}</text>
					</view>
					<view class="result-card-item">
						<view class="result-icon">
							<uni-icons type="clock" size="32" color="#52c41a"></uni-icons>
						</view>
						<text class="result-label">距离退休</text>
						<text class="result-value success">{{ remainingTime }}</text>
					</view>
				</view>

				<!-- 详细信息 -->
				<view class="result-details">
					<view class="detail-item">
						<view class="detail-label-wrapper">
							<uni-icons type="info" size="14" color="#999"></uni-icons>
							<text class="detail-label">原退休年龄</text>
						</view>
						<text class="detail-value">{{ baseRetirementAge }}周岁</text>
					</view>
					<view class="detail-item">
						<view class="detail-label-wrapper">
							<uni-icons type="clock-filled" size="14" color="#999"></uni-icons>
							<text class="detail-label">延迟时间</text>
						</view>
						<text
							class="detail-value"
							:class="{ 'delay-text': hasDelay, 'no-delay-text': !hasDelay }">
							{{ delayedMonths }}
						</text>
					</view>
					<view class="detail-item">
						<view class="detail-label-wrapper">
							<uni-icons
								type="person-filled"
								size="14"
								color="#999"></uni-icons>
							<text class="detail-label">实际退休年龄</text>
						</view>
						<text class="detail-value highlight">{{ retirementAge }}</text>
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
						<text class="tip-text">2025年1月1日起实施渐进式延迟退休政策</text>
					</view>
					<view class="tip-item">
						<text class="tip-number">2</text>
						<text class="tip-text"
							>2025年前达到法定退休年龄的人员维持原政策</text
						>
					</view>
					<view class="tip-item">
						<text class="tip-number">3</text>
						<text class="tip-text">男性职工延迟3年，最终到63岁</text>
					</view>
					<view class="tip-item">
						<text class="tip-number">4</text>
						<text class="tip-text">女干部延迟3年，最终到58岁</text>
					</view>
					<view class="tip-item">
						<text class="tip-number">5</text>
						<text class="tip-text">女工人延迟5年，最终到55岁</text>
					</view>
					<view class="tip-item">
						<text class="tip-number">6</text>
						<text class="tip-text">特殊工种维持原政策不变</text>
					</view>
					<view class="tip-item">
						<text class="tip-number">7</text>
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
const DELAY_RETIREMENT_START_YEAR = 2025

// 选项数据
const genderOptions = [
	{ value: 'male', text: '男' },
	{ value: 'female', text: '女' },
]

const workTypeOptions = [
	{ value: 'cadre', text: '干部' },
	{ value: 'worker', text: '工人' },
	{ value: 'special', text: '特殊工种' },
]

// 生成年份选项（1950年到当前年份+10年）
const yearOptions = computed(() => {
	const currentYear = new Date().getFullYear()
	const years = []
	for (let year = currentYear + 10; year >= 1950; year--) {
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
const gender = ref('male')
const workType = ref('worker')
const birthYear = ref(new Date().getFullYear() - 25)
const birthMonth = ref(new Date().getMonth() + 1)
const retirementAge = ref('')
const retirementDate = ref('')
const remainingTime = ref('')
const baseRetirementAge = ref('') // 原退休年龄
const delayedMonths = ref('') // 延迟月数

// 判断是否有结果
const hasResult = computed(() => {
	return birthYear.value && birthMonth.value && retirementDate.value
})

// 判断是否有延迟
const hasDelay = computed(() => {
	return delayedMonths.value && delayedMonths.value !== '无延迟'
})

/**
 * 获取延迟退休年龄和月数
 * @param {number} baseAge - 基础退休年龄
 * @param {number} birthYear - 出生年份
 * @param {number} birthMonth - 出生月份
 * @returns {Object} - 包含实际退休年龄和延迟月数的对象
 */
const getDelayedRetirementAge = (baseAge, birthYear, birthMonth) => {
	// 计算达到基础退休年龄的时间
	const baseRetirementDate = new Date(birthYear + baseAge, birthMonth - 1, 1)
	const baseRetirementYear = baseRetirementDate.getFullYear()
	const baseRetirementMonth = baseRetirementDate.getMonth() + 1

	// 2025年前达到退休年龄的人维持原政策
	if (baseRetirementYear < DELAY_RETIREMENT_START_YEAR) {
		return {
			age: baseAge,
			delayMonths: 0,
		}
	}

	// 计算从2025年1月到基础退休年龄期间的月数
	const startDate = new Date(DELAY_RETIREMENT_START_YEAR, 0, 1)
	const endDate = new Date(baseRetirementYear, baseRetirementMonth - 1, 1)
	const monthsAfter2025 =
		(endDate.getFullYear() - startDate.getFullYear()) * 12 +
		(endDate.getMonth() - startDate.getMonth())

	// 女性工人（原50岁退休，每2个月延迟1个月，最终到55岁）
	if (gender.value === 'female' && workType.value === 'worker') {
		// 每2个月延迟1个月，最多延迟60个月(5年)
		const delayMonths = Math.min(Math.floor(monthsAfter2025 / 2), 60)
		const newAge = baseAge + delayMonths / 12
		// 如果延迟后超过55岁，则固定在55岁
		if (newAge > 55) {
			return {
				age: 55,
				delayMonths: (55 - baseAge) * 12,
			}
		}
		return {
			age: newAge,
			delayMonths,
		}
	}

	// 女干部（原55岁退休，每4个月延迟1个月，最终到58岁）
	if (gender.value === 'female' && workType.value === 'cadre') {
		// 每4个月延迟1个月，最多延迟36个月(3年)
		const delayMonths = Math.min(Math.floor(monthsAfter2025 / 4), 36)
		const newAge = baseAge + delayMonths / 12
		// 如果延迟后超过58岁，则固定在58岁
		if (newAge > 58) {
			return {
				age: 58,
				delayMonths: (58 - baseAge) * 12,
			}
		}
		return {
			age: newAge,
			delayMonths,
		}
	}

	// 男性（原60岁退休，每4个月延迟1个月，最终到63岁）
	if (gender.value === 'male' && workType.value !== 'special') {
		// 每4个月延迟1个月，最多延迟36个月(3年)
		const delayMonths = Math.min(Math.floor(monthsAfter2025 / 4), 36)
		const newAge = baseAge + delayMonths / 12
		// 如果延迟后超过63岁，则固定在63岁
		if (newAge > 63) {
			return {
				age: 63,
				delayMonths: (63 - baseAge) * 12,
			}
		}
		return {
			age: newAge,
			delayMonths,
		}
	}

	// 特殊工种维持原政策
	return {
		age: baseAge,
		delayMonths: 0,
	}
}

/**
 * 获取退休年龄
 */
const getRetirementAge = () => {
	let baseAge

	// 获取基础退休年龄
	if (gender.value === 'male') {
		baseAge = workType.value === 'special' ? 55 : 60
	} else {
		switch (workType.value) {
			case 'cadre':
				baseAge = 55
				break
			case 'special':
				baseAge = 45
				break
			case 'worker':
				baseAge = 50
				break
		}
	}

	baseRetirementAge.value = baseAge

	// 计算实际退休年龄（考虑延迟政策）
	const result = getDelayedRetirementAge(
		baseAge,
		birthYear.value,
		birthMonth.value
	)

	// 格式化延迟时间显示
	if (result.delayMonths === 0) {
		delayedMonths.value = '无延迟'
	} else {
		const years = Math.floor(result.delayMonths / 12)
		const months = result.delayMonths % 12
		if (months === 0) {
			delayedMonths.value = `延迟${years}年`
		} else {
			delayedMonths.value = `延迟${years}年${months}个月`
		}
	}

	return result.age
}

/**
 * 计算退休信息
 */
const calculateRetirement = () => {
	if (!birthYear.value || !birthMonth.value) {
		retirementAge.value = ''
		retirementDate.value = ''
		remainingTime.value = ''
		return
	}

	try {
		// 计算退休年龄
		const age = getRetirementAge()
		const ageYears = Math.floor(age)
		const ageMonths = Math.round((age - ageYears) * 12)

		retirementAge.value =
			ageMonths > 0 ? `${ageYears}岁${ageMonths}个月` : `${ageYears}周岁`

		// 计算退休时间（修复日期计算逻辑）
		const birthDate = new Date(birthYear.value, birthMonth.value - 1, 1)
		const retirementDateObj = new Date(birthDate)
		retirementDateObj.setFullYear(birthDate.getFullYear() + ageYears)
		retirementDateObj.setMonth(birthDate.getMonth() + ageMonths)

		const finalYear = retirementDateObj.getFullYear()
		const finalMonth = retirementDateObj.getMonth() + 1

		retirementDate.value = `${finalYear}年${String(finalMonth).padStart(2, '0')}月`

		// 计算距离退休时间
		const now = new Date()
		const currentYear = now.getFullYear()
		const currentMonth = now.getMonth() + 1

		let yearDiff = finalYear - currentYear
		let monthDiff = finalMonth - currentMonth

		if (monthDiff < 0) {
			yearDiff--
			monthDiff += 12
		}

		if (yearDiff < 0 || (yearDiff === 0 && monthDiff <= 0)) {
			remainingTime.value = '已到退休年龄'
		} else if (yearDiff === 0 && monthDiff > 0) {
			remainingTime.value = `${monthDiff}个月`
		} else if (monthDiff === 0) {
			remainingTime.value = `${yearDiff}年整`
		} else {
			remainingTime.value = `${yearDiff}年${monthDiff}个月`
		}
	} catch (error) {
		console.error('计算退休信息失败:', error)
		uni.showToast({
			title: '计算失败，请检查输入',
			icon: 'none',
		})
	}
}

// 初始计算
calculateRetirement()
</script>

<style lang="scss">
.retirement-age {
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

	&.primary {
		color: #1677ff;
	}

	&.success {
		color: #52c41a;
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

	&.highlight {
		color: #1677ff;
		font-size: 32rpx;
		font-weight: 600;
	}

	&.delay-text {
		color: #ff4d4f;
	}

	&.no-delay-text {
		color: #52c41a;
	}
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
