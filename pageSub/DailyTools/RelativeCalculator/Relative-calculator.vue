<template>
	<view class="relative-calculator">
		<!-- 顶部显示区域 -->
		<view class="display-area">
			<!-- 标题 -->
			<view class="title-section">
				<uni-icons
					type="person"
					size="24"
					color="rgba(255, 255, 255, 0.6)"></uni-icons>
				<text class="title">亲戚关系计算器</text>
			</view>

			<!-- 输入显示区域 -->
			<view class="input-chain-wrapper">
				<view class="input-chain">
					<text class="self">我</text>
					<template v-for="(item, index) in relationChain" :key="index">
						<text class="separator">的</text>
						<text class="relation-item">{{ relationMap[item] }}</text>
					</template>
				</view>
				<view class="chain-count" v-if="relationChain.length > 0">
					已选择 {{ relationChain.length }} 层关系
				</view>
			</view>

			<!-- 计算结果区域 -->
			<view class="result-wrapper">
				<view class="result-label">称呼</view>
				<view class="result" :class="{ unknown: result === '未知关系' }">
					{{ result }}
				</view>
				<view class="result-hint" v-if="result === '未知关系'">
					该关系暂不支持，请尝试其他组合
				</view>
			</view>
		</view>

		<!-- 底部键盘区域 -->
		<view class="keyboard">
			<view class="keyboard-header">
				<text class="keyboard-title">选择关系</text>
				<view class="keyboard-actions">
					<view
						class="action-btn"
						@click="deleteRelation"
						:class="{ disabled: relationChain.length === 0 }">
						<uni-icons type="backspace" size="20" color="#fff"></uni-icons>
						<text>删除</text>
					</view>
					<view
						class="action-btn clear-btn"
						@click="clearAll"
						:class="{ disabled: relationChain.length === 0 }">
						<uni-icons type="trash" size="20" color="#ff6b00"></uni-icons>
						<text>清空</text>
					</view>
				</view>
			</view>

			<view class="keyboard-content">
				<view class="keyboard-row">
					<view
						class="key"
						@click="handleAppendRelation('夫')"
						:class="{ disabled: isMaxLength }">
						<text class="key-text">夫</text>
						<text class="key-desc">丈夫</text>
					</view>
					<view
						class="key"
						@click="handleAppendRelation('妻')"
						:class="{ disabled: isMaxLength }">
						<text class="key-text">妻</text>
						<text class="key-desc">妻子</text>
					</view>
					<view
						class="key"
						@click="handleAppendRelation('父')"
						:class="{ disabled: isMaxLength }">
						<text class="key-text">父</text>
						<text class="key-desc">爸爸</text>
					</view>
					<view
						class="key"
						@click="handleAppendRelation('母')"
						:class="{ disabled: isMaxLength }">
						<text class="key-text">母</text>
						<text class="key-desc">妈妈</text>
					</view>
				</view>
				<view class="keyboard-row">
					<view
						class="key"
						@click="handleAppendRelation('子')"
						:class="{ disabled: isMaxLength }">
						<text class="key-text">子</text>
						<text class="key-desc">儿子</text>
					</view>
					<view
						class="key"
						@click="handleAppendRelation('女')"
						:class="{ disabled: isMaxLength }">
						<text class="key-text">女</text>
						<text class="key-desc">女儿</text>
					</view>
					<view
						class="key"
						@click="handleAppendRelation('兄')"
						:class="{ disabled: isMaxLength }">
						<text class="key-text">兄</text>
						<text class="key-desc">哥哥</text>
					</view>
					<view
						class="key"
						@click="handleAppendRelation('弟')"
						:class="{ disabled: isMaxLength }">
						<text class="key-text">弟</text>
						<text class="key-desc">弟弟</text>
					</view>
				</view>
				<view class="keyboard-row">
					<view
						class="key"
						@click="handleAppendRelation('姐')"
						:class="{ disabled: isMaxLength }">
						<text class="key-text">姐</text>
						<text class="key-desc">姐姐</text>
					</view>
					<view
						class="key"
						@click="handleAppendRelation('妹')"
						:class="{ disabled: isMaxLength }">
						<text class="key-text">妹</text>
						<text class="key-desc">妹妹</text>
					</view>
					<view class="key placeholder"></view>
					<view class="key placeholder"></view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

