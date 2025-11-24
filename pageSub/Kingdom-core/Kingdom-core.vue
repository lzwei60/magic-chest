<template>
	<view class="kingdom-core">
		<!-- 顶部标签页 -->
		<view class="tab-box">
			<view
				v-for="(tab, index) in tabs"
				:key="tab.key"
				class="tab-item"
				:class="{ active: currentTab === index }"
				@click="handleTabChange(index)">
				{{ tab.name }}
			</view>
		</view>

		<!-- 门禁页面 -->
		<view v-if="currentTab === 0" class="access-content">
			<view class="qrcode-box">
				<canvas
					canvas-id="qrcode"
					:style="{ width: '300px', height: '300px' }"></canvas>
			</view>
			<view class="select-box">
				<uni-data-select
					v-model="selectedCard"
					:localdata="cardList"
					placeholder="请选择门卡" />
			</view>
			<button class="refresh-btn" @click="refreshQRCode">
				<uni-icons type="refresh" size="16" color="#fff"></uni-icons>
				刷新二维码
			</button>
		</view>

		<!-- 设置页面 -->
		<view v-else class="settings-content">
			<scroll-view
				scroll-y
				class="card-list"
				:style="{ height: scrollHeight + 'px' }">
				<view
					v-for="item in cardList"
					:key="item.value"
					class="card-item"
					:class="{ active: selectedCard === item.value }"
					@click="handleCardSelect(item)">
					<view class="card-info">
						<text class="card-remark">{{ item.text }}</text>
						<text class="card-number">{{ item.value }}</text>
					</view>
					<view class="delete-btn" @click.stop="handleDelete(item)">
						<uni-icons type="trash" size="18" color="#ff4d4f"></uni-icons>
					</view>
				</view>
			</scroll-view>

			<!-- 底部按钮 -->
			<view class="bottom-btns">
				<button class="add-btn" @click="showAddDialog">添加卡号</button>
				<button class="clear-btn" @click="handleClear">清空缓存</button>
			</view>
		</view>

		<!-- 添加卡号弹窗 -->
		<uni-popup ref="addPopup" type="dialog">
			<uni-popup-dialog
				title="门卡详情"
				:before-close="true"
				@confirm="handleAdd"
				@close="closeDialog">
				<view class="dialog-content">
					<view class="input-item">
						<text class="label">备注：</text>
						<uni-easyinput
							v-model="newCard.remark"
							placeholder="请输入备注"
							:clearable="false"
							class="input" />
					</view>
					<view class="input-item">
						<text class="label">卡号：</text>
						<uni-easyinput
							v-model="newCard.number"
							placeholder="请输入卡号"
							:clearable="false"
							class="input" />

						<uni-icons type="scan" size="30" @click="scanQrCode"></uni-icons>
					</view>
				</view>
			</uni-popup-dialog>
		</uni-popup>
	</view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import UQRCode from '@/uni_modules/Sansnn-uQRCode/js_sdk/uqrcode/uqrcode.js'
import { DooerCodec } from '@/utils/core.ts'

// 标签页配置
const tabs = [
	{ key: 'access', name: '门禁' },
	{ key: 'settings', name: '设置' },
]
const currentTab = ref(0)

// 门卡数据
const cardList = ref([])
const selectedCard = ref('')
const newCard = ref({ remark: '', number: '' })

// 弹窗引用
const addPopup = ref(null)

// 计算滚动区域高度
const scrollHeight = computed(() => {
	const systemInfo = uni.getSystemInfoSync()
	return systemInfo.windowHeight - 180 // 减去其他元素高度
})

// 切换标签页
const handleTabChange = (index) => {
	currentTab.value = index
	generateQRCode()
}

// 生成二维码
const generateQRCode = async () => {
	if (!selectedCard.value) return
	const cardid = selectedCard.value
	const currentTime = Date.now() // 获取当前时间戳
	const codec = new DooerCodec()
	const encryptedHex = codec.showLocalQrcode(cardid, currentTime)

	console.log(selectedCard.value)
	console.log(encryptedHex)
	try {
		const qr = new UQRCode()
		qr.data = encryptedHex
		qr.size = 300
		await qr.make()
		const canvasContext = uni.createCanvasContext('qrcode')
		qr.canvasContext = canvasContext
		qr.drawCanvas()
	} catch (err) {
		console.error(err)
		uni.showToast({
			title: '生成失败',
			icon: 'error',
		})
	}
}

