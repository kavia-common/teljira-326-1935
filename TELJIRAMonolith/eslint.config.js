/** @type {import("eslint").FlatConfig[]} */
let reactPlugin;
let reactHooksPlugin;
try {
  // Prefer real plugins if installed locally
  reactPlugin = require('eslint-plugin-react');
} catch (_e) {
  reactPlugin = require('./.eslint-plugins/react');
}
try {
  reactHooksPlugin = require('eslint-plugin-react-hooks');
} catch (_e) {
  reactHooksPlugin = require('./.eslint-plugins/react-hooks');
}

const jsConfig = {
  files: ['**/*.js'],
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'commonjs',
  },
  rules: {
    semi: ['error', 'always'],
    quotes: ['error', 'single'],
  },
};

// Frontend ESM override so eslint parses import/export correctly in Vite/React app
const frontendEsmConfig = {
  files: ['frontend/**/*.{js,jsx}'],
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    parserOptions: {
      ecmaFeatures: { jsx: true },
    },
    globals: {
      document: 'readonly',
      window: 'readonly',
      navigator: 'readonly',
    },
  },
  plugins: {
    react: reactPlugin,
    'react-hooks': reactHooksPlugin,
  },
  rules: {
    semi: ['error', 'always'],
    quotes: ['error', 'single'],
    // Recommended hooks rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};

const ignoreConfig = {
  ignores: ['node_modules/**', 'frontend/dist/**'],
};

module.exports = [ignoreConfig, jsConfig, frontendEsmConfig];