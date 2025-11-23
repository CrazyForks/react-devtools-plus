import antfu from '@antfu/eslint-config'

export default antfu({
  // force enable react and typescript rules
  react: true,
  vue: false,
  typescript: true,
  unocss: true,

  formatters: {
    css: true,
    html: true,
    markdown: 'prettier', // 使用 prettier 格式化，但不检查代码块中的代码
  },

  // override default rules
  rules: {
    'no-console': 'off',
    'antfu/top-level-function': 'off',
    'unused-imports/no-unused-vars': 'off',

    'node/prefer-global/process': 'off',

    'ts/no-invalid-this': 'off',
    'ts/consistent-type-imports': 'off',
    'ts/ban-types': 'off',
    'ts/no-unused-expressions': 'off',
    'ts/no-unsafe-function-type': 'off',

    'unicorn/consistent-function-scoping': 'off',
  },
}, {
  ignores: [
    'dist',
    'node_modules',
    '.cursor',
    '.history',
    'ci.yml',
    'release.yml',
    '**.svg',
    'packages/react-devtools-overlay/dist/*',
    'packages/react-devtools-client/dist/*',
    'packages/playground/**/dist/*',
    'eslint.config.js',
    // 忽略文档文件中的代码块 lint
    '**/*.md/**',
  ],
})
