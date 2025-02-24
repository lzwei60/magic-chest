<template>
	<view class="tax-calculator">
		<uni-card>
			<!-- 基本信息输入 -->
			<uni-section title="收入信息" type="line" padding>
				<!-- 月收入 -->
				<view class="form-item">
					<text class="label">月收入（元）</text>
					<uni-easyinput
						v-model="monthlyIncome"
						type="number"
						placeholder="请输入税前月收入"
						@change="calculate" />
				</view>

				<!-- 专项扣除 -->
				<view class="form-item">
					<text class="label">五险一金（元）</text>
					<uni-easyinput
						v-model="insurance"
						type="number"
						placeholder="请输入五险一金金额"
						@change="calculate" />
				</view>

				<!-- 专项附加扣除 -->
				<view class="deductions-box">
					<text class="section-title">专项附加扣除</text>
					<view class="deduction-items">
						<view
							v-for="item in deductionItems"
							:key="item.key"
							class="deduction-item">
							<view class="item-header">
								<text class="item-label">{{ item.label }}</text>
								<text class="item-limit">{{ item.limit }}</text>
							</view>
							<view class="item-input">
								<uni-easyinput
									v-model="specialDeductions[item.key]"
									type="number"
									:placeholder="`最高${item.max}元`"
									@change="handleDeductionChange(item.key)" />
								<text class="unit">元/月</text>
							</view>
						</view>
					</view>
				</view>
			</uni-section>

			<!-- 计算结果 -->
			<uni-section title="计算结果" type="line" padding>
				<view class="result-box">
					<!-- 应纳税所得额 -->
					<view class="result-item">
						<text class="label">应纳税所得额：</text>
						<text class="value">{{ taxableIncome }}元</text>
					</view>
					<!-- 适用税率 -->
					<view class="result-item">
						<text class="label">适用税率：</text>
						<text class="value">{{ taxRate }}%</text>
					</view>
					<!-- 速算扣除数 -->
					<view class="result-item">
						<text class="label">速算扣除数：</text>
						<text class="value">{{ quickDeduction }}元</text>
					</view>
					<!-- 应缴个税 -->
					<view class="result-item">
						<text class="label">应缴个税：</text>
						<text class="value highlight">{{ tax }}元</text>
					</view>
					<!-- 税后收入 -->
					<view class="result-item">
						<text class="label">税后收入：</text>
						<text class="value highlight">{{ afterTaxIncome }}元</text>
					</view>
				</view>
			</uni-section>

			<!-- 税率表 -->
			<uni-section title="个税税率表" type="line" padding>
				<view class="tax-table">
					<view class="table-header">
						<text class="col">级数</text>
						<text class="col">应纳税所得额</text>
						<text class="col">税率</text>
						<text class="col">速算扣除数</text>
					</view>
					<view
						v-for="(rate, index) in taxRates"
						:key="index"
						class="table-row">
						<text class="col">{{ index + 1 }}</text>
						<text class="col">{{ rate.range }}</text>
						<text class="col">{{ rate.rate }}%</text>
						<text class="col">{{ rate.deduction }}</text>
					</view>
				</view>
			</uni-section>

			<!-- 提示说明 -->
			<view class="tips">
				<text class="tips-title">计算说明：</text>
				<text class="tips-content"
					>1. 应纳税所得额 = 月收入 - 五险一金 - 专项附加扣除 -
					5000（免征额）</text
				>
				<text class="tips-content"
					>2.
					专项附加扣除包括：子女教育、继续教育、住房贷款利息、住房租金、赡养老人、大病医疗</text
				>
				<text class="tips-content"
					>3. 计算结果仅供参考，实际以税务部门核定为准</text
				>
			</view>
		</uni-card>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'

