<template>
	<view class="index">
		<!-- 搜索框 -->
		<view class="search-box">
			<uni-icons type="search" size="18" color="#999"></uni-icons>
			<input
				type="text"
				v-model="searchKeyword"
				placeholder="搜索工具"
				class="search-input"
				placeholder-style="color: #999" />
			<uni-icons
				v-if="searchKeyword"
				type="clear"
				size="18"
				color="#999"
				@click="clearSearch"
				class="clear-icon"></uni-icons>
		</view>

		<!-- 搜索结果 -->
		<view v-if="searchKeyword" class="search-results">
			<view v-if="searchResults.length > 0" class="tools-grid">
				<view
					v-for="item in searchResults"
					:key="item.id"
					class="tool-item"
					@click="handleItemClick(item)">
					<view class="tool-content">
						<uni-icons :type="item.icon" size="32" color="#1677ff"></uni-icons>
						<text class="tool-name">{{ item.name }}</text>
					</view>
					<view
						class="favorite-btn"
						:class="{ 'is-favorite': isFavorite(item.id) }"
						@tap.stop="toggleFavorite(item)">
						<uni-icons
							:type="isFavorite(item.id) ? 'star-filled' : 'star'"
							size="18"
							:color="isFavorite(item.id) ? '#1677ff' : '#999'"></uni-icons>
					</view>
				</view>
			</view>
			<view v-else class="empty-tip">
				<uni-icons type="info" size="40" color="#ccc"></uni-icons>
				<text class="empty-text">未找到相关工具</text>
			</view>
		</view>

		<!-- 原有内容 -->
		<template v-else>
			<!-- 我的常用 -->
			<uni-section
				title="我的常用"
				type="line"
				@click="handleFavoritesTitleClick"
				class="favorites-section">
				<view class="tools-grid" v-if="favorites.length > 0">
					<view
						v-for="(item, index) in displayedFavorites"
						:key="`${item.id}-${index}`"
						class="tool-item favorite-item"
						:class="{ dragging: index === dragStartIndex }"
						:style="getDragStyle(index)">
						<view class="tool-content" @click="handleItemClick(item)">
							<uni-icons
								:type="item.icon"
								size="32"
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
					<uni-icons type="info" size="40" color="#ccc"></uni-icons>
					<text class="empty-text">暂无常用工具，可从下方添加</text>
				</view>
				<view
					v-if="favorites.length > 6"
					class="show-more"
					@click="toggleShowMore">
					<text>{{ showAllFavorites ? '收起' : '查看更多' }}</text>
					<uni-icons
						:type="showAllFavorites ? 'top' : 'bottom'"
						size="14"
						color="#1677ff"></uni-icons>
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
								class="tool-item"
								@click="handleItemClick(item)">
								<view class="tool-content">
									<uni-icons
										:type="item.icon"
										size="32"
										color="#1677ff"></uni-icons>
									<text class="tool-name">{{ item.name }}</text>
								</view>
								<view
									class="favorite-btn"
									:class="{ 'is-favorite': isFavorite(item.id) }"
									@tap.stop="toggleFavorite(item)">
									<uni-icons
										:type="isFavorite(item.id) ? 'star-filled' : 'star'"
										size="18"
										:color="
											isFavorite(item.id) ? '#1677ff' : '#999'
										"></uni-icons>
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
import { ref, computed, onMounted, unref } from 'vue'

// 常量定义
const KINGDOM_UNLOCK_CLICKS = 5
const FAVORITES_DISPLAY_LIMIT = 6
const STORAGE_KEY_FAVORITES = 'favorites'

