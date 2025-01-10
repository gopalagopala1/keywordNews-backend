module.exports = {
    env: {
      es2021: true,
      node: true,
    },
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:node/recommended',
      'plugin:import/recommended',
      'plugin:import/typescript',
      'plugin:promise/recommended',
      'plugin:prettier/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 12,
      sourceType: 'module',
    },
    plugins: ['@typescript-eslint', 'import', 'node', 'promise', 'prettier'],
    settings: {
      'import/resolver': {
        typescript: {},
      },
    },
    rules: {
      'prettier/prettier': 'error',
      'no-unused-vars': 'off', // Disable the base rule as it can report incorrect errors
      '@typescript-eslint/no-unused-vars': ['error'],
      'node/no-unsupported-features/es-syntax': [
        'error',
        { ignores: ['modules'] },
      ],
      'node/no-missing-import': 'off',
    },
  };