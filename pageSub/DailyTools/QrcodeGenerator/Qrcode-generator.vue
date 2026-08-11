<template>
	<view class="qrcode-generator">
		<!-- 内容输入卡片 -->
		<view class="input-card">
			<view class="card-header">
				<uni-icons type="compose" size="20" color="#1677ff"></uni-icons>
				<text class="card-title">二维码内容</text>
			</view>
			<view class="input-wrapper">
				<view class="input-box">
					<uni-easyinput
						v-model="content"
						type="textarea"
						placeholder="请输入要生成二维码的内容（文本、链接等）"
						:maxlength="500"
						:clearable="true"
						@input="handleInput" />
					<view class="input-footer">
						<view class="char-count"> {{ content.length }}/500 </view>
						<view class="input-actions">
							<view class="action-btn" @click="copyContent" v-if="content">
								<uni-icons type="copy" size="16" color="#1677ff"></uni-icons>
								<text>复制</text>
							</view>
							<view class="action-btn" @click="clearContent" v-if="content">
								<uni-icons type="trash" size="16" color="#f5222d"></uni-icons>
								<text>清空</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 二维码配置卡片 -->
		<view class="config-card">
			<view class="card-header">
				<uni-icons type="settings" size="20" color="#1677ff"></uni-icons>
				<text class="card-title">二维码设置</text>
			</view>
			<view class="config-box">
				<!-- 二维码大小 -->
				<view class="config-item">
					<view class="config-label">
						<uni-icons type="image" size="16" color="#666"></uni-icons>
						<text class="label">二维码大小</text>
						<text class="size-value">{{ size }}px</text>
					</view>
					<slider
						:value="size"
						:min="100"
						:max="500"
						:step="10"
						activeColor="#1677ff"
						backgroundColor="#e0e0e0"
						@change="handleSizeChange" />
				</view>

				<!-- 二维码颜色 -->
				<view class="config-item">
					<view class="config-label">
						<uni-icons type="color" size="16" color="#666"></uni-icons>
						<text class="label">二维码颜色</text>
					</view>
					<view class="color-picker">
						<view
							v-for="color in colorOptions"
							:key="color"
							class="color-item"
							:class="{ active: qrColor === color }"
							:style="{ backgroundColor: color }"
							@click="handleColorChange(color)">
							<view class="color-check" v-if="qrColor === color">
								<uni-icons
									type="checkmarkempty"
									size="20"
									color="#fff"></uni-icons>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 二维码预览卡片 -->
		<view class="preview-card">
			<view class="card-header">
				<uni-icons type="scan" size="20" color="#1677ff"></uni-icons>
				<text class="card-title">二维码预览</text>
			</view>
			<view class="preview-box">
				<view v-if="isGenerating" class="loading-tip">
					<uni-icons type="spinner-cycle" size="40" color="#1677ff"></uni-icons>
					<text>正在生成二维码...</text>
				</view>
				<canvas
					v-else-if="showCanvas"
					canvas-id="qrcode"
					:style="{
						width: size + 'px',
						height: size + 'px',
					}"
					class="qrcode-canvas"></canvas>
				<view v-else class="empty-tip">
					<uni-icons type="info" size="60" color="#ccc"></uni-icons>
					<text class="empty-text">请输入内容生成二维码</text>
					<text class="empty-hint">支持文本、链接、联系方式等</text>
				</view>
			</view>
		</view>

		<!-- 操作按钮 -->
		<view class="action-box">
			<view class="action-buttons">
				<view
					class="action-btn save-btn"
					:class="{ disabled: !content || isGenerating }"
					@click="handleSave">
					<uni-icons type="download" size="20" color="#fff"></uni-icons>
					<text>保存二维码</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, watch, getCurrentInstance } from 'vue'
import UQRCode from '@/uni_modules/Sansnn-uQRCode/js_sdk/uqrcode/uqrcode.js'

// 获取当前实例（用于 canvas 上下文）
const instance = getCurrentInstance()

// 常量定义
const MAX_LENGTH = 500
const DEFAULT_SIZE = 200

// 表单数据
const content = ref('')
const size = ref(DEFAULT_SIZE)
const qrColor = ref('#000000')
const showCanvas = ref(false)
const isGenerating = ref(false)

