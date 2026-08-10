<template>
	<view class="tax-calculator">
		<!-- 收入信息卡片 -->
		<view class="card">
			<view class="card-header">
				<view class="header-left">
					<uni-icons type="wallet" size="20" color="#1677ff"></uni-icons>
					<text class="card-title">收入信息</text>
				</view>
				<text v-if="hasInput" class="clear-btn" @click="clearAll">清空</text>
			</view>

			<view class="card-body">
				<!-- 月收入 -->
				<view class="form-item">
					<view class="label-wrapper">
						<text class="label">月收入（元）</text>
						<text class="label-desc">税前月收入</text>
					</view>
					<uni-easyinput
						v-model="monthlyIncome"
						type="digit"
						placeholder="请输入税前月收入"
						:clearable="true"
						@input="handleIncomeInput"
						@blur="validateInput" />
				</view>

				<!-- 五险一金 -->
				<view class="form-item">
					<view class="label-wrapper">
						<text class="label">五险一金（元）</text>
						<text class="label-desc">每月扣除金额</text>
					</view>
					<uni-easyinput
						v-model="insurance"
						type="digit"
						placeholder="请输入五险一金金额"
						:clearable="true"
						@input="validateInput" />
				</view>

				<!-- 专项附加扣除 -->
				<view class="deductions-box">
					<view class="deductions-header">
						<text class="section-title">专项附加扣除</text>
						<text class="total-deductions">
							合计：{{ formatNumber(totalSpecialDeductions) }}元/月
						</text>
					</view>
					<view class="deduction-items">
						<view
							v-for="item in deductionItems"
							:key="item.key"
							class="deduction-item"
							:class="{ active: specialDeductions[item.key] > 0 }">
							<view class="item-header">
								<view class="item-label-wrapper">
									<uni-icons
										:type="item.icon"
										size="16"
										:color="
											specialDeductions[item.key] > 0 ? '#1677ff' : '#999'
										"></uni-icons>
									<text class="item-label">{{ item.label }}</text>
								</view>
								<text class="item-limit">{{ item.limit }}</text>
							</view>
							<view class="item-input">
								<uni-easyinput
									v-model="specialDeductions[item.key]"
									type="digit"
									:placeholder="`最高${item.max}元`"
									:clearable="true"
									@input="handleDeductionChange(item.key)"
									@blur="validateDeduction(item.key)" />
								<text class="unit">元/月</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 计算结果卡片 -->
		<view v-if="hasResult" class="card result-card">
			<view class="card-header">
				<view class="header-left">
					<uni-icons type="calculator" size="20" color="#1677ff"></uni-icons>
					<text class="card-title">计算结果</text>
				</view>
			</view>

			<view class="card-body">
				<!-- 计算明细 -->
				<view class="calculation-detail">
					<view class="detail-item">
						<text class="detail-label">月收入</text>
						<text class="detail-value"
							>{{ formatNumber(monthlyIncome) }}元</text
						>
					</view>
					<view class="detail-item">
						<text class="detail-label">五险一金</text>
						<text class="detail-value minus"
							>-{{ formatNumber(insurance) }}元</text
						>
					</view>
					<view class="detail-item">
						<text class="detail-label">专项附加扣除</text>
						<text class="detail-value minus"
							>-{{ formatNumber(totalSpecialDeductions) }}元</text
						>
					</view>
					<view class="detail-item">
						<text class="detail-label">免征额</text>
						<text class="detail-value minus">-5000元</text>
					</view>
					<view class="detail-divider"></view>
					<view class="detail-item highlight">
						<text class="detail-label">应纳税所得额</text>
						<text class="detail-value"
							>{{ formatNumber(taxableIncome) }}元</text
						>
					</view>
				</view>

				<!-- 主要结果 -->
				<view class="result-box">
					<view class="result-main">
						<view class="result-card-item tax-card">
							<text class="result-label">应缴个税</text>
							<text class="result-value tax-value"
								>{{ formatNumber(tax) }}元</text
							>
							<view class="result-desc">
								<text>税率：{{ taxRate }}%</text>
								<text>速算扣除：{{ formatNumber(quickDeduction) }}元</text>
							</view>
						</view>
						<view class="result-card-item income-card">
							<text class="result-label">税后收入</text>
							<text class="result-value income-value"
								>{{ formatNumber(afterTaxIncome) }}元</text
							>
							<view class="result-desc">
								<text
									>年度税后：{{ formatNumber(annualAfterTaxIncome) }}元</text
								>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 税率表卡片 -->
		<view class="card">
			<view class="card-header">
				<view class="header-left">
					<uni-icons type="list" size="20" color="#1677ff"></uni-icons>
					<text class="card-title">个税税率表</text>
				</view>
			</view>

			<view class="card-body">
				<scroll-view scroll-x class="table-wrapper">
					<view class="tax-table">
						<view class="table-header">
							<text class="col col-level">级数</text>
							<text class="col col-range">应纳税所得额</text>
							<text class="col col-rate">税率</text>
							<text class="col col-deduction">速算扣除数</text>
						</view>
						<view
							v-for="(rate, index) in taxRates"
							:key="index"
							class="table-row"
							:class="{ active: isCurrentTaxLevel(index) }">
							<text class="col col-level">{{ index + 1 }}</text>
							<text class="col col-range">{{ rate.range }}</text>
							<text class="col col-rate">{{ rate.rate }}%</text>
							<text class="col col-deduction">{{ rate.deduction }}元</text>
						</view>
					</view>
				</scroll-view>
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
							>应纳税所得额 = 月收入 - 五险一金 - 专项附加扣除 -
							5000（免征额）</text
						>
					</view>
					<view class="tip-item">
						<text class="tip-number">2</text>
						<text class="tip-text"
							>应缴个税 = 应纳税所得额 × 适用税率 - 速算扣除数</text
						>
					</view>
					<view class="tip-item">
						<text class="tip-number">3</text>
						<text class="tip-text"
							>专项附加扣除包括：子女教育、继续教育、住房贷款利息、住房租金、赡养老人、大病医疗</text
						>
					</view>
					<view class="tip-item">
						<text class="tip-number">4</text>
						<text class="tip-text"
							>计算结果仅供参考，实际以税务部门核定为准</text
						>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'

