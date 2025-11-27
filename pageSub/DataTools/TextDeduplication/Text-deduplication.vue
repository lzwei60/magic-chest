<template>
	<view class="page">
		<!-- 输入区域 -->
		<view class="input-section">
			<view class="section-header">
				<text class="section-title">输入文本</text>
				<view class="input-actions">
					<text v-if="input" class="action-btn" @click="clearInput">清空</text>
					<text v-if="input" class="action-btn" @click="pasteText">粘贴</text>
				</view>
			</view>
			<textarea
				v-model="input"
				class="textarea"
				maxlength="-1"
				placeholder="粘贴文本，每行一项，支持换行、逗号、分号分隔"
				placeholder-style="color: #999"
				@input="handleInput"></textarea>
			<view v-if="input" class="input-count">
				已输入 {{ input.length }} 个字符
			</view>
		</view>

		<!-- 选项区域 -->
		<view class="options-section">
			<view class="section-header">
				<text class="section-title">处理选项</text>
			</view>
			<view class="opts">
				<checkbox-group
					class="opts-group"
					@change="onOptChange"
					:value="checkedOpts">
					<label class="checkbox-item">
						<checkbox value="ignoreEmpty" color="#1677ff" />
						<text class="checkbox-label">去空行</text>
					</label>
					<label class="checkbox-item">
						<checkbox value="trim" color="#1677ff" />
						<text class="checkbox-label">去空格</text>
					</label>
					<label class="checkbox-item">
						<checkbox value="ignoreCase" color="#1677ff" />
						<text class="checkbox-label">忽略大小写</text>
					</label>
				</checkbox-group>

				<view class="picker-wrapper">
					<picker :range="sortTypes" :value="opt.sort" @change="onSortChange">
						<view class="picker">
							<text class="picker-label">排序方式</text>
							<text class="picker-value">{{ sortTypes[opt.sort] }}</text>
							<uni-icons type="bottom" size="14" color="#999"></uni-icons>
						</view>
					</picker>
				</view>
			</view>
		</view>

		<!-- 操作按钮 -->
		<view class="action-section">
			<button class="primary-btn" @click="run" :disabled="!input || processing">
				<text v-if="processing">处理中...</text>
				<text v-else>开始处理</text>
			</button>
		</view>

		<!-- 统计信息 -->
		<view v-if="result.length > 0" class="stats-section">
			<view class="stats-card">
				<view class="stat-item">
					<text class="stat-label">原始数量</text>
					<text class="stat-value original">{{ originalCount }}</text>
				</view>
				<view class="stat-item">
					<text class="stat-label">去重后</text>
					<text class="stat-value result">{{ result.length }}</text>
				</view>
				<view class="stat-item">
					<text class="stat-label">去除数量</text>
					<text class="stat-value removed">{{ removedCount }}</text>
				</view>
			</view>
		</view>

		<!-- 结果区域 -->
		<view v-if="result.length > 0" class="result-section">
			<view class="section-header">
				<text class="section-title">去重结果</text>
				<view class="result-actions">
					<text class="action-btn" @click="copyResult">复制结果</text>
					<text class="action-btn" @click="expExcel">导出Excel</text>
				</view>
			</view>
			<view class="result-list">
				<view
					v-for="(item, i) in result"
					:key="i"
					class="result-row"
					@click="handleRowClick(item)">
					<view class="row-content">
						<text class="row-number">{{ i + 1 }}</text>
						<text class="row-text">{{ item || '(空)' }}</text>
					</view>
					<view class="row-actions">
						<text class="diff-btn" @click.stop="openDiff(item)">差异</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 空状态 -->
		<view v-if="!input && !result.length" class="empty-state">
			<uni-icons type="compose" size="60" color="#ccc"></uni-icons>
			<text class="empty-text">请输入或粘贴需要去重的文本</text>
		</view>

		<!-- 差异对比弹窗 -->
		<DiffDialog
			:show="diffVisible"
			:diff="curDiff"
			@close="diffVisible = false" />
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { parseText } from './utils/parse'
import { diffText } from './utils/diff'
import { exportExcel } from './utils/export'
import DiffDialog from './diffDialog.vue'

const input = ref('')
const result = ref([])
const originalList = ref([])
const diffVisible = ref(false)
const curDiff = ref([])
const processing = ref(false)

const opt = ref({ trim: true, ignoreEmpty: true, ignoreCase: false, sort: 0 })
const checkedOpts = ref(['ignoreEmpty', 'trim'])

const sortTypes = ['保持原顺序', '升序', '降序']

// 计算统计信息
const originalCount = computed(() => originalList.value.length)
const removedCount = computed(() => originalCount.value - result.value.length)

