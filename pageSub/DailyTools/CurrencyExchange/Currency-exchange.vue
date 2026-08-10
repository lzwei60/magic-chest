<template>
	<view class="currency-converter">
		<!-- 转换器主体 -->
		<view class="card converter-card">
			<view class="card-header">
				<view class="header-left">
					<uni-icons type="wallet-filled" size="20" color="#1677ff"></uni-icons>
					<text class="card-title">汇率转换</text>
				</view>
				<view class="header-actions">
					<view
						class="refresh-btn"
						:class="{ refreshing: loading }"
						@tap="refreshRates">
						<uni-icons
							:type="loading ? 'spinner-cycle' : 'refresh'"
							size="18"
							color="#1677ff"></uni-icons>
						<text>刷新</text>
					</view>
				</view>
			</view>

			<view class="card-body">
				<!-- 金额输入 -->
				<view class="amount-section">
					<view class="label-wrapper">
						<uni-icons type="wallet" size="16" color="#999"></uni-icons>
						<text class="section-label">金额</text>
					</view>
					<view class="amount-input-wrapper">
						<view class="currency-symbol-wrapper">
							<text class="currency-symbol">
								{{ currencySymbols[fromCurrency] }}
							</text>
						</view>
						<input
							v-model="amount"
							type="digit"
							placeholder="请输入金额"
							class="amount-input"
							@input="handleConvert" />
						<text v-if="amount" class="clear-btn" @click="clearAmount">
							<uni-icons type="clear" size="16" color="#999"></uni-icons>
						</text>
					</view>
					<text v-if="formattedAmount" class="formatted-amount">
						已格式化: {{ formattedAmount }}
					</text>
				</view>

				<!-- 货币选择 -->
				<view class="currency-section">
					<view class="label-wrapper">
						<uni-icons type="loop" size="16" color="#999"></uni-icons>
						<text class="section-label">货币选择</text>
					</view>
					<view class="currency-select-wrapper">
						<view class="currency-select-item">
							<text class="currency-label">从</text>
							<uni-data-select
								v-model="fromCurrency"
								:localdata="currencyOptions"
								:clear="false"
								@change="handleFromCurrencyChange"
								class="custom-select" />
						</view>
						<view class="exchange-btn" @tap="swapCurrencies">
							<uni-icons type="loop" size="24" color="#1677ff"></uni-icons>
						</view>
						<view class="currency-select-item">
							<text class="currency-label">到</text>
							<uni-data-select
								v-model="toCurrency"
								:localdata="currencyOptions"
								:clear="false"
								@change="handleToCurrencyChange"
								class="custom-select" />
						</view>
					</view>
				</view>

				<!-- 转换结果 -->
				<view
					v-if="convertedAmount !== null && convertedAmount !== undefined"
					class="result-section">
					<view class="result-card">
						<view class="result-main">
							<view class="result-from">
								<text class="result-label">原始金额</text>
								<text class="result-value">
									{{ currencySymbols[fromCurrency] }}{{ formattedAmount }}
								</text>
								<text class="result-currency">{{ fromCurrency }}</text>
							</view>
							<view class="result-arrow">
								<uni-icons
									type="arrow-right"
									size="24"
									color="#1677ff"></uni-icons>
							</view>
							<view class="result-to">
								<text class="result-label">转换结果</text>
								<text class="result-value highlight">
									{{ currencySymbols[toCurrency] }}{{ formatResult }}
								</text>
								<text class="result-currency">{{ toCurrency }}</text>
							</view>
						</view>
						<view class="result-info">
							<view class="rate-info">
								<uni-icons type="info" size="14" color="#999"></uni-icons>
								<text class="rate-text">
									1 {{ fromCurrency }} = {{ currentRate }} {{ toCurrency }}
								</text>
							</view>
							<view class="time-info">
								<uni-icons type="clock" size="14" color="#999"></uni-icons>
								<text class="time-text">更新时间：{{ lastUpdateTime }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 常用汇率 -->
		<view v-if="commonRates.length > 0" class="card rates-card">
			<view class="card-header">
				<view class="header-left">
					<uni-icons type="list" size="20" color="#1677ff"></uni-icons>
					<text class="card-title">常用汇率</text>
				</view>
			</view>

			<view class="card-body">
				<view class="rates-list">
					<view
						v-for="(rate, index) in commonRates"
						:key="index"
						class="rate-item"
						@click="selectCommonRate(rate)">
						<view class="rate-item-left">
							<view class="rate-flag">
								<text class="rate-from">{{ rate.from }}</text>
								<uni-icons
									type="arrow-right"
									size="14"
									color="#999"></uni-icons>
								<text class="rate-to">{{ rate.to }}</text>
							</view>
						</view>
						<view class="rate-item-right">
							<text class="rate-value">{{ rate.rate }}</text>
							<uni-icons type="right" size="16" color="#999"></uni-icons>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { STORAGE_KEYS, getStorage, setStorage } from '../../../utils/storage'

// 货币选项
const currencyOptions = [
	{ value: 'CNY', text: '人民币 (CNY)' },
	{ value: 'USD', text: '美元 (USD)' },
	{ value: 'EUR', text: '欧元 (EUR)' },
	{ value: 'JPY', text: '日元 (JPY)' },
	{ value: 'GBP', text: '英镑 (GBP)' },
	{ value: 'HKD', text: '港币 (HKD)' },
]

// 货币符号
const currencySymbols = {
	CNY: '￥',
	USD: '$',
	EUR: '€',
	JPY: '¥',
	GBP: '£',
	HKD: 'HK$',
	KRW: '₩',
}

// 状态变量
const amount = ref('')
const fromCurrency = ref('CNY')
const toCurrency = ref('USD')
const exchangeRates = ref({})
const lastUpdateTime = ref('')
const loading = ref(false)
const convertedAmount = ref(null)
const EXCHANGE_RATE_API_KEY = process.env.VUE_APP_EXCHANGE_RATE_API_KEY || ''

// 千分位格式化
const formatNumber = (num) => {
	if (num == null || isNaN(num)) return ''
	const [intPart, decPart] = num.toString().split('.')
	return (
		intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',') +
		(decPart ? '.' + decPart : '')
	)
}