// 刷新二维码
const refreshQRCode = () => {
	if (!selectedCard.value) {
		uni.showToast({
			title: '请先选择门卡',
			icon: 'none',
		})
		return
	}
	generateQRCode()
}

// 选择门卡
const handleCardSelect = (item) => {
	selectedCard.value = item.value
	saveSelectedCard()
}

// 保存选中的卡号
const saveSelectedCard = () => {
	uni.setStorageSync('selectedCard', selectedCard.value)
}

// 显示添加弹窗
const showAddDialog = () => {
	newCard.value = { remark: '', number: '' }
	addPopup.value.open()
}

// 关闭弹窗
const closeDialog = () => {
	addPopup.value.close()
}

// 添加门卡
const handleAdd = () => {
	if (!newCard.value.remark || !newCard.value.number) {
		uni.showToast({
			title: '请填写完整信息',
			icon: 'none',
		})
		return
	}

	const newItem = {
		text: newCard.value.remark,
		value: newCard.value.number,
	}
	cardList.value.push(newItem)
	// 如果是第一张卡，则自动选中
	if (cardList.value.length === 1) {
		selectedCard.value = newItem.value
		saveSelectedCard()
	}
	saveCardList()
	closeDialog()
	uni.showToast({
		title: '添加成功',
		icon: 'success',
	})
}

// 删除门卡
const handleDelete = (item) => {
	uni.showModal({
		title: '提示',
		content: '确定删除该门卡吗？',
		success: (res) => {
			if (res.confirm) {
				const index = cardList.value.findIndex(
					(card) => card.value === item.value
				)
				if (index > -1) {
					cardList.value.splice(index, 1)
					// 如果删除的是当前选中的卡
					if (selectedCard.value === item.value) {
						// 如果还有其他卡，选中第一个
						if (cardList.value.length > 0) {
							selectedCard.value = cardList.value[0].value
						} else {
							selectedCard.value = ''
						}
						saveSelectedCard()
					}
					saveCardList()
					uni.showToast({
						title: '删除成功',
						icon: 'success',
					})
				}
			}
		},
	})
}

// 清空缓存
const handleClear = () => {
	uni.showModal({
		title: '提示',
		content: '确定清空所有门卡吗？',
		success: (res) => {
			if (res.confirm) {
				cardList.value = []
				saveCardList()
				uni.showToast({
					title: '清空成功',
					icon: 'success',
				})
			}
		},
	})
}

// 保存数据到本地
const saveCardList = () => {
	uni.setStorageSync('cardList', cardList.value)
}

// 从本地加载数据
const loadCardList = () => {
	const list = uni.getStorageSync('cardList')
	if (list) {
		cardList.value = list
		// 加载保存的选中卡号
		const saved = uni.getStorageSync('selectedCard')
		if (saved && list.some((item) => item.value === saved)) {
			selectedCard.value = saved
		} else if (list.length > 0) {
			// 如果没有保存的选中卡号或该卡号已不存在，则选中第一个
			selectedCard.value = list[0].value
			saveSelectedCard()
		}
	}
}

/**
 * 打开扫描二维码
 */
const scanQrCode = () => {
	uni.showLoading({
		title: '扫码识别中',
	})

	uni.scanCode({
		scanType: ['qrCode'],
		success(detail) {
			uni.hideLoading()

			const code = detail.path || detail.result || ''
			if (!code) {
				return uni.showToast({
					title: '无效的二维码',
					icon: 'none',
				})
			}
			const codec = new DooerCodec()
			const data = codec.decodeLocalQrcode(code)
			if (!data) {
				return uni.showToast({
					title: '无效的二维码',
					icon: 'none',
				})
			}
			const card = data.cardid
			if (cardList.value.some((item) => item.value === card)) {
				return uni.showToast({
					title: '该门卡已存在',
					icon: 'none',
				})
			}
			newCard.value.number = card
		},
		fail() {
			uni.hideLoading()
			uni.showToast({ title: '扫码失败', icon: 'none' })
		},
	})
}

// 页面加载时读取数据
onMounted(() => {
	loadCardList()
	generateQRCode()
})
</script>