// 颜色选项
const colorOptions = [
	'#000000',
	'#1677ff',
	'#f5222d',
	'#52c41a',
	'#722ed1',
	'#eb2f96',
	'#fa8c16',
	'#13c2c2',
]

// 防抖定时器
let generateTimer = null

// 监听内容变化（添加防抖）
watch(
	[content, size, qrColor],
	() => {
		if (content.value && content.value.trim()) {
			// 清除之前的定时器
			if (generateTimer) {
				clearTimeout(generateTimer)
			}
			// 设置防抖，300ms 后生成
			generateTimer = setTimeout(() => {
				showCanvas.value = true
				generateQRCode()
			}, 300)
		} else {
			showCanvas.value = false
			isGenerating.value = false
		}
	},
	{ immediate: false }
)

// 生成二维码
const generateQRCode = async () => {
	if (!content.value || !content.value.trim()) {
		showCanvas.value = false
		return
	}

	isGenerating.value = true

	try {
		// 等待 canvas 准备就绪
		await new Promise((resolve) => setTimeout(resolve, 100))

		// 获取uQRCode实例
		const qr = new UQRCode()
		qr.data = content.value.trim()
		qr.size = size.value
		qr.foregroundColor = qrColor.value
		qr.fileType = 'png'

		// 生成二维码数据
		await qr.make()

		// 获取 canvas 上下文（使用 getCurrentInstance 获取组件实例）
		const canvasContext = uni.createCanvasContext('qrcode', instance)

		// 设置uQRCode实例的canvas上下文
		qr.canvasContext = canvasContext

		// 调用绘制方法将二维码图案绘制到canvas上
		qr.drawCanvas()

		// 等待绘制完成
		setTimeout(() => {
			isGenerating.value = false
		}, 200)
	} catch (err) {
		console.error('生成二维码失败:', err)
		isGenerating.value = false
		showCanvas.value = false
		uni.showToast({
			title: '生成失败，请重试',
			icon: 'error',
			duration: 2000,
		})
	}
}

// 处理输入
const handleInput = () => {
	if (content.value.length > MAX_LENGTH) {
		content.value = content.value.slice(0, MAX_LENGTH)
		uni.showToast({
			title: `内容最多${MAX_LENGTH}字`,
			icon: 'none',
			duration: 2000,
		})
		uni.vibrateShort({
			type: 'medium',
		})
	}
}

// 处理大小变化
const handleSizeChange = (e) => {
	size.value = e.detail.value
	uni.vibrateShort({
		type: 'light',
	})
}

// 处理颜色变化
const handleColorChange = (color) => {
	qrColor.value = color
	uni.vibrateShort({
		type: 'light',
	})
}

