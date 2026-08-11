<template>
	<view class="page">
		<view class="panel">
			<view class="section-header">
				<text class="section-title">开奖号码</text>
				<view class="header-actions">
					<text class="text-btn" @click="fetchLatestDraw">最新开奖</text>
					<text class="text-btn" @click="toggleDrawFilter">日期筛选</text>
				</view>
			</view>
			<view v-if="showDrawFilter" class="draw-filter">
				<picker
					mode="selector"
					:range="drawDateOptions"
					range-key="label"
					:value="selectedDrawDateIndex"
					@change="onDrawDateChange">
					<view class="date-picker">
						<text>开奖日期</text>
						<text>{{ selectedDrawDateLabel }}</text>
					</view>
				</picker>
			</view>
			<view v-if="selectedDraw" class="selected-draw">
				<view class="draw-meta">
					<text>{{ selectedDraw.issue }}期</text>
					<text>{{ selectedDraw.date }}</text>
				</view>
				<view class="balls-row">
					<text
						v-for="red in selectedDraw.numbers.reds"
						:key="red"
						class="ball red-ball">
						{{ formatBall(red) }}
					</text>
					<text class="ball blue-ball">
						{{ formatBall(selectedDraw.numbers.blue) }}
					</text>
				</view>
			</view>
		</view>

		<view class="panel">
			<view class="section-header">
				<text class="section-title">投注号码</text>
				<view class="header-actions">
					<text v-if="ticketInput" class="text-btn" @click="clearTickets">清空</text>
					<text class="text-btn" @click="recognizeTicketImage">拍照识别</text>
					<text class="text-btn" @click="scanTicketQrCode">扫票面码</text>
					<text class="text-btn" @click="pasteTickets">粘贴</text>
				</view>
			</view>
			<textarea
				v-model="ticketInput"
				class="textarea tickets"
				maxlength="-1"
				placeholder="每行一注，例如：01 03 05 07 09 11 + 16"
				placeholder-style="color: #999" />
			<view v-if="lastScanResult" class="scan-result">
				<view class="scan-result-header">
					<text>扫码原始结果</text>
					<text class="text-btn" @click="copyScanResult">复制</text>
				</view>
				<text class="scan-result-text">{{ lastScanResult }}</text>
			</view>
			<view v-if="ticketIssue" class="ticket-issue">
				<text>票面开奖期</text>
				<text>{{ ticketIssueLabel }}</text>
			</view>
		</view>

		<view class="option-panel">
			<view>
				<text class="option-title">福运奖模式</text>
				<text class="option-desc">仅在当期执行特别规定时开启</text>
			</view>
			<switch
				:checked="enableFortunePrize"
				color="#1677ff"
				@change="onFortunePrizeChange" />
		</view>

		<button class="primary-btn" :disabled="checking" @click="runCheck">
			{{ checking ? '查询中...' : '查询中奖结果' }}
		</button>

		<view v-if="summary.total > 0" class="result-summary">
			<view :class="{ winning: summary.winning > 0 }" class="summary-status">
				{{ summary.winning > 0 ? `中奖 ${summary.winning} 注` : '未中奖' }}
			</view>
		</view>

		<view v-if="results.length > 0" class="result-list">
			<view
				v-for="result in results"
				:key="result.index"
				class="result-card"
				:class="{ hit: result.level !== 'none' }">
				<view class="result-main">
					<text class="ticket-index">第{{ result.index + 1 }}注</text>
					<text class="ticket-number">{{ formatNumbers(result.ticket) }}</text>
				</view>
				<view class="result-info">
					<view class="prize-badge" :class="result.level">
						{{ result.level === 'none' ? '未中奖' : `中奖 ${result.levelName}` }}
					</view>
				</view>
			</view>
		</view>

		<view class="rules-panel">
			<view class="section-header">
				<text class="section-title">奖级规则</text>
			</view>
			<view class="rule-row">
				<text>一等奖</text>
				<text>6红 + 蓝</text>
			</view>
			<view class="rule-row">
				<text>二等奖</text>
				<text>6红</text>
			</view>
			<view class="rule-row">
				<text>三等奖</text>
				<text>5红 + 蓝，3000元</text>
			</view>
			<view class="rule-row">
				<text>四等奖</text>
				<text>5红 / 4红+蓝，200元</text>
			</view>
			<view class="rule-row">
				<text>五等奖</text>
				<text>4红 / 3红+蓝，10元</text>
			</view>
			<view class="rule-row">
				<text>六等奖</text>
				<text>中蓝球，5元</text>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
	createOcrEnv,
	recognizeImageText,
	resolveOcrProvider,
} from '../../../utils/ocr'
import {
	buildCwlDrawNoticeUrl,
	checkTicket,
	formatBall,
	formatNumbers,
	parseDrawNotice,
	parseTicketBetCount,
	parseTicketIssue,
	parseTicketsFromQrText,
	parseTicketLines,
	summarizeResults,
	type CheckResult,
	type CwlDrawNotice,
	type DrawInfo,
} from './utils/check'