// 常量定义
const TAX_FREE_AMOUNT = 5000 // 免征额

// 专项附加扣除项目
const deductionItems = [
	{
		key: 'children',
		label: '子女教育',
		max: 1000,
		limit: '每子女1000元/月',
		icon: 'person-filled',
	},
	{
		key: 'education',
		label: '继续教育',
		max: 400,
		limit: '学历400元/月',
		icon: 'wallet-filled',
	},
	{
		key: 'mortgage',
		label: '住房贷款利息',
		max: 1000,
		limit: '1000元/月',
		icon: 'home-filled',
	},
	{
		key: 'rent',
		label: '住房租金',
		max: 1500,
		limit: '1500元/月',
		icon: 'home',
	},
	{
		key: 'elderly',
		label: '赡养老人',
		max: 2000,
		limit: '2000元/月',
		icon: 'heart-filled',
	},
	{
		key: 'medical',
		label: '大病医疗',
		max: 80000,
		limit: '年度限额80000',
		icon: 'medal-filled',
	},
]

// 个税税率表
const taxRates = [
	{ min: 0, max: 3000, rate: 3, deduction: 0, range: '不超过3000元' },
	{ min: 3000, max: 12000, rate: 10, deduction: 210, range: '3000-12000元' },
	{ min: 12000, max: 25000, rate: 20, deduction: 1410, range: '12000-25000元' },
	{ min: 25000, max: 35000, rate: 25, deduction: 2660, range: '25000-35000元' },
	{ min: 35000, max: 55000, rate: 30, deduction: 4410, range: '35000-55000元' },
	{ min: 55000, max: 80000, rate: 35, deduction: 7160, range: '55000-80000元' },
	{
		min: 80000,
		max: Infinity,
		rate: 45,
		deduction: 15160,
		range: '超过80000元',
	},
]

// 表单数据
const monthlyIncome = ref('') // 月收入
const insurance = ref('') // 五险一金
const specialDeductions = ref({
	children: 0, // 子女教育
	education: 0, // 继续教育
	mortgage: 0, // 住房贷款利息
	rent: 0, // 住房租金
	elderly: 0, // 赡养老人
	medical: 0, // 大病医疗
})

// 判断是否有输入
const hasInput = computed(() => {
	return (
		monthlyIncome.value ||
		insurance.value ||
		Object.values(specialDeductions.value).some((v) => v > 0)
	)
})

// 判断是否有结果
const hasResult = computed(() => {
	return monthlyIncome.value && Number(monthlyIncome.value) > 0
})

// 格式化数字
const formatNumber = (value) => {
	const num = Number(value) || 0
	if (num === 0) return '0.00'
	return num.toLocaleString('zh-CN', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})
}

// 计算专项附加扣除总额
const totalSpecialDeductions = computed(() => {
	return Object.values(specialDeductions.value).reduce(
		(sum, curr) => sum + Number(curr || 0),
		0
	)
})

