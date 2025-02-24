<template>
	<view class="index">
		<!-- 搜索框 -->
		<view class="search-box">
			<uni-icons type="search" size="16" color="#999"></uni-icons>
			<input
				type="text"
				v-model="searchKeyword"
				placeholder="搜索工具"
				@input="handleSearch"
				class="search-input" />
			<uni-icons
				v-if="searchKeyword"
				type="clear"
				size="16"
				color="#999"
				@click="clearSearch"></uni-icons>
		</view>

		<!-- 搜索结果 -->
		<view v-if="searchKeyword" class="search-results">
			<view v-if="searchResults.length > 0" class="tools-grid">
				<view v-for="item in searchResults" :key="item.id" class="tool-item">
					<view class="tool-content" @click="handleItemClick(item)">
						<uni-icons :type="item.icon" size="30" color="#1677ff"></uni-icons>
						<text class="tool-name">{{ item.name }}</text>
					</view>
					<view
						v-if="!isFavorite(item.id)"
						class="add-favorite"
						@tap.stop="handleAdd(item)">
						<uni-icons type="star" size="18" color="#999"></uni-icons>
					</view>
					<view
						v-else
						class="remove-favorite"
						@tap.stop="handleRemove(item.id)">
						<uni-icons type="star-filled" size="18" color="#1677ff"></uni-icons>
					</view>
				</view>
			</view>
			<view v-else class="empty-tip">
				<uni-icons type="info" size="30" color="#999"></uni-icons>
				<text>未找到相关工具</text>
			</view>
		</view>

		<!-- 原有内容 -->
		<template v-else>
			<!-- 我的常用 -->
			<uni-section
				title="我的常用"
				type="line"
				@click="handleFavoritesTitleClick">
				<view class="tools-grid" v-if="favorites.length > 0">
					<view
						v-for="(item, index) in displayedFavorites"
						:key="item.id"
						class="tool-item"
						:class="{ dragging: index === dragStartIndex }"
						:data-index="index">
						<view class="tool-content" @click="handleItemClick(item)">
							<uni-icons
								:type="item.icon"
								size="30"
								color="#1677ff"></uni-icons>
							<text class="tool-name">{{ item.name }}</text>
						</view>
						<view
							class="drag-handle"
							@touchstart.stop="startDrag($event, index)"
							@touchmove.stop.prevent="handleDrag"
							@touchend.stop="endDrag">
							<uni-icons type="more-filled" size="18" color="#999"></uni-icons>
						</view>
						<view class="remove-favorite" @tap.stop="handleRemove(item.id)">
							<uni-icons type="close" size="18" color="#999"></uni-icons>
						</view>
					</view>
				</view>
				<!-- 没有常用工具时的提示 -->
				<view v-else class="empty-tip">
					<uni-icons type="info" size="30" color="#999"></uni-icons>
					<text>暂无常用工具，可从下方添加</text>
				</view>
				<view
					v-if="favorites.length > 6"
					class="show-more"
					@click="toggleShowMore">
					<text>{{ showAllFavorites ? '收起' : '查看更多' }}</text>
					<uni-icons
						:type="showAllFavorites ? 'top' : 'bottom'"
						size="14"></uni-icons>
				</view>
			</uni-section>

			<!-- 全部工具 -->
			<view class="all-tools">
				<view
					v-for="category in categories"
					:key="category.id"
					class="category">
					<uni-section :title="category.name" type="line">
						<view class="tools-grid">
							<view
								v-for="item in getToolsByCategory(category.id)"
								:key="item.id"
								class="tool-item">
								<view class="tool-content" @click="handleItemClick(item)">
									<uni-icons
										:type="item.icon"
										size="30"
										color="#1677ff"></uni-icons>
									<text class="tool-name">{{ item.name }}</text>
								</view>
								<view class="add-favorite" @tap.stop="handleAdd(item)">
									<uni-icons type="star" size="18" color="#999"></uni-icons>
								</view>
							</view>
						</view>
					</uni-section>
				</view>
			</view>

			<!-- 联系我们 -->
			<view class="contact-box" @click="showQRCode">
				<uni-icons type="chat" size="20" color="#1677ff"></uni-icons>
				<text>需要新增工具？点击联系我们</text>
			</view>

			<!-- 二维码弹窗 -->
			<uni-popup ref="qrPopup" type="center">
				<view class="qr-popup">
					<view class="qr-title">联系我们</view>
					<image
						class="qr-image"
						src="/static/contact-qr.jpg"
						mode="widthFix" />
					<view class="qr-desc">扫描二维码联系我们</view>
					<view class="qr-desc">为您添加需要的工具</view>
					<button class="close-btn" @click="hideQRCode">关闭</button>
				</view>
			</uni-popup>
		</template>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 工具分类