const ticketInput = ref('')
const ticketIssue = ref('')
const ticketIssueDrawn = ref(true)
const ticketIssueBlockMessage = ref('')
const lastScanResult = ref('')
const recognizingImage = ref(false)
const drawLoading = ref(false)
const drawDateFilterReady = ref(false)
const drawList = ref<DrawInfo[]>([])
const selectedDraw = ref<DrawInfo | null>(null)
const showDrawFilter = ref(false)
const selectedDrawDateIndex = ref(0)
const enableFortunePrize = ref(false)
const checking = ref(false)
const results = ref<CheckResult[]>([])
const summary = ref({
	total: 0,
	winning: 0,
	fixedPrize: 0,
	floating: 0,
})

const getErrorMessage = (error: unknown, fallback: string) => {
	return error instanceof Error ? error.message : fallback
}

const readEnv = (key: string): string => {
	return typeof process !== 'undefined'
		? (process.env[key] as string | undefined) || ''
		: ''
}
const ocrEnv = createOcrEnv(readEnv)
const ocrReady = computed(() => Boolean(resolveOcrProvider(ocrEnv)))

const drawDateOptions = computed(() =>
	drawList.value.map((draw) => ({
		label: `${draw.date} ${draw.issue}期`,
		value: draw.issue,
	}))
)

const selectedDrawDateLabel = computed(() => {
	return drawDateOptions.value[selectedDrawDateIndex.value]?.label || '暂无开奖日期'
})

const ticketIssueLabel = computed(() => {
	if (!ticketIssue.value) return ''
	return ticketIssueDrawn.value
		? `${ticketIssue.value}期`
		: `${ticketIssue.value}期（${ticketIssueBlockMessage.value || '未开奖'}）`
})

const appendTicketLines = (lines: string[]) => {
	const nextText = lines.join('\n')
	ticketInput.value = ticketInput.value ? `${ticketInput.value}\n${nextText}` : nextText
	resetResults()
}

const setTicketIssue = (issue: string, drawn = true, blockMessage = '') => {
	ticketIssue.value = issue
	ticketIssueDrawn.value = drawn
	ticketIssueBlockMessage.value = blockMessage
	resetResults()
}

const requestDrawNotices = (url: string) => {
	return new Promise<CwlDrawNotice[]>((resolve, reject) => {
		uni.request({
			url,
			method: 'GET',
			timeout: 10000,
			success: (response) => {
				const data = response.data as { result?: CwlDrawNotice[]; message?: string }
				if (response.statusCode === 200 && Array.isArray(data.result)) {
					resolve(data.result)
				} else {
					reject(new Error(data.message || '获取开奖数据失败'))
				}
			},
			fail: (error) => reject(error),
		})
	})
}

const applyDrawList = (notices: CwlDrawNotice[]) => {
	drawList.value = notices.map(parseDrawNotice)
	if (drawList.value.length === 0) {
		throw new Error('未查询到开奖数据')
	}
	selectDraw(drawList.value[0])
}

const applyIssueDraw = (notice: CwlDrawNotice) => {
	const draw = parseDrawNotice(notice)
	drawList.value = [draw]
	selectDraw(draw)
}

