export function diffText(original, target) {
	const o = original.split(/\r?\n/)
	const t = target.split(/\r?\n/)
	const max = Math.max(o.length, t.length)
	const res = []
	for (let i = 0; i < max; i++) {
		const a = o[i] || ''
		const b = t[i] || ''
		if (a === b) res.push({ type: 'same', text: b })
		else {
			if (a) res.push({ type: 'del', text: a })
			if (b) res.push({ type: 'add', text: b })
		}
	}
	return res
}
