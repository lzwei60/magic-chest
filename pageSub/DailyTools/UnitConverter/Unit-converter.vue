<template>
	<view class="unit-converter">
		<!-- 转换类型选择卡片 -->
		<view class="type-card">
			<view class="card-header">
				<uni-icons :type="typeIcon" size="20" color="#1677ff"></uni-icons>
				<text class="card-title">转换类型</text>
			</view>
			<uni-data-select
				v-model="currentType"
				:localdata="conversionTypes"
				:clear="false"
				@change="handleTypeChange" />
		</view>

		<!-- 单位转换卡片 -->
		<view class="converter-card">
			<view class="card-header">
				<uni-icons :type="typeIcon" size="20" color="#1677ff"></uni-icons>
				<text class="card-title">{{ typeName }}</text>
			</view>

			<view class="converter-box">
				<!-- 输入值 -->
				<view class="input-wrapper">
					<view class="input-label">输入</view>
					<view class="input-group">
						<view class="input-box">
							<uni-easyinput
								v-model="inputValue"
								type="digit"
								placeholder="请输入数值"
								:clearable="true"
								@input="handleConvert"
								@blur="validateInput" />
							<view class="input-actions" v-if="inputValue">
								<view class="clear-btn" @click="clearInput">
									<uni-icons type="clear" size="16" color="#999"></uni-icons>
								</view>
							</view>
						</view>
						<view class="unit-select">
							<uni-data-select
								v-model="fromUnit"
								:localdata="currentUnits"
								:clear="false"
								@change="handleConvert" />
						</view>
					</view>
					<text v-if="inputError" class="error-text">{{ inputError }}</text>
				</view>

				<!-- 转换图标 -->
				<view class="convert-icon-wrapper">
					<view
						class="convert-icon"
						@click="handleSwap"
						:class="{ rotating: isSwapping }">
						<uni-icons type="loop" size="24" color="#1677ff"></uni-icons>
					</view>
				</view>

				<!-- 输出值 -->
				<view class="input-wrapper">
					<view class="input-label">结果</view>
					<view class="input-group">
						<view class="input-box result-box">
							<text class="result-value">{{ formattedOutput }}</text>
						</view>
						<view class="unit-select">
							<uni-data-select
								v-model="toUnit"
								:localdata="currentUnits"
								:clear="false"
								@change="handleConvert" />
						</view>
					</view>
				</view>
			</view>

			<!-- 清空按钮 -->
			<view class="action-buttons">
				<view class="clear-all-btn" @click="clearAll">
					<uni-icons type="trash" size="18" color="#fff"></uni-icons>
					<text>清空</text>
				</view>
			</view>
		</view>

		<!-- 常用换算卡片 -->
		<view class="common-card" v-if="commonConversions.length > 0">
			<view class="card-header">
				<uni-icons type="star" size="20" color="#1677ff"></uni-icons>
				<text class="card-title">常用换算</text>
			</view>
			<view class="common-box">
				<view
					v-for="item in commonConversions"
					:key="item.from + item.to"
					class="common-item"
					@click="handleCommonClick(item)">
					<view class="common-left">
						<view class="common-icon">
							<uni-icons
								type="arrow-right"
								size="16"
								color="#1677ff"></uni-icons>
						</view>
						<view class="common-info">
							<text class="common-text">{{ item.text }}</text>
							<text class="common-value">{{ item.value }}</text>
						</view>
					</view>
					<view class="common-arrow">
						<uni-icons type="right" size="16" color="#999"></uni-icons>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'

// 转换类型
const conversionTypes = [
	{ value: 'length', text: '长度' },
	{ value: 'area', text: '面积' },
	{ value: 'volume', text: '体积' },
	{ value: 'temperature', text: '温度' },
	{ value: 'weight', text: '重量' },
	{ value: 'speed', text: '速度' },
]

// 类型名称映射
const typeNameMap = {
	length: '长度转换',
	area: '面积转换',
	volume: '体积转换',
	temperature: '温度转换',
	weight: '重量转换',
	speed: '速度转换',
}