const selectDraw = (draw: DrawInfo) => {
	selectedDraw.value = draw
	const nextIndex = drawList.value.findIndex((item) => item.issue === draw.issue)
	selectedDrawDateIndex.value = nextIndex > -1 ? nextIndex : 0
	resetResults()
}

const fetchDraws = async (url: string) => {
	if (drawLoading.value) return
	drawLoading.value = true
	uni.showLoading({
		title: '获取开奖中...',
		mask: true,
	})

	try {
		const notices = await requestDrawNotices(url)
		applyDrawList(notices)
		uni.showToast({
			title: '开奖已更新',
			icon: 'success',
		})
	} catch (error) {
		uni.showToast({
			title: getErrorMessage(error, '获取开奖失败'),
			icon: 'none',
		})
	} finally {
		drawLoading.value = false
		uni.hideLoading()
	}
}

const fetchLatestDraw = () => {
	fetchDraws(buildCwlDrawNoticeUrl({ issueCount: 1, pageSize: 1 }))
}

const fetchDrawByIssue = async (issue: string) => {
	drawLoading.value = true
	uni.showLoading({
		title: '获取开奖中...',
		mask: true,
	})

	try {
		const notices = await requestDrawNotices(
			buildCwlDrawNoticeUrl({
				issueStart: issue,
				issueEnd: issue,
				pageSize: 1,
			})
		)
		const notice = notices.find((item) => String(item.code || '') === issue)

		if (!notice) {
			selectedDraw.value = null
			drawList.value = []
			selectedDrawDateIndex.value = 0
			setTicketIssue(issue, false, '该期未开奖')
			uni.showToast({
				title: '该期未开奖',
				icon: 'none',
			})
			return false
		}

		applyIssueDraw(notice)
		setTicketIssue(issue, true)
		return true
	} catch (error) {
		selectedDraw.value = null
		drawList.value = []
		selectedDrawDateIndex.value = 0
		setTicketIssue(issue, false, '开奖查询失败')
		uni.showToast({
			title: getErrorMessage(error, '获取开奖失败'),
			icon: 'none',
		})
		return false
	} finally {
		drawLoading.value = false
		uni.hideLoading()
	}
}

const toggleDrawFilter = () => {
	showDrawFilter.value = !showDrawFilter.value
	if (showDrawFilter.value && !drawDateFilterReady.value) {
		drawDateFilterReady.value = true
		fetchDraws(buildCwlDrawNoticeUrl({ issueCount: 30, pageSize: 30 }))
	}
}

const onDrawDateChange = (event: { detail: { value: number } }) => {
	const index = Number(event.detail.value)
	const draw = drawList.value[index]
	if (draw) {
		selectDraw(draw)
	}
}

const resetResults = () => {
	results.value = []
	summary.value = {
		total: 0,
		winning: 0,
		fixedPrize: 0,
		floating: 0,
	}
}

const onFortunePrizeChange = (event: { detail: { value: boolean } }) => {
	enableFortunePrize.value = event.detail.value
	if (results.value.length > 0) {
		runCheck()
	}
}

const clearTickets = () => {
	ticketInput.value = ''
	ticketIssue.value = ''
	ticketIssueDrawn.value = true
	ticketIssueBlockMessage.value = ''
	resetResults()
}

