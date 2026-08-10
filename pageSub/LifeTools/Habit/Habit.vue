<template>
	<view class="container">
		<!-- 统计卡片 -->
		<view class="stats-card">
			<view class="stat-item">
				<view class="stat-icon-wrapper">
					<uni-icons type="list" size="24" color="#fff"></uni-icons>
				</view>
				<text class="stat-value">{{ habits.length }}</text>
				<text class="stat-label">总习惯</text>
			</view>
			<view class="stat-item">
				<view class="stat-icon-wrapper">
					<uni-icons type="checkmarkempty" size="24" color="#fff"></uni-icons>
				</view>
				<text class="stat-value">{{ todayCompletedCount }}</text>
				<text class="stat-label">今日完成</text>
			</view>
			<view class="stat-item">
				<view class="stat-icon-wrapper">
					<uni-icons type="star-filled" size="24" color="#fff"></uni-icons>
				</view>
				<text class="stat-value">{{ completionRate }}%</text>
				<text class="stat-label">完成率</text>
			</view>
		</view>

		<!-- 工具栏和添加区域 -->
		<view class="toolbar-section">
			<!-- 排序选择 -->
			<view class="toolbar">
				<picker
					:range="sortOptions"
					:value="sortIndex"
					range-key="label"
					@change="onSortChange">
					<view class="sort-btn">
						<uni-icons type="bars" size="16" color="#1677ff"></uni-icons>
						<text>{{ sortOptions[sortIndex].label }}</text>
						<uni-icons type="bottom" size="12" color="#999"></uni-icons>
					</view>
				</picker>
			</view>

			<!-- 添加习惯输入框 -->
			<view class="add-section">
				<view class="input-wrapper">
					<uni-icons type="plus" size="18" color="#999"></uni-icons>
					<input
						v-model="newHabit"
						placeholder="输入一个习惯，如：喝水、运动"
						class="input"
						@confirm="addHabit"
						maxlength="20"
						placeholder-style="color: #999" />
					<text v-if="newHabit" class="clear-input" @click="clearInput">
						<uni-icons type="clear" size="16" color="#999"></uni-icons>
					</text>
				</view>
				<button class="add-btn" @click="addHabit" :disabled="!newHabit.trim()">
					<uni-icons type="plus" size="18" color="#fff"></uni-icons>
					<text>添加</text>
				</button>
			</view>
		</view>

		<!-- 空状态 -->
		<view v-if="habits.length === 0" class="empty-state">
			<view class="empty-icon-wrapper">
				<uni-icons type="medal" size="80" color="#ccc"></uni-icons>
			</view>
			<text class="empty-text">还没有习惯</text>
			<text class="empty-hint">开始添加第一个习惯吧！</text>
		</view>

		<!-- 习惯列表 -->
		<view
			class="habit-item"
			v-for="(item, index) in sortedHabits"
			:key="item.id"
			:class="{ 'habit-done': item.doneToday }">
			<view
				class="habit-content"
				@click="toggleHabit(getOriginalIndex(item.id))"
				@longpress="showHabitMenu(getOriginalIndex(item.id))">
				<view class="habit-left">
					<view class="habit-icon" :class="{ done: item.doneToday }">
						<uni-icons
							v-if="item.doneToday"
							type="checkmarkempty"
							size="32"
							color="#fff"></uni-icons>
						<text v-else class="habit-emoji">{{ getIcon(item.name) }}</text>
					</view>
					<view class="habit-info">
						<view class="habit-header">
							<text class="habit-name">{{ item.name }}</text>
							<view
								v-if="item.streak > 0 && isAchievement(item.streak)"
								class="achievement-badge">
								<uni-icons
									type="medal-filled"
									size="16"
									color="#ff9800"></uni-icons>
								<text>{{ item.streak }}天</text>
							</view>
						</view>
						<view class="habit-meta">
							<view class="meta-item">
								<uni-icons type="fire" size="14" color="#ff4d4f"></uni-icons>
								<text>{{ item.streak }} 天</text>
							</view>
							<view class="meta-item">
								<uni-icons type="bars" size="14" color="#1677ff"></uni-icons>
								<text>{{ item.total }} 次</text>
							</view>
							<view class="meta-item">
								<uni-icons
									type="calendar"
									size="14"
									color="#52c41a"></uni-icons>
								<text>{{ getWeekCount(item.id) }} 天/周</text>
							</view>
						</view>
						<!-- 目标进度条 -->
						<view
							v-if="item.targetStreak || item.targetTotal"
							class="target-progress">
							<view v-if="item.targetStreak" class="progress-item">
								<view class="progress-header">
									<text class="progress-label">连续目标</text>
									<text class="progress-value"
										>{{ getStreakProgress(item) }}%</text
									>
								</view>
								<view class="progress-bar">
									<view
										class="progress-fill streak-progress"
										:style="{ width: getStreakProgress(item) + '%' }"></view>
								</view>
								<text class="progress-text"
									>{{ item.streak }} / {{ item.targetStreak }} 天</text
								>
							</view>
							<view v-if="item.targetTotal" class="progress-item">
								<view class="progress-header">
									<text class="progress-label">总次数目标</text>
									<text class="progress-value"
										>{{ getTotalProgress(item) }}%</text
									>
								</view>
								<view class="progress-bar">
									<view
										class="progress-fill total-progress"
										:style="{ width: getTotalProgress(item) + '%' }"></view>
								</view>
								<text class="progress-text"
									>{{ item.total }} / {{ item.targetTotal }} 次</text
								>
							</view>
						</view>
					</view>
				</view>
				<view class="check-box" :class="{ done: item.doneToday }">
					<uni-icons
						v-if="item.doneToday"
						type="checkmarkempty"
						size="24"
						color="#fff"></uni-icons>
				</view>
			</view>
			<view class="habit-actions">
				<view
					class="action-btn detail-btn"
					@click.stop="showHabitDetail(getOriginalIndex(item.id))">
					<uni-icons type="info" size="16" color="#1677ff"></uni-icons>
					<text>详情</text>
				</view>
				<view
					class="action-btn target-btn"
					@click.stop="setTarget(getOriginalIndex(item.id))">
					<uni-icons type="flag" size="16" color="#ff9800"></uni-icons>
					<text>目标</text>
				</view>
				<view
					class="action-btn edit-btn"
					@click.stop="editHabit(getOriginalIndex(item.id))">
					<uni-icons type="compose" size="16" color="#6366f1"></uni-icons>
					<text>编辑</text>
				</view>
				<view
					class="action-btn delete-btn"
					@click.stop="confirmDelete(getOriginalIndex(item.id))">
					<uni-icons type="trash" size="16" color="#ef4444"></uni-icons>
					<text>删除</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { STORAGE_KEYS, getStorage, setStorage } from '../../../utils/storage'

