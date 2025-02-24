<template>
	<view class="relative-calculator">
		<!-- 顶部显示区域 -->
		<view class="display-area">
			<!-- 输入显示区域 -->
			<view class="input-chain">
				<text>我</text>
				<text v-for="(item, index) in relationChain" :key="index">
					<text class="separator">的</text>{{ relationMap[item] }}
				</text>
			</view>
			<!-- 计算结果区域 -->
			<view class="result">{{ result }}</view>
		</view>

		<!-- 底部键盘区域 -->
		<view class="keyboard">
			<view class="keyboard-row">
				<view class="key" @click="appendRelation('夫')">夫</view>
				<view class="key" @click="appendRelation('妻')">妻</view>
				<view class="key" @click="appendRelation('子')">子</view>
				<view class="key delete" @click="deleteRelation">
					<uni-icons type="close" size="24" color="#666"></uni-icons>
				</view>
			</view>
			<view class="keyboard-row">
				<view class="key" @click="appendRelation('父')">父</view>
				<view class="key" @click="appendRelation('母')">母</view>
				<view class="key" @click="appendRelation('女')">女</view>
				<view class="key clear" @click="clearAll">清空</view>
			</view>
			<view class="keyboard-row">
				<view class="key" @click="appendRelation('兄')">兄</view>
				<view class="key" @click="appendRelation('弟')">弟</view>
				<view class="key" @click="appendRelation('姐')">姐</view>
				<view class="key" @click="appendRelation('妹')">妹</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, watch } from 'vue'

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
const appendRelation = (relation) => {
	if (relationChain.value.length >= 8) return // 限制最大长度
	relationChain.value.push(relation)
}

// 删除最后一个关系
const deleteRelation = () => {
	if (relationChain.value.length > 0) {
		relationChain.value.pop()
	}
}

// 清空所有
const clearAll = () => {
	relationChain.value = []
	result.value = '我'
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
			default:
				result.value = '未知关系'
		}
		return
	}

	// 如果没有找到映射，返回未知关系
	result.value = '未知关系'
}
</script>

<style lang="scss">
.relative-calculator {
	min-height: 100vh;
	background-color: #000;
	display: flex;
	flex-direction: column;

	.display-area {
		flex: 1;
		padding: 40rpx;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;

		.input-chain {
			font-size: 36rpx;
			color: rgba(255, 255, 255, 0.8);
			text-align: center;
			margin-bottom: 40rpx;

			.separator {
				color: rgba(255, 255, 255, 0.4);
				margin: 0 10rpx;
			}
		}

		.result {
			font-size: 60rpx;
			color: #ff6b00;
			font-weight: bold;
		}
	}

	.keyboard {
		padding: 20rpx;
		background-color: #1c1c1e;
		border-radius: 32rpx 32rpx 0 0;

		.keyboard-row {
			display: flex;
			margin-bottom: 20rpx;

			&:last-child {
				margin-bottom: 0;
			}

			.key {
				flex: 1;
				height: 100rpx;
				margin: 0 10rpx;
				background-color: #2c2c2e;
				border-radius: 16rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 32rpx;
				color: #fff;
				transition: all 0.2s;

				&:active {
					background-color: #3a3a3c;
					transform: scale(0.95);
				}

				&.delete {
					background-color: #2c2c2e;
				}

				&.clear {
					background-color: #2c2c2e;
					color: #ff6b00;
				}
			}
		}
	}
}
</style>
