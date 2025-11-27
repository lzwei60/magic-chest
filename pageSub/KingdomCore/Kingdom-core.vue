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
				<text class="tab-icon">{{ tab.icon }}</text>
				<text class="tab-name">{{ tab.name }}</text>
			</view>
		</view>

		<!-- 门禁页面 -->
		<view v-if="currentTab === 0" class="access-content">
			<!-- 统计信息 -->
			<view class="stats-card">
				<view class="stat-item">
					<text class="stat-value">{{ cardList.length }}</text>
					<text class="stat-label">门卡总数</text>
				</view>
				<view class="stat-item">
					<text class="stat-value">{{ selectedCard ? '✓' : '✗' }}</text>
					<text class="stat-label">当前状态</text>
				</view>
				<view class="stat-item">
					<text class="stat-value">{{
						autoRefreshEnabled ? 'ON' : 'OFF'
					}}</text>
					<text class="stat-label">自动刷新</text>
				</view>
			</view>

			<!-- 二维码卡片 -->
			<view class="qrcode-card">
				<view v-if="!selectedCard" class="empty-qrcode">
					<text class="empty-icon">📷</text>
					<text class="empty-text">请先添加并选择门卡</text>
					<text class="empty-hint">切换到"设置"页面添加门卡</text>
				</view>
				<view v-else class="qrcode-wrapper">
					<view class="qrcode-header">
						<text class="qrcode-title">{{ getCurrentCardName() }}</text>
						<view class="qrcode-status" :class="{ valid: isQRCodeValid }">
							<view class="status-dot"></view>
							<text class="status-text">
								{{ isQRCodeValid ? `有效期 ${countdown}s` : '已过期' }}
							</text>
						</view>
					</view>
					<view class="qrcode-box">
						<canvas
							canvas-id="qrcode"
							:style="{ width: qrCodeSize + 'px', height: qrCodeSize + 'px' }"
							class="qrcode-canvas"></canvas>
					</view>
					<view class="qrcode-actions">
						<button class="action-btn refresh-btn" @click="refreshQRCode">
							<text class="btn-icon">🔄</text>
							<text>刷新二维码</text>
						</button>
						<view
							class="action-btn toggle-btn"
							:class="{ active: autoRefreshEnabled }"
							@click="toggleAutoRefresh">
							<text class="btn-icon">⏱️</text>
							<text>{{
								autoRefreshEnabled ? '停止自动刷新' : '开启自动刷新'
							}}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 门卡选择 -->
			<view class="card-select-card">
				<view class="select-label">选择门卡</view>
				<view class="select-box">
					<uni-data-select
						v-model="selectedCard"
						:localdata="cardList"
						placeholder="请选择门卡"
						@change="handleCardChange" />
				</view>
			</view>
		</view>

		<!-- 设置页面 -->
		<view v-else class="settings-content">
			<scroll-view
				scroll-y
				class="card-list"
				:style="{ height: scrollHeight + 'px' }">
				<!-- 空状态 -->
				<view v-if="cardList.length === 0" class="empty-state">
					<text class="empty-icon">🔑</text>
					<text class="empty-text">还没有门卡</text>
					<text class="empty-hint">点击下方按钮添加第一个门卡</text>
				</view>

				<!-- 门卡列表 -->
				<view
					v-for="(item, index) in cardList"
					:key="item.value"
					class="card-item"
					:class="{ active: isCardSelected(item.value) }"
					@click="handleCardSelect(item)"
					@longpress="handleCardLongPress(item)">
					<view class="card-left">
						<view class="card-icon-wrapper">
							<text class="card-icon">🔐</text>
							<view v-if="isCardSelected(item.value)" class="selected-badge"
								>✓</view
							>
						</view>
						<view class="card-info">
							<text class="card-remark">{{ item.text }}</text>
							<text class="card-number">{{
								formatCardNumber(item.value)
							}}</text>
							<text v-if="item.createdAt" class="card-time">
								添加于 {{ formatDate(item.createdAt) }}
							</text>
						</view>
					</view>
					<view class="card-actions">
						<view
							class="card-action-btn edit-btn"
							@click.stop="handleEdit(item, index)">
							<text>✏️</text>
						</view>
						<view
							class="card-action-btn delete-btn"
							@click.stop="handleDelete(item)">
							<text>🗑️</text>
						</view>
					</view>
				</view>
			</scroll-view>

			<!-- 底部按钮 -->
			<view class="bottom-btns">
				<button class="add-btn" @click="showAddDialog">
					<text class="btn-icon">➕</text>
					<text>添加门卡</text>
				</button>
				<button
					v-if="cardList.length > 0"
					class="clear-btn"
					@click="handleClear">
					<text class="btn-icon">🗑️</text>
					<text>清空所有</text>
				</button>
			</view>
		</view>

		<!-- 添加/编辑卡号弹窗 -->
		<uni-popup ref="addPopup" type="dialog">
			<uni-popup-dialog
				:title="isEditing ? '编辑门卡' : '添加门卡'"
				:before-close="true"
				@confirm="handleAdd"
				@close="closeDialog">
				<view class="dialog-content">
					<view class="input-item">
						<text class="label">备注：</text>
						<uni-easyinput
							v-model="newCard.remark"
							placeholder="请输入备注（如：办公室门卡）"
							:clearable="true"
							maxlength="20"
							class="input" />
					</view>
					<view class="input-item">
						<text class="label">卡号：</text>
						<uni-easyinput
							v-model="newCard.number"
							placeholder="请输入卡号或扫码识别"
							:clearable="true"
							class="input" />
						<view class="scan-btn" @click="scanQrCode">
							<text class="scan-icon">📷</text>
						</view>
					</view>
					<view v-if="newCard.number" class="card-preview">
						<text class="preview-label">卡号预览：</text>
						<text class="preview-value">{{
							formatCardNumber(newCard.number)
						}}</text>
					</view>
				</view>
			</uni-popup-dialog>
		</uni-popup>
	</view>