// 复制内容
const copyContent = () => {
	if (!content.value) return

	uni.setClipboardData({
		data: content.value,
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

// 清空内容
const clearContent = () => {
	if (!content.value) return

	uni.showModal({
		title: '提示',
		content: '确定要清空内容吗？',
		success: (res) => {
			if (res.confirm) {
				content.value = ''
				showCanvas.value = false
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

// 保存二维码
const handleSave = () => {
	if (!content.value || !showCanvas.value || isGenerating.value) {
		return
	}

	uni.showLoading({
		title: '正在保存...',
		mask: true,
	})

	// 延迟一下确保 canvas 绘制完成
	setTimeout(() => {
		uni.canvasToTempFilePath(
			{
				canvasId: 'qrcode',
				success: (res) => {
					uni.hideLoading()
					// 保存到相册
					uni.saveImageToPhotosAlbum({
						filePath: res.tempFilePath,
						success: () => {
							uni.showToast({
								title: '保存成功',
								icon: 'success',
								duration: 2000,
							})
							uni.vibrateShort({
								type: 'medium',
							})
						},
						fail: (err) => {
							console.error('保存失败:', err)
							// 如果是因为权限问题，提示用户
							if (err.errMsg && err.errMsg.includes('auth')) {
								uni.showModal({
									title: '需要相册权限',
									content: '请在设置中开启相册权限',
									showCancel: false,
								})
							} else {
								uni.showToast({
									title: '保存失败，请重试',
									icon: 'error',
									duration: 2000,
								})
							}
						},
					})
				},
				fail: (err) => {
					console.error('生成图片失败:', err)
					uni.hideLoading()
					uni.showToast({
						title: '生成图片失败',
						icon: 'error',
						duration: 2000,
					})
				},
			},
			instance
		)
	}, 300)
}
</script>

<style lang="scss">
.qrcode-generator {
	padding: 30rpx;
	min-height: 100vh;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

	// 卡片通用样式
	.input-card,
	.config-card,
	.preview-card {
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

	// 输入区域
	.input-wrapper {
		.input-box {
			position: relative;

			.input-footer {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-top: 16rpx;
				padding-top: 16rpx;
				border-top: 1rpx solid #f0f0f0;

				.char-count {
					font-size: 24rpx;
					color: #999;
				}

				.input-actions {
					display: flex;
					gap: 16rpx;

					.action-btn {
						display: flex;
						align-items: center;
						gap: 6rpx;
						padding: 8rpx 16rpx;
						background: rgba(22, 119, 255, 0.1);
						border-radius: 12rpx;
						font-size: 24rpx;
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
	}

	// 配置区域
	.config-box {
		.config-item {
			margin-bottom: 40rpx;

			&:last-child {
				margin-bottom: 0;
			}

			.config-label {
				display: flex;
				align-items: center;
				margin-bottom: 20rpx;
				gap: 8rpx;

				.label {
					font-size: 28rpx;
					color: #333;
					font-weight: 500;
					flex: 1;
				}

				.size-value {
					font-size: 28rpx;
					color: #1677ff;
					font-weight: 600;
				}
			}
		}

		// 颜色选择器
		.color-picker {
			display: flex;
			gap: 20rpx;
			flex-wrap: wrap;

			.color-item {
				width: 72rpx;
				height: 72rpx;
				border-radius: 16rpx;
				border: 3rpx solid transparent;
				cursor: pointer;
				position: relative;
				transition: all 0.3s;
				box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);

				&.active {
					border-color: #1677ff;
					transform: scale(1.1);
					box-shadow: 0 4rpx 12rpx rgba(22, 119, 255, 0.4);
				}

				&:active {
					transform: scale(0.95);
				}

				.color-check {
					position: absolute;
					top: 50%;
					left: 50%;
					transform: translate(-50%, -50%);
					width: 100%;
					height: 100%;
					display: flex;
					align-items: center;
					justify-content: center;
					background: rgba(0, 0, 0, 0.3);
					border-radius: 13rpx;
				}
			}
		}
	}

	// 预览区域
	.preview-box {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 500rpx;
		background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
		border-radius: 20rpx;
		padding: 40rpx;
		border: 2rpx dashed #ddd;

		.loading-tip {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 20rpx;
			color: #1677ff;
			font-size: 28rpx;

			.uni-icons {
				animation: rotate 1s linear infinite;
			}
		}

		.qrcode-canvas {
			background-color: #fff;
			border-radius: 16rpx;
			box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
			animation: fadeInScale 0.3s ease-out;
		}

		.empty-tip {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 20rpx;
			color: #999;

			.empty-text {
				font-size: 28rpx;
				color: #666;
			}

			.empty-hint {
				font-size: 24rpx;
				color: #999;
			}
		}
	}

	// 操作按钮
	.action-box {
		margin-top: 30rpx;

		.action-buttons {
			.save-btn {
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
			}
		}
	}
}

// 输入框样式
:deep(.uni-easyinput) {
	.uni-easyinput__content {
		background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
		min-height: 200rpx !important;
		border-radius: 16rpx !important;
		border: 2rpx solid transparent !important;
		padding: 20rpx 24rpx !important;
		transition: all 0.3s !important;

		&:focus-within {
			border-color: #1677ff !important;
			background: #fff !important;
			box-shadow: 0 0 0 4rpx rgba(22, 119, 255, 0.1) !important;
		}

		.uni-easyinput__content-textarea {
			font-size: 28rpx !important;
			color: #333 !important;
			line-height: 1.6 !important;
		}
	}
}

// slider 样式
:deep(slider) {
	.uni-slider-handle {
		background-color: #1677ff !important;
		border: 2rpx solid #fff !important;
		box-shadow: 0 2rpx 8rpx rgba(22, 119, 255, 0.3) !important;
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

@keyframes rotate {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}
</style>