// 常量定义
const MAX_CHAIN_LENGTH = 8 // 最大关系链长度

// 关系链
const relationChain = ref([])
// 计算结果
const result = ref('我')

// 关系映射表
const relationMap = {
	妻: '妻子',
	夫: '丈夫',
	子: '儿子',
	女: '女儿',
	父: '爸爸',
	母: '妈妈',
	兄: '哥哥',
	弟: '弟弟',
	姐: '姐姐',
	妹: '妹妹',
}

// 检查是否达到最大长度
const isMaxLength = computed(() => {
	return relationChain.value.length >= MAX_CHAIN_LENGTH
})

// 复杂关系映射表
const complexRelationMap = {
	// 父系长辈
	父父: '爷爷',
	父母: '奶奶',
	父父父: '曾祖父',
	父父母: '曾祖母',
	父父父父: '高祖父',
	父父父母: '高祖母',
	父父父父父: '玄祖父',
	父父父父母: '玄祖母',

	// 母系长辈
	母父: '外公',
	母母: '外婆',
	母父父: '外曾祖父',
	母父母: '外曾祖母',
	母父父父: '外高祖父',
	母父父母: '外高祖母',

	// 父系亲戚
	父兄: '伯伯',
	父弟: '叔叔',
	父姐: '姑姑',
	父妹: '姑姑',
	父兄子: '堂兄',
	父兄女: '堂姐',
	父弟子: '堂弟',
	父弟女: '堂妹',

	// 母系亲戚
	母兄: '舅舅',
	母弟: '舅舅',
	母姐: '姨妈',
	母妹: '姨妈',
	母兄子: '表哥',
	母兄女: '表姐',
	母弟子: '表弟',
	母弟女: '表妹',
	母姐子: '表哥',
	母姐女: '表姐',
	母妹子: '表弟',
	母妹女: '表妹',

	// 直系晚辈
	子子: '孙子',
	子女: '孙女',
	女子: '外孙',
	女女: '外孙女',
	子子子: '曾孙',
	子子女: '曾孙女',
	女子子: '外曾孙',
	女子女: '外曾孙女',
	子子子子: '玄孙',
	子子子女: '玄孙女',
	女子子子: '外玄孙',
	女子子女: '外玄孙女',

	// 旁系晚辈
	兄子: '侄子',
	兄女: '侄女',
	弟子: '侄子',
	弟女: '侄女',
	姐子: '外甥',
	姐女: '外甥女',
	妹子: '外甥',
	妹女: '外甥女',

	// 配偶家庭
	夫父: '公公',
	夫母: '婆婆',
	妻父: '岳父',
	妻母: '岳母',
	夫兄: '大伯',
	夫弟: '小叔',
	夫姐: '大姑',
	夫妹: '小姑',
	妻兄: '大舅',
	妻弟: '小舅',
	妻姐: '大姨',
	妻妹: '小姨',

	// 侄甥系列
	兄子子: '侄孙',
	兄子女: '侄孙女',
	弟子子: '侄孙',
	弟子女: '侄孙女',
	姐子子: '外甥孙',
	姐子女: '外甥孙女',
	妹子子: '外甥孙',
	妹子女: '外甥孙女',

	// 配偶的兄弟姐妹的子女
	夫兄子: '侄子',
	夫兄女: '侄女',
	夫弟子: '侄子',
	夫弟女: '侄女',
	夫姐子: '外甥',
	夫姐女: '外甥女',
	夫妹子: '外甥',
	夫妹女: '外甥女',

	// 子女的配偶
	子妻: '儿媳',
	女夫: '女婿',

	// 孙辈的配偶
	子子妻: '孙媳',
	子女夫: '孙女婿',
	女子妻: '外孙媳',
	女女夫: '外孙女婿',

	// 伯叔姑舅姨的配偶
	父兄妻: '伯母',
	父弟妻: '婶婶',
	父姐夫: '姑父',
	父妹夫: '姑父',
	母兄妻: '舅妈',
	母弟妻: '舅妈',
	母姐夫: '姨父',
	母妹夫: '姨父',

	// 堂表亲的子女
	父兄子子: '堂侄',
	父兄子女: '堂侄女',
	父弟子子: '堂侄',
	父弟子女: '堂侄女',
	母兄子子: '表侄',
	母兄子女: '表侄女',
	母姐子子: '表侄',
	母姐子女: '表侄女',

	// 祖父母的兄弟姐妹
	父父兄: '伯祖父',
	父父弟: '叔祖父',
	父父姐: '姑祖母',
	父父妹: '姑祖母',
	母父兄: '舅祖父',
	母父弟: '舅祖父',
	母父姐: '姨祖母',
	母父妹: '姨祖母',

	// 曾祖父母的兄弟姐妹
	父父父兄: '伯曾祖父',
	父父父弟: '叔曾祖父',
	父父父姐: '姑曾祖母',
	父父父妹: '姑曾祖母',

	// 配偶的祖父母
	夫父父: '祖公公',
	夫父母: '祖婆婆',
	妻父父: '岳公',
	妻父母: '岳婆',

	// 子女的孙辈
	子子子子: '玄孙',
	子子子女: '玄孙女',
	女子子子: '外玄孙',
	女子子女: '外玄孙女',
	子子子子子: '来孙',
	子子子子女: '来孙女',
	女子子子子: '外来孙',
	女子子子女: '外来孙女',

	// 特殊关系
	夫妻父: '亲家公',
	夫妻母: '亲家母',
	子妻父: '亲家公',
	子妻母: '亲家母',

	// 堂表兄弟的配偶
	父兄子妻: '堂嫂',
	父弟子妻: '堂弟妹',
	母兄子妻: '表嫂',
	母弟子妻: '表弟妹',
}