const pasteTickets = () => {
	uni.getClipboardData({
		success: (res) => {
			if (res.data) {
				ticketInput.value = res.data
				resetResults()
				uni.showToast({
					title: '粘贴成功',
					icon: 'success',
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

const chooseTicketImage = () => {
	return new Promise<string>((resolve, reject) => {
		uni.chooseImage({
			count: 1,
			sizeType: ['original'],
			sourceType: ['camera', 'album'],
			success: (res) => {
				const imagePath = res.tempFilePaths[0]
				if (imagePath) {
					resolve(imagePath)
				} else {
					reject(new Error('未选择图片'))
				}
			},
			fail: (error) => reject(error),
		})
	})
}

const recognizeTicketImage = async () => {
	if (recognizingImage.value) return
	if (!ocrReady.value) {
		uni.showToast({
			title: 'OCR 服务未配置',
			icon: 'none',
		})
		return
	}

	recognizingImage.value = true
	uni.showLoading({
		title: '识别票面中...',
		mask: true,
	})

	try {
		const imagePath = await chooseTicketImage()
		const text = await recognizeImageText({
			env: ocrEnv,
			imagePath,
			feature: 'lottery-ticket',
		})
		const issue = parseTicketIssue(text)
		const betCount = parseTicketBetCount(text)
		const tickets = parseTicketsFromQrText(text)

		if (issue) {
			await fetchDrawByIssue(issue)
		}

		if (tickets.length === 0) {
			throw new Error('未识别到双色球号码')
		}

		appendTicketLines(tickets.map(formatNumbers))
		if (betCount > 0 && tickets.length < betCount) {
			uni.showModal({
				title: '请核对票面',
				content: `票面共${betCount}注，本次识别到${tickets.length}注，请手动补充缺失号码后再查询。`,
				showCancel: false,
			})
		} else {
			uni.showToast({
				title: `已识别${tickets.length}注`,
				icon: 'success',
			})
		}
	} catch (error) {
		uni.showToast({
			title: getErrorMessage(error, '票面识别失败'),
			icon: 'none',
		})
	} finally {
		recognizingImage.value = false
		uni.hideLoading()
	}
}

const scanTicketQrCode = () => {
	uni.scanCode({
		scanType: ['qrCode'],
		success: (detail) => {
			const code = detail.result || detail.path || ''
			lastScanResult.value = code
			const tickets = parseTicketsFromQrText(code)

			if (tickets.length === 0) {
				uni.showToast({
					title: '二维码未包含可识别号码',
					icon: 'none',
				})
				return
			}

			appendTicketLines(tickets.map(formatNumbers))
			uni.showToast({
				title: `已识别${tickets.length}注`,
				icon: 'success',
			})
		},
		fail: () => {
			uni.showToast({
				title: '扫码失败',
				icon: 'none',
			})
		},
	})
}

const copyScanResult = () => {
	if (!lastScanResult.value) return

	uni.setClipboardData({
		data: lastScanResult.value,
		success: () => {
			uni.showToast({
				title: '已复制扫码结果',
				icon: 'success',
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

const runCheck = () => {
	if (checking.value) return
	checking.value = true

	try {
		if (ticketIssue.value && !ticketIssueDrawn.value) {
			throw new Error(ticketIssueBlockMessage.value || '该期未开奖')
		}

		if (!selectedDraw.value) {
			throw new Error('请先选择开奖号码')
		}

		if (ticketIssue.value && selectedDraw.value.issue !== ticketIssue.value) {
			throw new Error('开奖号码与票面开奖期不一致')
		}

		const draw = selectedDraw.value.numbers
		const tickets = parseTicketLines(ticketInput.value)

		if (tickets.length === 0) {
			throw new Error('请输入投注号码')
		}

		results.value = tickets.map((ticket, index) =>
			checkTicket(draw, ticket, index, enableFortunePrize.value)
		)
		summary.value = summarizeResults(results.value)

		uni.showToast({
			title: summary.value.winning > 0 ? '查询完成' : '未中奖',
			icon: summary.value.winning > 0 ? 'success' : 'none',
		})
	} catch (error) {
		resetResults()
		uni.showToast({
			title: getErrorMessage(error, '查询失败'),
			icon: 'none',
		})
	} finally {
		checking.value = false
	}
}

onMounted(() => {
	fetchLatestDraw()
})
</script>

<style scoped lang="scss">
.page {
	min-height: 100vh;
	padding: 24rpx;
	background: linear-gradient(to bottom, #f8f9fa 0%, #f5f5f5 100%);
}

.panel,
.rules-panel,
.option-panel {
	background: #fff;
	border-radius: 16rpx;
	padding: 24rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.section-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16rpx;
}

.section-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
}

.section-tip {
	font-size: 24rpx;
	color: #999;
}

.header-actions {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.text-btn {
	font-size: 26rpx;
	color: #1677ff;
}

.draw-filter {
	margin-bottom: 16rpx;
}

.date-picker {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12rpx;
	padding: 18rpx 20rpx;
	border-radius: 12rpx;
	background: #fafafa;
	font-size: 26rpx;
	color: #333;
}

.selected-draw {
	margin-bottom: 16rpx;
	padding: 24rpx 20rpx;
	border-radius: 12rpx;
	background: #fff1f0;
}

.draw-meta {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20rpx;
	font-size: 26rpx;
	color: #8c1d18;
}

.balls-row {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 10rpx;
}

.ball {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	color: #fff;
	font-weight: 700;
}

.ball {
	width: 64rpx;
	height: 64rpx;
	font-size: 28rpx;
}

.red-ball {
	background: #e53935;
}

.blue-ball {
	background: #1677ff;
}

.textarea {
	width: 100%;
	box-sizing: border-box;
	background: #fafafa;
	border-radius: 12rpx;
	padding: 20rpx;
	font-size: 28rpx;
	line-height: 1.6;
	color: #333;
}

.single {
	height: 130rpx;
}

.tickets {
	min-height: 300rpx;
}

.scan-result {
	margin-top: 16rpx;
	padding: 18rpx 20rpx;
	border-radius: 12rpx;
	background: #fafafa;
}

.scan-result-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 12rpx;
	font-size: 26rpx;
	color: #333;
	font-weight: 600;
}

.scan-result-text {
	display: block;
	font-size: 24rpx;
	color: #666;
	line-height: 1.5;
	word-break: break-all;
	white-space: pre-wrap;
}

.ticket-issue {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16rpx;
	margin-top: 16rpx;
	padding: 18rpx 20rpx;
	border-radius: 12rpx;
	background: #fff7e6;
	font-size: 26rpx;
	color: #8c4a00;
}

.option-panel {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.option-title {
	display: block;
	font-size: 30rpx;
	font-weight: 600;
	color: #333;
}

.option-desc {
	display: block;
	margin-top: 8rpx;
	font-size: 24rpx;
	color: #999;
}

.primary-btn {
	width: 100%;
	height: 88rpx;
	margin-bottom: 24rpx;
	border-radius: 16rpx;
	background: linear-gradient(135deg, #e53935 0%, #b71c1c 100%);
	color: #fff;
	font-size: 30rpx;
	font-weight: 600;
	line-height: 88rpx;
}

.result-summary {
	margin-bottom: 24rpx;
}

.summary-status {
	background: #fff;
	border-radius: 16rpx;
	padding: 28rpx;
	text-align: center;
	color: #666;
	font-size: 32rpx;
	font-weight: 700;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.summary-status.winning {
	background: #fff1f0;
	color: #cf1322;
}

.result-list {
	margin-bottom: 24rpx;
}

.result-card {
	background: #fff;
	border-radius: 16rpx;
	padding: 24rpx;
	margin-bottom: 16rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
	border-left: 8rpx solid #d9d9d9;
}

.result-card.hit {
	border-left-color: #e53935;
}

.result-main {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16rpx;
	margin-bottom: 16rpx;
}

.ticket-index {
	font-size: 26rpx;
	color: #666;
	white-space: nowrap;
}

.ticket-number {
	flex: 1;
	text-align: right;
	font-size: 28rpx;
	font-weight: 600;
	color: #333;
}

.result-info {
	display: flex;
	align-items: center;
	justify-content: flex-end;
}

.prize-badge {
	padding: 10rpx 18rpx;
	border-radius: 999rpx;
	background: #f5f5f5;
	color: #666;
	font-size: 26rpx;
	font-weight: 600;
	white-space: nowrap;
}

.prize-badge.first,
.prize-badge.second,
.prize-badge.third,
.prize-badge.fourth,
.prize-badge.fifth,
.prize-badge.sixth,
.prize-badge.fortune {
	background: #fff1f0;
	color: #cf1322;
}

.rule-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 18rpx 0;
	border-bottom: 1rpx solid #f0f0f0;
	font-size: 26rpx;
	color: #333;
}

.rule-row:last-child {
	border-bottom: none;
}
</style>