// 工具分类
const categories = [
	{
		id: 'daily',
		name: '日常工具',
		tools: ['Kingdom', 'calculator', 'unit', 'qrcode', 'relative'],
	},
	{
		id: 'finance',
		name: '理财工具',
		tools: ['mortgage', 'car', 'pension'],
	},
	{
		id: 'life',
		name: '生活工具',
		tools: ['bmi', 'currency', 'pregnancy'],
	},
	{
		id: 'work',
		name: '工作工具',
		tools: ['individual', 'retirement', 'social'],
	},
	{
		id: 'data',
		name: '数据工具',
		tools: ['deduplication'],
	},
	{
		id: 'time',
		name: '时间工具',
		tools: ['dateCalculation', 'timezoneConverter', 'countdown'],
	},
]

// 添加点击计数器
const favoriteClickCount = ref(0)
// 是否显示金证门禁
const showKingdom = ref(false)

// 基础工具列表数据
const defaultTools = ref([
	{
		id: 'Kingdom',
		name: '金证门禁',
		icon: 'calendar-filled',
		path: '/pageSub/KingdomCore/Kingdom-core',
		category: 'daily',
		hidden: true, // 添加hidden属性标记需要隐藏的工具
	},
])

// 日常工具列表数据
const dailyTools = ref([
	{
		id: 'calculator',
		name: '计算器',
		icon: 'calendar-filled',
		path: '/pageSub/DailyTools/Calculator/Calculator',
		category: 'daily',
	},
	{
		id: 'unit',
		name: '单位转换器',
		icon: 'refresh',
		path: '/pageSub/DailyTools/UnitConverter/Unit-converter',
		category: 'daily',
	},
	{
		id: 'currency',
		name: '汇率转换器',
		icon: 'refresh',
		path: '/pageSub/DailyTools/CurrencyExchange/Currency-exchange',
		category: 'daily',
	},
	{
		id: 'qrcode',
		name: '二维码生成器',
		icon: 'medal',
		path: '/pageSub/DailyTools/QrcodeGenerator/Qrcode-generator',
		category: 'daily',
	},
	{
		id: 'relative',
		name: '亲戚称呼计算器',
		icon: 'medal',
		path: '/pageSub/DailyTools/RelativeCalculator/Relative-calculator',
		category: 'daily',
	},
])

// 理财工具列表数据
const financeTools = ref([
	{
		id: 'mortgage',
		name: '房贷计算器',
		icon: 'home',
		path: '/pageSub/FinanceTools/MortgageCalculator/Mortgage-calculator',
		category: 'finance',
	},
	{
		id: 'car',
		name: '车贷计算器',
		icon: 'cart-filled',
		path: '/pageSub/FinanceTools/CarCalculator/Car-calculator',
		category: 'finance',
	},
	{
		id: 'pension',
		name: '养老金计算器',
		icon: 'wallet-filled',
		path: '/pageSub/FinanceTools/PensionCalculator/Pension-calculator',
		category: 'finance',
	},
])

// 生活工具列表数据
const lifeTools = ref([
	{
		id: 'bmi',
		name: 'BMI计算器',
		icon: 'person-filled',
		path: '/pageSub/LifeTools/BMI/BMI',
		category: 'life',
	},
	{
		id: 'pregnancy',
		name: '孕期计算器',
		icon: 'heart-filled',
		path: '/pageSub/LifeTools/PregnancyCalculator/Pregnancy-calculator',
		category: 'life',
	},
	{
		id: 'habit',
		name: '打卡器',
		icon: 'wallet',
		path: '/pageSub/LifeTools/Habit/Habit',
		category: 'life',
	},
])

// 工作工具列表数据
const workTools = ref([
	{
		id: 'individual',
		name: '个税计算器',
		icon: 'wallet',
		path: '/pageSub/WorkTools/IndividualCalculator/Individual-calculator',
		category: 'work',
	},
	{
		id: 'retirement',
		name: '退休年龄',
		icon: 'calendar',
		path: '/pageSub/WorkTools/RetirementAge/Retirement-age',
		category: 'work',
	},
	{
		id: 'social',
		name: '社保年限',
		icon: 'medal',
		path: '/pageSub/WorkTools/SocialSecurityPeriod/Social-security-period',
		category: 'work',
	},
])