// 类型图标映射
const typeIconMap = {
	length: 'list',
	area: 'grid',
	volume: 'cube',
	temperature: 'fire',
	weight: 'scale',
	speed: 'loop',
}

// 单位定义
const units = {
	length: [
		{ value: 'km', text: '千米' },
		{ value: 'm', text: '米' },
		{ value: 'dm', text: '分米' },
		{ value: 'cm', text: '厘米' },
		{ value: 'mm', text: '毫米' },
		{ value: 'mile', text: '英里' },
		{ value: 'yard', text: '码' },
		{ value: 'foot', text: '英尺' },
		{ value: 'inch', text: '英寸' },
	],
	area: [
		{ value: 'km2', text: '平方千米' },
		{ value: 'm2', text: '平方米' },
		{ value: 'dm2', text: '平方分米' },
		{ value: 'cm2', text: '平方厘米' },
		{ value: 'mm2', text: '平方毫米' },
		{ value: 'ha', text: '公顷' },
		{ value: 'acre', text: '英亩' },
	],
	volume: [
		{ value: 'm3', text: '立方米' },
		{ value: 'dm3', text: '立方分米' },
		{ value: 'cm3', text: '立方厘米' },
		{ value: 'mm3', text: '立方毫米' },
		{ value: 'l', text: '升' },
		{ value: 'ml', text: '毫升' },
	],
	temperature: [
		{ value: 'c', text: '摄氏度' },
		{ value: 'f', text: '华氏度' },
		{ value: 'k', text: '开尔文' },
	],
	weight: [
		{ value: 't', text: '吨' },
		{ value: 'kg', text: '千克' },
		{ value: 'g', text: '克' },
		{ value: 'mg', text: '毫克' },
		{ value: 'lb', text: '磅' },
		{ value: 'oz', text: '盎司' },
	],
	speed: [
		{ value: 'kmh', text: '千米/时' },
		{ value: 'ms', text: '米/秒' },
		{ value: 'mph', text: '英里/时' },
		{ value: 'kn', text: '节' },
	],
}

// 基准单位换算比例（以第一个单位为基准）
const ratios = {
	length: {
		km: 1000,
		m: 1,
		dm: 0.1,
		cm: 0.01,
		mm: 0.001,
		mile: 1609.344,
		yard: 0.9144,
		foot: 0.3048,
		inch: 0.0254,
	},
	area: {
		km2: 1000000,
		m2: 1,
		dm2: 0.01,
		cm2: 0.0001,
		mm2: 0.000001,
		ha: 10000,
		acre: 4046.86,
	},
	volume: {
		m3: 1000,
		dm3: 1,
		cm3: 0.001,
		mm3: 0.000001,
		l: 1,
		ml: 0.001,
	},
	weight: {
		t: 1000,
		kg: 1,
		g: 0.001,
		mg: 0.000001,
		lb: 0.45359237,
		oz: 0.028349523125,
	},
	speed: {
		kmh: 1,
		ms: 3.6,
		mph: 1.609344,
		kn: 1.852,
	},
}

// 表单数据
const currentType = ref('length')
const inputValue = ref('')
const outputValue = ref('')
const fromUnit = ref('')
const toUnit = ref('')
const inputError = ref('')
const isSwapping = ref(false)

// 当前可用单位
const currentUnits = computed(() => units[currentType.value])

// 类型名称
const typeName = computed(() => typeNameMap[currentType.value] || '单位转换')

// 类型图标
const typeIcon = computed(() => typeIconMap[currentType.value] || 'list')

// 格式化输出值
const formattedOutput = computed(() => {
	if (!outputValue.value || outputValue.value === '0') return '0'
	const num = parseFloat(outputValue.value)
	if (isNaN(num)) return '0'

	// 去除不必要的0
	const str = num.toString()
	if (str.includes('.')) {
		return str.replace(/\.?0+$/, '')
	}
	return str
})

