<template>
	<uni-popup ref="popup" type="center" :show="show" @change="handleChange">
		<view class="popup-box">
			<view class="popup-header">
				<text class="popup-title">差异对比</text>
				<uni-icons
					type="close"
					size="20"
					color="#999"
					@click="close"
					class="close-icon"></uni-icons>
			</view>
			<scroll-view scroll-y class="diff-body">
				<view
					v-for="(l, i) in diff"
					:key="i"
					:class="['diff-line', l.type]">
					<view class="line-marker">
						<text v-if="l.type === 'add'" class="marker add-marker">+</text>
						<text v-else-if="l.type === 'del'" class="marker del-marker">-</text>
						<text v-else class="marker same-marker">=</text>
					</view>
					<text class="line-text">{{ l.text || '(空行)' }}</text>
				</view>
				<view v-if="!diff || diff.length === 0" class="empty-diff">
					<text>暂无差异</text>
				</view>
			</scroll-view>
			<view class="popup-footer">
				<button class="close-btn" @click="close">关闭</button>
			</view>
		</view>
	</uni-popup>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({ show: Boolean, diff: Array })
const emits = defineEmits(['close'])

const popup = ref(null)

watch(
	() => props.show,
	(newVal) => {
		if (newVal && popup.value) {
			popup.value.open()
		} else if (!newVal && popup.value) {
			popup.value.close()
		}
	},
	{ immediate: true }
)

const handleChange = (e) => {
	if (!e.show) {
		close()
	}
}

const close = () => {
	emits('close')
}
</script>

<style scoped lang="scss">
.popup-box {
	width: 680rpx;
	max-width: 90vw;
	background: #fff;
	border-radius: 20rpx;
	overflow: hidden;
	box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.15);
}

.popup-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 30rpx;
	border-bottom: 1rpx solid #f0f0f0;
	background: linear-gradient(135deg, #f8f9fa 0%, #fff 100%);
}

.popup-title {
	font-size: 36rpx;
	font-weight: 600;
	color: #333;
}

.close-icon {
	padding: 8rpx;
	transition: all 0.2s ease;

	&:active {
		transform: scale(0.9);
		opacity: 0.7;
	}
}

.diff-body {
	max-height: 60vh;
	min-height: 200rpx;
	padding: 20rpx;
	background: #fafafa;
}

.diff-line {
	display: flex;
	align-items: flex-start;
	padding: 12rpx 16rpx;
	margin-bottom: 8rpx;
	border-radius: 8rpx;
	transition: all 0.2s ease;
	gap: 12rpx;
}

.line-marker {
	flex-shrink: 0;
	width: 40rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.marker {
	font-size: 24rpx;
	font-weight: 600;
	width: 32rpx;
	height: 32rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 4rpx;

	&.add-marker {
		background: #d1ffd8;
		color: #52c41a;
	}

	&.del-marker {
		background: #ffdada;
		color: #ff4d4f;
	}

	&.same-marker {
		background: #f0f0f0;
		color: #999;
	}
}

.line-text {
	flex: 1;
	font-size: 26rpx;
	line-height: 1.6;
	word-break: break-all;
	color: #333;
}

.diff-line.add {
	background: #f6ffed;
	border-left: 4rpx solid #52c41a;

	.line-text {
		color: #389e0d;
	}
}

.diff-line.del {
	background: #fff1f0;
	border-left: 4rpx solid #ff4d4f;

	.line-text {
		color: #cf1322;
		text-decoration: line-through;
	}
}

.diff-line.same {
	background: #fff;
	border-left: 4rpx solid #d9d9d9;

	.line-text {
		color: #666;
	}
}

.empty-diff {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 60rpx 0;
	color: #999;
	font-size: 28rpx;
}

.popup-footer {
	padding: 24rpx 30rpx;
	border-top: 1rpx solid #f0f0f0;
	background: #fafafa;
}

.close-btn {
	width: 100%;
	height: 80rpx;
	background: linear-gradient(135deg, #1677ff 0%, #0958d9 100%);
	color: #fff;
	border-radius: 12rpx;
	font-size: 30rpx;
	font-weight: 500;
	border: none;
	box-shadow: 0 4rpx 12rpx rgba(22, 119, 255, 0.3);
	transition: all 0.2s ease;

	&:active {
		transform: scale(0.98);
		opacity: 0.9;
	}
}
</style>