// 数据工具列表数据
const dataTools = ref([
	{
		id: 'deduplication',
		name: '文本去重',
		icon: 'compose',
		path: '/pageSub/DataTools/TextDeduplication/Text-deduplication',
		category: 'data',
	},
])

// 时间工具列表数据
const timeTools = ref([
	{
		id: 'dateCalculation',
		name: '日期计算器',
		icon: 'calendar',
		path: '/pageSub/TimeTools/DateCalculation/Date-calculation',
		category: 'time',
	},
	{
		id: 'timezoneConverter',
		name: '时区转换器',
		icon: 'refreshempty',
		path: '/pageSub/TimeTools/TimezoneConverter/TimezoneConverter',
		category: 'time',
	},
	{
		id: 'countdown',
		name: '倒计时',
		icon: 'notification',
		path: '/pageSub/TimeTools/Countdown/Countdown',
		category: 'time',
	},
])

// 工具列表数据
const tools = computed(() => [
	...defaultTools.value,
	...dailyTools.value,
	...financeTools.value,
	...lifeTools.value,
	...workTools.value,
	...dataTools.value,
	...timeTools.value,
])

// 获取分类下的工具
const getToolsByCategory = (categoryId) => {
	const allTools = unref(tools)
	return allTools.filter(
		(tool) =>
			tool.category === categoryId &&
			(!tool.hidden || (tool.id === 'Kingdom' && showKingdom.value))
	)
}

// 我的常用
const favorites = ref([])
const showAllFavorites = ref(false)

// 显示的常用工具
const displayedFavorites = computed(() => {
	return showAllFavorites.value
		? favorites.value
		: favorites.value.slice(0, FAVORITES_DISPLAY_LIMIT)
})

// 判断是否已添加到常用
const isFavorite = (id) => {
	return favorites.value.some((item) => item.id === id)
}

// 保存收藏到本地存储
const saveFavorites = () => {
	try {
		uni.setStorageSync(STORAGE_KEY_FAVORITES, favorites.value)
	} catch (error) {
		console.error('保存收藏失败:', error)
		uni.showToast({
			title: '保存失败',
			icon: 'none',
		})
	}
}

// 切换收藏状态
const toggleFavorite = (tool) => {
	if (isFavorite(tool.id)) {
		handleRemove(tool.id)
	} else {
		handleAdd(tool)
	}
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
		uni.showToast({
			title: '已移除',
			icon: 'success',
			duration: 1500,
		})
	}
}