const categories = [
	{
		id: 'daily',
		name: '日常工具',
		tools: ['calculator', 'unit', 'currency', 'qrcode', 'Kingdom', 'relative'],
	},
	{
		id: 'finance',
		name: '理财工具',
		tools: ['mortgage', 'car', 'pension'],
	},
	{
		id: 'life',
		name: '生活工具',
		tools: ['bmi', 'pregnancy'],
	},
	{
		id: 'work',
		name: '工作工具',
		tools: ['individual', 'retirement', 'social'],
	},
]

// 添加点击计数器
const favoriteClickCount = ref(0)
// 是否显示金证门禁
const showKingdom = ref(false)

// 工具列表数据
const tools = [
	{
		id: 'Kingdom',
		name: '金证门禁',
		icon: 'calendar-filled',
		path: '/pageSub/Kingdom-core/Kingdom-core',
		category: 'daily',
		hidden: true, // 添加hidden属性标记需要隐藏的工具
	},
	{
		id: 'calculator',
		name: '计算器',
		icon: 'calendar-filled',
		path: '/pageSub/Calculator/Calculator',
		category: 'daily',
	},
	{
		id: 'unit',
		name: '单位转换器',
		icon: 'refresh',
		path: '/pageSub/Unit-converter/Unit-converter',
		category: 'daily',
	},
	{
		id: 'currency',
		name: '汇率转换器',
		icon: 'refresh',
		path: '/pageSub/Currency-exchange/Currency-exchange',
		category: 'daily',
	},
	{
		id: 'qrcode',
		name: '二维码生成器',
		icon: 'medal',
		path: '/pageSub/Qrcode-generator/Qrcode-generator',
		category: 'daily',
	},
	{
		id: 'relative',
		name: '亲戚称呼计算器',
		icon: 'medal',
		path: '/pageSub/Relative-calculator/Relative-calculator',
		category: 'daily',
	},
	{
		id: 'mortgage',
		name: '房贷计算器',
		icon: 'home',
		path: '/pageSub/Mortgage-calculator/Mortgage-calculator',
		category: 'finance',
	},
	{
		id: 'car',
		name: '车贷计算器',
		icon: 'cart-filled',
		path: '/pageSub/Car-calculator/Car-calculator',
		category: 'finance',
	},
	{
		id: 'pension',
		name: '养老金计算器',
		icon: 'wallet-filled',
		path: '/pageSub/Pension-calculator/Pension-calculator',
		category: 'finance',
	},
	{
		id: 'bmi',
		name: 'BMI计算器',
		icon: 'person-filled',
		path: '/pageSub/BMI/BMI',
		category: 'life',
	},
	{
		id: 'pregnancy',
		name: '孕期计算器',
		icon: 'heart-filled',
		path: '/pageSub/Pregnancy-calculator/Pregnancy-calculator',
		category: 'life',
	},
	{
		id: 'individual',
		name: '个税计算器',
		icon: 'wallet',
		path: '/pageSub/Individual-calculator/Individual-calculator',
		category: 'work',
	},
	{
		id: 'retirement',
		name: '退休年龄',
		icon: 'calendar',
		path: '/pageSub/Retirement-age/Retirement-age',
		category: 'work',
	},
	{
		id: 'social',
		name: '社保年限',
		icon: 'medal',
		path: '/pageSub/Social-security-period/Social-security-period',
		category: 'work',
	},
]

// 获取分类下的工具
const getToolsByCategory = (categoryId) => {
	return tools
		.filter((tool) => tool.category === categoryId)
		.filter(
			(tool) => !tool.hidden || (tool.id === 'Kingdom' && showKingdom.value)
		)
}

// 我的常用
const favorites = ref([])
const showAllFavorites = ref(false)

