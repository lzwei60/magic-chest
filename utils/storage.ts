export const STORAGE_KEYS = {
	favorites: 'mc/favorites',
	ocrHistory: 'mc/ocr_history',
	habitTracker: 'mc/habit_tracker_data',
	timerTasks: 'mc/timer_tasks',
	timezoneConverterConfig: 'mc/timezone_converter_config',
	exchangeRates: (currency: string) => `mc/exchange_rates/${currency}`,
	exchangeRatesUpdatedAt: (currency: string) => `mc/exchange_rates_updated_at/${currency}`,
	kingdomSelectedCard: 'mc/kingdom/selected_card',
	kingdomAutoRefreshEnabled: 'mc/kingdom/auto_refresh_enabled',
	kingdomCardList: 'mc/kingdom/card_list',
} as const

export function getStorage<T>(key: string, fallback: T): T {
	try {
		const value = uni.getStorageSync(key)
		return value == null || value === '' ? fallback : (value as T)
	} catch {
		return fallback
	}
}

export function setStorage<T>(key: string, value: T): boolean {
	try {
		uni.setStorageSync(key, value)
		return true
	} catch {
		return false
	}
}
