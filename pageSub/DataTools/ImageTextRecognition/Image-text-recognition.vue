<template>
	<view class="image-text-recognition">
		<!-- 图片选择卡片 -->
		<view class="image-card">
			<view class="card-header">
				<uni-icons type="image" size="20" color="#1677ff"></uni-icons>
				<text class="card-title">选择图片</text>
			</view>
			<view class="image-selector">
				<view v-if="!selectedImage" class="select-box" @click="chooseImage">
					<uni-icons type="camera" size="60" color="#ccc"></uni-icons>
					<text class="select-text">点击选择图片</text>
					<text class="select-hint">支持拍照或从相册选择</text>
				</view>
				<view v-else class="image-preview">
					<image
						:src="selectedImage"
						mode="aspectFit"
						class="preview-image"
						@click="previewImage"></image>
					<view class="image-actions">
						<view class="action-btn" @click="chooseImage">
							<uni-icons type="camera" size="18" color="#1677ff"></uni-icons>
							<text>重新选择</text>
						</view>
						<view class="action-btn" @click="clearImage">
							<uni-icons type="trash" size="18" color="#f5222d"></uni-icons>
							<text>删除</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 识别结果卡片 -->
		<view class="result-card" v-if="recognitionResult">
			<view class="card-header">
				<uni-icons type="compose" size="20" color="#1677ff"></uni-icons>
				<text class="card-title">识别结果</text>
				<view class="result-stats">
					<text class="stats-text">{{ recognitionResult.length }} 字</text>
				</view>
			</view>
			<view class="result-content">
				<view class="result-text">{{ recognitionResult }}</view>
				<view class="result-actions">
					<view class="action-btn" @click="copyResult">
						<uni-icons type="copy" size="18" color="#1677ff"></uni-icons>
						<text>复制全部</text>
					</view>
					<view class="action-btn" @click="clearResult">
						<uni-icons type="trash" size="18" color="#f5222d"></uni-icons>
						<text>清空</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 识别历史卡片 -->
		<view class="history-card" v-if="historyList.length > 0">
			<view class="card-header">
				<uni-icons type="list" size="20" color="#1677ff"></uni-icons>
				<text class="card-title">识别历史</text>
				<view class="clear-history" @click="clearHistory">
					<uni-icons type="trash" size="16" color="#999"></uni-icons>
					<text>清空</text>
				</view>
			</view>
			<view class="history-list">
				<view
					v-for="(item, index) in historyList"
					:key="index"
					class="history-item"
					@click="useHistoryItem(item)">
					<view class="history-content">
						<text class="history-text">{{ item.text }}</text>
						<text class="history-time">{{ item.time }}</text>
					</view>
					<view class="history-actions">
						<view class="history-btn" @click.stop="copyHistoryItem(item)">
							<uni-icons type="copy" size="16" color="#1677ff"></uni-icons>
						</view>
						<view class="history-btn" @click.stop="deleteHistoryItem(index)">
							<uni-icons type="trash" size="16" color="#f5222d"></uni-icons>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 操作按钮 -->
		<view class="action-box">
			<view class="action-buttons">
				<view
					class="action-btn recognize-btn"
					:class="{
						disabled: !selectedImage || isRecognizing,
						recognizing: isRecognizing,
					}"
					@click="recognizeText">
					<uni-icons
						:type="isRecognizing ? 'spinner-cycle' : 'scan'"
						size="20"
						color="#fff"
						:class="{ rotating: isRecognizing }"></uni-icons>
					<text>{{ isRecognizing ? '识别中...' : '开始识别' }}</text>
				</view>
			</view>
		</view>

		<!-- 提示信息 -->
		<view class="tips-card">
			<view class="card-header">
				<uni-icons type="info" size="20" color="#1677ff"></uni-icons>
				<text class="card-title">使用提示</text>
			</view>
			<view class="tips-content">
				<view class="tip-item">
					<text class="tip-number">1</text>
					<text class="tip-text">选择清晰的图片，文字越清晰识别准确率越高</text>
				</view>
				<view class="tip-item">
					<text class="tip-number">2</text>
					<text class="tip-text"
						>支持识别印刷体文字，手写文字识别准确率较低</text
					>
				</view>
				<view class="tip-item">
					<text class="tip-number">3</text>
					<text class="tip-text"
						>识别结果会自动保存到历史记录，方便后续使用</text
					>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { STORAGE_KEYS, getStorage, setStorage } from '../../../utils/storage'