// 处理选项变化
const onOptChange = (e) => {
	checkedOpts.value = e.detail.value
	opt.value.ignoreEmpty = checkedOpts.value.includes('ignoreEmpty')
	opt.value.trim = checkedOpts.value.includes('trim')
	opt.value.ignoreCase = checkedOpts.value.includes('ignoreCase')
}

// 处理排序变化
const onSortChange = (e) => {
	opt.value.sort = Number(e.detail.value)
	// 如果已有结果，重新排序
	if (result.value.length > 0) {
		applySort()
	}
}

// 应用排序
const applySort = () => {
	if (opt.value.sort === 1) {
		result.value = [...result.value].sort()
	} else if (opt.value.sort === 2) {
		result.value = [...result.value].sort().reverse()
	}
}

// 处理输入
const handleInput = () => {
	// 输入变化时清空结果
	if (result.value.length > 0) {
		result.value = []
		originalList.value = []
	}
}

// 清空输入
const clearInput = () => {
	input.value = ''
	result.value = []
	originalList.value = []
	uni.showToast({
		title: '已清空',
		icon: 'success',
		duration: 1500,
	})
}

// 粘贴文本
const pasteText = () => {
	uni.getClipboardData({
		success: (res) => {
			if (res.data) {
				input.value = res.data
				uni.showToast({
					title: '粘贴成功',
					icon: 'success',
					duration: 1500,
				})
			}
		},
		fail: () => {
			uni.showToast({
				title: '粘贴失败',
				icon: 'none',
			})
		},
	})
}

// 执行去重处理
const run = () => {
	if (!input.value || !input.value.trim()) {
		uni.showToast({
			title: '请输入文本',
			icon: 'none',
		})
		return
	}

	processing.value = true

	try {
		// 解析文本
		const list = parseText(input.value, opt.value)
		originalList.value = list

		if (list.length === 0) {
			uni.showToast({
				title: '未找到有效数据',
				icon: 'none',
			})
			result.value = []
			processing.value = false
			return
		}

		// 去重
		let uniqueList = []
		const seen = new Set()

		for (const item of list) {
			const key = opt.value.ignoreCase ? item.toLowerCase() : item
			if (!seen.has(key)) {
				seen.add(key)
				uniqueList.push(item)
			}
		}

		// 应用排序
		if (opt.value.sort === 1) {
			uniqueList = uniqueList.sort()
		} else if (opt.value.sort === 2) {
			uniqueList = uniqueList.sort().reverse()
		}

		result.value = uniqueList

		uni.showToast({
			title: `去重完成，去除 ${removedCount.value} 项`,
			icon: 'success',
			duration: 2000,
		})
	} catch (error) {
		console.error('处理失败:', error)
		uni.showToast({
			title: '处理失败，请检查输入',
			icon: 'none',
		})
	} finally {
		processing.value = false
	}
}

// 打开差异对比
const openDiff = (item) => {
	try {
		curDiff.value = diffText(input.value, item)
		diffVisible.value = true
	} catch (error) {
		console.error('生成差异失败:', error)
		uni.showToast({
			title: '无法显示差异',
			icon: 'none',
		})
	}
}

// 复制结果
const copyResult = () => {
	if (result.value.length === 0) {
		uni.showToast({
			title: '没有可复制的内容',
			icon: 'none',
		})
		return
	}

	const text = result.value.join('\n')
	uni.setClipboardData({
		data: text,
		success: () => {
			uni.showToast({
				title: '复制成功',
				icon: 'success',
				duration: 1500,
			})
		},
		fail: () => {
			uni.showToast({
				title: '复制失败',
				icon: 'none',
			})
		},
	})
}

// 导出Excel
const expExcel = () => {
	if (result.value.length === 0) {
		uni.showToast({
			title: '没有可导出的内容',
			icon: 'none',
		})
		return
	}

	try {
		exportExcel(result.value)
		uni.showToast({
			title: '导出成功',
			icon: 'success',
			duration: 2000,
		})
	} catch (error) {
		console.error('导出失败:', error)
		uni.showToast({
			title: '导出失败',
			icon: 'none',
		})
	}
}

// 处理行点击
const handleRowClick = (item) => {
	// 可以添加点击行复制该行的功能
	uni.setClipboardData({
		data: item,
		success: () => {
			uni.showToast({
				title: '已复制',
				icon: 'success',
				duration: 1500,
			})
		},
	})
}
</script>

<style scoped lang="scss">
.page {
	padding: 24rpx;
	min-height: 100vh;
	background: linear-gradient(to bottom, #f8f9fa 0%, #f5f5f5 100%);
}

// 通用样式
.section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16rpx;
}

.section-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
}

.action-btn {
	font-size: 26rpx;
	color: #1677ff;
	padding: 8rpx 16rpx;
	border-radius: 8rpx;
	transition: all 0.2s ease;
	margin-left: 12rpx;

	&:active {
		background-color: rgba(22, 119, 255, 0.1);
		transform: scale(0.95);
	}
}