// 显示的常用工具
const displayedFavorites = computed(() => {
	return showAllFavorites.value ? favorites.value : favorites.value.slice(0, 6)
})

// 判断是否已添加到常用
const isFavorite = (id) => {
	return favorites.value.some((item) => item.id === id)
}

// 保存收藏到本地存储
const saveFavorites = () => {
	uni.setStorageSync('favorites', favorites.value)
}

// 从常用中移除
const handleRemove = (id) => {
	const index = favorites.value.findIndex((item) => item.id === id)
	if (index > -1) {
		favorites.value.splice(index, 1)
		saveFavorites()
		// 如果删除的是金证门禁，重置显示状态
		if (id === 'Kingdom') {
			showKingdom.value = false
			favoriteClickCount.value = 0
		}
	}
}

// 添加到常用
const handleAdd = (tool) => {
	if (!isFavorite(tool.id)) {
		favorites.value.push(tool)
		saveFavorites()
	}
}

// 切换显示全部/部分常用
const toggleShowMore = () => {
	showAllFavorites.value = !showAllFavorites.value
}

// 拖拽相关变量
const dragStartIndex = ref(-1)
const dragEndIndex = ref(-1)
const dragStartY = ref(0)
const itemHeight = ref(0)

// 开始拖拽
const startDrag = (e, index) => {
	dragStartIndex.value = index
	dragStartY.value = e.touches[0].pageY

	// 获取元素高度
	uni
		.createSelectorQuery()
		.select('.tool-item')
		.boundingClientRect((rect) => {
			itemHeight.value = rect.height
		})
		.exec()
}

// 处理拖拽
const handleDrag = (e) => {
	if (dragStartIndex.value === -1) return

	const currentY = e.touches[0].pageY
	const moveDistance = currentY - dragStartY.value
	const moveItems = Math.round(moveDistance / itemHeight.value)

	let newIndex = dragStartIndex.value + moveItems

	// 确保新位置在有效范围内
	newIndex = Math.max(0, Math.min(newIndex, favorites.value.length - 1))

	if (newIndex !== dragEndIndex.value) {
		dragEndIndex.value = newIndex
		// 更新位置
		const item = favorites.value[dragStartIndex.value]
		favorites.value.splice(dragStartIndex.value, 1)
		favorites.value.splice(newIndex, 0, item)
		dragStartIndex.value = newIndex
		dragStartY.value = currentY
	}
}

// 结束拖拽
const endDrag = () => {
	if (dragStartIndex.value !== -1) {
		saveFavorites()
		uni.vibrateShort() // 添加触感反馈
	}
	dragStartIndex.value = -1
	dragEndIndex.value = -1
}

// 处理工具项点击
const handleItemClick = (item) => {
	uni.navigateTo({
		url: item.path,
		fail: (err) => {
			console.error('导航失败:', err)
			uni.showToast({
				title: '页面跳转失败',
				icon: 'none',
			})
		},
	})
}

// 页面加载时从本地存储获取常用工具
onMounted(() => {
	const savedFavorites = uni.getStorageSync('favorites')
	if (savedFavorites) {
		favorites.value = savedFavorites
	}

	// 如果收藏夹中有金证门禁，则显示它
	if (favorites.value.some((item) => item.id === 'Kingdom')) {
		showKingdom.value = true
	}
})

// 搜索相关
const searchKeyword = ref('')
const searchResults = computed(() => {
	if (!searchKeyword.value) return []
	return tools
		.filter(
			(tool) => !tool.hidden || (tool.id === 'Kingdom' && showKingdom.value)
		)
		.filter((tool) =>
			tool.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
		)
})

// 处理搜索
const handleSearch = () => {
	if (!searchKeyword.value) {
		searchResults.value = []
		return
	}

	const keyword = searchKeyword.value.toLowerCase()
	searchResults.value = tools.filter(
		(tool) =>
			tool.name.toLowerCase().includes(keyword) ||
			tool.id.toLowerCase().includes(keyword)
	)
}

// 清除搜索
const clearSearch = () => {
	searchKeyword.value = ''
	searchResults.value = []
}

// 二维码弹窗
const qrPopup = ref(null)
const showQRCode = () => {
	qrPopup.value.open()
}
const hideQRCode = () => {
	qrPopup.value.close()
}

