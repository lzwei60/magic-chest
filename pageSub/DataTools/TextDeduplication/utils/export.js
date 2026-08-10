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
		const fs = uni.getFileSystemManager?.()
		const userDataPath = uni.env?.USER_DATA_PATH

		if (!fs || !userDataPath) {
			throw new Error('当前平台不支持导出文件')
		}

		const filePath = `${userDataPath}/${filename}`
		fs.writeFileSync(filePath, '\ufeff' + csv, 'utf8')
		uni.openDocument({ filePath, fileType: 'xls' })
	}
}