// 常量定义
const MAX_HISTORY = 20
const OCR_API_URL = process.env.VUE_APP_OCR_API_URL || ''

// 状态数据
const selectedImage = ref('')
const recognitionResult = ref('')
const isRecognizing = ref(false)
const historyList = ref([])

// 选择图片
const chooseImage = () => {
	uni.chooseImage({
		count: 1,
		sizeType: ['compressed'],
		sourceType: ['camera', 'album'],
		success: (res) => {
			const tempFilePath = res.tempFilePaths[0]
			selectedImage.value = tempFilePath
			// 清空之前的结果
			recognitionResult.value = ''
			uni.vibrateShort({
				type: 'light',
			})
		},
		fail: (err) => {
			console.error('选择图片失败:', err)
			if (err.errMsg && err.errMsg.includes('cancel')) {
				// 用户取消，不提示
				return
			}
			uni.showToast({
				title: '选择图片失败',
				icon: 'error',
				duration: 2000,
			})
		},
	})
}

// 预览图片
const previewImage = () => {
	if (!selectedImage.value) return
	uni.previewImage({
		urls: [selectedImage.value],
		current: selectedImage.value,
	})
}

// 清空图片
const clearImage = () => {
	uni.showModal({
		title: '提示',
		content: '确定要删除当前图片吗？',
		success: (res) => {
			if (res.confirm) {
				selectedImage.value = ''
				recognitionResult.value = ''
				uni.vibrateShort({
					type: 'medium',
				})
			}
		},
	})
}

// 识别文字
const recognizeText = async () => {
	if (!selectedImage.value || isRecognizing.value) {
		return
	}

	isRecognizing.value = true
	uni.showLoading({
		title: '识别中...',
		mask: true,
	})

	try {
		const result = await recognizeWithAPI(selectedImage.value)

		if (result && result.text) {
			recognitionResult.value = result.text
			// 保存到历史记录
			saveToHistory(result.text)
			uni.showToast({
				title: '识别成功',
				icon: 'success',
				duration: 2000,
			})
			uni.vibrateShort({
				type: 'medium',
			})
		} else {
			throw new Error('识别结果为空')
		}
	} catch (error) {
		console.error('识别失败:', error)
		uni.showToast({
			title: error.message || '识别失败，请重试',
			icon: 'error',
			duration: 2000,
		})
	} finally {
		isRecognizing.value = false
		uni.hideLoading()
	}
}

// 使用后端API调用OCR服务。
const recognizeWithAPI = async (imagePath) => {
	return new Promise((resolve, reject) => {
		if (!OCR_API_URL) {
			reject(new Error('OCR服务未配置'))
			return
		}

		const fsManager = uni.getFileSystemManager?.()
		if (!fsManager) {
			reject(new Error('当前平台不支持读取本地图片'))
			return
		}

		// 将图片转换为base64
		fsManager.readFile({
			filePath: imagePath,
			encoding: 'base64',
			success: (res) => {
				const base64 = res.data

				uni.request({
					url: OCR_API_URL,
					method: 'POST',
					header: {
						'Content-Type': 'application/json',
					},
					data: {
						image: base64,
						type: 'general', // 通用文字识别
					},
					timeout: 30000,
					success: (apiRes) => {
						if (apiRes.statusCode === 200 && apiRes.data && apiRes.data.text) {
							resolve({
								text: apiRes.data.text,
							})
						} else {
							reject(new Error(apiRes.data?.message || '识别失败'))
						}
					},
					fail: (err) => {
						reject(err)
					},
				})
			},
			fail: () => {
				reject(new Error('读取图片失败'))
			},
		})
	})
}

// 保存到历史记录
const saveToHistory = (text) => {
	if (!text || !text.trim()) return

	const historyItem = {
		text: text.trim(),
		time: formatTime(new Date()),
	}

	// 添加到列表开头
	historyList.value.unshift(historyItem)

	// 限制历史记录数量
	if (historyList.value.length > MAX_HISTORY) {
		historyList.value = historyList.value.slice(0, MAX_HISTORY)
	}

	// 保存到本地存储
	saveHistoryToStorage()
}

