<template>
	<view class="currency-converter">
		<!-- 转换器主体 -->
		<view class="converter-main">
			<uni-card>
				<!-- 金额输入 -->
				<uni-section title="金额" type="line">
					<uni-easyinput
						v-model="amount"
						type="digit"
						placeholder="请输入金额"
						:inputBorder="false"
						@input="handleConvert" />
				</uni-section>

				<!-- 货币选择 -->
				<uni-section title="货币选择" type="line" padding>
					<uni-row :gutter="10">
						<uni-col :span="11">
							<uni-data-select
								v-model="fromCurrency"
								:localdata="currencyOptions"
								:clear="false"
								@change="handleFromCurrencyChange" />
						</uni-col>
						<uni-col :span="2">
							<view class="exchange-btn" @tap="swapCurrencies">
								<uni-icons type="loop" size="20" color="#1677ff" />
							</view>
						</uni-col>
						<uni-col :span="11">
							<uni-data-select
								v-model="toCurrency"
								:localdata="currencyOptions"
								:clear="false"
								@change="handleToCurrencyChange" />
						</uni-col>
					</uni-row>
				</uni-section>

				<!-- 转换结果 -->
				<uni-section
					v-if="convertedAmount"
					title="转换结果"
					type="line"
					padding>
					<view class="result-box">
						<text class="amount">
							{{ amount }} {{ fromCurrency }} = {{ formatResult }}
						</text>
						<text class="rate">
							1 {{ fromCurrency }} = {{ currentRate }} {{ toCurrency }}
						</text>
						<text class="time">更新时间：{{ lastUpdateTime }}</text>
					</view>
				</uni-section>
			</uni-card>
		</view>

		<!-- 常用汇率 -->
		<view class="rates-wrapper">
			<uni-card margin="20rpx 0">
				<uni-section title="常用汇率" type="line">
					<uni-list :border="false">
						<uni-list-item
							v-for="(rate, index) in commonRates"
							:key="index"
							:title="`${rate.from} → ${rate.to}`"
							:rightText="rate.rate"
							:clickable="true"
							@click="selectCommonRate(rate)" />
					</uni-list>
				</uni-section>
			</uni-card>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 货币选项
const currencyOptions = [
	{ value: 'CNY', text: '人民币 (CNY)' },
	{ value: 'USD', text: '美元 (USD)' },
	{ value: 'EUR', text: '欧元 (EUR)' },
	{ value: 'JPY', text: '日元 (JPY)' },
	{ value: 'GBP', text: '英镑 (GBP)' },
	{ value: 'HKD', text: '港币 (HKD)' },
]

// 状态变量
const amount = ref('')
const fromCurrency = ref('CNY')
const toCurrency = ref('USD')
const exchangeRates = ref({})
const lastUpdateTime = ref('')
const loading = ref(false)
const convertedAmount = ref(null)

/**
 * 检查是否需要更新汇率
 * @returns {boolean} 是否需要更新
 */
const shouldUpdateRates = () => {
	try {
		const lastUpdate = uni.getStorageSync('lastRateUpdate')
		const rates = uni.getStorageSync('exchangeRates')

		if (!lastUpdate || !rates) return true

		// 检查是否是同一天
		const lastDate = new Date(lastUpdate)
		const today = new Date()
		return (
			lastDate.getFullYear() !== today.getFullYear() ||
			lastDate.getMonth() !== today.getMonth() ||
			lastDate.getDate() !== today.getDate()
		)
	} catch (error) {
		console.error('检查更新时间错误:', error)
		return true
	}
}

/**
 * 从缓存获取汇率数据
 * @returns {Object|null} 汇率数据或null
 */
const getCachedRates = () => {
	try {
		const rates = uni.getStorageSync('exchangeRates')
		const updateTime = uni.getStorageSync('lastRateUpdate')
		if (rates && updateTime) {
			exchangeRates.value = rates
			lastUpdateTime.value = new Date(updateTime).toLocaleString()
			return rates
		}
		return null
	} catch (error) {
		console.error('获取缓存汇率错误:', error)
		return null
	}
}

/**
 * 保存汇率数据到缓存
 * @param {Object} rates - 汇率数据
 */
const saveRatesToCache = (rates) => {
	try {
		uni.setStorageSync('exchangeRates', rates)
		uni.setStorageSync('lastRateUpdate', new Date().toISOString())
	} catch (error) {
		console.error('保存汇率缓存错误:', error)
	}
}

// 获取汇率数据
const fetchExchangeRates = async () => {
	if (loading.value) return

	try {
		// 检查是否需要更新汇率
		if (!shouldUpdateRates()) {
			const cachedRates = getCachedRates()
			if (cachedRates) {
				handleConvert()
				return
			}
		}

		loading.value = true
		uni.showLoading({ title: '获取汇率中...' })

		const response = await uni.request({
			url: `https://v6.exchangerate-api.com/v6/72515e93e2c92d130d9ff638/latest/${fromCurrency.value}`,
			method: 'GET',
		})

		if (response.statusCode === 200) {
			exchangeRates.value = response.data.conversion_rates
			lastUpdateTime.value = new Date().toLocaleString()

			// 保存到缓存
			saveRatesToCache(response.data.conversion_rates)

			handleConvert()
		} else {
			throw new Error('获取汇率失败')
		}
	} catch (error) {
		uni.showToast({
			title: '获取汇率失败',
			icon: 'error',
		})
		console.error('获取汇率错误:', error)
	} finally {
		loading.value = false
		uni.hideLoading()
	}
}

