const eslintrc = {
  extends: ['eslint-config-airbnb'],
  parser: 'babel-eslint',
  env: {
    browser: true,
    node: true,
    es6: true
  },
  plugins: [
    'react',
    'babel',
    'jsx-a11y',
    'import'
  ],
  rules: {
    'no-var': 0,
    'semi': 1,
    'no-console': ['error', { allow: ['log', 'warn', 'error'] }],
    'no-multi-spaces': ['error', { ignoreEOLComments: true, exceptions: { 'VariableDeclarator': true, 'ImportDeclaration': true  } }],
    'func-names': 0,
    'arrow-body-style': 0,
    'comma-dangle': 0,
    'no-underscore-dangle': 0,
    'no-param-reassign': 0,
    'no-return-assign': 0,
    'max-len': 0,
    'consistent-return': 0,
    'no-redeclare': 0,
    'class-methods-use-this': 0,
    'react/require-extension': 0,
    'react/react-in-jsx-scope': 0,
    'react/no-array-index-key': 0,
    'react/sort-comp': 0,
    'react/prop-types': 0,
    'react/jsx-first-prop-new-line': 0,
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx', '.md'] }],
    'react/no-danger': 0,
    "react/no-multi-comp": 0,
    'jsx-a11y/no-static-element-interactions': 0,
    'jsx-a11y/anchor-has-content': 0,
    'jsx-a11y/no-noninteractive-element-interactions': 0,
    'import/extensions': 0,
    'import/no-unresolved': 0,
    'import/no-extraneous-dependencies': 0
  },
};

module.exports = eslintrc;
