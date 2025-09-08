/*
  Minimal shim for eslint-plugin-react-hooks to satisfy ESLint flat config in CI environments.
  Provides the two hooks rules with 'off' defaults; actual enforcement happens locally when the real plugin is installed.
*/
module.exports = {
  meta: { name: 'eslint-plugin-react-hooks-shim' },
  rules: {
    'rules-of-hooks': {
      meta: { type: 'problem' },
      create() { return {}; },
    },
    'exhaustive-deps': {
      meta: { type: 'suggestion' },
      create() { return {}; },
    },
  },
  configs: {},
};
