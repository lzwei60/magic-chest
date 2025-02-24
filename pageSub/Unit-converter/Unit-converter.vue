<template>
	<view class="unit-converter">
		<uni-card>
			<!-- 转换类型选择 -->
			<uni-section title="转换类型" type="line" padding>
				<uni-data-select
					v-model="currentType"
					:localdata="conversionTypes"
					:clear="false"
					@change="handleTypeChange" />
			</uni-section>

			<!-- 单位转换 -->
			<uni-section :title="currentType" type="line" padding>
				<view class="converter-box">
					<!-- 输入值 -->
					<view class="input-group">
						<uni-easyinput
							v-model="inputValue"
							type="number"
							:clearable="false"
							@input="handleConvert" />
						<uni-data-select
							v-model="fromUnit"
							:localdata="currentUnits"
							:clear="false"
							@change="handleConvert" />
					</view>

					<!-- 转换图标 -->
					<view class="convert-icon" @click="handleSwap">
						<uni-icons type="loop" size="20" color="#1677ff"></uni-icons>
					</view>

					<!-- 输出值 -->
					<view class="input-group">
						<uni-easyinput v-model="outputValue" type="number" disabled />
						<uni-data-select
							v-model="toUnit"
							:localdata="currentUnits"
							:clear="false"
							@change="handleConvert" />
					</view>
				</view>
			</uni-section>

			<!-- 常用换算 -->
			<uni-section title="常用换算" type="line" padding>
				<view class="common-box">
					<view
						v-for="item in commonConversions"
						:key="item.from + item.to"
						class="common-item"
						@click="handleCommonClick(item)">
						<text class="common-text">{{ item.text }}</text>
						<text class="common-value">{{ item.value }}</text>
					</view>
				</view>
			</uni-section>
		</uni-card>
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

// 当前可用单位
const currentUnits = computed(() => units[currentType.value])

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

// 处理类型变化
const handleTypeChange = () => {
	fromUnit.value = currentUnits.value[0].value
	toUnit.value = currentUnits.value[1].value
	inputValue.value = ''
	outputValue.value = ''
}

// 处理单位转换
const handleConvert = () => {
	if (!inputValue.value) {
		outputValue.value = ''
		return
	}

	const value = parseFloat(inputValue.value)
	if (isNaN(value)) {
		outputValue.value = ''
		return
	}

	if (currentType.value === 'temperature') {
		outputValue.value = convertTemperature(
			value,
			fromUnit.value,
			toUnit.value
		).toFixed(2)
	} else {
		const fromRatio = ratios[currentType.value][fromUnit.value]
		const toRatio = ratios[currentType.value][toUnit.value]
		outputValue.value = ((value * fromRatio) / toRatio).toFixed(6)
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
	const temp = fromUnit.value
	fromUnit.value = toUnit.value
	toUnit.value = temp
	handleConvert()
}

// 处理常用换算点击
const handleCommonClick = (item) => {
	fromUnit.value = item.from
	toUnit.value = item.to
	inputValue.value = '1'
	handleConvert()
}

// 初始化
handleTypeChange()
</script>

<style lang="scss">
.unit-converter {
	padding: 30rpx;
	min-height: 100vh;
	background-color: #f5f5f5;

	// 转换器样式
	.converter-box {
		display: flex;
		flex-direction: column;
		gap: 20rpx;

		.input-group {
			display: flex;
			gap: 16rpx;

			.uni-easyinput {
				flex: 1;
			}

			.uni-easyinput__content {
				background-color: #f8f8f8 !important;
				height: 70rpx !important;
			}

			.uni-easyinput__content-input {
				color: #333 !important;
				font-size: 28rpx !important;
			}

			.uni-data-select {
				max-width: 180rpx;
				flex-shrink: 0;
			}

			.uni-select {
				width: 100% !important;
			}

			.uni-select__input-box {
				width: 100% !important;
				min-width: 240rpx !important;
				padding: 0 16rpx !important;
			}

			.uni-select__selector {
				min-width: 240rpx !important;
			}
		}

		.convert-icon {
			display: flex;
			justify-content: center;
			padding: 10rpx;
			cursor: pointer;

			&:active {
				opacity: 0.7;
			}
		}
	}

	// 常用换算样式
	.common-box {
		display: flex;
		flex-direction: column;
		gap: 16rpx;

		.common-item {
			background-color: #f8f8f8;
			padding: 20rpx;
			border-radius: 8rpx;
			display: flex;
			justify-content: space-between;
			align-items: center;
			cursor: pointer;

			&:active {
				opacity: 0.7;
			}

			.common-text {
				font-size: 28rpx;
				color: #333;
			}

			.common-value {
				font-size: 26rpx;
				color: #666;
			}
		}
	}
}
</style>