const habits = ref([])
const newHabit = ref('')
const sortIndex = ref(0)

const LEGACY_STORAGE_KEY = 'habit_tracker_data'

// 排序选项
const sortOptions = [
	{ label: '默认排序', value: 'default' },
	{ label: '连续天数', value: 'streak' },
	{ label: '总完成次数', value: 'total' },
	{ label: '创建时间', value: 'created' },
	{ label: '本周完成', value: 'week' },
]

// 计算属性
const todayCompletedCount = computed(() => {
	return habits.value.filter((h) => h.doneToday).length
})

const completionRate = computed(() => {
	if (habits.value.length === 0) return 0
	return Math.round((todayCompletedCount.value / habits.value.length) * 100)
})

// 排序后的习惯列表
const sortedHabits = computed(() => {
	const list = [...habits.value]
	const sortType = sortOptions[sortIndex.value].value

	switch (sortType) {
		case 'streak':
			return list.sort((a, b) => b.streak - a.streak)
		case 'total':
			return list.sort((a, b) => b.total - a.total)
		case 'created':
			return list.sort((a, b) => {
				if (!a.createdDate) return 1
				if (!b.createdDate) return -1
				return new Date(b.createdDate) - new Date(a.createdDate)
			})
		case 'week':
			return list.sort((a, b) => getWeekCount(b.id) - getWeekCount(a.id))
		default:
			return list
	}
})