</template>

<script setup>
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import UQRCode from '@/uni_modules/Sansnn-uQRCode/js_sdk/uqrcode/uqrcode.js'
import { DooerCodec } from './utils/core.ts'

// 标签页配置
const tabs = [
	{ key: 'access', name: '门禁', icon: '🚪' },
	{ key: 'settings', name: '设置', icon: '⚙️' },
]
const currentTab = ref(0)

// 门卡数据
const cardList = ref([])
const selectedCard = ref('')
const newCard = ref({ remark: '', number: '' })
const editingIndex = ref(-1)
const isEditing = ref(false)

// 弹窗引用
const addPopup = ref(null)

// 二维码相关
const qrCodeSize = ref(300)
const isQRCodeValid = ref(true)
const countdown = ref(0)
const autoRefreshEnabled = ref(false)
let qrCodeTimer = null
let refreshTimer = null
const QR_CODE_VALID_DURATION = 60 // 二维码有效期60秒

// 计算滚动区域高度
const scrollHeight = computed(() => {
	const systemInfo = uni.getSystemInfoSync()
	return systemInfo.windowHeight - 160
})

// 检查门卡是否被选中
const isCardSelected = (cardValue) => {
	return String(selectedCard.value || '') === String(cardValue || '')
}

// 获取当前门卡名称
const getCurrentCardName = () => {
	const selectedStr = String(selectedCard.value || '')
	const card = cardList.value.find((c) => String(c.value || '') === selectedStr)
	return card ? card.text : '未知门卡'
}

// 格式化卡号显示（中间隐藏）
const formatCardNumber = (number) => {
	if (!number && number !== 0) return ''
	// 确保转换为字符串
	const numStr = String(number)
	if (numStr.length <= 8) return numStr
	return numStr.substring(0, 4) + '****' + numStr.substring(numStr.length - 4)
}

