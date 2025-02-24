<template>
	<view class="retirement-age">
		<uni-card>
			<!-- 基本信息输入 -->
			<uni-section title="基本信息" type="line" padding>
				<!-- 性别选择 -->
				<view class="form-item">
					<text class="label">性别</text>
					<uni-data-select
						v-model="gender"
						:localdata="genderOptions"
						:clear="false"
						@change="calculateRetirement" />
				</view>

				<!-- 工种选择 -->
				<view class="form-item">
					<text class="label">工种</text>
					<uni-data-select
						v-model="workType"
						:localdata="workTypeOptions"
						:clear="false"
						@change="calculateRetirement" />
				</view>

				<!-- 出生年月选择 -->
				<view class="form-item">
					<text class="label">出生年月</text>
					<view class="date-select">
						<div class="data-select-item">
							<uni-data-select
								v-model="birthYear"
								:localdata="yearOptions"
								:clear="false"
								@change="calculateRetirement" />
						</div>
						<div class="data-select-item">
							<uni-data-select
								v-model="birthMonth"
								:localdata="monthOptions"
								:clear="false"
								@change="calculateRetirement" />
						</div>
					</view>
				</view>
			</uni-section>

			<!-- 计算结果 -->
			<uni-section title="退休时间" type="line" padding>
				<view class="result-box">
					<view class="result-item">
						<text class="label">原退休年龄：</text>
						<text class="value">{{ baseRetirementAge }}周岁</text>
					</view>
					<view class="result-item">
						<text class="label">延迟时间：</text>
						<text class="value">{{ delayedMonths }}</text>
					</view>
					<view class="result-item">
						<text class="label">实际退休年龄：</text>
						<text class="value">{{ retirementAge }}</text>
					</view>
					<view class="result-item">
						<text class="label">退休时间：</text>
						<text class="value">{{ retirementDate }}</text>
					</view>
					<view class="result-item">
						<text class="label">距离退休：</text>
						<text class="value">{{ remainingTime }}</text>
					</view>
				</view>
			</uni-section>

			<!-- 提示信息 -->
			<view class="tips">
				<text class="tips-title">温馨提示：</text>
				<text class="tips-content"
					>1. 2025年1月1日起实施渐进式延迟退休政策</text
				>
				<text class="tips-content"
					>2. 2025年前达到法定退休年龄的人员维持原政策</text
				>
				<text class="tips-content">3. 男性职工延迟3年，最终到63岁</text>
				<text class="tips-content">4. 女干部延迟3年，最终到58岁</text>
				<text class="tips-content">5. 女工人延迟5年，最终到55岁</text>
				<text class="tips-content">6. 特殊工种维持原政策不变</text>
				<text class="tips-content">7. 本计算结果仅供参考</text>
			</view>
		</uni-card>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'

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

// 生成年份选项（1950年到当前年份）
const yearOptions = computed(() => {
	const currentYear = new Date().getFullYear()
	const years = []
	for (let year = currentYear - 10; year >= 1950; year--) {
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
		text: String(i + 1).padStart(2, '0'),
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

/**
 * 获取延迟退休年龄和月数
 * @param {number} baseAge - 基础退休年龄
 * @param {number} birthYear - 出生年份
 * @returns {Object} - 包含实际退休年龄和延迟月数的对象
 */
const getDelayedRetirementAge = (baseAge, birthYear) => {
	// 计算达到基础退休年龄的时间
	const retirementYear = birthYear + baseAge

	// 2025年前达到退休年龄的人维持原政策
	if (retirementYear < 2025) {
		return {
			age: baseAge,
			delayMonths: 0,
		}
	}

	// 计算从2025年到退休年龄期间的月数
	const monthsAfter2025 = (retirementYear - 2025) * 12

	// 女性工人（原50岁退休，每2个月延迟1个月，最终到55岁）
	if (gender.value === 'female' && workType.value === 'worker') {
		// 每2个月延迟1个月，最多延迟60个月(5年)
		const delayMonths = Math.min(Math.ceil(monthsAfter2025 / 2), 60)
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
		const delayMonths = Math.min(Math.ceil(monthsAfter2025 / 4), 36)
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
		const delayMonths = Math.min(Math.ceil(monthsAfter2025 / 4), 36)
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
	const result = getDelayedRetirementAge(baseAge, birthYear.value)
	const delayedNewMonths =
		result.delayMonths % 12 === 0 ? 0 : (result.delayMonths % 12) + 1
	delayedMonths.value =
		result.delayMonths > 0
			? `延迟${Math.floor(result.delayMonths / 12)}年${delayedNewMonths}个月`
			: '无延迟'
	return result.age
}

/**
 * 计算退休信息
 */
const calculateRetirement = () => {
	if (!birthYear.value || !birthMonth.value) return

	// 计算退休年龄
	const age = getRetirementAge()
	const ageYears = Math.floor(age)
	const ageMonths = Math.round((age - ageYears) * 12)

	retirementAge.value =
		ageMonths > 0 ? `${ageYears}岁${ageMonths}个月` : `${ageYears}周岁`

	// 计算退休时间
	const birthMonthNum = parseInt(birthMonth.value)
	const totalMonths = birthMonthNum + ageMonths // 不需要减1，因为要算到完整的月份
	const finalMonth = totalMonths % 12 === 0 ? 0 : (totalMonths % 12) + 1 // 如果能整除12，月份应该是12而不是0
	const addYears = Math.floor((totalMonths - 1) / 12) // 减1后再除以12，确保进位正确
	const finalYear = birthYear.value + ageYears + addYears

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

	if (yearDiff < 0 || (yearDiff === 0 && monthDiff < 0)) {
		remainingTime.value = '已到退休年龄'
	} else {
		remainingTime.value =
			monthDiff > 0 ? `${yearDiff}年${monthDiff}个月` : `${yearDiff}年整`
	}
}

// 初始计算
calculateRetirement()
</script>

<style lang="scss">
.retirement-age {
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

	// 日期选择样式
	.date-select {
		display: flex;
		gap: 20rpx;

		.data-select-item {
			flex: 1;
		}
	}

	// 结果显示样式
	.result-box {
		padding: 20rpx 0;

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
				min-width: 180rpx; // 增加宽度以适应更长的标签
			}

			.value {
				font-size: 32rpx;
				color: #1677ff;
				font-weight: 500;
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

// 下拉选择器样式
:deep(.uni-data-select) {
	.uni-select--selector {
		height: 88rpx !important;
		background-color: #f8f8f8 !important;
		border-radius: 8rpx !important;
		border: none !important;
		padding: 0 24rpx !important;
		display: flex !important;
		align-items: center !important;
		justify-content: space-between !important;

		.uni-select__input-text {
			font-size: 28rpx !important;
			color: #333 !important;
			flex: 1 !important;
			text-align: center !important;
		}
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
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1) !important;
	max-height: 400rpx !important;
	overflow-y: auto !important;

	.uni-popper__arrow {
		display: none !important;
	}

	.uni-select__selector-item {
		padding: 24rpx !important;
		font-size: 28rpx !important;
		color: #333 !important;
		text-align: center !important;
		border-bottom: 2rpx solid #f5f5f5 !important;
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;

		&:last-child {
			border-bottom: none !important;
		}

		&:active,
		&.uni-select__selector-item--hover {
			background-color: #f8f8f8 !important;
		}
	}
}

// 隐藏遮罩层
:deep(.uni-select--mask) {
	display: none !important;
}
</style>