// 工具函数：格式化日期为 YYYY-MM-DD
const formatDate = (date = new Date()) => {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

// 工具函数：获取昨天日期
const getYesterday = () => {
	const d = new Date()
	d.setDate(d.getDate() - 1)
	return formatDate(d)
}

// 工具函数：计算天数差
const getDaysSince = (dateStr) => {
	if (!dateStr) return 0
	const today = new Date()
	const created = new Date(dateStr)
	const diff = today - created
	return Math.floor(diff / (1000 * 60 * 60 * 24))
}

// 工具函数：根据习惯名称获取图标
const getIcon = (name) => {
	const icons = {
		喝水: '💧',
		运动: '🏃',
		阅读: '📚',
		早睡: '😴',
		早起: '🌅',
		学习: '📖',
		冥想: '🧘',
		写作: '✍️',
		跑步: '🏃',
		健身: '💪',
		瑜伽: '🧘',
		读书: '📖',
		背单词: '📝',
		练字: '✍️',
		画画: '🎨',
		听音乐: '🎵',
		看电影: '🎬',
		做饭: '🍳',
		打扫: '🧹',
		整理: '📦',
	}
	for (const key in icons) {
		if (name.includes(key)) {
			return icons[key]
		}
	}
	return '🎯'
}

// 清空输入
const clearInput = () => {
	newHabit.value = ''
}

// 获取原始索引（用于编辑/删除操作）
const getOriginalIndex = (id) => {
	return habits.value.findIndex((h) => h.id === id)
}

// 获取本周完成天数
const getWeekCount = (habitId) => {
	const habit = habits.value.find((h) => h.id === habitId)
	if (!habit || !habit.checkHistory) return 0

	const today = new Date()
	const weekStart = new Date(today)
	weekStart.setDate(today.getDate() - today.getDay()) // 本周一
	const weekStartStr = formatDate(weekStart)

	let count = 0
	habit.checkHistory.forEach((date) => {
		if (date >= weekStartStr && date <= formatDate()) {
			count++
		}
	})

	return count
}

// 判断是否是成就里程碑
const isAchievement = (streak) => {
	const achievements = [7, 14, 30, 50, 100, 365]
	return achievements.includes(streak)
}

// 获取连续天数进度
const getStreakProgress = (habit) => {
	if (!habit.targetStreak) return 0
	return Math.min(100, Math.round((habit.streak / habit.targetStreak) * 100))
}

// 获取总次数进度
const getTotalProgress = (habit) => {
	if (!habit.targetTotal) return 0
	return Math.min(100, Math.round((habit.total / habit.targetTotal) * 100))
}

// 排序变化
const onSortChange = (e) => {
	sortIndex.value = e.detail.value
}

// 数据加载和保存
const loadData = () => {
	try {
		const data = getStorage(
			STORAGE_KEYS.habitTracker,
			getStorage(LEGACY_STORAGE_KEY, '')
		)
		if (data) {
			habits.value = typeof data === 'string' ? JSON.parse(data) : data
			// 兼容旧数据，为新字段添加默认值
			habits.value.forEach((habit) => {
				if (!habit.checkHistory) habit.checkHistory = []
				if (habit.targetStreak === undefined) habit.targetStreak = null
				if (habit.targetTotal === undefined) habit.targetTotal = null
			})
			refreshTodayStatus()
		}
	} catch (e) {
		console.error('加载数据失败:', e)
	}
}

const saveData = () => {
	const ok = setStorage(STORAGE_KEYS.habitTracker, habits.value)
	if (!ok) {
		uni.showToast({ title: '保存失败', icon: 'none' })
	}
}

// 刷新今日状态
const refreshTodayStatus = () => {
	const today = formatDate()
	const yesterday = getYesterday()

	habits.value.forEach((item) => {
		// 更新今日打卡状态
		item.doneToday = item.checkHistory?.includes(today) || false

		// 更新最后打卡日期
		if (item.checkHistory && item.checkHistory.length > 0) {
			const sortedDates = [...item.checkHistory].sort().reverse()
			item.lastCheckDate = sortedDates[0]
		}

		// 重新计算连续天数
		if (item.checkHistory && item.checkHistory.length > 0) {
			if (item.doneToday) {
				// 如果今天打卡了，从今天开始计算连续天数
				item.streak = calculateStreakFromDate(item, today)
			} else {
				// 如果今天没打卡，从昨天开始计算连续天数
				const yesterdayChecked = item.checkHistory.includes(yesterday)
				if (yesterdayChecked) {
					item.streak = calculateStreakFromDate(item, yesterday)
				} else {
					// 如果昨天也没打卡，连续天数重置为0
					item.streak = 0
				}
			}
		} else {
			item.streak = 0
		}
	})

	saveData()
}

// 添加习惯
const addHabit = () => {
	const name = newHabit.value.trim()
	if (!name) {
		return uni.showToast({ title: '请输入习惯名称', icon: 'none' })
	}

	// 检查是否重复
	if (habits.value.some((h) => h.name === name)) {
		return uni.showToast({ title: '该习惯已存在', icon: 'none' })
	}

	habits.value.push({
		id: Date.now(),
		name: name,
		streak: 0,
		total: 0,
		lastCheckDate: null,
		doneToday: false,
		createdDate: formatDate(),
		targetStreak: null,
		targetTotal: null,
		checkHistory: [],
	})

	newHabit.value = ''
	saveData()
	uni.showToast({ title: '添加成功', icon: 'success' })
}

// 切换打卡状态
const toggleHabit = (index) => {
	const habit = habits.value[index]
	const today = formatDate()
	const yesterday = getYesterday()

	if (habit.doneToday) {
		// 取消今日打卡
		habit.doneToday = false
		habit.total = Math.max(0, habit.total - 1)

		// 从历史记录中移除今天
		if (habit.checkHistory) {
			habit.checkHistory = habit.checkHistory.filter((date) => date !== today)
		}

		// 如果今天取消打卡，需要重新计算连续天数
		// 检查昨天是否打卡
		const yesterdayChecked = habit.checkHistory?.includes(yesterday) || false
		if (!yesterdayChecked) {
			// 如果昨天没打卡，连续天数重置为0
			habit.streak = 0
		} else {
			// 如果昨天打卡了，需要重新计算从昨天开始的连续天数
			habit.streak = calculateStreakFromDate(habit, yesterday)
		}

		// 更新最后打卡日期
		if (habit.checkHistory && habit.checkHistory.length > 0) {
			// 找到最近的打卡日期
			const sortedDates = [...habit.checkHistory].sort().reverse()
			habit.lastCheckDate = sortedDates[0]
		} else {
			habit.lastCheckDate = null
		}
	} else {
		// 今日打卡
		habit.doneToday = true
		habit.total++
		habit.lastCheckDate = today

		// 记录打卡历史
		if (!habit.checkHistory) {
			habit.checkHistory = []
		}
		if (!habit.checkHistory.includes(today)) {
			habit.checkHistory.push(today)
			// 保持历史记录排序
			habit.checkHistory.sort()
		}

		// 更新连续天数
		const oldStreak = habit.streak
		const yesterdayChecked = habit.checkHistory.includes(yesterday)

		if (yesterdayChecked) {
			// 如果昨天也打卡了，连续天数+1
			habit.streak++
		} else {
			// 如果昨天没打卡，重新开始计算连续天数
			habit.streak = calculateStreakFromDate(habit, today)
		}

		// 检查成就
		if (habit.streak > oldStreak && isAchievement(habit.streak)) {
			uni.showToast({
				title: `🎉 连续${habit.streak}天！太棒了！`,
				icon: 'none',
				duration: 3000,
			})
		}

		// 检查目标达成
		if (
			habit.targetStreak &&
			habit.streak >= habit.targetStreak &&
			oldStreak < habit.targetStreak
		) {
			uni.showToast({
				title: `🎯 恭喜完成连续${habit.targetStreak}天目标！`,
				icon: 'none',
				duration: 3000,
			})
		}
		if (
			habit.targetTotal &&
			habit.total >= habit.targetTotal &&
			habit.total - 1 < habit.targetTotal
		) {
			uni.showToast({
				title: `🎯 恭喜完成${habit.targetTotal}次目标！`,
				icon: 'none',
				duration: 3000,
			})
		}

		// 震动反馈
		// #ifdef APP-PLUS || H5
		uni.vibrateShort()
		// #endif
	}

	saveData()
}

// 从指定日期开始计算连续天数
const calculateStreakFromDate = (habit, startDate) => {
	if (!habit.checkHistory || habit.checkHistory.length === 0) {
		return 1
	}

	const sortedDates = [...habit.checkHistory].sort().reverse()
	let streak = 0
	let currentDate = new Date(startDate)

	// 从指定日期开始，向前查找连续打卡的日期
	for (let i = 0; i < sortedDates.length; i++) {
		const checkDate = formatDate(currentDate)
		if (sortedDates.includes(checkDate)) {
			streak++
			currentDate.setDate(currentDate.getDate() - 1)
		} else {
			break
		}
	}

	return streak > 0 ? streak : 1
}

// 编辑习惯
const editHabit = (index) => {
	const habit = habits.value[index]
	uni.showModal({
		title: '编辑习惯',
		content: `当前名称：${habit.name}`,
		editable: true,
		placeholderText: '请输入新名称',
		success: (res) => {
			if (res.confirm) {
				const newName = (res.content || '').trim()
				if (!newName) {
					uni.showToast({
						title: '名称不能为空',
						icon: 'none',
					})
					return
				}

				// 检查是否与其他习惯重名
				if (habits.value.some((h, i) => i !== index && h.name === newName)) {
					uni.showToast({
						title: '该习惯已存在',
						icon: 'none',
					})
					return
				}

				habit.name = newName
				saveData()
				uni.showToast({
					title: '修改成功',
					icon: 'success',
				})
			}
		},
		fail: () => {
			// 如果不支持 editable，使用删除后重新添加的方式
			uni.showModal({
				title: '编辑习惯',
				content: `当前名称：${habit.name}\n\n请删除后重新添加`,
				confirmText: '删除',
				cancelText: '取消',
				success: (res) => {
					if (res.confirm) {
						const oldName = habit.name
						habits.value.splice(index, 1)
						newHabit.value = oldName
						saveData()
						uni.showToast({
							title: '已删除，可修改后重新添加',
							icon: 'none',
							duration: 2000,
						})
					}
				},
			})
		},
	})
}

// 确认删除
const confirmDelete = (index) => {
	uni.showModal({
		title: '删除习惯',
		content: `确定要删除"${habits.value[index].name}"吗？`,
		success: (res) => {
			if (res.confirm) {
				habits.value.splice(index, 1)
				saveData()
				uni.showToast({ title: '删除成功', icon: 'success' })
			}
		},
	})
}

// 显示习惯详情
const showHabitDetail = (index) => {
	const habit = habits.value[index]
	const weekCount = getWeekCount(habit.id)
	const monthCount = getMonthCount(habit.id)

	let detail = `习惯名称：${habit.name}\n\n`
	detail += `连续打卡：${habit.streak} 天\n`
	detail += `总完成次数：${habit.total} 次\n`
	detail += `本周完成：${weekCount} 天\n`
	detail += `本月完成：${monthCount} 天\n`
	if (habit.createdDate) {
		detail += `已坚持：${getDaysSince(habit.createdDate)} 天\n`
	}
	if (habit.targetStreak) {
		detail += `连续目标：${habit.targetStreak} 天（进度 ${getStreakProgress(habit)}%）\n`
	}
	if (habit.targetTotal) {
		detail += `总次数目标：${habit.targetTotal} 次（进度 ${getTotalProgress(habit)}%）`
	}

	uni.showModal({
		title: '习惯详情',
		content: detail,
		showCancel: false,
		confirmText: '知道了',
	})
}

// 获取本月完成天数
const getMonthCount = (habitId) => {
	const habit = habits.value.find((h) => h.id === habitId)
	if (!habit || !habit.checkHistory) return 0

	const today = new Date()
	const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
	const monthStartStr = formatDate(monthStart)

	let count = 0
	habit.checkHistory.forEach((date) => {
		if (date >= monthStartStr && date <= formatDate()) {
			count++
		}
	})

	return count
}

// 设置目标
const setTarget = (index) => {
	const habit = habits.value[index]
	const items = ['设置连续天数目标', '设置总次数目标', '清除目标']

	uni.showActionSheet({
		itemList: items,
		success: (res) => {
			if (res.tapIndex === 0) {
				// 设置连续天数目标
				// 微信小程序不支持 editable，使用 prompt 或提示
				uni.showModal({
					title: '设置连续天数目标',
					content: `当前连续：${habit.streak} 天\n\n请在输入框中输入目标天数`,
					editable: true,
					placeholderText: '请输入目标天数',
					success: (modalRes) => {
						if (modalRes.confirm && modalRes.content) {
							const target = parseInt(modalRes.content)
							if (target > 0) {
								habit.targetStreak = target
								saveData()
								uni.showToast({ title: '目标设置成功', icon: 'success' })
							} else {
								uni.showToast({ title: '请输入有效数字', icon: 'none' })
							}
						}
					},
					fail: () => {
						// 如果不支持 editable，使用提示
						uni.showToast({
							title: '请在输入框中输入目标天数后确认',
							icon: 'none',
							duration: 2000,
						})
					},
				})
			} else if (res.tapIndex === 1) {
				// 设置总次数目标
				uni.showModal({
					title: '设置总次数目标',
					content: `当前总次数：${habit.total} 次\n\n请在输入框中输入目标次数`,
					editable: true,
					placeholderText: '请输入目标次数',
					success: (modalRes) => {
						if (modalRes.confirm && modalRes.content) {
							const target = parseInt(modalRes.content)
							if (target > 0) {
								habit.targetTotal = target
								saveData()
								uni.showToast({ title: '目标设置成功', icon: 'success' })
							} else {
								uni.showToast({ title: '请输入有效数字', icon: 'none' })
							}
						}
					},
					fail: () => {
						uni.showToast({
							title: '请在输入框中输入目标次数后确认',
							icon: 'none',
							duration: 2000,
						})
					},
				})
			} else if (res.tapIndex === 2) {
				// 清除目标
				habit.targetStreak = null
				habit.targetTotal = null
				saveData()
				uni.showToast({ title: '目标已清除', icon: 'success' })
			}
		},
	})
}

// 显示习惯菜单（长按）
const showHabitMenu = (index) => {
	uni.vibrateShort({ fail: () => {} })
	uni.showActionSheet({
		itemList: ['查看详情', '设置目标', '编辑', '删除'],
		success: (res) => {
			if (res.tapIndex === 0) {
				showHabitDetail(index)
			} else if (res.tapIndex === 1) {
				setTarget(index)
			} else if (res.tapIndex === 2) {
				editHabit(index)
			} else if (res.tapIndex === 3) {
				confirmDelete(index)
			}
		},
	})
}

// 生命周期
onMounted(() => {
	loadData()
})

onShow(() => {
	// 每次页面显示时刷新今日状态
	refreshTodayStatus()
})
</script>

<style lang="scss" scoped>
.container {
	padding: 24rpx;
	min-height: 100vh;
	background: linear-gradient(to bottom, #f8f9fa 0%, #f5f5f5 100%);
}

/* 统计卡片 */
.stats-card {
	display: flex;
	justify-content: space-around;
	background: linear-gradient(135deg, #1677ff 0%, #0958d9 100%);
	border-radius: 20rpx;
	padding: 40rpx 20rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 8rpx 24rpx rgba(22, 119, 255, 0.3);
}

.stat-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 12rpx;
}

.stat-icon-wrapper {
	width: 56rpx;
	height: 56rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(255, 255, 255, 0.2);
	border-radius: 50%;
}

.stat-value {
	font-size: 48rpx;
	font-weight: 700;
	color: #fff;
	line-height: 1;
}

.stat-label {
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.9);
}

/* 工具栏和添加区域 */
.toolbar-section {
	margin-bottom: 24rpx;
}

.toolbar {
	margin-bottom: 20rpx;
	display: flex;
	justify-content: flex-end;
}

.sort-btn {
	display: flex;
	align-items: center;
	gap: 8rpx;
	padding: 12rpx 20rpx;
	background: #fff;
	border-radius: 12rpx;
	font-size: 26rpx;
	color: #333;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
	transition: all 0.2s ease;

	&:active {
		transform: scale(0.98);
		box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.1);
	}
}