// 使用历史记录项
const useHistoryItem = (item) => {
	recognitionResult.value = item.text
	uni.showToast({
		title: '已加载',
		icon: 'success',
		duration: 1500,
	})
	uni.vibrateShort({
		type: 'light',
	})
}

// 复制识别结果
const copyResult = () => {
	if (!recognitionResult.value) return

	uni.setClipboardData({
		data: recognitionResult.value,
		success: () => {
			uni.showToast({
				title: '已复制到剪贴板',
				icon: 'success',
				duration: 1500,
			})
			uni.vibrateShort({
				type: 'light',
			})
		},
		fail: () => {
			uni.showToast({
				title: '复制失败',
				icon: 'error',
			})
		},
	})
}

// 清空识别结果
const clearResult = () => {
	recognitionResult.value = ''
	uni.vibrateShort({
		type: 'light',
	})
}

// 复制历史记录项
const copyHistoryItem = (item) => {
	uni.setClipboardData({
		data: item.text,
		success: () => {
			uni.showToast({
				title: '已复制',
				icon: 'success',
				duration: 1500,
			})
			uni.vibrateShort({
				type: 'light',
			})
		},
	})
}

// 删除历史记录项
const deleteHistoryItem = (index) => {
	historyList.value.splice(index, 1)
	saveHistoryToStorage()
	uni.showToast({
		title: '已删除',
		icon: 'success',
		duration: 1500,
	})
	uni.vibrateShort({
		type: 'light',
	})
}

// 清空历史记录
const clearHistory = () => {
	if (historyList.value.length === 0) return

	uni.showModal({
		title: '提示',
		content: '确定要清空所有历史记录吗？',
		success: (res) => {
			if (res.confirm) {
				historyList.value = []
				saveHistoryToStorage()
				uni.showToast({
					title: '已清空',
					icon: 'success',
					duration: 1500,
				})
				uni.vibrateShort({
					type: 'medium',
				})
			}
		},
	})
}

// 保存历史记录到本地存储
const saveHistoryToStorage = () => {
	setStorage(STORAGE_KEYS.ocrHistory, historyList.value)
}

// 从本地存储加载历史记录
const loadHistoryFromStorage = () => {
	const stored = getStorage(STORAGE_KEYS.ocrHistory, [])
	if (Array.isArray(stored)) {
		historyList.value = stored
	}
}

// 格式化时间
const formatTime = (date) => {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	const hour = String(date.getHours()).padStart(2, '0')
	const minute = String(date.getMinutes()).padStart(2, '0')
	return `${year}-${month}-${day} ${hour}:${minute}`
}

// 初始化
onMounted(() => {
	loadHistoryFromStorage()
})
</script>

