/** @type {import("eslint").FlatConfig[]} */
const baseJs = {
  files: ['**/*.{js,jsx}'],
  ignores: ['node_modules/**', 'dist/**'],
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
    globals: {
      document: 'readonly',
      window: 'readonly',
      navigator: 'readonly',
    },
  },
  rules: {
    semi: ['error', 'always'],
    quotes: ['error', 'single'],
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
};

export default [baseJs];