<style lang="scss">
.kingdom-core {
	min-height: 100vh;
	background-color: #f5f5f5;

	// 标签页样式
	.tab-box {
		display: flex;
		background-color: #fff;
		padding: 20rpx 30rpx;
		border-bottom: 2rpx solid #eee;

		.tab-item {
			flex: 1;
			text-align: center;
			font-size: 28rpx;
			color: #666;
			padding: 16rpx 0;
			position: relative;

			&.active {
				color: #1677ff;

				&::after {
					content: '';
					position: absolute;
					left: 50%;
					bottom: 0;
					transform: translateX(-50%);
					width: 40rpx;
					height: 4rpx;
					background-color: #1677ff;
					border-radius: 2rpx;
				}
			}
		}
	}

	// 门禁页面样式
	.access-content {
		padding: 30rpx;

		.qrcode-box {
			background-color: #fff;
			border-radius: 12rpx;
			padding: 30rpx;
			margin-bottom: 30rpx;
			display: flex;
			justify-content: center;
			align-items: center;

			.qrcode-canvas {
				background-color: #fff;
			}
		}

		.select-box {
			margin-bottom: 30rpx;

			:deep(.uni-select__input-text) {
				color: #333;
			}

			:deep(.uni-select__input-placeholder) {
				color: #999;
			}
		}

		.refresh-btn {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 8rpx;
			background-color: #1677ff;
			color: #fff;
			border-radius: 8rpx;
			font-size: 28rpx;
			padding: 20rpx 0;

			&:active {
				opacity: 0.8;
			}
		}
	}

	// 设置页面样式
	.settings-content {
		position: relative;
		height: 100%;
		padding-bottom: 120rpx;

		.card-list {
			padding: 30rpx;
			box-sizing: border-box;
			width: 100%;

			.card-item {
				display: flex;
				align-items: center;
				justify-content: space-between;
				background-color: #fff;
				padding: 30rpx;
				border-radius: 12rpx;
				margin-bottom: 20rpx;
				box-sizing: border-box;
				width: 100%;
				position: relative;
				border: 2rpx solid transparent;
				transition: all 0.3s ease;

				&.active {
					border-color: #1677ff;
					background-color: #f0f7ff;
					padding-left: 40rpx;

					&::before {
						content: '';
						position: absolute;
						left: -2rpx;
						top: 50%;
						transform: translateY(-50%);
						width: 6rpx;
						height: 40rpx;
						background-color: #1677ff;
						border-radius: 0 4rpx 4rpx 0;
					}

					.card-info {
						.card-remark {
							color: #1677ff;
							font-weight: 500;
						}

						.card-number {
							color: #1677ff;
						}
					}
				}

				.card-info {
					flex: 1;
					margin-right: 20rpx;

					.card-remark {
						display: block;
						font-size: 28rpx;
						color: #333;
						margin-bottom: 8rpx;
					}

					.card-number {
						font-size: 24rpx;
						color: #666;
					}
				}

				.delete-btn {
					padding: 20rpx;
					margin: -20rpx;

					&:active {
						opacity: 0.7;
					}
				}
			}
		}

		.bottom-btns {
			position: fixed;
			left: 0;
			right: 0;
			bottom: 0;
			padding: 20rpx 30rpx;
			background-color: #fff;
			box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.05);
			display: flex;
			gap: 20rpx;
			box-sizing: border-box;
			width: 100%;

			button {
				flex: 1;
				font-size: 28rpx;
				padding: 20rpx 0;
				border-radius: 8rpx;

				&:active {
					opacity: 0.8;
				}
			}

			.add-btn {
				background-color: #1677ff;
				color: #fff;
			}

			.clear-btn {
				background-color: #ff4d4f;
				color: #fff;
			}
		}
	}

	// 弹窗样式
	.dialog-content {
		padding: 20rpx;

		.input-item {
			display: flex;
			align-items: center;
			margin-bottom: 24rpx;

			.label {
				font-size: 28rpx;
				color: #333;
				margin-right: 20rpx;
			}

			.input {
				flex: 1;

				:deep(.uni-easyinput__content) {
					background-color: #f8f8f8;
					border-radius: 8rpx;
					height: 80rpx;

					.uni-easyinput__content-input {
						font-size: 28rpx;
					}
				}
			}
		}
	}
}
</style>