// 专项附加扣除项目
const deductionItems = [
	{
		key: 'children',
		label: '子女教育',
		max: 1000,
		limit: '每子女1000元/月',
	},
	{
		key: 'education',
		label: '继续教育',
		max: 400,
		limit: '学历400元/月',
	},
	{
		key: 'mortgage',
		label: '住房贷款利息',
		max: 1000,
		limit: '1000元/月',
	},
	{
		key: 'rent',
		label: '住房租金',
		max: 1500,
		limit: '1500元/月',
	},
	{
		key: 'elderly',
		label: '赡养老人',
		max: 2000,
		limit: '2000元/月',
	},
	{
		key: 'medical',
		label: '大病医疗',
		max: 80000,
		limit: '年度限额80000',
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

// 计算专项附加扣除总额
const totalSpecialDeductions = computed(() => {
	return Object.values(specialDeductions.value).reduce(
		(sum, curr) => sum + curr,
		0
	)
})

// 计算应纳税所得额
const taxableIncome = computed(() => {
	const income = Number(monthlyIncome.value) || 0
	const insuranceAmount = Number(insurance.value) || 0
	const deductions = totalSpecialDeductions.value
	const base = 5000 // 免征额

	const amount = income - insuranceAmount - deductions - base
	return Math.max(amount, 0).toFixed(2)
})

// 获取适用税率和速算扣除数
const getTaxRate = (income) => {
	const amount = Number(income)
	const taxLevel = taxRates.find(
		(item) => amount > item.min && amount <= item.max
	)
	return taxLevel || taxRates[0]
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
	if (income <= 0) return '0.00'
	return (income * (taxRate.value / 100) - quickDeduction.value).toFixed(2)
})

// 计算税后收入
const afterTaxIncome = computed(() => {
	const income = Number(monthlyIncome.value) || 0
	const insuranceAmount = Number(insurance.value) || 0
	const taxAmount = Number(tax.value)
	return (income - insuranceAmount - taxAmount).toFixed(2)
})

// 计算方法
const calculate = () => {
	// 触发所有计算属性重新计算
	taxableIncome.value
	taxRate.value
	quickDeduction.value
	tax.value
	afterTaxIncome.value
}

// 处理专项附加扣除输入变化
const handleDeductionChange = (key) => {
	const item = deductionItems.find((item) => item.key === key)
	const value = Number(specialDeductions.value[key]) || 0

	// 限制最大值
	if (value > item.max) {
		specialDeductions.value[key] = item.max
		uni.showToast({
			title: `${item.label}最高${item.max}元`,
			icon: 'none',
		})
	}

	// 限制最小值
	if (value < 0) {
		specialDeductions.value[key] = 0
	}

	calculate()
}
</script>

<style lang="scss">
.tax-calculator {
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

	// 专项附加扣除样式
	.deductions-box {
		margin-top: 30rpx;

		.section-title {
			display: block;
			font-size: 28rpx;
			color: #666;
			margin-bottom: 20rpx;
		}

		.deduction-items {
			display: flex;
			flex-direction: column;
			gap: 20rpx;

			.deduction-item {
				background-color: #f8f8f8;
				padding: 20rpx;
				border-radius: 8rpx;

				.item-header {
					display: flex;
					align-items: center;
					justify-content: space-between;
					margin-bottom: 12rpx;

					.item-label {
						font-size: 28rpx;
						color: #333;
						font-weight: 500;
					}

					.item-limit {
						font-size: 26rpx;
						color: #999;
					}
				}

				.item-input {
					display: flex;
					align-items: center;
					gap: 12rpx;

					:deep(.uni-easyinput) {
						flex: 1;

						.uni-easyinput__content {
							height: 70rpx !important;
							background-color: #fff !important;
						}

						.uni-easyinput__content-input {
							font-size: 28rpx !important;
						}

						.uni-easyinput__placeholder {
							font-size: 26rpx !important;
						}
					}

					.unit {
						font-size: 26rpx;
						color: #666;
						white-space: nowrap;
						padding: 0 4rpx;
					}
				}
			}
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
				min-width: 220rpx;
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

	// 税率表样式
	.tax-table {
		border: 1px solid #eee;
		border-radius: 8rpx;
		overflow: hidden;

		.table-header,
		.table-row {
			display: grid;
			grid-template-columns: 80rpx 1fr 100rpx 150rpx;
			text-align: center;
			font-size: 26rpx;
		}

		.table-header {
			background-color: #f8f8f8;
			font-weight: 500;
			color: #333;

			.col {
				padding: 16rpx;
				border-right: 1px solid #eee;
				border-bottom: 1px solid #eee;

				&:last-child {
					border-right: none;
				}
			}
		}

		.table-row {
			color: #666;

			.col {
				padding: 16rpx;
				border-right: 1px solid #eee;
				border-bottom: 1px solid #eee;

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