// 计算应纳税所得额
const taxableIncome = computed(() => {
	const income = Number(monthlyIncome.value) || 0
	const insuranceAmount = Number(insurance.value) || 0
	const deductions = totalSpecialDeductions.value

	const amount = income - insuranceAmount - deductions - TAX_FREE_AMOUNT
	return Math.max(amount, 0)
})

// 获取适用税率和速算扣除数
const getTaxRate = (income) => {
	const amount = Number(income)
	if (amount <= 0) return taxRates[0]

	// 修复税率查找逻辑
	for (let i = taxRates.length - 1; i >= 0; i--) {
		const rate = taxRates[i]
		if (amount > rate.min) {
			return rate
		}
	}

	return taxRates[0]
}

// 获取当前税率级别索引
const getCurrentTaxLevelIndex = () => {
	const amount = Number(taxableIncome.value)
	if (amount <= 0) return -1

	for (let i = taxRates.length - 1; i >= 0; i--) {
		const rate = taxRates[i]
		if (amount > rate.min) {
			return i
		}
	}

	return 0
}

// 判断是否为当前税率级别
const isCurrentTaxLevel = (index) => {
	return index === getCurrentTaxLevelIndex()
}

// 计算适用税率
const taxRate = computed(() => {
	return getTaxRate(taxableIncome.value).rate
})

// 计算速算扣除数
const quickDeduction = computed(() => {
	return getTaxRate(taxableIncome.value).deduction
})

// 计算应缴个税
const tax = computed(() => {
	const income = Number(taxableIncome.value)
	if (income <= 0) return 0

	const taxLevel = getTaxRate(income)
	const taxAmount = income * (taxLevel.rate / 100) - taxLevel.deduction

	return Math.max(taxAmount, 0)
})

// 计算税后收入
const afterTaxIncome = computed(() => {
	const income = Number(monthlyIncome.value) || 0
	const insuranceAmount = Number(insurance.value) || 0
	const taxAmount = tax.value

	return income - insuranceAmount - taxAmount
})

// 计算年度税后收入
const annualAfterTaxIncome = computed(() => {
	return afterTaxIncome.value * 12
})

// 处理收入输入
const handleIncomeInput = () => {
	validateInput()
}

// 验证输入
const validateInput = () => {
	// 验证月收入
	if (monthlyIncome.value) {
		const value = Number(monthlyIncome.value)
		if (value < 0) {
			monthlyIncome.value = ''
			uni.showToast({
				title: '月收入不能为负数',
				icon: 'none',
			})
		}
	}

	// 验证五险一金
	if (insurance.value) {
		const value = Number(insurance.value)
		if (value < 0) {
			insurance.value = ''
			uni.showToast({
				title: '五险一金不能为负数',
				icon: 'none',
			})
		}
	}
}

// 处理专项附加扣除输入变化
const handleDeductionChange = (key) => {
	const value = Number(specialDeductions.value[key]) || 0

	// 限制最小值
	if (value < 0) {
		specialDeductions.value[key] = 0
	}
}

// 验证专项附加扣除
const validateDeduction = (key) => {
	const item = deductionItems.find((item) => item.key === key)
	const value = Number(specialDeductions.value[key]) || 0

	// 限制最大值
	if (value > item.max) {
		specialDeductions.value[key] = item.max
		uni.showToast({
			title: `${item.label}最高${item.max}元`,
			icon: 'none',
			duration: 2000,
		})
	}

	// 限制最小值
	if (value < 0) {
		specialDeductions.value[key] = 0
	}
}

// 清空所有输入
const clearAll = () => {
	uni.showModal({
		title: '确认清空',
		content: '确定要清空所有输入吗？',
		success: (res) => {
			if (res.confirm) {
				monthlyIncome.value = ''
				insurance.value = ''
				Object.keys(specialDeductions.value).forEach((key) => {
					specialDeductions.value[key] = 0
				})
				uni.showToast({
					title: '已清空',
					icon: 'success',
					duration: 1500,
				})
			}
		},
	})
}
</script>

