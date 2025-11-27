export function exportExcel(list) {
	const filename = '去重结果.xls'
	const csv = list.map((v) => `"${v.replace(/"/g, '""')}"`).join('\n')

	// H5 端
	if (process.env.UNI_PLATFORM === 'h5') {
		const blob = new Blob(['\ufeff' + csv], {
			type: 'application/vnd.ms-excel',
		})
		const a = document.createElement('a')
		a.href = URL.createObjectURL(blob)
		a.download = filename
		a.click()
	} else {
		// 小程序端
		const fs = wx.getFileSystemManager()
		const filePath = `${wx.env.USER_DATA_PATH}/${filename}`
		fs.writeFileSync(filePath, '\ufeff' + csv, 'utf8')
		uni.openDocument({ filePath, fileType: 'xls' })
	}
}