<style lang="scss">
.image-text-recognition {
	padding: 30rpx;
	min-height: 100vh;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

	// 卡片通用样式
	.image-card,
	.result-card,
	.history-card,
	.tips-card {
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
			flex: 1;
		}

		.result-stats {
			font-size: 24rpx;
			color: #999;
		}

		.clear-history {
			display: flex;
			align-items: center;
			gap: 6rpx;
			font-size: 24rpx;
			color: #999;
			padding: 8rpx 12rpx;
			border-radius: 8rpx;
			transition: all 0.3s;

			&:active {
				background: rgba(0, 0, 0, 0.05);
			}
		}
	}

	// 图片选择区域
	.image-selector {
		.select-box {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			min-height: 400rpx;
			background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
			border-radius: 20rpx;
			border: 2rpx dashed #ddd;
			gap: 16rpx;
			transition: all 0.3s;

			&:active {
				background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
				transform: scale(0.98);
			}

			.select-text {
				font-size: 28rpx;
				color: #666;
				font-weight: 500;
			}

			.select-hint {
				font-size: 24rpx;
				color: #999;
			}
		}

		.image-preview {
			.preview-image {
				width: 100%;
				max-height: 600rpx;
				border-radius: 16rpx;
				background: #f5f5f5;
			}

			.image-actions {
				display: flex;
				gap: 16rpx;
				margin-top: 20rpx;
				justify-content: center;

				.action-btn {
					display: flex;
					align-items: center;
					gap: 8rpx;
					padding: 12rpx 24rpx;
					background: rgba(22, 119, 255, 0.1);
					border-radius: 12rpx;
					font-size: 26rpx;
					color: #1677ff;
					transition: all 0.3s;

					&:active {
						background: rgba(22, 119, 255, 0.2);
						transform: scale(0.95);
					}

					&:last-child {
						background: rgba(245, 34, 45, 0.1);
						color: #f5222d;
					}

					&:last-child:active {
						background: rgba(245, 34, 45, 0.2);
					}
				}
			}
		}
	}

	// 识别结果区域
	.result-content {
		.result-text {
			min-height: 200rpx;
			padding: 24rpx;
			background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
			border-radius: 16rpx;
			font-size: 28rpx;
			line-height: 1.8;
			color: #333;
			white-space: pre-wrap;
			word-break: break-all;
		}

		.result-actions {
			display: flex;
			gap: 16rpx;
			margin-top: 20rpx;
			justify-content: center;

			.action-btn {
				display: flex;
				align-items: center;
				gap: 8rpx;
				padding: 12rpx 24rpx;
				background: rgba(22, 119, 255, 0.1);
				border-radius: 12rpx;
				font-size: 26rpx;
				color: #1677ff;
				transition: all 0.3s;

				&:active {
					background: rgba(22, 119, 255, 0.2);
					transform: scale(0.95);
				}

				&:last-child {
					background: rgba(245, 34, 45, 0.1);
					color: #f5222d;
				}

				&:last-child:active {
					background: rgba(245, 34, 45, 0.2);
				}
			}
		}
	}

	// 历史记录区域
	.history-list {
		.history-item {
			display: flex;
			align-items: center;
			padding: 20rpx;
			margin-bottom: 16rpx;
			background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
			border-radius: 16rpx;
			transition: all 0.3s;

			&:last-child {
				margin-bottom: 0;
			}

			&:active {
				background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
				transform: scale(0.98);
			}

			.history-content {
				flex: 1;
				display: flex;
				flex-direction: column;
				gap: 8rpx;

				.history-text {
					font-size: 26rpx;
					color: #333;
					line-height: 1.6;
					overflow: hidden;
					text-overflow: ellipsis;
					display: -webkit-box;
					-webkit-line-clamp: 2;
					-webkit-box-orient: vertical;
				}

				.history-time {
					font-size: 22rpx;
					color: #999;
				}
			}

			.history-actions {
				display: flex;
				gap: 12rpx;
				margin-left: 16rpx;

				.history-btn {
					width: 56rpx;
					height: 56rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					background: rgba(0, 0, 0, 0.05);
					border-radius: 12rpx;
					transition: all 0.3s;

					&:active {
						background: rgba(0, 0, 0, 0.1);
						transform: scale(0.9);
					}
				}
			}
		}
	}

	// 提示信息区域
	.tips-content {
		.tip-item {
			display: flex;
			align-items: flex-start;
			margin-bottom: 20rpx;
			gap: 16rpx;

			&:last-child {
				margin-bottom: 0;
			}

			.tip-number {
				width: 40rpx;
				height: 40rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				background: linear-gradient(135deg, #1677ff 0%, #0958d9 100%);
				color: #fff;
				border-radius: 50%;
				font-size: 24rpx;
				font-weight: 600;
				flex-shrink: 0;
			}

			.tip-text {
				flex: 1;
				font-size: 26rpx;
				color: #666;
				line-height: 1.6;
			}
		}
	}

	// 操作按钮
	.action-box {
		margin-top: 30rpx;

		.action-buttons {
			.recognize-btn {
				width: 100%;
				height: 88rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 12rpx;
				background: linear-gradient(135deg, #1677ff 0%, #0958d9 100%);
				border-radius: 16rpx;
				color: #fff;
				font-size: 32rpx;
				font-weight: 500;
				box-shadow: 0 4rpx 16rpx rgba(22, 119, 255, 0.3);
				transition: all 0.3s;

				&:active {
					transform: translateY(2rpx);
					box-shadow: 0 2rpx 8rpx rgba(22, 119, 255, 0.3);
				}

				&.disabled {
					background: linear-gradient(135deg, #ccc 0%, #bbb 100%);
					box-shadow: none;
					opacity: 0.6;
				}

				.uni-icons.rotating {
					animation: rotate 1s linear infinite;
				}
			}
		}
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
		transform: rotate(360deg);
	}
}
</style>
