import css from '@eslint/css'
import json from '@eslint/json'
import pluginReact from 'eslint-plugin-react'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

import pluginJs from '@eslint/js'
import pluginPrettier from 'eslint-plugin-prettier'

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    plugins: {
      js: pluginJs,
      typescript: tseslint,
      react: pluginReact,
      prettier: pluginPrettier
    },
    rules: {
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          trailingComma: 'all',
          printWidth: 80,
          tabWidth: 2,
          semi: false
        }
      ],
      'react/prop-types': 'off'
    },
    extends: ['js/recommended'],
    languageOptions: { globals: globals.browser }
  },
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    files: ['**/*.json'],
    plugins: { json },
    language: 'json/json',
    extends: ['json/recommended']
  },
  {
    files: ['**/*.css'],
    plugins: { css },
    language: 'css/css',
    extends: ['css/recommended']
  }
])
