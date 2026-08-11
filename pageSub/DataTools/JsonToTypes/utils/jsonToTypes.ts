export type JsonToTypesResult = {
	ok: boolean
	value?: string
	error?: string
}

type TypeShape =
	| { kind: 'primitive'; value: string }
	| { kind: 'array'; item: TypeShape }
	| { kind: 'object'; fields: Record<string, TypeShape> }

export function jsonToTypeScript(input: string, rootName = 'Root'): JsonToTypesResult {
	if (!input.trim()) {
		return { ok: false, error: '请输入 JSON 内容' }
	}

	try {
		const parsed = JSON.parse(input) as unknown
		const declarations: string[] = []
		const rootShape = inferShape(parsed)
		const normalizedRootName = normalizeTypeName(rootName)
		const rootType =
			rootShape.kind === 'object'
				? shapeToType(rootShape, normalizedRootName, declarations)
				: shapeToInlineType(rootShape)
		return {
			ok: true,
			value:
				rootShape.kind === 'object'
					? declarations.join('\n\n')
					: `export type ${normalizedRootName} = ${rootType}`,
		}
	} catch (error) {
		return {
			ok: false,
			error: error instanceof Error ? error.message : 'JSON 解析失败',
		}
	}
}

function inferShape(value: unknown): TypeShape {
	if (Array.isArray(value)) {
		return {
			kind: 'array',
			item: mergeShapes(value.map(inferShape)),
		}
	}

	if (value && typeof value === 'object') {
		const fields: Record<string, TypeShape> = {}
		Object.entries(value).forEach(([key, child]) => {
			fields[key] = inferShape(child)
		})
		return { kind: 'object', fields }
	}

	return { kind: 'primitive', value: primitiveType(value) }
}

function mergeShapes(shapes: TypeShape[]): TypeShape {
	if (shapes.length === 0) return { kind: 'primitive', value: 'unknown' }
	const [first, ...rest] = shapes
	return rest.reduce(mergeTwoShapes, first)
}

function mergeTwoShapes(left: TypeShape, right: TypeShape): TypeShape {
	if (left.kind !== right.kind) {
		return { kind: 'primitive', value: `${shapeToInlineType(left)} | ${shapeToInlineType(right)}` }
	}

	if (left.kind === 'primitive' && right.kind === 'primitive') {
		return {
			kind: 'primitive',
			value: Array.from(new Set([...left.value.split(' | '), ...right.value.split(' | ')])).join(
				' | '
			),
		}
	}

	if (left.kind === 'array' && right.kind === 'array') {
		return { kind: 'array', item: mergeTwoShapes(left.item, right.item) }
	}

	if (left.kind === 'object' && right.kind === 'object') {
		const fields: Record<string, TypeShape> = { ...left.fields }
		Object.entries(right.fields).forEach(([key, shape]) => {
			fields[key] = fields[key] ? mergeTwoShapes(fields[key], shape) : shape
		})
		return { kind: 'object', fields }
	}

	return { kind: 'primitive', value: 'unknown' }
}

function shapeToType(
	shape: TypeShape,
	name: string,
	declarations: string[]
): string {
	if (shape.kind !== 'object') {
		return shapeToInlineType(shape)
	}

	const lines = Object.entries(shape.fields).map(([key, value]) => {
		const optional = isOptionalShape(value) ? '?' : ''
		const fieldType = shapeToInlineType(value)
		return `\t${formatKey(key)}${optional}: ${fieldType}`
	})
	declarations.push(`export interface ${name} {\n${lines.join('\n')}\n}`)
	return name
}

function shapeToInlineType(shape: TypeShape): string {
	if (shape.kind === 'primitive') return shape.value
	if (shape.kind === 'array') return `${shapeToInlineType(shape.item)}[]`
	const lines = Object.entries(shape.fields).map(
		([key, value]) => `\t${formatKey(key)}: ${shapeToInlineType(value)}`
	)
	return `{\n${lines.join('\n')}\n}`
}

function primitiveType(value: unknown): string {
	if (value === null) return 'null'
	const valueType = typeof value
	return valueType === 'number' ||
		valueType === 'string' ||
		valueType === 'boolean'
		? valueType
		: 'unknown'
}

function normalizeTypeName(input: string): string {
	const cleaned = input.replace(/[^A-Za-z0-9_]/g, '')
	return cleaned ? `${cleaned[0].toUpperCase()}${cleaned.slice(1)}` : 'Root'
}

function formatKey(key: string): string {
	return /^[A-Za-z_$][\w$]*$/u.test(key) ? key : JSON.stringify(key)
}

function isOptionalShape(shape: TypeShape): boolean {
	return shape.kind === 'primitive' && shape.value.split(' | ').includes('undefined')
}