// 格式化显示金额
const formattedAmount = computed(() => {
	if (!amount.value) return ''
	return formatNumber(amount.value)
})

const formatResult = computed(() => {
	if (!convertedAmount.value) return ''
	const formatted = formatNumber(convertedAmount.value.toFixed(2))
	return formatted
})

// 清空金额
const clearAmount = () => {
	amount.value = ''
	convertedAmount.value = null
}

// 获取用户本地货币
const detectLocalCurrency = () => {
	try {
		const res = uni.getSystemInfoSync()
		const locale = res.language || 'zh'
		const langToCurrency = { zh: 'CNY', en: 'USD', ja: 'JPY', ko: 'KRW' }
		return langToCurrency[locale] || 'CNY'
	} catch {
		return 'CNY'
	}
}
fromCurrency.value = detectLocalCurrency()

// 缓存逻辑
const shouldUpdateRates = () => {
	try {
		const lastUpdate = getStorage(
			STORAGE_KEYS.exchangeRatesUpdatedAt(fromCurrency.value),
			getStorage(`lastRateUpdate_${fromCurrency.value}`, '')
		)
		const rates = getStorage(
			STORAGE_KEYS.exchangeRates(fromCurrency.value),
			getStorage(`exchangeRates_${fromCurrency.value}`, null)
		)
		if (!lastUpdate || !rates) return true
		const lastDate = new Date(lastUpdate)
		const today = new Date()
		return (
			lastDate.getFullYear() !== today.getFullYear() ||
			lastDate.getMonth() !== today.getMonth() ||
			lastDate.getDate() !== today.getDate()
		)
	} catch {
		return true
	}
}

const getCachedRates = () => {
	try {
		const rates = getStorage(
			STORAGE_KEYS.exchangeRates(fromCurrency.value),
			getStorage(`exchangeRates_${fromCurrency.value}`, null)
		)
		const updateTime = getStorage(
			STORAGE_KEYS.exchangeRatesUpdatedAt(fromCurrency.value),
			getStorage(`lastRateUpdate_${fromCurrency.value}`, '')
		)
		if (rates && updateTime) {
			exchangeRates.value = rates
			lastUpdateTime.value = new Date(updateTime).toLocaleString()
			return rates
		}
		return null
	} catch {
		return null
	}
}

const saveRatesToCache = (rates) => {
	setStorage(STORAGE_KEYS.exchangeRates(fromCurrency.value), rates)
	setStorage(
		STORAGE_KEYS.exchangeRatesUpdatedAt(fromCurrency.value),
		new Date().toISOString()
	)
}

