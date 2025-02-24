<template>
	<view class="social-security">
		<uni-card>
			<!-- 起始时间选择 -->
			<uni-section title="开始缴费时间" type="line" padding>
				<view class="date-select">
					<!-- 年份选择 -->
					<div class="data-select-item">
						<uni-data-select
							v-model="year"
							:localdata="yearOptions"
							:clear="false"
							@change="calculateEndDates" />
					</div>

					<!-- 月份选择 -->
					<div class="data-select-item">
						<uni-data-select
							v-model="month"
							:localdata="monthOptions"
							:clear="false"
							@change="calculateEndDates" />
					</div>
				</view>
			</uni-section>

			<!-- 达到年限时间 -->
			<uni-section title="预计达到年限时间" type="line" padding>
				<view class="result-box">
					<view class="result-item">
						<text class="label">养老保险(15年)：</text>
						<text class="time">{{ pensionDate }}</text>
					</view>
					<view class="result-item">
						<text class="label">医疗保险(25年)：</text>
						<text class="time">{{ medicalDate }}</text>
					</view>
				</view>
			</uni-section>

			<!-- 提示信息 -->
			<view class="tips">
				<text class="tips-title">温馨提示：</text>
				<text class="tips-content"> 1. 养老保险缴满15年可以领取养老金 </text>
				<text class="tips-content">
					2. 医疗保险缴满25年可以享受退休后医保待遇
				</text>
				<text class="tips-content"> 3. 实际缴费年限以社保部门记录为准 </text>
				<text class="tips-content"> 4. 本计算结果仅供参考 </text>
			</view>
		</uni-card>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'

// 生成年份选项（1900年到当前年份）
const yearOptions = computed(() => {
	const currentYear = new Date().getFullYear()
	const years = []
	for (let year = currentYear; year >= 1900; year--) {
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
const year = ref(new Date().getFullYear())
const month = ref(new Date().getMonth() + 1)
const pensionDate = ref('') // 养老保险满15年的日期
const medicalDate = ref('') // 医疗保险满25年的日期

/**
 * 计算指定月数后的日期
 * @param {number} startYear - 开始年份
 * @param {number} startMonth - 开始月份
 * @param {number} months - 需要增加的月数
 * @returns {string} - 格式化后的日期字符串
 */
const addMonths = (startYear, startMonth, months) => {
	let targetYear = startYear
	let targetMonth = startMonth + months - 1 // 减1是因为包含起始月

	// 处理月份溢出
	if (targetMonth > 12) {
		targetYear += Math.floor((targetMonth - 1) / 12)
		targetMonth = ((targetMonth - 1) % 12) + 1
	}

	return `${targetYear}年${String(targetMonth).padStart(2, '0')}月`
}

/**
 * 计算达到年限的时间
 */
const calculateEndDates = () => {
	if (!year.value || !month.value) {
		pensionDate.value = ''
		medicalDate.value = ''
		return
	}

	// 养老保险15年 = 180个月
	pensionDate.value = addMonths(year.value, month.value, 180)

	// 医疗保险25年 = 300个月
	medicalDate.value = addMonths(year.value, month.value, 300)
}

// 初始计算
calculateEndDates()
</script>

<style lang="scss">
.social-security {
	padding: 30rpx;
	min-height: 100vh;
	background-color: #f5f5f5;

	// 日期选择样式
	.date-select {
		display: flex;
		align-items: center;
		gap: 20rpx;

		.data-select-item {
			flex: 1;
		}

		:deep(.uni-data-select) {
			flex: 1;
			position: relative;

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

				.uni-select__input-placeholder {
					font-size: 28rpx !important;
					color: #999 !important;
				}
			}
		}

		.separator {
			font-size: 28rpx;
			color: #666;
			padding: 0 4rpx;
			flex: none;
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
				min-width: 200rpx;
			}

			.time {
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

		&.uni-select__selector-item--disabled {
			color: #999 !important;
			background-color: #f5f5f5 !important;
		}
	}
}

// 调整卡片层级
:deep(.uni-card) {
	position: relative !important;
	z-index: 1 !important;
}

// 隐藏遮罩层
:deep(.uni-select--mask) {
	display: none !important;
}
</style>