// 常用换算
const commonConversions = computed(() => {
	const type = currentType.value
	switch (type) {
		case 'length':
			return [
				{ from: 'm', to: 'km', value: '1000米 = 1千米', text: '米 → 千米' },
				{ from: 'km', to: 'm', value: '1千米 = 1000米', text: '千米 → 米' },
				{ from: 'm', to: 'cm', value: '1米 = 100厘米', text: '米 → 厘米' },
			]
		case 'area':
			return [
				{
					from: 'm2',
					to: 'km2',
					value: '1000000平方米 = 1平方千米',
					text: '平方米 → 平方千米',
				},
				{
					from: 'm2',
					to: 'ha',
					value: '10000平方米 = 1公顷',
					text: '平方米 → 公顷',
				},
			]
		case 'volume':
			return [
				{ from: 'l', to: 'ml', value: '1升 = 1000毫升', text: '升 → 毫升' },
				{ from: 'm3', to: 'l', value: '1立方米 = 1000升', text: '立方米 → 升' },
			]
		case 'temperature':
			return [
				{ from: 'c', to: 'f', value: '0°C = 32°F', text: '摄氏度 → 华氏度' },
				{ from: 'f', to: 'c', value: '32°F = 0°C', text: '华氏度 → 摄氏度' },
			]
		case 'weight':
			return [
				{ from: 'kg', to: 'g', value: '1千克 = 1000克', text: '千克 → 克' },
				{ from: 'kg', to: 'lb', value: '1千克 ≈ 2.2046磅', text: '千克 → 磅' },
			]
		case 'speed':
			return [
				{
					from: 'kmh',
					to: 'ms',
					value: '1千米/时 ≈ 0.2778米/秒',
					text: '千米/时 → 米/秒',
				},
				{
					from: 'kmh',
					to: 'mph',
					value: '1千米/时 ≈ 0.6214英里/时',
					text: '千米/时 → 英里/时',
				},
			]
		default:
			return []
	}
})

// 验证输入
const validateInput = () => {
	const value = inputValue.value.trim()
	if (!value) {
		inputError.value = ''
		return
	}
	const num = parseFloat(value)
	if (isNaN(num)) {
		inputError.value = '请输入有效的数值'
		return
	}
	if (!isFinite(num)) {
		inputError.value = '数值超出范围'
		return
	}
	inputError.value = ''
}

// 清空输入
const clearInput = () => {
	inputValue.value = ''
	outputValue.value = ''
	inputError.value = ''
}

// 清空所有
const clearAll = () => {
	if (!inputValue.value && !outputValue.value) {
		uni.showToast({
			title: '已经是空的了',
			icon: 'none',
			duration: 1500,
		})
		return
	}
	uni.showModal({
		title: '提示',
		content: '确定要清空所有输入吗？',
		success: (res) => {
			if (res.confirm) {
				inputValue.value = ''
				outputValue.value = ''
				inputError.value = ''
				uni.showToast({
					title: '已清空',
					icon: 'success',
					duration: 1500,
				})
			}
		},
	})
}

// 处理类型变化
const handleTypeChange = () => {
	fromUnit.value = currentUnits.value[0].value
	toUnit.value = currentUnits.value[1].value
	inputValue.value = ''
	outputValue.value = ''
	inputError.value = ''
	uni.vibrateShort({
		type: 'light',
	})
}

// 处理单位转换
const handleConvert = () => {
	if (!inputValue.value || !inputValue.value.trim()) {
		outputValue.value = ''
		return
	}

	const value = parseFloat(inputValue.value)
	if (isNaN(value) || !isFinite(value)) {
		outputValue.value = ''
		return
	}

	let result
	if (currentType.value === 'temperature') {
		result = convertTemperature(value, fromUnit.value, toUnit.value)
		outputValue.value = result.toFixed(2)
	} else {
		const fromRatio = ratios[currentType.value][fromUnit.value]
		const toRatio = ratios[currentType.value][toUnit.value]
		if (!fromRatio || !toRatio) {
			outputValue.value = ''
			return
		}
		result = (value * fromRatio) / toRatio
		// 根据结果大小决定小数位数
		if (Math.abs(result) >= 1000) {
			outputValue.value = result.toFixed(2)
		} else if (Math.abs(result) >= 1) {
			outputValue.value = result.toFixed(4)
		} else {
			outputValue.value = result.toFixed(8)
		}
	}
}

