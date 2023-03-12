module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
  },
  plugins: ['jest', '@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:jest/recommended',
    'plugin:@typescript-eslint/recommended',
    // Must be last,
    'plugin:prettier/recommended',
  ],
  rules: {
    '@typescript-eslint/naming-convention': 'warn',
    curly: 'warn',
    eqeqeq: 'warn',
    'no-throw-literal': 'warn',
    'jest/expect-expect': [
      'error',
      {
        assertFunctionNames: ['expect', 'testReversibleConversion'],
      },
    ],
  },
  ignorePatterns: ['out', 'dist', '**/*.d.ts'],
}
