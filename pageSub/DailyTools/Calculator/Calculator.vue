<template>
	<view class="calculator">
		<!-- 显示区域 -->
		<view class="display">
			<text class="expression">{{ expression || '0' }}</text>
			<text class="result" v-if="result !== null">= {{ result }}</text>
		</view>

		<!-- 按键区域 -->
		<view class="keypad">
			<view class="key-row" v-for="(row, index) in keypad" :key="index">
				<view
					v-for="key in row"
					:key="key.value"
					:class="['key', key.type]"
					@tap="handleKeyPress(key)">
					{{ key.label }}
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'

// 状态管理
const expression = ref('') // 当前表达式
const result = ref(null) // 计算结果
const lastOperation = ref(null) // 记录上一次操作类型

// 按键布局配置
const keypad = [
	[
		{ label: 'C', value: 'clear', type: 'function' }, // 清除
		{ label: '⌫', value: 'backspace', type: 'function' }, // 退格
		{ label: '%', value: '%', type: 'operator' }, // 百分号
		{ label: '÷', value: '/', type: 'operator' }, // 除法
	],
	[
		{ label: '7', value: '7', type: 'number' },
		{ label: '8', value: '8', type: 'number' },
		{ label: '9', value: '9', type: 'number' },
		{ label: '×', value: '*', type: 'operator' }, // 乘法
	],
	[
		{ label: '4', value: '4', type: 'number' },
		{ label: '5', value: '5', type: 'number' },
		{ label: '6', value: '6', type: 'number' },
		{ label: '-', value: '-', type: 'operator' }, // 减法
	],
	[
		{ label: '1', value: '1', type: 'number' },
		{ label: '2', value: '2', type: 'number' },
		{ label: '3', value: '3', type: 'number' },
		{ label: '+', value: '+', type: 'operator' }, // 加法
	],
	[
		{ label: '00', value: '00', type: 'number' },
		{ label: '0', value: '0', type: 'number' },
		{ label: '.', value: '.', type: 'number' }, // 小数点
		{ label: '=', value: 'equals', type: 'equals' }, // 等号
	],
]

/**
 * 安全的表达式计算函数
 * @param {string} expr - 数学表达式
 * @returns {number|string} - 计算结果或错误信息
 */
const safeEval = (expr) => {
	try {
		// 将表达式分解成数字和运算符
		const tokens = expr.match(/(\d*\.?\d+|[+\-*/])/g)
		if (!tokens) return '错误'

		// 处理乘除法
		let i = 0
		while (i < tokens.length) {
			if (tokens[i] === '*' || tokens[i] === '/') {
				const prev = parseFloat(tokens[i - 1])
				const next = parseFloat(tokens[i + 1])
				let result

				if (tokens[i] === '*') {
					result = prev * next
				} else if (tokens[i] === '/') {
					if (next === 0) return '错误'
					result = prev / next
				}

				// 替换计算结果
				tokens.splice(i - 1, 3, result.toString())
				i--
			}
			i++
		}

		// 处理加减法
		let result = parseFloat(tokens[0])
		for (i = 1; i < tokens.length; i += 2) {
			const operator = tokens[i]
			const num = parseFloat(tokens[i + 1])

			if (operator === '+') {
				result += num
			} else if (operator === '-') {
				result -= num
			}
		}

		return result
	} catch (error) {
		console.error('计算错误:', error)
		return '错误'
	}
}

/**
 * 计算表达式结果
 * @param {string} expr - 要计算的表达式
 * @returns {string} - 计算结果或错误信息
 */
const calculate = (expr) => {
	try {
		// 处理表达式中的特殊字符
		let processedExpr = expr
			.replace(/×/g, '*')
			.replace(/÷/g, '/')
			.replace(/%/g, '*0.01')

		// 如果表达式以运算符结尾，则移除
		processedExpr = processedExpr.replace(/[+\-*/%]$/, '')

		if (!processedExpr) return '0'

		const calculatedResult = safeEval(processedExpr)

		if (calculatedResult === '错误') return '错误'

		if (isFinite(calculatedResult)) {
			// 处理小数精度问题
			const stringResult = calculatedResult.toString()
			if (stringResult.includes('.')) {
				const [integer, decimal] = stringResult.split('.')
				return `${integer}${decimal ? '.' + decimal.slice(0, 8) : ''}`.replace(
					/\.?0+$/,
					''
				)
			}
			return stringResult
		}
		return '错误'
	} catch (error) {
		console.error('计算错误:', error)
		return '错误'
	}
}

/**
 * 处理按键点击事件
 * @param {Object} key - 按键对象
 */
const handleKeyPress = (key) => {
	switch (key.value) {
		case 'clear':
			expression.value = ''
			result.value = null
			lastOperation.value = null
			break

		case 'backspace':
			expression.value = expression.value.slice(0, -1)
			if (expression.value) {
				result.value = calculate(expression.value)
			} else {
				result.value = null
			}
			break

		case 'equals':
			if (expression.value) {
				const calculated = calculate(expression.value)
				if (calculated !== '错误') {
					result.value = calculated
					expression.value = calculated
					lastOperation.value = 'equals'
				} else {
					result.value = '错误'
					lastOperation.value = null
				}
			}
			break

		default:
			// 如果上一次是等号计算，且现在输入数字，则清空开始新计算
			if (lastOperation.value === 'equals' && key.type === 'number') {
				expression.value = key.value
				result.value = null
			}
			// 如果上一次是等号计算，且现在输入运算符，则继续使用上次结果
			else if (lastOperation.value === 'equals' && key.type === 'operator') {
				expression.value =
					result.value +
					(key.label === '×' ? '*' : key.label === '÷' ? '/' : key.label)
			}
			// 如果是运算符，且前一个字符也是运算符，则替换
			else if (
				key.type === 'operator' &&
				/[+\-*/%×÷]$/.test(expression.value)
			) {
				expression.value =
					expression.value.slice(0, -1) +
					(key.label === '×' ? '*' : key.label === '÷' ? '/' : key.label)
			}
			// 其他情况正常追加
			else {
				expression.value += key.label
			}

			lastOperation.value = key.type
			if (expression.value) {
				result.value = calculate(expression.value)
			}
	}
}
</script>

<style lang="scss">
.calculator {
	height: 100vh;
	display: flex;
	flex-direction: column;
	background-color: #f5f5f5;

	// 显示区域样式
	.display {
		flex: 1;
		padding: 40rpx;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		background-color: #fff;

		.expression {
			font-size: 48rpx;
			color: #333;
			text-align: right;
			word-break: break-all;
		}

		.result {
			font-size: 32rpx;
			color: #666;
			text-align: right;
			margin-top: 20rpx;
		}
	}

	// 按键区域样式
	.keypad {
		padding: 20rpx;

		.key-row {
			display: flex;
			gap: 20rpx;
			margin-bottom: 20rpx;

			&:last-child {
				margin-bottom: 0;
			}
		}

		// 按键样式
		.key {
			flex: 1;
			height: 120rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 36rpx;
			background-color: #fff;
			border-radius: 16rpx;
			box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

			// 点击效果
			&:active {
				opacity: 0.8;
				transform: scale(0.98);
			}

			// 功能键样式
			&.function {
				color: #ff4d4f;
			}

			// 运算符样式
			&.operator {
				color: #1677ff;
			}

			// 等号样式
			&.equals {
				background-color: #1677ff;
				color: #fff;
			}
		}
	}
}
</style>