// 温度转换特殊处理
const convertTemperature = (value, from, to) => {
	let celsius
	// 先转换为摄氏度
	switch (from) {
		case 'c':
			celsius = value
			break
		case 'f':
			celsius = (value - 32) * (5 / 9)
			break
		case 'k':
			celsius = value - 273.15
			break
	}
	// 从摄氏度转换为目标单位
	switch (to) {
		case 'c':
			return celsius
		case 'f':
			return celsius * (9 / 5) + 32
		case 'k':
			return celsius + 273.15
	}
}

// 交换单位
const handleSwap = () => {
	if (!fromUnit.value || !toUnit.value) return

	const temp = fromUnit.value
	fromUnit.value = toUnit.value
	toUnit.value = temp

	// 交换输入和输出值
	const tempValue = inputValue.value
	inputValue.value = outputValue.value
	outputValue.value = tempValue

	// 添加旋转动画
	isSwapping.value = true
	setTimeout(() => {
		isSwapping.value = false
	}, 300)

	uni.vibrateShort({
		type: 'light',
	})

	handleConvert()
}

// 处理常用换算点击
const handleCommonClick = (item) => {
	fromUnit.value = item.from
	toUnit.value = item.to
	inputValue.value = '1'
	inputError.value = ''
	handleConvert()
	uni.vibrateShort({
		type: 'light',
	})
}

// 初始化
handleTypeChange()
</script>

