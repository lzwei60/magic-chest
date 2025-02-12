import { ESLint } from 'eslint'

const eslint = new ESLint({
	baseConfig: {
		parserOptions: {
			ecmaVersion: 2020,
			sourceType: 'module',
		},
		env: {
			browser: true,
			node: true,
			es6: true,
		},
		rules: {
			'prettier/prettier': 'error', // 或者其他你需要的规则
		},
	},
})

export default eslint
