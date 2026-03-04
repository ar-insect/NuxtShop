import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt([
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'vue/no-v-html': 'off',
      'no-empty-pattern': 'off',
      '@typescript-eslint/unified-signatures': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      'no-empty': 'off'
    }
  }
])