// 获取汇率
const fetchExchangeRates = async (showLoading = true) => {
	if (loading.value) return
	loading.value = true

	if (showLoading) {
		uni.showLoading({ title: '获取汇率中...' })
	}

	try {
		// 先尝试使用缓存
		if (!shouldUpdateRates()) {
			const cachedRates = getCachedRates()
			if (cachedRates) {
				handleConvert()
				if (showLoading) {
					uni.hideLoading()
				}
				loading.value = false
				return
			}
		}

		if (!EXCHANGE_RATE_API_KEY) {
			throw new Error('汇率服务未配置')
		}

		// 从API获取最新汇率
		const response = await uni.request({
			url: `https://v6.exchangerate-api.com/v6/${EXCHANGE_RATE_API_KEY}/latest/${fromCurrency.value}`,
			method: 'GET',
			timeout: 10000, // 10秒超时
		})

		if (
			response.statusCode === 200 &&
			response.data &&
			response.data.conversion_rates
		) {
			exchangeRates.value = response.data.conversion_rates
			lastUpdateTime.value = new Date().toLocaleString('zh-CN', {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit',
				hour: '2-digit',
				minute: '2-digit',
			})
			saveRatesToCache(response.data.conversion_rates)
			handleConvert()
		} else {
			// 如果API失败，尝试使用缓存
			const cachedRates = getCachedRates()
			if (cachedRates) {
				handleConvert()
				uni.showToast({
					title: '使用缓存汇率',
					icon: 'none',
					duration: 2000,
				})
			} else {
				throw new Error('获取汇率失败')
			}
		}
	} catch (error) {
		console.error('获取汇率失败:', error)

		// 尝试使用缓存
		const cachedRates = getCachedRates()
		if (cachedRates) {
			handleConvert()
			uni.showToast({
				title: '网络异常，使用缓存汇率',
				icon: 'none',
				duration: 2000,
			})
		} else {
			uni.showToast({
				title: EXCHANGE_RATE_API_KEY
					? '获取汇率失败，请检查网络'
					: '汇率服务未配置',
				icon: 'error',
				duration: 2000,
			})
		}
	} finally {
		loading.value = false
		if (showLoading) {
			uni.hideLoading()
		}
	}
}

// 转换计算
const handleConvert = async () => {
	await nextTick()

	// 移除千分位和空格
	const rawValue = (amount.value || '').toString().replace(/[,\s]/g, '')

	if (!rawValue || rawValue.trim() === '') {
		convertedAmount.value = null
		return
	}

	const numAmount = parseFloat(rawValue)

	if (isNaN(numAmount) || numAmount <= 0) {
		convertedAmount.value = null
		return
	}

	if (!exchangeRates.value || !exchangeRates.value[toCurrency.value]) {
		convertedAmount.value = null
		// 如果没有汇率数据，尝试获取
		if (Object.keys(exchangeRates.value).length === 0) {
			fetchExchangeRates()
		}
		return
	}

	try {
		convertedAmount.value = numAmount * exchangeRates.value[toCurrency.value]
	} catch (error) {
		console.error('计算转换金额失败:', error)
		convertedAmount.value = null
	}
}

// 计算属性
const currentRate = computed(() => {
	const rate = exchangeRates.value[toCurrency.value]
	return rate ? rate.toFixed(4) : '0.0000'
})

const commonRates = computed(() => {
	if (!exchangeRates.value) return []
	const targets = ['CNY', 'USD', 'EUR', 'JPY']
	return targets
		.filter((cur) => cur !== fromCurrency.value)
		.map((cur) => ({
			from: fromCurrency.value,
			to: cur,
			rate: exchangeRates.value[cur]?.toFixed(4) || '-',
		}))
})

// 事件
const handleFromCurrencyChange = () => fetchExchangeRates()
const handleToCurrencyChange = () => handleConvert()
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
const refreshRates = async () => {
	if (loading.value) return
	await fetchExchangeRates(true)
	// 延迟显示成功提示，避免与loading冲突
	setTimeout(() => {
		uni.showToast({
			title: '已刷新汇率',
			icon: 'success',
			duration: 1500,
		})
	}, 300)
}

// 初始化
onMounted(() => fetchExchangeRates())
</script>

