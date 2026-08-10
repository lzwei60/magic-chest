export function parseText(str, options) {
	const {
		trim = true,
		ignoreEmpty = true,
		ignoreCase = false,
		separators = ['\n', ',', '，', ';', '；'],
	} = options
	if (!str) return []
	const regex = new RegExp(separators.map((s) => '\\' + s).join('|'), 'g')
	let list = str.split(regex)
	if (trim) list = list.map((v) => v.trim())
	if (ignoreEmpty) list = list.filter((v) => v)
	// ignoreCase 只用于去重 key，不能改变用户原始内容。
	void ignoreCase
	return list
}
