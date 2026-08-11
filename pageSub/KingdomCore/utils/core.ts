export class DooerCodec {
	timeout = 30
	openCount = 0
	codekey = ''
	constructor(codekey: string = 'RCQJVAGOSZXOYVXCVQYFORCTOTZKYESE') {
		this.codekey = codekey
	}

	/**
	 * 加密生成hex值
	 * @param cardid
	 * @param currentTime
	 * @param timeout
	 * @returns
	 */
	showLocalQrcode(cardid: number, currentTime: number, timeout = this.timeout) {
		if (!Number.isSafeInteger(cardid) || cardid < 0 || cardid > 0xffffffff) {
			throw new Error('Invalid card id')
		}
		const time = currentTime + timeout * 1000
		const count = this.openCount
		const seekByte20 = this.getQrcodeBytes(cardid, time, count)
		const keys = this.stringToByte(this.codekey) // 使用事先定义的 codekey 常量
		const encodebytes = this.HloveyRC4(seekByte20, keys)
		return this.getHexString(encodebytes)
	}

	/**
	 * 解密hex得到卡号、时间、次数
	 * @param hexStr
	 * @returns
	 */
	decodeLocalQrcode(hexStr: string) {
		const encodebytes = this.getByteArray(hexStr)
		const keys = this.stringToByte(this.codekey) // 使用事先定义的 codekey 常量
		const seekByte20 = this.HloveyRC4(encodebytes, keys)
		const data = this.parseQrcodeBytes(seekByte20)
		return data
	}

	/**
	 * 通过卡号、时间、次数生成20位加密数据
	 * @param cardid
	 * @param time
	 * @param count
	 * @returns
	 */
	getQrcodeBytes(cardid: number, time: number, count: number) {
		let index = 0
		const qrcodebyte = new Array<number>(20)
		qrcodebyte[index++] = 0x26
		qrcodebyte[index++] = 0x18
		qrcodebyte[index++] = 0x01
		qrcodebyte[index++] = 0x0c
		const b_cardid = this.long_byte4(cardid)
		for (let i = 0; i < 4; i++) {
			qrcodebyte[index++] = b_cardid[i]
		}
		const b_company = [0xff, 0xff, 0xff, count]
		for (let i = 0; i < 4; i++) {
			qrcodebyte[index++] = b_company[i]
		}
		const b_time = this.long_byte4(time / 1000)
		for (let i = 0; i < 4; i++) {
			qrcodebyte[index++] = b_time[i]
		}
		const crcCheck = qrcodebyte.slice(0, 16)
		const crcValue = this.CrcGen_STM32(crcCheck, 4)
		const b_crc = this.long_byte4(crcValue)
		for (let i = 0; i < 4; i++) {
			qrcodebyte[index++] = b_crc[i]
		}
		return qrcodebyte
	}

	/**
	 * 通过20加密数据得到卡号、时间、次数
	 * @param qrcodebyte
	 * @returns
	 */
	parseQrcodeBytes(qrcodebyte: number[]) {
		if (qrcodebyte.length !== 20) {
			throw new Error('Invalid QR code byte length')
		}

		let index = 4 // 跳过前4个静态字节
		const b_cardid = qrcodebyte.slice(index, index + 4)
		const cardid = this.byte4_to_long(b_cardid)
		index += 4

		const b_company = qrcodebyte.slice(index, index + 4)
		const count = b_company[3] // 假设 count 是这个数组的最后一个字节
		index += 4

		const b_time = qrcodebyte.slice(index, index + 4)
		const time = this.byte4_to_long(b_time) * 1000 // 转换回毫秒
		index += 4

		const crcCheck = qrcodebyte.slice(0, 16)
		const b_crc = qrcodebyte.slice(index, index + 4)
		const b2_crc = this.long_byte4(this.CrcGen_STM32(crcCheck, 4))
		const crc1 = this.byte4_to_long(b_crc)
		const crc2 = this.byte4_to_long(b2_crc)

		if (crc1 !== crc2) {
			throw new Error('CRC validation failed')
		}

		return {
			cardid: cardid,
			time: time,
			count: count,
		}
	}

	/**
	 * 字符串转换成byte
	 * @param str
	 * @returns
	 */
	stringToByte(str: string) {
		const bytes: number[] = []
		const len = str.length
		let c
		for (let i = 0; i < len; i++) {
			c = str.charCodeAt(i)
			if (c >= 0x010000 && c <= 0x10ffff) {
				bytes.push(((c >> 18) & 0x07) | 0xf0)
				bytes.push(((c >> 12) & 0x3f) | 0x80)
				bytes.push(((c >> 6) & 0x3f) | 0x80)
				bytes.push((c & 0x3f) | 0x80)
			} else if (c >= 0x000800 && c <= 0x00ffff) {
				bytes.push(((c >> 12) & 0x0f) | 0xe0)
				bytes.push(((c >> 6) & 0x3f) | 0x80)
				bytes.push((c & 0x3f) | 0x80)
			} else if (c >= 0x000080 && c <= 0x0007ff) {
				bytes.push(((c >> 6) & 0x1f) | 0xc0)
				bytes.push((c & 0x3f) | 0x80)
			} else {
				bytes.push(c & 0xff)
			}
		}
		return bytes
	}

	/**
	 * byte 转换成 hex 值
	 * @param seekByte20
	 * @returns
	 */
	getHexString(seekByte20: number[]) {
		const chars = '0123456789ABCDEF'.split('')
		let sb = ''
		for (let i = 0; i < seekByte20.length; i++) {
			sb += chars[(seekByte20[i] & 0xf0) >> 4] + chars[seekByte20[i] & 0x0f]
		}
		return sb
	}

	/**
	 * hex字符串转换成byte
	 * @param hexString
	 * @returns
	 */
	getByteArray(hexString: string) {
		// 验证输入是否为偶数长度的字符串
		if (hexString.length % 2 !== 0) {
			throw new Error('Invalid hex string')
		}

		const byteArray = new Array(hexString.length / 2)

		for (let i = 0; i < hexString.length; i += 2) {
			byteArray[i / 2] = parseInt(hexString.substr(i, 2), 16)
		}

		return byteArray
	}

	/**
	 * 长整型转换成4位byte
	 * @param value
	 * @returns
	 */
	long_byte4(value: number) {
		const result = new Array(4)
		result[0] = (value >> 24) & 0xff
		result[1] = (value >> 16) & 0xff
		result[2] = (value >> 8) & 0xff
		result[3] = (value >> 0) & 0xff
		return result
	}

	/**
	 * 4位byte转换成长整型
	 * @param byteArray
	 * @returns
	 */
	byte4_to_long(byteArray: number[]) {
		return (
			((byteArray[0] << 24) |
				(byteArray[1] << 16) |
				(byteArray[2] << 8) |
				byteArray[3]) >>>
			0
		)
	}

	/**
	 * 4位byte转换成长整型，用于crc校验
	 * @param bs
	 * @returns
	 */
	little_byte4_to_long(bs: number[]) {
		return (
			((bs[3] & 0xff) << 24) |
			((bs[2] & 0xff) << 16) |
			((bs[1] & 0xff) << 8) |
			(bs[0] & 0xff)
		)
	}

	// STM32 的 CRC 校验算法
	CrcGen_STM32(data: number[], size: number) {
		let crc = 0x16e008ec
		for (let i = 0; i < size; i++) {
			const t = new Array(4)
			let index = i * 4
			for (let k = 0; k < 4; k++) {
				t[k] = data[index++]
			}
			let temp = this.little_byte4_to_long(t)
			for (let j = 0; j < 32; j++) {
				if (((crc ^ temp) & 0x80000000) != 0) {
					crc = 0x04c11db7 ^ (crc << 1)
				} else {
					crc <<= 1
				}
				temp <<= 1
			}
		}
		return crc
	}

	// RC4 加密算法
	HloveyRC4(aInput: number[], aKey: number[]) {
		const iS = new Array(256)
		const iK = new Array(256)
		for (let i = 0; i < 256; i++) {
			iS[i] = i
		}
		let j = 1
		for (let i = 0; i < 256; i++) {
			iK[i] = aKey[i % aKey.length]
		}
		j = 0
		for (let i = 0; i < 256; i++) {
			j = (j + iS[i] + iK[i]) % 256
			const temp = iS[i]
			iS[i] = iS[j]
			iS[j] = temp
		}
		let i = 0
		j = 0
		const iInputBytes = aInput
		const iOutputBytes = new Array(aInput.length)
		for (let x = 0; x < iInputBytes.length; x++) {
			i = (i + 1) % 256
			j = (j + iS[i]) % 256
			const temp = iS[i]
			iS[i] = iS[j]
			iS[j] = temp
			const t = (iS[i] + iS[j]) % 256
			const iY = iS[t]
			const iCY = iY
			iOutputBytes[x] = (iInputBytes[x] ^ iCY) & 0xff
		}
		return iOutputBytes
	}
}