<style lang="scss">
.currency-converter {
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

.header-actions {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.refresh-btn {
	display: flex;
	align-items: center;
	gap: 6rpx;
	padding: 8rpx 16rpx;
	border-radius: 8rpx;
	font-size: 26rpx;
	color: #1677ff;
	transition: all 0.2s ease;

	&:active {
		background-color: rgba(22, 119, 255, 0.1);
		transform: scale(0.95);
	}

	&.refreshing {
		animation: rotate 1s linear infinite;
	}
}

.card-body {
	padding: 24rpx;
}

// 金额输入区域
.amount-section {
	margin-bottom: 32rpx;
}

.label-wrapper {
	display: flex;
	align-items: center;
	gap: 8rpx;
	margin-bottom: 16rpx;
}

.section-label {
	font-size: 28rpx;
	color: #333;
	font-weight: 500;
}

.amount-input-wrapper {
	position: relative;
	display: flex;
	align-items: center;
	background: #fafafa;
	border-radius: 12rpx;
	border: 2rpx solid transparent;
	transition: all 0.3s ease;
	padding: 0 20rpx;

	&:focus-within {
		background: #fff;
		border-color: #1677ff;
		box-shadow: 0 0 0 4rpx rgba(22, 119, 255, 0.1);
	}
}

.currency-symbol-wrapper {
	display: flex;
	align-items: center;
	margin-right: 12rpx;
}

.currency-symbol {
	font-size: 36rpx;
	color: #1677ff;
	font-weight: 600;
}

.amount-input {
	flex: 1;
	height: 88rpx;
	font-size: 32rpx;
	color: #333;
	background: transparent;
	border: none;
}

.clear-btn {
	padding: 8rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-left: 12rpx;
	transition: all 0.2s ease;

	&:active {
		transform: scale(0.9);
		opacity: 0.7;
	}
}

.formatted-amount {
	display: block;
	margin-top: 12rpx;
	font-size: 24rpx;
	color: #999;
}

// 货币选择区域
.currency-section {
	margin-bottom: 32rpx;
}

.currency-select-wrapper {
	display: flex;
	align-items: flex-end;
	gap: 16rpx;
}

.currency-select-item {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}

.currency-label {
	font-size: 24rpx;
	color: #999;
}

.exchange-btn {
	width: 64rpx;
	height: 64rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #f0f7ff 0%, #fff 100%);
	border-radius: 50%;
	border: 2rpx solid #1677ff;
	transition: all 0.3s ease;
	margin-bottom: 12rpx;

	&:active {
		transform: scale(0.9) rotate(180deg);
		background: rgba(22, 119, 255, 0.1);
	}
}

// 结果展示
.result-section {
	margin-top: 32rpx;
	animation: fadeIn 0.5s ease;
}

.result-card {
	background: linear-gradient(135deg, #f8f9fa 0%, #fff 100%);
	border-radius: 16rpx;
	padding: 32rpx;
	border-left: 6rpx solid #1677ff;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.result-main {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 24rpx;
}

.result-from,
.result-to {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8rpx;
}

.result-label {
	font-size: 24rpx;
	color: #999;
}

.result-value {
	font-size: 40rpx;
	font-weight: 600;
	color: #333;
	line-height: 1.2;

	&.highlight {
		color: #1677ff;
		font-size: 44rpx;
	}
}

.result-currency {
	font-size: 26rpx;
	color: #666;
}

.result-arrow {
	padding: 0 16rpx;
}

.result-info {
	display: flex;
	flex-direction: column;
	gap: 12rpx;
	padding-top: 24rpx;
	border-top: 1rpx solid #e8e8e8;
}

.rate-info,
.time-info {
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.rate-text,
.time-text {
	font-size: 24rpx;
	color: #999;
}

// 常用汇率列表
.rates-list {
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}

.rate-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx;
	background: #fafafa;
	border-radius: 12rpx;
	transition: all 0.2s ease;

	&:active {
		background: #f0f7ff;
		transform: scale(0.98);
	}
}

.rate-item-left {
	flex: 1;
}

.rate-flag {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.rate-from,
.rate-to {
	font-size: 28rpx;
	font-weight: 500;
	color: #333;
}

.rate-item-right {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.rate-value {
	font-size: 30rpx;
	font-weight: 600;
	color: #1677ff;
}

// 下拉选择器样式
:deep(.custom-select .uni-data-select) {
	.uni-select--selector {
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

	.uni-select__input-text {
		font-size: 28rpx !important;
		color: #333 !important;
		font-weight: 500 !important;
	}
}

:deep(.uni-select__popper) {
	position: fixed !important;
	left: 24rpx !important;
	right: 24rpx !important;
	top: 50% !important;
	transform: translateY(-50%) !important;
	z-index: 9999 !important;
	background-color: #fff !important;
	border-radius: 16rpx !important;
	box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.15) !important;
	max-height: 60vh !important;
	overflow-y: auto !important;
	border: 1rpx solid #e8e8e8 !important;

	.uni-select__selector-item {
		padding: 24rpx !important;
		font-size: 28rpx !important;
		color: #333 !important;
		text-align: left !important;
		border-bottom: 1rpx solid #f5f5f5 !important;
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

:deep(.uni-select--mask) {
	position: fixed !important;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
	z-index: 9998;
	background-color: rgba(0, 0, 0, 0.4) !important;
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

@keyframes rotate {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}
</style>