.add-section {
	display: flex;
	gap: 16rpx;
	align-items: center;
}

.input-wrapper {
	flex: 1;
	display: flex;
	align-items: center;
	gap: 12rpx;
	background: #fff;
	border-radius: 16rpx;
	padding: 0 24rpx;
	border: 2rpx solid transparent;
	transition: all 0.3s ease;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);

	&:focus-within {
		border-color: #1677ff;
		box-shadow: 0 0 0 4rpx rgba(22, 119, 255, 0.1);
	}
}

.input {
	flex: 1;
	height: 88rpx;
	font-size: 28rpx;
	color: #333;
	background: transparent;
	border: none;
}

.clear-input {
	padding: 8rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s ease;

	&:active {
		transform: scale(0.9);
		opacity: 0.7;
	}
}

.add-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8rpx;
	height: 88rpx;
	padding: 0 32rpx;
	background: linear-gradient(135deg, #1677ff 0%, #0958d9 100%);
	color: #fff;
	border-radius: 16rpx;
	font-size: 28rpx;
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

/* 空状态 */
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

.empty-icon-wrapper {
	width: 160rpx;
	height: 160rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #f8f9fa 0%, #e8e8e8 100%);
	border-radius: 50%;
	margin-bottom: 32rpx;
}

.empty-text {
	font-size: 32rpx;
	color: #333;
	font-weight: 500;
	margin-bottom: 12rpx;
}

.empty-hint {
	font-size: 26rpx;
	color: #999;
}

/* 习惯项 */
.habit-item {
	background: #fff;
	border-radius: 20rpx;
	margin-bottom: 20rpx;
	overflow: hidden;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
	transition: all 0.3s ease;

	&:active {
		transform: scale(0.98);
	}

	&.habit-done {
		border-left: 6rpx solid #52c41a;
	}
}

.habit-content {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 28rpx;
	border-bottom: 1rpx solid #f0f0f0;
	transition: background-color 0.2s ease;

	&:active {
		background-color: #fafafa;
	}
}

.habit-left {
	display: flex;
	align-items: center;
	flex: 1;
	gap: 24rpx;
	min-width: 0;
}

.habit-icon {
	width: 96rpx;
	height: 96rpx;
	border-radius: 20rpx;
	background: linear-gradient(135deg, #f8f9fa 0%, #e8e8e8 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 48rpx;
	transition: all 0.3s ease;
	flex-shrink: 0;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);

	&.done {
		background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
		box-shadow: 0 4rpx 12rpx rgba(82, 196, 26, 0.3);
		transform: scale(1.05);
	}
}

.habit-emoji {
	font-size: 48rpx;
	line-height: 1;
}

.habit-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 12rpx;
	min-width: 0;
}