// 格式化日期
const formatDate = (timestamp) => {
	if (!timestamp) return ''
	const date = new Date(timestamp)
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

// 切换标签页
const handleTabChange = (index) => {
	currentTab.value = index
	if (index === 0 && selectedCard.value) {
		// 切换到门禁页面时，如果有选中卡号则生成二维码
		generateQRCode()
		// 如果开启了自动刷新，重新启动
		if (autoRefreshEnabled.value) {
			startAutoRefresh()
		}
	} else {
		// 切换到设置页面时，停止自动刷新
		stopAutoRefresh()
	}
}

// 生成二维码
const generateQRCode = async () => {
	if (!selectedCard.value) {
		isQRCodeValid.value = false
		countdown.value = 0
		return
	}

	try {
		// 确保卡号为字符串类型
		const cardid = String(selectedCard.value || '')
		const currentTime = Date.now()
		const codec = new DooerCodec()
		const encryptedHex = codec.showLocalQrcode(cardid, currentTime)

		const qr = new UQRCode()
		qr.data = encryptedHex
		qr.size = qrCodeSize.value
		await qr.make()
		const canvasContext = uni.createCanvasContext('qrcode')
		qr.canvasContext = canvasContext
		qr.drawCanvas()

		// 重置倒计时
		isQRCodeValid.value = true
		countdown.value = QR_CODE_VALID_DURATION
		startCountdown()

		console.log('二维码生成成功:', encryptedHex)
	} catch (err) {
		console.error('生成二维码失败:', err)
		uni.showToast({
			title: '生成失败，请重试',
			icon: 'none',
			duration: 2000,
		})
		isQRCodeValid.value = false
	}
}

// 开始倒计时
const startCountdown = () => {
	if (qrCodeTimer) {
		clearInterval(qrCodeTimer)
	}

	qrCodeTimer = setInterval(() => {
		if (countdown.value > 0) {
			countdown.value--
		} else {
			isQRCodeValid.value = false
			clearInterval(qrCodeTimer)
			qrCodeTimer = null
			// 如果开启了自动刷新，则自动刷新
			if (autoRefreshEnabled.value) {
				generateQRCode()
			}
		}
	}, 1000)
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
	uni.vibrateShort({ fail: () => {} })
}

// 切换自动刷新
const toggleAutoRefresh = () => {
	autoRefreshEnabled.value = !autoRefreshEnabled.value
	if (autoRefreshEnabled.value) {
		startAutoRefresh()
		uni.showToast({
			title: '已开启自动刷新',
			icon: 'success',
		})
	} else {
		stopAutoRefresh()
		uni.showToast({
			title: '已关闭自动刷新',
			icon: 'none',
		})
	}
	saveAutoRefreshSetting()
}

// 开始自动刷新
const startAutoRefresh = () => {
	if (refreshTimer) return

	refreshTimer = setInterval(() => {
		if (selectedCard.value && currentTab.value === 0) {
			generateQRCode()
		}
	}, QR_CODE_VALID_DURATION * 1000)
}

// 停止自动刷新
const stopAutoRefresh = () => {
	if (refreshTimer) {
		clearInterval(refreshTimer)
		refreshTimer = null
	}
}

// 选择门卡变化
const handleCardChange = () => {
	// 确保选中卡号为字符串
	if (selectedCard.value) {
		selectedCard.value = String(selectedCard.value)
	}
	saveSelectedCard()
	generateQRCode()
}

// 选择门卡
const handleCardSelect = (item) => {
	selectedCard.value = String(item.value || '')
	saveSelectedCard()
	generateQRCode()
	// 切换到门禁页面
	currentTab.value = 0
}

// 长按门卡
const handleCardLongPress = (item) => {
	uni.vibrateShort({ fail: () => {} })
	uni.showActionSheet({
		itemList: ['编辑', '删除', '设为当前'],
		success: (res) => {
			if (res.tapIndex === 0) {
				const itemValueStr = String(item.value || '')
				handleEdit(
					item,
					cardList.value.findIndex(
						(c) => String(c.value || '') === itemValueStr
					)
				)
			} else if (res.tapIndex === 1) {
				handleDelete(item)
			} else if (res.tapIndex === 2) {
				handleCardSelect(item)
			}
		},
	})
}

// 编辑门卡
const handleEdit = (item, index) => {
	isEditing.value = true
	editingIndex.value = index
	newCard.value = {
		remark: item.text || '',
		number: String(item.value || ''),
	}
	addPopup.value.open()
}

// 保存选中的卡号
const saveSelectedCard = () => {
	uni.setStorageSync('selectedCard', selectedCard.value)
}

// 保存自动刷新设置
const saveAutoRefreshSetting = () => {
	uni.setStorageSync('autoRefreshEnabled', autoRefreshEnabled.value)
}

// 加载自动刷新设置
const loadAutoRefreshSetting = () => {
	const saved = uni.getStorageSync('autoRefreshEnabled')
	if (saved !== null && saved !== undefined) {
		autoRefreshEnabled.value = saved
		if (autoRefreshEnabled.value) {
			startAutoRefresh()
		}
	}
}

// 显示添加弹窗
const showAddDialog = () => {
	isEditing.value = false
	editingIndex.value = -1
	newCard.value = { remark: '', number: '' }
	addPopup.value.open()
}

// 关闭弹窗
const closeDialog = () => {
	isEditing.value = false
	editingIndex.value = -1
	newCard.value = { remark: '', number: '' }
	addPopup.value.close()
}

// 添加/编辑门卡
const handleAdd = () => {
	const remark = newCard.value.remark?.trim()

	if (!remark) {
		uni.showToast({
			title: '请输入备注',
			icon: 'none',
		})
		return false // 阻止关闭弹窗
	}

	// 获取卡号并确保为字符串类型
	const rawNumber = newCard.value.number
	if (!rawNumber && rawNumber !== 0) {
		uni.showToast({
			title: '请输入卡号',
			icon: 'none',
		})
		return false
	}

	// 确保卡号为字符串类型
	const cardNumber = String(rawNumber).trim()

	// 验证卡号格式（根据实际需求调整）
	if (cardNumber.length < 4) {
		uni.showToast({
			title: '卡号长度至少4位',
			icon: 'none',
		})
		return false
	}

	if (isEditing.value && editingIndex.value >= 0) {
		// 编辑模式
		const existingCard = cardList.value[editingIndex.value]
		// 确保现有卡号也是字符串类型进行比较
		const existingCardNumber = String(existingCard.value || '')
		const isNumberChanged = existingCardNumber !== cardNumber

		// 检查卡号是否与其他门卡重复
		if (
			isNumberChanged &&
			cardList.value.some(
				(c, i) =>
					i !== editingIndex.value && String(c.value || '') === cardNumber
			)
		) {
			uni.showToast({
				title: '该卡号已存在',
				icon: 'none',
			})
			return false
		}

		cardList.value[editingIndex.value] = {
			text: remark,
			value: cardNumber,
			createdAt: existingCard.createdAt || Date.now(),
		}

		// 如果编辑的是当前选中的卡，更新选中状态
		if (String(selectedCard.value || '') === existingCardNumber) {
			selectedCard.value = cardNumber
			saveSelectedCard()
			generateQRCode()
		}

		uni.showToast({
			title: '编辑成功',
			icon: 'success',
		})
	} else {
		// 添加模式
		// 检查是否重复（统一转换为字符串比较）
		if (
			cardList.value.some((item) => String(item.value || '') === cardNumber)
		) {
			uni.showToast({
				title: '该卡号已存在',
				icon: 'none',
			})
			return false
		}

		const newItem = {
			text: remark,
			value: cardNumber,
			createdAt: Date.now(),
		}
		cardList.value.push(newItem)

		// 如果是第一张卡，则自动选中
		if (cardList.value.length === 1) {
			selectedCard.value = newItem.value
			saveSelectedCard()
			generateQRCode()
		}

		uni.showToast({
			title: '添加成功',
			icon: 'success',
		})
	}

	saveCardList()
	closeDialog()
	return true
}

// 删除门卡
const handleDelete = (item) => {
	if (cardList.value.length === 1) {
		uni.showModal({
			title: '提示',
			content: '这是最后一张门卡，删除后将无法使用门禁功能。确定删除吗？',
			success: (res) => {
				if (res.confirm) {
					performDelete(item)
				}
			},
		})
	} else {
		uni.showModal({
			title: '删除门卡',
			content: `确定要删除"${item.text}"吗？`,
			success: (res) => {
				if (res.confirm) {
					performDelete(item)
				}
			},
		})
	}
}

// 执行删除
const performDelete = (item) => {
	const itemValueStr = String(item.value || '')
	const index = cardList.value.findIndex(
		(card) => String(card.value || '') === itemValueStr
	)
	if (index === -1) return

	const selectedStr = String(selectedCard.value || '')
	const isDeletingSelected = selectedStr === itemValueStr

	cardList.value.splice(index, 1)
	saveCardList()

	// 如果删除的是当前选中的卡
	if (isDeletingSelected) {
		// 如果还有其他卡，选中第一个
		if (cardList.value.length > 0) {
			selectedCard.value = String(cardList.value[0].value || '')
			saveSelectedCard()
			generateQRCode()
		} else {
			selectedCard.value = ''
			saveSelectedCard()
			// 清空二维码相关状态
			if (qrCodeTimer) {
				clearInterval(qrCodeTimer)
				qrCodeTimer = null
			}
			isQRCodeValid.value = false
			countdown.value = 0
			stopAutoRefresh()
		}
	}

	uni.showToast({
		title: '删除成功',
		icon: 'success',
	})
}

// 清空缓存
const handleClear = () => {
	if (cardList.value.length === 0) {
		return
	}

	uni.showModal({
		title: '清空所有门卡',
		content: '确定要清空所有门卡吗？此操作不可恢复！',
		confirmText: '确定清空',
		confirmColor: '#ff4d4f',
		success: (res) => {
			if (res.confirm) {
				cardList.value = []
				selectedCard.value = ''
				saveCardList()
				saveSelectedCard()
				// 清空二维码
				if (qrCodeTimer) {
					clearInterval(qrCodeTimer)
					qrCodeTimer = null
				}
				isQRCodeValid.value = false
				countdown.value = 0
				uni.showToast({
					title: '已清空',
					icon: 'success',
				})
			}
		},
	})
}

// 保存数据到本地
const saveCardList = () => {
	try {
		uni.setStorageSync('cardList', cardList.value)
	} catch (e) {
		console.error('保存失败:', e)
		uni.showToast({ title: '保存失败', icon: 'none' })
	}
}

// 从本地加载数据
const loadCardList = () => {
	try {
		const list = uni.getStorageSync('cardList')
		if (list && Array.isArray(list)) {
			// 确保所有卡号都是字符串类型
			cardList.value = list.map((item) => ({
				...item,
				value: String(item.value || ''),
			}))
			// 加载保存的选中卡号
			const saved = uni.getStorageSync('selectedCard')
			const savedStr = saved ? String(saved) : ''
			if (
				savedStr &&
				cardList.value.some((item) => String(item.value || '') === savedStr)
			) {
				selectedCard.value = savedStr
			} else if (cardList.value.length > 0) {
				// 如果没有保存的选中卡号或该卡号已不存在，则选中第一个
				selectedCard.value = String(cardList.value[0].value || '')
				saveSelectedCard()
			}
		}
	} catch (e) {
		console.error('加载失败:', e)
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
		scanType: ['qrCode', 'barCode'],
		success(detail) {
			uni.hideLoading()

			const code = detail.result || detail.path || ''
			if (!code) {
				return uni.showToast({
					title: '无效的二维码',
					icon: 'none',
				})
			}

			try {
				const codec = new DooerCodec()
				const data = codec.decodeLocalQrcode(code)
				if (data && data.cardid) {
					const card = String(data.cardid)
					// 检查是否已存在（统一转换为字符串比较）
					if (
						cardList.value.some((item) => String(item.value || '') === card)
					) {
						return uni.showToast({
							title: '该门卡已存在',
							icon: 'none',
						})
					}
					newCard.value.number = card
					uni.showToast({
						title: '识别成功',
						icon: 'success',
					})
				} else {
					// 如果不是加密二维码，直接使用扫码结果
					newCard.value.number = String(code)
					uni.showToast({
						title: '已填入卡号',
						icon: 'success',
					})
				}
			} catch (e) {
				console.error('解析二维码失败:', e)
				// 解析失败，直接使用原始结果（确保为字符串）
				newCard.value.number = String(code)
				uni.showToast({
					title: '已填入卡号',
					icon: 'success',
				})
			}
		},
		fail() {
			uni.hideLoading()
			uni.showToast({ title: '扫码失败', icon: 'none' })
		},
	})
}

