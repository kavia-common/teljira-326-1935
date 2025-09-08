/*
  Minimal shim for eslint-plugin-react to satisfy ESLint flat config in CI environments
  where devDependencies might not be installed. Provides empty rules as no-ops.
*/
module.exports = {
  meta: { name: 'eslint-plugin-react-shim' },
  rules: {
    // no rules – acts as a placeholder so ESLint doesn't error on missing plugin
  },
  configs: {},
};
