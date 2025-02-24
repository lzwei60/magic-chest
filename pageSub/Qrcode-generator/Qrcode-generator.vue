<template>
	<view class="qrcode-generator">
		<uni-card>
			<!-- 内容输入 -->
			<uni-section title="二维码内容" type="line" padding>
				<view class="input-box">
					<uni-easyinput
						v-model="content"
						type="textarea"
						placeholder="请输入要生成二维码的内容"
						:maxlength="500"
						@input="handleInput" />
				</view>
			</uni-section>

			<!-- 二维码配置 -->
			<uni-section title="二维码设置" type="line" padding>
				<view class="config-box">
					<!-- 二维码大小 -->
					<view class="config-item">
						<text class="label">二维码大小</text>
						<slider
							:value="size"
							:min="100"
							:max="500"
							:step="10"
							show-value
							@change="handleSizeChange" />
					</view>

					<!-- 二维码颜色 -->
					<view class="config-item">
						<text class="label">二维码颜色</text>
						<view class="color-picker">
							<view
								v-for="color in colorOptions"
								:key="color"
								class="color-item"
								:class="{ active: qrColor === color }"
								:style="{ backgroundColor: color }"
								@click="qrColor = color"></view>
						</view>
					</view>
				</view>
			</uni-section>

			<!-- 二维码预览 -->
			<uni-section title="二维码预览" type="line" padding>
				<view class="preview-box">
					<canvas
						v-if="showCanvas"
						canvas-id="qrcode"
						:style="{
							width: size + 'px',
							height: size + 'px',
						}"></canvas>

					<view v-else class="empty-tip">
						<uni-icons type="info" size="30" color="#999"></uni-icons>
						<text>请输入内容生成二维码</text>
					</view>
				</view>
			</uni-section>

			<!-- 保存按钮 -->
			<view class="action-box">
				<button class="save-btn" :disabled="!content" @click="handleSave">
					保存二维码
				</button>
			</view>
		</uni-card>
	</view>
</template>

<script setup>
import { ref, watch } from 'vue'
import UQRCode from '@/uni_modules/Sansnn-uQRCode/js_sdk/uqrcode/uqrcode.js'

// 表单数据
const content = ref('')
const size = ref(200)
const qrColor = ref('#000000')
const showCanvas = ref(false)

// 颜色选项
const colorOptions = [
	'#000000',
	'#1677ff',
	'#f5222d',
	'#52c41a',
	'#722ed1',
	'#eb2f96',
]

// 监听内容变化
watch(
	[content, size, qrColor],
	() => {
		if (content.value) {
			showCanvas.value = true
			generateQRCode()
		} else {
			showCanvas.value = false
		}
	},
	{ immediate: true }
)

// 生成二维码
const generateQRCode = async () => {
	try {
		// 获取uQRCode实例
		const qr = new UQRCode()
		qr.data = content.value
		qr.size = size.value
		qr.foregroundColor = qrColor.value
		qr.fileType = 'png'
		await qr.make()
		const canvasContext = uni.createCanvasContext('qrcode', this) // 如果是组件，this必须传入
		// 设置uQRCode实例的canvas上下文
		qr.canvasContext = canvasContext
		// 调用绘制方法将二维码图案绘制到canvas上
		qr.drawCanvas()
	} catch (err) {
		console.error(err)
		uni.showToast({
			title: '生成失败',
			icon: 'error',
		})
	}
}

// 处理输入
const handleInput = () => {
	if (content.value.length > 500) {
		content.value = content.value.slice(0, 500)
		uni.showToast({
			title: '内容最多500字',
			icon: 'none',
		})
	}
}

// 处理大小变化
const handleSizeChange = (e) => {
	size.value = e.detail.value
}

// 保存二维码
const handleSave = () => {
	uni.canvasToTempFilePath({
		canvasId: 'qrcode',
		success: (res) => {
			uni.saveImageToPhotosAlbum({
				filePath: res.tempFilePath,
				success: () => {
					uni.showToast({
						title: '保存成功',
						icon: 'success',
					})
				},
				fail: () => {
					uni.showToast({
						title: '保存失败',
						icon: 'error',
					})
				},
			})
		},
		fail: () => {
			uni.showToast({
				title: '生成失败',
				icon: 'error',
			})
		},
	})
}
</script>

<style lang="scss">
.qrcode-generator {
	padding: 30rpx;
	min-height: 100vh;
	background-color: #f5f5f5;

	// 输入框样式
	.input-box {
		.uni-easyinput__content {
			background-color: #f8f8f8 !important;
			min-height: 160rpx !important;
		}
	}

	// 配置项样式
	.config-box {
		.config-item {
			margin-bottom: 30rpx;

			&:last-child {
				margin-bottom: 0;
			}

			.label {
				display: block;
				font-size: 28rpx;
				color: #666;
				margin-bottom: 16rpx;
			}
		}

		// 颜色选择器
		.color-picker {
			display: flex;
			gap: 20rpx;
			flex-wrap: wrap;

			.color-item {
				width: 60rpx;
				height: 60rpx;
				border-radius: 8rpx;
				border: 2rpx solid #eee;
				cursor: pointer;

				&.active {
					border: 4rpx solid #1677ff;
				}

				&:active {
					opacity: 0.8;
				}
			}
		}
	}

	// 预览区域
	.preview-box {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 400rpx;
		background-color: #fff;
		border-radius: 8rpx;
		padding: 30rpx;

		.empty-tip {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 16rpx;
			color: #999;
			font-size: 28rpx;
		}

		canvas {
			background-color: #fff;
		}
	}

	// 按钮样式
	.action-box {
		margin-top: 30rpx;
		padding: 0 30rpx;

		.save-btn {
			background-color: #1677ff;
			color: #fff;
			border-radius: 8rpx;
			font-size: 32rpx;
			padding: 20rpx 0;

			&:active {
				opacity: 0.8;
			}

			&[disabled] {
				background-color: #ccc;
				opacity: 1;
			}
		}
	}
}
</style>
