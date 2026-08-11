<template>
	<view class="page">
		<!-- 奖金信息 -->
		<view class="card">
			<view class="card-header">
				<view class="header-left">
					<uni-icons type="wallet" size="20" color="#1677ff"></uni-icons>
					<text class="card-title">奖金信息</text>
				</view>
				<text v-if="hasResult" class="clear-btn" @click="clearAll">清空</text>
			</view>

			<view class="card-body">
				<view class="form-item">
					<view class="label-wrapper">
						<text class="label">年终奖金额（元）</text>
						<text class="label-desc">全年一次性奖金</text>
					</view>
					<uni-easyinput
						v-model="bonus"
						type="digit"
						placeholder="请输入年终奖金额"
						:clearable="true" />
				</view>
				<view class="tip-box">
					<uni-icons type="info" size="16" color="#999"></uni-icons>
					<text class="tip-text"
						>根据现行政策，2027 年底前全年一次性奖金可选择单独计税。</text
					>
				</view>
			</view>
		</view>

		<!-- 收入信息（可选） -->
		<view class="card">
			<view class="card-header">
				<view class="header-left">
					<uni-icons type="person" size="20" color="#1677ff"></uni-icons>
					<text class="card-title">年度收入信息</text>
					<text class="optional-tag">选填</text>
				</view>
			</view>

			<view class="card-body">
				<view class="form-item">
					<view class="label-wrapper">
						<text class="label">月收入（元）</text>
						<text class="label-desc">税前月工资</text>
					</view>
					<uni-easyinput
						v-model="monthlyIncome"
						type="digit"
						placeholder="填写后对比两种计税方式"
						:clearable="true" />
				</view>
				<view class="form-item">
					<view class="label-wrapper">
						<text class="label">五险一金（元/月）</text>
						<text class="label-desc">个人缴纳部分</text>
					</view>
					<uni-easyinput
						v-model="insurance"
						type="digit"
						placeholder="每月个人缴纳金额"
						:clearable="true" />
				</view>
				<view class="form-item">
					<view class="label-wrapper">
						<text class="label">专项附加扣除（元/月）</text>
						<text class="label-desc">子女教育、房贷等</text>
					</view>
					<uni-easyinput
						v-model="specialDeduction"
						type="digit"
						placeholder="每月专项附加扣除"
						:clearable="true" />
				</view>
			</view>
		</view>

		<!-- 计算结果 -->
		<view v-if="hasResult" class="card result-card">
			<view class="card-header">
				<view class="header-left">
					<uni-icons type="calculator" size="20" color="#1677ff"></uni-icons>
					<text class="card-title">计算结果</text>
				</view>
			</view>

			<view class="card-body">
				<!-- 方案A：单独计税 -->
				<view class="plan-box" :class="{ recommended: isSeparateRecommended }">
					<view class="plan-header">
						<text class="plan-name">方案A · 单独计税</text>
						<text v-if="isSeparateRecommended" class="recommend-tag">推荐</text>
					</view>
					<view class="plan-main">
						<text class="plan-label">应纳税额</text>
						<text class="plan-tax">{{ formatNumber(separate?.tax ?? 0) }}元</text>
					</view>
					<view class="plan-desc">
						<text>税率 {{ separate?.rate ?? 0 }}%</text>
						<text>速算扣除 {{ formatNumber(separate?.deduction ?? 0) }}元</text>
						<text>税后 {{ formatNumber(separate?.afterTax ?? 0) }}元</text>
					</view>
				</view>

				<!-- 方案B：并入综合所得 -->
				<view v-if="hasCompareInfo" class="plan-box" :class="{ recommended: !isSeparateRecommended }">
					<view class="plan-header">
						<text class="plan-name">方案B · 并入综合所得</text>
						<text v-if="!isSeparateRecommended" class="recommend-tag">推荐</text>
					</view>
					<view class="plan-main">
						<text class="plan-label">应纳税额</text>
						<text class="plan-tax">{{ formatNumber(compare?.merged.tax ?? 0) }}元</text>
					</view>
					<view class="plan-desc">
						<text>税后 {{ formatNumber(compare?.merged.afterTax ?? 0) }}元</text>
					</view>
				</view>

				<!-- 对比结论 -->
				<view v-if="hasCompareInfo" class="compare-tip" :class="{ saving: compareSaving > 0 }">
					<uni-icons
						:type="compareSaving > 0 ? 'checkbox-filled' : 'info'"
						size="18"
						:color="compareSaving > 0 ? '#4cd964' : '#f0ad4e'"></uni-icons>
					<text class="compare-text">
						{{
							compareSaving > 0
								? `选择${compare?.better === 'separate' ? '单独计税' : '并入综合所得'}，可节省 ${formatNumber(compareSaving)} 元`
								: '两种方式税额相同，选择任一即可'
						}}
					</text>
				</view>
				<view v-else class="compare-tip">
					<uni-icons type="info" size="18" color="#999"></uni-icons>
					<text class="compare-text"
						>填写月收入后，可对比两种计税方式并给出推荐。</text
					>
				</view>
			</view>
		</view>

		<!-- 税率表 -->
		<view class="card">
			<view class="card-header">
				<view class="header-left">
					<uni-icons type="list" size="20" color="#1677ff"></uni-icons>
					<text class="card-title">单独计税税率表</text>
				</view>
			</view>
			<view class="card-body">
				<view class="tax-table">
					<view class="table-header">
						<text class="col col-range">级距（奖金÷12）</text>
						<text class="col col-rate">税率</text>
						<text class="col col-deduction">速算扣除</text>
					</view>
					<view
						v-for="(item, index) in taxTableRows"
						:key="index"
						class="table-row">
						<text class="col col-range">{{ item.range }}</text>
						<text class="col col-rate">{{ item.rate }}%</text>
						<text class="col col-deduction">{{ item.deduction }}元</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import {
	calcBonusTaxSeparate,
	compareBonusTaxMethods,
	MONTHLY_TAX_BRACKETS,
	type CompareResult,
	type SeparateResult,
} from './utils/tax'