// 监听我的常用标题点击
const handleFavoritesTitleClick = () => {
	favoriteClickCount.value++
	if (favoriteClickCount.value >= 5) {
		showKingdom.value = true
		favoriteClickCount.value = 0 // 重置计数器

		// 找到金证门禁工具
		const kingdomTool = tools.find((tool) => tool.id === 'Kingdom')
		if (kingdomTool && !isFavorite(kingdomTool.id)) {
			// 添加到我的常用
			favorites.value.push(kingdomTool)
			saveFavorites()
		}

		uni.showToast({
			title: '已解锁金证门禁并添加到常用',
			icon: 'none',
			duration: 2000,
		})
	}
}
</script>
<style lang="scss">
.index {
	padding: 20rpx;
	min-height: 100vh;
	background-color: #f5f5f5;

	.search-box {
		display: flex;
		align-items: center;
		background-color: #fff;
		border-radius: 12rpx;
		padding: 16rpx 24rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);

		.search-input {
			flex: 1;
			margin: 0 16rpx;
			font-size: 28rpx;
			color: #333;
		}
	}

	.search-results {
		margin-bottom: 20rpx;
	}

	.tools-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 20rpx;
		padding: 10rpx;
	}

	.tool-item {
		position: relative;
		background-color: #fff;
		border-radius: 12rpx;
		padding: 16rpx 12rpx;
		text-align: center;
		box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
		transition:
			transform 0.2s ease,
			opacity 0.2s ease;
		width: 100%;
		box-sizing: border-box;
		display: flex;
		justify-content: center;

		&.dragging {
			opacity: 0.8;
			transform: scale(1.02);
			z-index: 100;
			background-color: #f8f8f8;
		}
	}

	.tool-content {
		position: relative;
		z-index: 1;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 12rpx;
		padding: 24rpx 12rpx 12rpx;
		min-height: 120rpx;
	}

	.tool-name {
		font-size: 26rpx;
		color: #333;
		line-height: 1.4;
		width: 100%;
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
		padding: 0 6rpx;
	}

	.add-favorite,
	.remove-favorite {
		position: absolute;
		top: 6rpx;
		right: 6rpx;
		padding: 16rpx;
		z-index: 10;
		display: flex;
		align-items: center;
		justify-content: center;

		&:active {
			opacity: 0.7;
		}
	}

	.show-more {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 16rpx;
		color: #666;
		font-size: 28rpx;
		gap: 8rpx;
	}

	.empty-tip {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 40rpx 0;
		color: #999;
		font-size: 28rpx;
		gap: 16rpx;
		background-color: #fff;
		border-radius: 12rpx;
		margin: 16rpx;
	}

	.drag-handle {
		position: absolute;
		top: 6rpx;
		left: 6rpx;
		padding: 16rpx;
		z-index: 10;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: move;
		transform: rotate(90deg);

		&:active {
			opacity: 0.7;
		}
	}

	:deep(.uni-section) {
		padding: 0 !important;
		margin-bottom: 20rpx;

		.uni-section-header {
			padding: 0 10rpx;
		}
	}

	// 联系我们按钮
	.contact-box {
		margin: 30rpx 10rpx;
		padding: 20rpx;
		background-color: #fff;
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12rpx;
		box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
		cursor: pointer;

		&:active {
			opacity: 0.7;
		}

		text {
			font-size: 28rpx;
			color: #1677ff;
		}
	}

	// 二维码弹窗
	.qr-popup {
		background-color: #fff;
		border-radius: 12rpx;
		padding: 30rpx;
		width: 560rpx;
		text-align: center;

		.qr-title {
			font-size: 32rpx;
			font-weight: 500;
			color: #333;
			margin-bottom: 20rpx;
		}

		.qr-image {
			width: 400rpx;
			height: 400rpx;
			margin: 20rpx 0;
		}

		.qr-desc {
			font-size: 28rpx;
			color: #666;
			line-height: 1.6;
		}

		.close-btn {
			margin-top: 30rpx;
			background-color: #1677ff;
			color: #fff;
			border-radius: 8rpx;
			font-size: 28rpx;
			padding: 16rpx 0;

			&:active {
				opacity: 0.8;
			}
		}
	}
}
</style>