.habit-header {
	display: flex;
	align-items: center;
	gap: 12rpx;
	flex-wrap: wrap;
}

.habit-name {
	font-size: 32rpx;
	font-weight: 600;
	color: #1a202c;
	line-height: 1.4;
	word-break: break-all;
}

.achievement-badge {
	display: flex;
	align-items: center;
	gap: 4rpx;
	padding: 4rpx 12rpx;
	background: linear-gradient(135deg, #fff3cd 0%, #ffe69c 100%);
	border-radius: 12rpx;
	font-size: 22rpx;
	color: #d97706;
	font-weight: 500;
	animation: bounce 1s ease-in-out;
}

@keyframes bounce {
	0%,
	100% {
		transform: translateY(0);
	}
	50% {
		transform: translateY(-8rpx);
	}
}

.habit-meta {
	display: flex;
	gap: 20rpx;
	flex-wrap: wrap;
}

.meta-item {
	display: flex;
	align-items: center;
	gap: 6rpx;
	font-size: 24rpx;
	color: #666;
}

/* 目标进度条 */
.target-progress {
	margin-top: 12rpx;
	padding-top: 12rpx;
	border-top: 1rpx solid #f0f0f0;
}

.progress-item {
	margin-top: 12rpx;

	&:first-child {
		margin-top: 0;
	}
}

.progress-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 8rpx;
}