const bonus = ref('')
const monthlyIncome = ref('')
const insurance = ref('')
const specialDeduction = ref('')

const bonusNumber = computed(() => Number(bonus.value) || 0)
const hasResult = computed(() => bonusNumber.value > 0)
const hasCompareInfo = computed(() => Number(monthlyIncome.value) > 0)

const separate = computed<SeparateResult | null>(() => {
	if (!hasResult.value) return null
	try {
		return calcBonusTaxSeparate(bonusNumber.value)
	} catch {
		return null
	}
})

const compare = computed<CompareResult | null>(() => {
	if (!hasResult.value || !hasCompareInfo.value) return null
	try {
		return compareBonusTaxMethods({
			bonus: bonusNumber.value,
			monthlyIncome: Number(monthlyIncome.value) || 0,
			monthlyInsurance: Number(insurance.value) || 0,
			monthlySpecialDeduction: Number(specialDeduction.value) || 0,
		})
	} catch {
		return null
	}
})

const compareSaving = computed(() => compare.value?.saving ?? 0)

const isSeparateRecommended = computed(() => {
	if (!compare.value) return true
	return compare.value.better === 'separate'
})

const taxTableRows = computed(() => {
	const ranges = [
		'不超过3000元',
		'3000-12000元',
		'12000-25000元',
		'25000-35000元',
		'35000-55000元',
		'55000-80000元',
		'超过80000元',
	]
	return MONTHLY_TAX_BRACKETS.map((bracket, index) => ({
		range: ranges[index] ?? '其他',
		rate: bracket.rate,
		deduction: bracket.deduction,
	}))
})

const clearAll = () => {
	bonus.value = ''
	monthlyIncome.value = ''
	insurance.value = ''
	specialDeduction.value = ''
}

const formatNumber = (value: number) => {
	if (!Number.isFinite(value)) return '0'
	const [int, decimal] = String(value).split('.')
	const withCommas = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
	return decimal ? `${withCommas}.${decimal}` : withCommas
}
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
}

.header-left {
	display: flex;
	align-items: center;
}

.card-title {
	margin-left: 12rpx;
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
}

.optional-tag {
	margin-left: 16rpx;
	padding: 4rpx 12rpx;
	font-size: 22rpx;
	color: #999;
	background-color: #f5f6fa;
	border-radius: 8rpx;
}

.clear-btn {
	font-size: 26rpx;
	color: #1677ff;
}

.form-item {
	margin-bottom: 24rpx;
}

.label-wrapper {
	display: flex;
	align-items: center;
	margin-bottom: 12rpx;
}

.label {
	font-size: 28rpx;
	color: #333;
}

.label-desc {
	margin-left: 16rpx;
	font-size: 24rpx;
	color: #999;
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

.plan-box {
	padding: 24rpx;
	margin-bottom: 24rpx;
	border: 2rpx solid #e5e6eb;
	border-radius: 12rpx;

	&.recommended {
		border-color: #1677ff;
		background-color: rgba(22, 119, 255, 0.04);
	}
}

.plan-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16rpx;
}

.plan-name {
	font-size: 28rpx;
	font-weight: 600;
	color: #333;
}

.recommend-tag {
	padding: 4rpx 16rpx;
	font-size: 22rpx;
	color: #fff;
	background-color: #1677ff;
	border-radius: 8rpx;
}

.plan-main {
	display: flex;
	align-items: baseline;
	margin-bottom: 12rpx;
}

.plan-label {
	margin-right: 16rpx;
	font-size: 26rpx;
	color: #999;
}

.plan-tax {
	font-size: 44rpx;
	font-weight: 700;
	color: #1677ff;
}

.plan-desc {
	display: flex;
	flex-wrap: wrap;
	gap: 24rpx;
	font-size: 24rpx;
	color: #999;
}

.compare-tip {
	display: flex;
	align-items: flex-start;
	padding: 20rpx;
	background-color: #f5f6fa;
	border-radius: 12rpx;

	&.saving {
		background-color: rgba(76, 217, 100, 0.08);
	}
}

.compare-text {
	margin-left: 12rpx;
	font-size: 26rpx;
	color: #333;
	line-height: 1.5;
}

.tax-table {
	border: 2rpx solid #e5e6eb;
	border-radius: 12rpx;
	overflow: hidden;
}

.table-header,
.table-row {
	display: flex;
	align-items: center;
	padding: 20rpx 16rpx;
}

.table-header {
	background-color: #f5f6fa;
}

.table-row {
	border-top: 2rpx solid #f0f0f0;
}

.col {
	font-size: 26rpx;
}

.col-range {
	flex: 1;
	color: #333;
}

.col-rate {
	width: 120rpx;
	text-align: center;
	color: #1677ff;
}

.col-deduction {
	width: 180rpx;
	text-align: right;
	color: #666;
}

.table-header .col {
	color: #999;
}
</style>