// 添加关系
const handleAppendRelation = (relation) => {
	if (isMaxLength.value) {
		uni.showToast({
			title: `最多只能选择${MAX_CHAIN_LENGTH}层关系`,
			icon: 'none',
			duration: 2000,
		})
		uni.vibrateShort({
			type: 'medium',
		})
		return
	}
	relationChain.value.push(relation)
	uni.vibrateShort({
		type: 'light',
	})
}

// 删除最后一个关系
const deleteRelation = () => {
	if (relationChain.value.length > 0) {
		relationChain.value.pop()
		uni.vibrateShort({
			type: 'light',
		})
	} else {
		uni.showToast({
			title: '没有可删除的关系',
			icon: 'none',
			duration: 1500,
		})
	}
}

// 清空所有
const clearAll = () => {
	if (relationChain.value.length === 0) {
		uni.showToast({
			title: '已经是空的了',
			icon: 'none',
			duration: 1500,
		})
		return
	}
	uni.showModal({
		title: '提示',
		content: '确定要清空所有关系吗？',
		success: (res) => {
			if (res.confirm) {
				relationChain.value = []
				result.value = '我'
				uni.vibrateShort({
					type: 'medium',
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

// 监听关系链变化，实时计算结果
watch(
	relationChain,
	(newChain) => {
		if (newChain.length === 0) {
			result.value = '我'
			return
		}
		calculateResult()
	},
	{ deep: true }
)

// 计算结果
const calculateResult = () => {
	if (relationChain.value.length === 0) {
		result.value = '我'
		return
	}

	// 获取关系链
	const relationKey = relationChain.value.join('')

	// 先尝试在复杂关系映射表中查找
	if (complexRelationMap[relationKey]) {
		result.value = complexRelationMap[relationKey]
		return
	}

	// 如果只有一个关系，使用基础映射
	if (relationChain.value.length === 1) {
		result.value = relationMap[relationChain.value[0]]
		return
	}

	// 尝试处理特殊的连续关系
	// 连续多个"子"
	if (relationChain.value.every((r) => r === '子')) {
		const count = relationChain.value.length
		switch (count) {
			case 2:
				result.value = '孙子'
				break
			case 3:
				result.value = '曾孙'
				break
			case 4:
				result.value = '玄孙'
				break
			case 5:
				result.value = '来孙'
				break
			case 6:
				result.value = '晜孙'
				break
			case 7:
				result.value = '仍孙'
				break
			case 8:
				result.value = '云孙'
				break
			default:
				result.value = '未知关系'
		}
		return
	}

	// 连续多个"女"
	if (relationChain.value.every((r) => r === '女')) {
		const count = relationChain.value.length
		switch (count) {
			case 2:
				result.value = '外孙女'
				break
			case 3:
				result.value = '外曾孙女'
				break
			case 4:
				result.value = '外玄孙女'
				break
			default:
				result.value = '未知关系'
		}
		return
	}

	// 连续多个"父"
	if (relationChain.value.every((r) => r === '父')) {
		const count = relationChain.value.length
		switch (count) {
			case 2:
				result.value = '爷爷'
				break
			case 3:
				result.value = '曾祖父'
				break
			case 4:
				result.value = '高祖父'
				break
			case 5:
				result.value = '玄祖父'
				break
			default:
				result.value = '未知关系'
		}
		return
	}

	// 连续多个"母"
	if (relationChain.value.every((r) => r === '母')) {
		const count = relationChain.value.length
		switch (count) {
			case 2:
				result.value = '奶奶'
				break
			case 3:
				result.value = '曾祖母'
				break
			case 4:
				result.value = '高祖母'
				break
			case 5:
				result.value = '玄祖母'
				break
			default:
				result.value = '未知关系'
		}
		return
	}

	// 尝试处理混合关系（简化处理）
	// 例如：子女 -> 外孙女（已在映射表中）
	// 例如：女子 -> 外曾孙（已在映射表中）

	// 如果没有找到映射，返回未知关系
	result.value = '未知关系'
}
</script>

<style lang="scss">
.relative-calculator {
	min-height: 100vh;
	background: linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
	display: flex;
	flex-direction: column;
	position: relative;
	overflow: hidden;

	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: radial-gradient(
			circle at 50% 30%,
			rgba(255, 107, 0, 0.1) 0%,
			transparent 50%
		);
		pointer-events: none;
	}

	.display-area {
		flex: 1;
		padding: 60rpx 40rpx 40rpx;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;
		position: relative;
		z-index: 1;

		.title-section {
			display: flex;
			align-items: center;
			justify-content: center;
			margin-bottom: 60rpx;

			.title {
				font-size: 32rpx;
				color: rgba(255, 255, 255, 0.8);
				margin-left: 12rpx;
				font-weight: 500;
			}
		}

		.input-chain-wrapper {
			width: 100%;
			margin-bottom: 60rpx;

			.input-chain {
				font-size: 36rpx;
				color: rgba(255, 255, 255, 0.9);
				text-align: center;
				line-height: 1.8;
				padding: 30rpx;
				background: rgba(255, 255, 255, 0.05);
				border-radius: 20rpx;
				border: 1rpx solid rgba(255, 255, 255, 0.1);
				backdrop-filter: blur(10rpx);
				min-height: 120rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				flex-wrap: wrap;

				.self {
					color: #ff6b00;
					font-weight: 600;
				}

				.separator {
					color: rgba(255, 255, 255, 0.4);
					margin: 0 8rpx;
				}

				.relation-item {
					color: rgba(255, 255, 255, 0.8);
					margin: 0 4rpx;
				}
			}

			.chain-count {
				text-align: center;
				font-size: 24rpx;
				color: rgba(255, 255, 255, 0.5);
				margin-top: 16rpx;
			}
		}

		.result-wrapper {
			width: 100%;
			text-align: center;

			.result-label {
				font-size: 28rpx;
				color: rgba(255, 255, 255, 0.6);
				margin-bottom: 20rpx;
			}

			.result {
				font-size: 72rpx;
				color: #ff6b00;
				font-weight: bold;
				text-shadow: 0 0 20rpx rgba(255, 107, 0, 0.5);
				animation: fadeInScale 0.3s ease-out;
				line-height: 1.2;

				&.unknown {
					color: rgba(255, 255, 255, 0.5);
					font-size: 56rpx;
					text-shadow: none;
				}
			}

			.result-hint {
				font-size: 24rpx;
				color: rgba(255, 255, 255, 0.4);
				margin-top: 16rpx;
			}
		}
	}

	.keyboard {
		padding: 30rpx 20rpx;
		background: rgba(28, 28, 30, 0.95);
		border-radius: 32rpx 32rpx 0 0;
		backdrop-filter: blur(20rpx);
		box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.3);
		position: relative;
		z-index: 1;

		.keyboard-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 24rpx;
			padding-bottom: 20rpx;
			border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);

			.keyboard-title {
				font-size: 28rpx;
				color: rgba(255, 255, 255, 0.8);
				font-weight: 500;
			}

			.keyboard-actions {
				display: flex;
				gap: 16rpx;

				.action-btn {
					display: flex;
					align-items: center;
					gap: 6rpx;
					padding: 12rpx 20rpx;
					background: rgba(255, 255, 255, 0.1);
					border-radius: 12rpx;
					font-size: 24rpx;
					color: rgba(255, 255, 255, 0.8);
					transition: all 0.3s;

					&:active {
						background: rgba(255, 255, 255, 0.2);
						transform: scale(0.95);
					}

					&.disabled {
						opacity: 0.4;
					}

					&.clear-btn {
						background: rgba(255, 107, 0, 0.2);
						color: #ff6b00;

						&:active {
							background: rgba(255, 107, 0, 0.3);
						}
					}

					text {
						font-size: 24rpx;
					}
				}
			}
		}

		.keyboard-content {
			.keyboard-row {
				display: flex;
				margin-bottom: 16rpx;
				gap: 12rpx;

				&:last-child {
					margin-bottom: 0;
				}

				.key {
					flex: 1;
					height: 120rpx;
					background: linear-gradient(135deg, #2c2c2e 0%, #3a3a3c 100%);
					border-radius: 20rpx;
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					color: #fff;
					transition: all 0.2s;
					border: 1rpx solid rgba(255, 255, 255, 0.1);
					box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
					position: relative;
					overflow: hidden;

					&::before {
						content: '';
						position: absolute;
						top: 0;
						left: 0;
						right: 0;
						bottom: 0;
						background: linear-gradient(
							135deg,
							rgba(255, 107, 0, 0.1) 0%,
							transparent 100%
						);
						opacity: 0;
						transition: opacity 0.3s;
					}

					&:active {
						background: linear-gradient(135deg, #3a3a3c 0%, #4a4a4c 100%);
						transform: scale(0.95);
						box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.3);

						&::before {
							opacity: 1;
						}
					}

					&.disabled {
						opacity: 0.4;
						pointer-events: none;
					}

					&.placeholder {
						background: transparent;
						border: none;
						box-shadow: none;
						pointer-events: none;
					}

					.key-text {
						font-size: 40rpx;
						font-weight: 600;
						margin-bottom: 4rpx;
					}

					.key-desc {
						font-size: 22rpx;
						color: rgba(255, 255, 255, 0.6);
					}
				}
			}
		}
	}
}

// 动画
@keyframes fadeInScale {
	from {
		opacity: 0;
		transform: scale(0.9);
	}
	to {
		opacity: 1;
		transform: scale(1);
	}
}
</style>