.input-actions,
.result-actions {
	display: flex;
	align-items: center;
}

// 输入区域
.input-section {
	background: #fff;
	border-radius: 16rpx;
	padding: 24rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.textarea {
	width: 100%;
	min-height: 360rpx;
	background: #fafafa;
	border-radius: 12rpx;
	padding: 20rpx;
	font-size: 28rpx;
	line-height: 1.6;
	color: #333;
	border: 2rpx solid transparent;
	transition: all 0.3s ease;
	box-sizing: border-box;

	&:focus {
		border-color: #1677ff;
		background: #fff;
	}
}

.input-count {
	margin-top: 12rpx;
	font-size: 24rpx;
	color: #999;
	text-align: right;
}

// 选项区域
.options-section {
	background: #fff;
	border-radius: 16rpx;
	padding: 24rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.opts {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.opts-group {
	display: flex;
	flex-wrap: wrap;
	gap: 32rpx;
}

.checkbox-item {
	display: flex;
	align-items: center;
	gap: 12rpx;
	padding: 12rpx 0;
}

.checkbox-label {
	font-size: 28rpx;
	color: #333;
}

.picker-wrapper {
	margin-top: 8rpx;
}

.picker {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 24rpx;
	border: 2rpx solid #e8e8e8;
	border-radius: 12rpx;
	background: #fafafa;
	transition: all 0.3s ease;

	&:active {
		border-color: #1677ff;
		background: #f0f7ff;
	}
}

.picker-label {
	font-size: 28rpx;
	color: #666;
	margin-right: 16rpx;
}

.picker-value {
	flex: 1;
	font-size: 28rpx;
	color: #333;
	text-align: right;
	margin-right: 12rpx;
}

// 操作按钮区域
.action-section {
	margin-bottom: 24rpx;
}

.primary-btn {
	width: 100%;
	height: 88rpx;
	background: linear-gradient(135deg, #1677ff 0%, #0958d9 100%);
	color: #fff;
	border-radius: 16rpx;
	font-size: 32rpx;
	font-weight: 500;
	border: none;
	box-shadow: 0 4rpx 16rpx rgba(22, 119, 255, 0.3);
	transition: all 0.3s ease;

	&:active {
		transform: scale(0.98);
		box-shadow: 0 2rpx 8rpx rgba(22, 119, 255, 0.4);
	}

	&[disabled] {
		background: #d9d9d9;
		box-shadow: none;
		opacity: 0.6;
	}
}

// 统计信息
.stats-section {
	margin-bottom: 24rpx;
}

.stats-card {
	display: flex;
	background: #fff;
	border-radius: 16rpx;
	padding: 24rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
	gap: 24rpx;
}

.stat-item {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 12rpx;
	padding: 16rpx;
	border-radius: 12rpx;
	background: #fafafa;
}

.stat-label {
	font-size: 24rpx;
	color: #999;
}

.stat-value {
	font-size: 36rpx;
	font-weight: 600;

	&.original {
		color: #666;
	}

	&.result {
		color: #1677ff;
	}

	&.removed {
		color: #ff4d4f;
	}
}

// 结果区域
.result-section {
	background: #fff;
	border-radius: 16rpx;
	padding: 24rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.result-list {
	max-height: 800rpx;
	overflow-y: auto;
}

.result-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 0;
	border-bottom: 1rpx solid #f0f0f0;
	transition: background-color 0.2s ease;

	&:last-child {
		border-bottom: none;
	}

	&:active {
		background-color: #fafafa;
	}
}

.row-content {
	flex: 1;
	display: flex;
	align-items: center;
	gap: 16rpx;
	min-width: 0;
}

.row-number {
	flex-shrink: 0;
	width: 48rpx;
	height: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #1677ff 0%, #0958d9 100%);
	color: #fff;
	border-radius: 50%;
	font-size: 24rpx;
	font-weight: 500;
}

.row-text {
	flex: 1;
	font-size: 28rpx;
	color: #333;
	line-height: 1.6;
	word-break: break-all;
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
}

.row-actions {
	flex-shrink: 0;
	margin-left: 16rpx;
}

.diff-btn {
	font-size: 26rpx;
	color: #1677ff;
	padding: 8rpx 20rpx;
	border-radius: 8rpx;
	background: rgba(22, 119, 255, 0.1);
	transition: all 0.2s ease;

	&:active {
		background: rgba(22, 119, 255, 0.2);
		transform: scale(0.95);
	}
}

// 空状态
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 120rpx 40rpx;
	background: #fff;
	border-radius: 16rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.empty-text {
	margin-top: 24rpx;
	font-size: 28rpx;
	color: #999;
	text-align: center;
}
</style>