<style lang="scss">
.unit-converter {
	padding: 30rpx;
	min-height: 100vh;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

	// 卡片通用样式
	.type-card,
	.converter-card,
	.common-card {
		background: #fff;
		border-radius: 24rpx;
		padding: 32rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
		animation: fadeInUp 0.5s ease-out;

		&:last-child {
			margin-bottom: 0;
		}
	}

	// 卡片头部
	.card-header {
		display: flex;
		align-items: center;
		margin-bottom: 32rpx;
		padding-bottom: 24rpx;
		border-bottom: 2rpx solid #f0f0f0;

		.card-title {
			font-size: 32rpx;
			font-weight: 600;
			color: #333;
			margin-left: 12rpx;
		}
	}

	// 转换器样式
	.converter-box {
		display: flex;
		flex-direction: column;
		gap: 32rpx;

		.input-wrapper {
			.input-label {
				font-size: 24rpx;
				color: #666;
				margin-bottom: 12rpx;
				padding-left: 4rpx;
			}

			.input-group {
				display: flex;
				gap: 16rpx;
				align-items: flex-start;

				.input-box {
					flex: 1;
					position: relative;

					.input-actions {
						position: absolute;
						right: 20rpx;
						top: 50%;
						transform: translateY(-50%);
						z-index: 10;

						.clear-btn {
							width: 48rpx;
							height: 48rpx;
							display: flex;
							align-items: center;
							justify-content: center;
							background: rgba(0, 0, 0, 0.05);
							border-radius: 50%;
							transition: all 0.3s;

							&:active {
								background: rgba(0, 0, 0, 0.1);
								transform: scale(0.95);
							}
						}
					}

					&.result-box {
						background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
						border-radius: 16rpx;
						border: 2rpx solid transparent;
						padding: 0 24rpx;
						height: 88rpx;
						display: flex;
						align-items: center;

						.result-value {
							font-size: 32rpx;
							color: #1677ff;
							font-weight: 600;
							width: 100%;
							text-align: left;
						}
					}
				}

				.unit-select {
					width: 200rpx;
					flex-shrink: 0;
				}
			}

			.error-text {
				display: block;
				font-size: 24rpx;
				color: #f5222d;
				margin-top: 8rpx;
				padding-left: 4rpx;
			}
		}

		.convert-icon-wrapper {
			display: flex;
			justify-content: center;
			padding: 10rpx 0;

			.convert-icon {
				width: 64rpx;
				height: 64rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
				border-radius: 50%;
				box-shadow: 0 4rpx 12rpx rgba(22, 119, 255, 0.3);
				transition: all 0.3s;

				&:active {
					transform: scale(0.95);
					box-shadow: 0 2rpx 8rpx rgba(22, 119, 255, 0.3);
				}

				&.rotating {
					animation: rotate 0.3s ease-out;
				}
			}
		}
	}

	// 操作按钮
	.action-buttons {
		margin-top: 32rpx;
		padding-top: 32rpx;
		border-top: 2rpx solid #f0f0f0;

		.clear-all-btn {
			width: 100%;
			height: 88rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			background: linear-gradient(135deg, #f5222d 0%, #ff4d4f 100%);
			border-radius: 16rpx;
			color: #fff;
			font-size: 28rpx;
			font-weight: 500;
			box-shadow: 0 4rpx 16rpx rgba(245, 34, 45, 0.3);
			transition: all 0.3s;

			&:active {
				transform: translateY(2rpx);
				box-shadow: 0 2rpx 8rpx rgba(245, 34, 45, 0.3);
			}

			text {
				margin-left: 8rpx;
			}
		}
	}

	// 常用换算样式
	.common-box {
		display: flex;
		flex-direction: column;
		gap: 16rpx;

		.common-item {
			background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
			padding: 24rpx;
			border-radius: 16rpx;
			display: flex;
			justify-content: space-between;
			align-items: center;
			transition: all 0.3s;
			border: 2rpx solid transparent;
			box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

			&:active {
				background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
				transform: scale(0.98);
				border-color: #1677ff;
			}

			.common-left {
				flex: 1;
				display: flex;
				align-items: center;
				gap: 16rpx;

				.common-icon {
					width: 48rpx;
					height: 48rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					background: rgba(22, 119, 255, 0.1);
					border-radius: 12rpx;
				}

				.common-info {
					flex: 1;
					display: flex;
					flex-direction: column;
					gap: 8rpx;

					.common-text {
						font-size: 28rpx;
						color: #333;
						font-weight: 500;
					}

					.common-value {
						font-size: 24rpx;
						color: #666;
					}
				}
			}

			.common-arrow {
				width: 48rpx;
				height: 48rpx;
				display: flex;
				align-items: center;
				justify-content: center;
			}
		}
	}
}

// 输入框样式
:deep(.uni-easyinput) {
	.uni-easyinput__content {
		height: 88rpx !important;
		background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
		border-radius: 16rpx !important;
		border: 2rpx solid transparent !important;
		padding: 0 24rpx !important;
		transition: all 0.3s !important;

		&:focus-within {
			border-color: #1677ff !important;
			background: #fff !important;
			box-shadow: 0 0 0 4rpx rgba(22, 119, 255, 0.1) !important;
		}

		.uni-easyinput__content-input {
			font-size: 28rpx !important;
			color: #333 !important;
		}
	}
}

// uni-data-select 样式
:deep(.uni-data-select) {
	.uni-stat__select {
		height: 88rpx !important;
		background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
		border-radius: 16rpx !important;
		border: 2rpx solid transparent !important;
		transition: all 0.3s !important;

		&:focus-within {
			border-color: #1677ff !important;
			background: #fff !important;
			box-shadow: 0 0 0 4rpx rgba(22, 119, 255, 0.1) !important;
		}
	}

	.uni-stat__actived {
		color: #333 !important;
		font-size: 28rpx !important;
	}
}

// 下拉框样式
:deep(.uni-select__popper) {
	z-index: 9999 !important;

	.uni-select__popper__mask {
		display: none !important;
	}
}

// 动画
@keyframes fadeInUp {
	from {
		opacity: 0;
		transform: translateY(30rpx);
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
		transform: rotate(180deg);
	}
}
</style>
