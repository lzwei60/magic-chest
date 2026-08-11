import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { TOOLS } from './tools'

type UniPageConfig = {
	pages?: Array<{ path: string }>
	subPackages?: Array<{
		root: string
		pages?: Array<{ path: string }>
	}>
}

const projectRoot = process.cwd()

function getRegisteredRoutes() {
	const pagesConfig = JSON.parse(
		readFileSync(join(projectRoot, 'pages.json'), 'utf8')
	) as UniPageConfig

	const mainRoutes = (pagesConfig.pages ?? []).map((page) => `/${page.path}`)
	const subPackageRoutes = (pagesConfig.subPackages ?? []).flatMap((subPackage) =>
		(subPackage.pages ?? []).map((page) => `/${subPackage.root}/${page.path}`)
	)

	return new Set([...mainRoutes, ...subPackageRoutes])
}

describe('tool routes', () => {
	it('keeps tool entries aligned with pages.json and page files', () => {
		const registeredRoutes = getRegisteredRoutes()

		for (const tool of TOOLS) {
			expect(registeredRoutes.has(tool.path), `${tool.id} route`).toBe(true)
			expect(
				existsSync(join(projectRoot, `${tool.path.slice(1)}.vue`)),
				`${tool.id} page file`
			).toBe(true)
		}
	})
})