.progress-label {
	font-size: 24rpx;
	color: #666;
}

.progress-value {
	font-size: 24rpx;
	color: #1677ff;
	font-weight: 600;
}

.progress-bar {
	height: 10rpx;
	background: #e8e8e8;
	border-radius: 5rpx;
	overflow: hidden;
	margin-bottom: 6rpx;
}

.progress-fill {
	height: 100%;
	border-radius: 5rpx;
	transition: width 0.3s ease;

	&.streak-progress {
		background: linear-gradient(90deg, #ff9800 0%, #ff6b00 100%);
	}

	&.total-progress {
		background: linear-gradient(90deg, #1677ff 0%, #0958d9 100%);
	}
}

.progress-text {
	font-size: 22rpx;
	color: #999;
}

.check-box {
	width: 64rpx;
	height: 64rpx;
	border-radius: 50%;
	border: 3rpx solid #d9d9d9;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.3s ease;
	background: #fff;
	flex-shrink: 0;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);

	&.done {
		background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
		border-color: #52c41a;
		box-shadow: 0 4rpx 12rpx rgba(82, 196, 26, 0.3);
		transform: scale(1.1);
	}
}

.habit-actions {
	display: flex;
	padding: 20rpx 28rpx;
	gap: 12rpx;
	background: #fafafa;
}

.action-btn {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 6rpx;
	padding: 16rpx 8rpx;
	border-radius: 12rpx;
	font-size: 22rpx;
	border: none;
	transition: all 0.2s ease;

	&:active {
		transform: scale(0.95);
		opacity: 0.8;
	}

	text {
		font-size: 22rpx;
	}
}

.detail-btn {
	background: #e0f2fe;
	color: #0284c7;
}

.target-btn {
	background: #fff7e6;
	color: #d97706;
}

.edit-btn {
	background: #f0f5ff;
	color: #6366f1;
}

.delete-btn {
	background: #fff1f0;
	color: #ef4444;
}
</style>
