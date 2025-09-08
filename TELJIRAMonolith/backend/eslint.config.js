const jsConfig = {
  files: ['**/*.js'],
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'commonjs'
  },
  rules: {
    semi: ['error', 'always'],
    quotes: ['error', 'single'],
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
  }
};

const ignoreConfig = {
  ignores: ['node_modules/**', 'dist/**', 'build/**']
};

module.exports = [ignoreConfig, jsConfig];
