import js from '@eslint/js'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import prettier from 'eslint-config-prettier'
import vue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import globals from 'globals'

const uniGlobals = {
	uni: 'readonly',
	wx: 'readonly',
	getApp: 'readonly',
	getCurrentPages: 'readonly',
	App: 'readonly',
	Page: 'readonly',
	Component: 'readonly',
	Behavior: 'readonly',
}

export default [
	{
		ignores: [
			'node_modules/**',
			'unpackage/**',
			'dist/**',
			'dist-ssr/**',
			'coverage/**',
			'uni_modules/**',
		],
	},
	js.configs.recommended,
	{
		files: ['**/*.{js,ts,vue}'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				...globals.browser,
				...globals.node,
				...uniGlobals,
			},
		},
		rules: {
			'no-empty': ['error', { allowEmptyCatch: true }],
			'no-console': ['warn', { allow: ['warn', 'error'] }],
			'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
		},
	},
	{
		files: ['**/*.ts'],
		languageOptions: {
			parser: tsParser,
		},
		plugins: {
			'@typescript-eslint': tsPlugin,
		},
		rules: {
			...tsPlugin.configs.recommended.rules,
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
		},
	},
	{
		files: ['**/*.vue'],
		languageOptions: {
			parser: vueParser,
			parserOptions: {
				parser: tsParser,
				ecmaVersion: 'latest',
				sourceType: 'module',
				extraFileExtensions: ['.vue'],
			},
		},
		plugins: {
			vue,
			'@typescript-eslint': tsPlugin,
		},
		rules: {
			...vue.configs['flat/recommended'].rules,
			'vue/multi-word-component-names': 'off',
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
		},
	},
	prettier,
]
