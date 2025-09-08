import js from '@eslint/js';

let pluginReact;
try {
  // Try to use real plugin if installed
  pluginReact = (await import('eslint-plugin-react')).default;
} catch {
  // Fallback shim to avoid module resolution error in CI if devDeps not installed yet
  pluginReact = (await import('./eslint-plugin-react-shim.js')).default;
}

export default [
  { ignores: ['dist/**', 'node_modules/**'] },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true }
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly'
      }
    },
    plugins: { react: pluginReact },
    rules: {
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
      // In React 17+ jsx runtime removes need for React in scope
      'react/react-in-jsx-scope': 'off',
      // Allow React import to be present without JSX pragma usage
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^React$' }]
    },
    settings: {
      react: { version: 'detect' }
    }
  }
];