// 监听选中卡号变化
watch(
	() => selectedCard.value,
	() => {
		if (selectedCard.value && currentTab.value === 0) {
			generateQRCode()
		}
	}
)

// 页面加载时读取数据
onMounted(() => {
	loadCardList()
	loadAutoRefreshSetting()
	if (selectedCard.value) {
		generateQRCode()
	}
})

// 页面卸载时清理定时器
onUnmounted(() => {
	if (qrCodeTimer) {
		clearInterval(qrCodeTimer)
		qrCodeTimer = null
	}
	stopAutoRefresh()
})
</script>

<style lang="scss">
.kingdom-core {
	min-height: 100vh;
	background: linear-gradient(180deg, #f5f7fa 0%, #e8ecf1 100%);

	// 标签页样式
	.tab-box {
		display: flex;
		background-color: #fff;
		padding: 20rpx 30rpx;
		border-bottom: 2rpx solid #eee;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

		.tab-item {
			flex: 1;
			text-align: center;
			padding: 20rpx 0;
			position: relative;
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 8rpx;
			transition: all 0.3s;

			.tab-icon {
				font-size: 40rpx;
			}

			.tab-name {
				font-size: 26rpx;
				color: #666;
			}

			&.active {
				.tab-name {
					color: #1677ff;
					font-weight: 600;
				}

				&::after {
					content: '';
					position: absolute;
					left: 50%;
					bottom: 0;
					transform: translateX(-50%);
					width: 60rpx;
					height: 4rpx;
					background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
					border-radius: 2rpx;
				}
			}
		}
	}

	// 门禁页面样式
	.access-content {
		padding: 30rpx;

		// 统计卡片
		.stats-card {
			display: flex;
			justify-content: space-around;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			border-radius: 20rpx;
			padding: 30rpx 20rpx;
			margin-bottom: 30rpx;
			box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
		}

		.stat-item {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 8rpx;
		}

		.stat-value {
			font-size: 44rpx;
			font-weight: bold;
			color: #fff;
		}

		.stat-label {
			font-size: 24rpx;
			color: rgba(255, 255, 255, 0.9);
		}

		// 二维码卡片
		.qrcode-card {
			background: #fff;
			border-radius: 24rpx;
			padding: 40rpx 30rpx;
			margin-bottom: 30rpx;
			box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
		}

		.empty-qrcode {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			padding: 80rpx 40rpx;
			text-align: center;
		}

		.empty-icon {
			font-size: 120rpx;
			margin-bottom: 20rpx;
		}

		.empty-text {
			font-size: 30rpx;
			color: #666;
			margin-bottom: 10rpx;
			font-weight: 500;
		}

		.empty-hint {
			font-size: 24rpx;
			color: #999;
		}

		.qrcode-wrapper {
			.qrcode-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 30rpx;
			}

			.qrcode-title {
				font-size: 32rpx;
				font-weight: 600;
				color: #333;
			}

			.qrcode-status {
				display: flex;
				align-items: center;
				gap: 8rpx;
				padding: 8rpx 16rpx;
				border-radius: 20rpx;
				background: #fee2e2;

				&.valid {
					background: #dcfce7;

					.status-dot {
						background: #16a34a;
					}

					.status-text {
						color: #16a34a;
					}
				}

				.status-dot {
					width: 12rpx;
					height: 12rpx;
					border-radius: 50%;
					background: #dc2626;
					animation: pulse 1.5s ease-in-out infinite;
				}

				.status-text {
					font-size: 22rpx;
					color: #dc2626;
					font-weight: 500;
				}
			}

			.qrcode-box {
				display: flex;
				justify-content: center;
				align-items: center;
				background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
				border-radius: 20rpx;
				padding: 40rpx;
				margin-bottom: 30rpx;
			}

			.qrcode-canvas {
				background-color: #fff;
				border-radius: 12rpx;
			}

			.qrcode-actions {
				display: flex;
				gap: 16rpx;
			}

			.action-btn {
				flex: 1;
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 8rpx;
				padding: 20rpx;
				border-radius: 12rpx;
				font-size: 26rpx;
				font-weight: 500;
				border: none;
				transition: all 0.3s;
			}

			.refresh-btn {
				background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
				color: #fff;
				box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
			}

			.refresh-btn:active {
				opacity: 0.8;
				transform: scale(0.98);
			}

			.toggle-btn {
				background: #f0f0f0;
				color: #666;
			}

			.toggle-btn.active {
				background: linear-gradient(135deg, #10b981 0%, #059669 100%);
				color: #fff;
			}

			.btn-icon {
				font-size: 28rpx;
			}
		}

		// 门卡选择卡片
		.card-select-card {
			background: #fff;
			border-radius: 20rpx;
			padding: 30rpx;
			box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
		}

		.select-label {
			font-size: 28rpx;
			color: #333;
			font-weight: 500;
			margin-bottom: 20rpx;
		}

		.select-box {
			:deep(.uni-select__input-text) {
				color: #333;
				font-size: 28rpx;
			}

			:deep(.uni-select__input-placeholder) {
				color: #999;
			}
		}
	}

	// 设置页面样式
	.settings-content {
		position: relative;
		height: 100%;
		padding-bottom: 140rpx;

		.card-list {
			padding: 30rpx;
			box-sizing: border-box;
			width: 100%;

			.empty-state {
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				padding: 120rpx 40rpx;
				text-align: center;
			}

			.empty-icon {
				font-size: 120rpx;
				margin-bottom: 30rpx;
			}

			.empty-text {
				font-size: 32rpx;
				color: #666;
				margin-bottom: 10rpx;
				font-weight: 500;
			}

			.empty-hint {
				font-size: 26rpx;
				color: #999;
			}

			.card-item {
				display: flex;
				align-items: center;
				justify-content: space-between;
				background: #fff;
				padding: 30rpx;
				border-radius: 20rpx;
				margin-bottom: 20rpx;
				box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
				position: relative;
				border: 2rpx solid transparent;
				transition: all 0.3s ease;

				&.active {
					border-color: #1677ff;
					background: linear-gradient(135deg, #f0f7ff 0%, #e0f2fe 100%);
				}

				.card-left {
					display: flex;
					align-items: center;
					gap: 24rpx;
					flex: 1;
				}

				.card-icon-wrapper {
					position: relative;
					width: 88rpx;
					height: 88rpx;
					background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
					border-radius: 18rpx;
					display: flex;
					align-items: center;
					justify-content: center;
				}

				.card-icon {
					font-size: 44rpx;
				}

				.selected-badge {
					position: absolute;
					top: -8rpx;
					right: -8rpx;
					width: 32rpx;
					height: 32rpx;
					background: #1677ff;
					border-radius: 50%;
					display: flex;
					align-items: center;
					justify-content: center;
					color: #fff;
					font-size: 20rpx;
					font-weight: bold;
					border: 3rpx solid #fff;
				}

				.card-info {
					flex: 1;
					display: flex;
					flex-direction: column;
					gap: 8rpx;
				}

				.card-remark {
					font-size: 30rpx;
					color: #333;
					font-weight: 500;
				}

				.card-number {
					font-size: 24rpx;
					color: #666;
					font-family: 'Courier New', monospace;
				}

				.card-time {
					font-size: 22rpx;
					color: #999;
				}

				.card-actions {
					display: flex;
					gap: 16rpx;
				}

				.card-action-btn {
					width: 64rpx;
					height: 64rpx;
					border-radius: 12rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 32rpx;
					transition: all 0.3s;
				}

				.edit-btn {
					background: #f0f4ff;
				}

				.edit-btn:active {
					background: #e0e7ff;
					transform: scale(0.95);
				}

				.delete-btn {
					background: #fef2f2;
				}

				.delete-btn:active {
					background: #fee2e2;
					transform: scale(0.95);
				}
			}
		}

		.bottom-btns {
			position: fixed;
			left: 0;
			right: 0;
			bottom: 0;
			padding: 20rpx 30rpx;
			background: #fff;
			box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.08);
			display: flex;
			gap: 20rpx;
			box-sizing: border-box;
			width: 100%;
			z-index: 100;

			button {
				flex: 1;
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 8rpx;
				font-size: 28rpx;
				font-weight: 500;
				padding: 24rpx 0;
				border-radius: 12rpx;
				border: none;
				transition: all 0.3s;
			}

			.btn-icon {
				font-size: 32rpx;
			}

			.add-btn {
				background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
				color: #fff;
				box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
			}

			.add-btn:active {
				opacity: 0.8;
				transform: scale(0.98);
			}

			.clear-btn {
				background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
				color: #fff;
				box-shadow: 0 4rpx 12rpx rgba(239, 68, 68, 0.3);
			}

			.clear-btn:active {
				opacity: 0.8;
				transform: scale(0.98);
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
			gap: 16rpx;

			.label {
				font-size: 28rpx;
				color: #333;
				min-width: 100rpx;
				font-weight: 500;
			}

			.input {
				flex: 1;

				:deep(.uni-easyinput__content) {
					background-color: #f8f9fa;
					border-radius: 12rpx;
					height: 88rpx;
					border: 2rpx solid transparent;
					transition: all 0.3s;

					&:focus-within {
						border-color: #1677ff;
						background-color: #fff;
					}

					.uni-easyinput__content-input {
						font-size: 28rpx;
						color: #333;
					}
				}
			}

			.scan-btn {
				width: 88rpx;
				height: 88rpx;
				background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
				border-radius: 12rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
			}

			.scan-icon {
				font-size: 40rpx;
			}

			.scan-btn:active {
				opacity: 0.8;
				transform: scale(0.95);
			}
		}

		.card-preview {
			margin-top: 20rpx;
			padding: 20rpx;
			background: #f0f9ff;
			border-radius: 12rpx;
			border-left: 4rpx solid #1677ff;
		}

		.preview-label {
			font-size: 24rpx;
			color: #666;
			margin-right: 12rpx;
		}

		.preview-value {
			font-size: 28rpx;
			color: #1677ff;
			font-weight: 600;
			font-family: 'Courier New', monospace;
		}
	}
}

@keyframes pulse {
	0%,
	100% {
		opacity: 1;
	}
	50% {
		opacity: 0.5;
	}
}
</style>