// 添加到常用
const handleAdd = (tool) => {
	if (!isFavorite(tool.id)) {
		favorites.value.push(tool)
		saveFavorites()
		uni.showToast({
			title: '已添加',
			icon: 'success',
			duration: 1500,
		})
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
const dragOffset = ref(0)

// 获取拖拽样式
const getDragStyle = (index) => {
	if (index === dragStartIndex.value && dragOffset.value !== 0) {
		return {
			transform: `translateY(${dragOffset.value}px)`,
		}
	}
	return {}
}

// 开始拖拽
const startDrag = (e, index) => {
	dragStartIndex.value = index
	dragStartY.value = e.touches[0].pageY
	dragOffset.value = 0

	// 获取元素高度
	const query = uni.createSelectorQuery()
	query
		.selectAll('.favorite-item')
		.boundingClientRect((rects) => {
			if (rects && rects.length > 0) {
				itemHeight.value = rects[0].height || 120
			}
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

	// 更新拖拽偏移量
	dragOffset.value = moveDistance % itemHeight.value
}

// 结束拖拽
const endDrag = () => {
	if (dragStartIndex.value !== -1) {
		saveFavorites()
		// #ifdef APP-PLUS || H5
		uni.vibrateShort() // 添加触感反馈
		// #endif
	}
	dragStartIndex.value = -1
	dragEndIndex.value = -1
	dragOffset.value = 0
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

// 搜索相关
const searchKeyword = ref('')
const searchResults = computed(() => {
	if (!searchKeyword.value.trim()) return []

	const keyword = searchKeyword.value.toLowerCase().trim()
	const allTools = unref(tools)

	return allTools
		.filter(
			(tool) => !tool.hidden || (tool.id === 'Kingdom' && showKingdom.value)
		)
		.filter(
			(tool) =>
				tool.name.toLowerCase().includes(keyword) ||
				tool.id.toLowerCase().includes(keyword)
		)
})

// 清除搜索
const clearSearch = () => {
	searchKeyword.value = ''
}

// 二维码弹窗
const qrPopup = ref(null)
const showQRCode = () => {
	qrPopup.value?.open()
}
const hideQRCode = () => {
	qrPopup.value?.close()
}

// 监听我的常用标题点击
const handleFavoritesTitleClick = () => {
	favoriteClickCount.value++
	if (favoriteClickCount.value >= KINGDOM_UNLOCK_CLICKS) {
		showKingdom.value = true
		favoriteClickCount.value = 0 // 重置计数器

		// 找到金证门禁工具
		const kingdomTool = unref(tools).find((tool) => tool.id === 'Kingdom')
		if (kingdomTool && !isFavorite(kingdomTool.id)) {
			// 添加到我的常用
			favorites.value.push(kingdomTool)
			saveFavorites()
		}

		uni.showToast({
			title: '已解锁金证门禁并添加到常用',
			icon: 'success',
			duration: 2000,
		})
	}
}

// 页面加载时从本地存储获取常用工具
onMounted(() => {
	try {
		const savedFavorites = uni.getStorageSync(STORAGE_KEY_FAVORITES)
		if (savedFavorites && Array.isArray(savedFavorites)) {
			favorites.value = savedFavorites
		}

		// 如果收藏夹中有金证门禁，则显示它
		if (favorites.value.some((item) => item.id === 'Kingdom')) {
			showKingdom.value = true
		}
	} catch (error) {
		console.error('加载收藏失败:', error)
	}
})
</script>
<style lang="scss">
.index {
	padding: 20rpx;
	min-height: 100vh;
	background: linear-gradient(to bottom, #f8f9fa 0%, #f5f5f5 100%);

	.search-box {
		display: flex;
		align-items: center;
		background-color: #fff;
		border-radius: 16rpx;
		padding: 20rpx 24rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
		transition: box-shadow 0.3s ease;

		&:focus-within {
			box-shadow: 0 4rpx 16rpx rgba(22, 119, 255, 0.2);
		}

		.search-input {
			flex: 1;
			margin: 0 16rpx;
			font-size: 28rpx;
			color: #333;
			line-height: 1.5;
		}

		.clear-icon {
			transition: opacity 0.2s ease;
			&:active {
				opacity: 0.6;
			}
		}
	}

	.search-results {
		margin-bottom: 20rpx;
		animation: fadeIn 0.3s ease;
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
		border-radius: 16rpx;
		padding: 20rpx 12rpx;
		text-align: center;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		width: 100%;
		box-sizing: border-box;
		display: flex;
		justify-content: center;
		overflow: hidden;

		&:active {
			transform: scale(0.96);
			box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.12);
		}

		&.dragging {
			opacity: 0.9;
			transform: scale(1.05);
			z-index: 100;
			background-color: #f0f7ff;
			box-shadow: 0 8rpx 24rpx rgba(22, 119, 255, 0.3);
		}

		&.favorite-item {
			&:hover {
				box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.12);
			}
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
		min-height: 130rpx;
		transition: transform 0.2s ease;
	}

	.tool-name {
		font-size: 26rpx;
		color: #333;
		line-height: 1.5;
		width: 100%;
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
		padding: 0 8rpx;
		font-weight: 500;
	}

	.favorite-btn {
		position: absolute;
		top: 8rpx;
		right: 8rpx;
		padding: 12rpx;
		z-index: 10;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		transition: all 0.2s ease;
		background-color: rgba(255, 255, 255, 0.9);

		&:active {
			transform: scale(0.9);
			opacity: 0.8;
		}

		&.is-favorite {
			background-color: rgba(22, 119, 255, 0.1);
		}
	}

	.add-favorite,
	.remove-favorite {
		position: absolute;
		top: 8rpx;
		right: 8rpx;
		padding: 12rpx;
		z-index: 10;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		transition: all 0.2s ease;
		background-color: rgba(255, 255, 255, 0.9);

		&:active {
			transform: scale(0.9);
			opacity: 0.8;
		}
	}

	.remove-favorite {
		background-color: rgba(255, 77, 79, 0.1);
	}

	.show-more {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20rpx;
		color: #1677ff;
		font-size: 28rpx;
		gap: 8rpx;
		margin-top: 10rpx;
		transition: all 0.2s ease;
		border-radius: 12rpx;

		&:active {
			background-color: rgba(22, 119, 255, 0.1);
			transform: scale(0.98);
		}
	}

	.empty-tip {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 60rpx 40rpx;
		color: #999;
		font-size: 28rpx;
		gap: 20rpx;
		background-color: #fff;
		border-radius: 16rpx;
		margin: 16rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);

		.empty-text {
			color: #999;
			font-size: 28rpx;
		}
	}

	.drag-handle {
		position: absolute;
		top: 8rpx;
		left: 8rpx;
		padding: 12rpx;
		z-index: 10;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background-color: rgba(255, 255, 255, 0.9);
		transform: rotate(90deg);
		transition: all 0.2s ease;

		&:active {
			transform: rotate(90deg) scale(0.9);
			opacity: 0.8;
			background-color: rgba(22, 119, 255, 0.1);
		}
	}

	:deep(.uni-section) {
		padding: 0 !important;
		margin-bottom: 24rpx;

		.uni-section-header {
			padding: 0 10rpx;
		}
	}

	.favorites-section {
		:deep(.uni-section-header) {
			cursor: pointer;
			transition: opacity 0.2s ease;

			&:active {
				opacity: 0.7;
			}
		}
	}

	// 联系我们按钮
	.contact-box {
		margin: 40rpx 10rpx 30rpx;
		padding: 24rpx;
		background: linear-gradient(135deg, #1677ff 0%, #0958d9 100%);
		border-radius: 16rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12rpx;
		box-shadow: 0 4rpx 16rpx rgba(22, 119, 255, 0.3);
		transition: all 0.3s ease;

		&:active {
			transform: scale(0.98);
			box-shadow: 0 2rpx 8rpx rgba(22, 119, 255, 0.4);
		}

		text {
			font-size: 28rpx;
			color: #fff;
			font-weight: 500;
		}
	}

	// 二维码弹窗
	.qr-popup {
		background-color: #fff;
		border-radius: 20rpx;
		padding: 40rpx 30rpx;
		width: 580rpx;
		text-align: center;
		box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.12);

		.qr-title {
			font-size: 36rpx;
			font-weight: 600;
			color: #333;
			margin-bottom: 30rpx;
		}

		.qr-image {
			width: 420rpx;
			height: 420rpx;
			margin: 20rpx auto;
			border-radius: 12rpx;
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
		}

		.qr-desc {
			font-size: 28rpx;
			color: #666;
			line-height: 1.8;
			margin-top: 10rpx;
		}

		.close-btn {
			margin-top: 40rpx;
			background: linear-gradient(135deg, #1677ff 0%, #0958d9 100%);
			color: #fff;
			border-radius: 12rpx;
			font-size: 30rpx;
			padding: 20rpx 0;
			border: none;
			box-shadow: 0 4rpx 12rpx rgba(22, 119, 255, 0.3);
			transition: all 0.2s ease;

			&:active {
				transform: scale(0.98);
				opacity: 0.9;
			}
		}
	}
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
</style>