<style lang="scss">
.tax-calculator {
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

.clear-btn {
	font-size: 26rpx;
	color: #1677ff;
	padding: 8rpx 16rpx;
	border-radius: 8rpx;
	transition: all 0.2s ease;

	&:active {
		background-color: rgba(22, 119, 255, 0.1);
		transform: scale(0.95);
	}
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
	justify-content: space-between;
	margin-bottom: 16rpx;
}

.label {
	font-size: 28rpx;
	color: #333;
	font-weight: 500;
}

.label-desc {
	font-size: 24rpx;
	color: #999;
}

:deep(.uni-easyinput) {
	.uni-easyinput__content {
		height: 88rpx !important;
		background-color: #fafafa !important;
		border-radius: 12rpx !important;
		border: 2rpx solid transparent !important;
		transition: all 0.3s ease !important;

		&:focus-within {
			background-color: #fff !important;
			border-color: #1677ff !important;
			box-shadow: 0 0 0 4rpx rgba(22, 119, 255, 0.1) !important;
		}
	}

	.uni-easyinput__content-input {
		font-size: 30rpx !important;
		color: #333 !important;
	}

	.uni-easyinput__placeholder {
		font-size: 28rpx !important;
		color: #999 !important;
	}
}

// 专项附加扣除样式
.deductions-box {
	margin-top: 32rpx;
}

.deductions-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 24rpx;
	padding-bottom: 16rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.section-title {
	font-size: 30rpx;
	color: #333;
	font-weight: 600;
}

.total-deductions {
	font-size: 26rpx;
	color: #1677ff;
	font-weight: 500;
}

.deduction-items {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.deduction-item {
	background-color: #fafafa;
	padding: 24rpx;
	border-radius: 12rpx;
	border: 2rpx solid transparent;
	transition: all 0.3s ease;

	&.active {
		background: linear-gradient(135deg, #f0f7ff 0%, #fff 100%);
		border-color: #1677ff;
		box-shadow: 0 2rpx 8rpx rgba(22, 119, 255, 0.1);
	}
}

.item-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16rpx;
}

.item-label-wrapper {
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.item-label {
	font-size: 28rpx;
	color: #333;
	font-weight: 500;
}

.item-limit {
	font-size: 24rpx;
	color: #999;
}

.item-input {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.unit {
	font-size: 26rpx;
	color: #666;
	white-space: nowrap;
	font-weight: 500;
}

// 计算明细
.calculation-detail {
	background: linear-gradient(135deg, #f8f9fa 0%, #fff 100%);
	border-radius: 12rpx;
	padding: 24rpx;
	margin-bottom: 24rpx;
}

.detail-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16rpx;

	&:last-child {
		margin-bottom: 0;
	}

	&.highlight {
		padding-top: 16rpx;
		border-top: 2rpx solid #e8e8e8;
		margin-top: 16rpx;
	}
}

.detail-label {
	font-size: 28rpx;
	color: #666;
}

.detail-value {
	font-size: 30rpx;
	color: #333;
	font-weight: 500;

	&.minus {
		color: #ff4d4f;
	}
}

.detail-divider {
	height: 1rpx;
	background: #e8e8e8;
	margin: 16rpx 0;
}

// 结果显示样式
.result-box {
	margin-top: 24rpx;
}

.result-main {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.result-card-item {
	background: linear-gradient(135deg, #f8f9fa 0%, #fff 100%);
	border-radius: 16rpx;
	padding: 32rpx;
	text-align: center;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
	transition: all 0.3s ease;

	&.tax-card {
		border-left: 6rpx solid #ff4d4f;
	}

	&.income-card {
		border-left: 6rpx solid #52c41a;
	}
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
	margin-bottom: 16rpx;

	&.tax-value {
		color: #ff4d4f;
	}

	&.income-value {
		color: #52c41a;
	}
}

.result-desc {
	display: flex;
	flex-direction: column;
	gap: 8rpx;
	margin-top: 16rpx;
	padding-top: 16rpx;
	border-top: 1rpx solid #e8e8e8;

	text {
		font-size: 24rpx;
		color: #999;
	}
}

// 税率表样式
.table-wrapper {
	width: 100%;
}

.tax-table {
	border: 1rpx solid #e8e8e8;
	border-radius: 12rpx;
	overflow: hidden;
	min-width: 600rpx;
}

.table-header,
.table-row {
	display: grid;
	grid-template-columns: 100rpx 200rpx 120rpx 180rpx;
	text-align: center;
	font-size: 26rpx;
}

.table-header {
	background: linear-gradient(135deg, #1677ff 0%, #0958d9 100%);
	color: #fff;
	font-weight: 500;

	.col {
		padding: 20rpx 12rpx;
		border-right: 1rpx solid rgba(255, 255, 255, 0.2);

		&:last-child {
			border-right: none;
		}
	}
}

.table-row {
	color: #666;
	transition: all 0.2s ease;

	&:nth-child(even) {
		background-color: #fafafa;
	}

	&.active {
		background: linear-gradient(135deg, #f0f7ff 0%, #fff 100%) !important;
		border-left: 4rpx solid #1677ff;
		font-weight: 600;
		color: #1677ff;
	}

	.col {
		padding: 20rpx 12rpx;
		border-right: 1rpx solid #e8e8e8;
		border-bottom: 1rpx solid #e8e8e8;

		&:last-child {
			border-right: none;
		}
	}

	&:last-child {
		.col {
			border-bottom: none;
		}
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
</style>
