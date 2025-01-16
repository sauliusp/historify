module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'google',
  ],
  plugins: ['@typescript-eslint', 'react'],
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'indent': ['error', 2],
    'max-len': ['error', {
      code: 80,
      tabWidth: 2,
      ignoreUrls: true,
      ignorePattern: '^import .*',
    }],
    'quotes': ['error', 'single'],
    'object-curly-spacing': ['error', 'never'],
    'require-jsdoc': ['error', {
      require: {
        FunctionDeclaration: true,
        MethodDefinition: true,
        ClassDeclaration: true,
        ArrowFunctionExpression: false,
        FunctionExpression: false,
      },
    }],
    '@typescript-eslint/member-ordering': ['error', {
      default: [
        'static-field',
        'instance-field',
        'constructor',
        'static-method',
        'instance-method',
      ],
    }],
    'no-invalid-this': 'off',
    '@typescript-eslint/no-invalid-this': ['error'],
    'valid-jsdoc': ['error', {
      requireReturn: false,
      requireParamType: false,
      requireReturnType: false,
    }],
  },
}; 