// 计算属性
const currentRate = computed(() => {
	const rate = exchangeRates.value[toCurrency.value]
	return rate ? rate.toFixed(4) : '0.0000'
})

const formatResult = computed(() => {
	if (!convertedAmount.value) return ''
	return `${convertedAmount.value.toFixed(2)} ${toCurrency.value}`
})

const commonRates = computed(() => {
	if (!exchangeRates.value || !exchangeRates.value['CNY']) return []

	return [
		{
			from: 'USD',
			to: 'CNY',
			rate: exchangeRates.value['CNY']?.toFixed(4) || '-',
		},
		{
			from: 'EUR',
			to: 'CNY',
			rate:
				(exchangeRates.value['CNY'] / exchangeRates.value['EUR'])?.toFixed(4) ||
				'-',
		},
		{
			from: 'JPY',
			to: 'CNY',
			rate:
				(exchangeRates.value['CNY'] / exchangeRates.value['JPY'])?.toFixed(4) ||
				'-',
		},
	]
})

// 事件处理
const handleConvert = () => {
	if (!amount.value || !exchangeRates.value[toCurrency.value]) {
		convertedAmount.value = null
		return
	}

	const numAmount = parseFloat(amount.value)
	if (isNaN(numAmount) || numAmount <= 0) {
		uni.showToast({
			title: '请输入有效金额',
			icon: 'none',
		})
		convertedAmount.value = null
		return
	}

	// 计算转换后的金额
	const rate = exchangeRates.value[toCurrency.value]
	convertedAmount.value = numAmount * rate
}

const handleFromCurrencyChange = () => {
	fetchExchangeRates()
}

const handleToCurrencyChange = () => {
	handleConvert()
}

const swapCurrencies = () => {
	;[fromCurrency.value, toCurrency.value] = [
		toCurrency.value,
		fromCurrency.value,
	]
	fetchExchangeRates()
}

const selectCommonRate = (rate) => {
	fromCurrency.value = rate.from
	toCurrency.value = rate.to
	fetchExchangeRates()
}

// 初始化时检查缓存
onMounted(() => {
	fetchExchangeRates()
})
</script>

<style lang="scss">
.currency-converter {
	padding: 30rpx;
	min-height: 100vh;
	background-color: #f5f5f5;

	.converter-main {
		position: relative;
		z-index: 2;
	}

	.rates-wrapper {
		position: relative;
		z-index: 1;
		margin-top: 30rpx;
	}

	.exchange-btn {
		height: 88rpx;
		display: flex;
		align-items: center;
		justify-content: center;

		&:active {
			opacity: 0.7;
		}
	}

	.result-box {
		text-align: center;
		padding: 20rpx 0;

		.amount {
			display: block;
			font-size: 40rpx;
			color: #333;
			font-weight: 500;
			margin-bottom: 16rpx;
		}

		.rate {
			display: block;
			font-size: 28rpx;
			color: #666;
			margin-bottom: 12rpx;
		}

		.time {
			display: block;
			font-size: 24rpx;
			color: #999;
		}
	}
}

// 修改下拉选择器和遮罩层样式
:deep(.uni-select--mask) {
	position: fixed !important;
	left: 0 !important;
	right: 0 !important;
	top: 0 !important;
	bottom: 0 !important;
	z-index: 9998 !important;
	background-color: rgba(0, 0, 0, 0.4) !important;
}

:deep(.uni-data-select) {
	position: relative !important;

	.uni-select--selector {
		height: 88rpx !important;
		background-color: #f8f8f8 !important;
		border-radius: 8rpx !important;
		border: none !important;
	}
}

// 下拉面板样式
:deep(.uni-select__selector) {
	position: fixed !important;
	left: 30rpx !important;
	right: 30rpx !important;
	top: 50% !important;
	transform: translateY(-50%) !important;
	z-index: 9999 !important;
	background-color: #fff !important;
	border-radius: 12rpx !important;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1) !important;
	max-height: 60vh !important;
	overflow-y: auto !important;

	.uni-select__selector-item {
		padding: 24rpx !important;
		font-size: 28rpx !important;
		color: #333 !important;
		text-align: center !important;
		border-bottom: 2rpx solid #f5f5f5 !important;

		&:last-child {
			border-bottom: none !important;
		}

		&:active,
		&.uni-select__selector-item--hover {
			background-color: #f8f8f8 !important;
		}
	}
}

// 调整卡片层级
:deep(.uni-card) {
	position: relative !important;
	margin: 0 !important;
	border-radius: 12rpx !important;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05) !important;
}

:deep(.uni-list-item) {
	&:active {
		background-color: #f8f8f8;
	}

	.uni-list-item__extra-text {
		color: #1677ff !important;
	}
}
</style>
