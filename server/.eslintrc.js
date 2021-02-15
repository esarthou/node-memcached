module.exports = {
    env: {
        es6: true,
        node: true,
    },
    extends: [
        'airbnb-base',
    ],
    parser: 'babel-eslint',
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
    },
    rules: {
        indent: ['error', 4],
        'prefer-destructuring': 0,
        camelcase: 0,
        'no-plusplus': 0,
        radix: 0,
        'max-len': ['error', { code: 150 }],
        'no-restricted-syntax': ['error', 'LabeledStatement', 'WithStatement'],
        'max-lines-per-function': ['error', { max: 75, skipComments: true }],
        'max-depth': ['warn', 5],
        'max-nested-callbacks': ['error', 3],
        'max-lines': ['error', 500],
        'no-console': 'off',
    },
    settings: {
    },
};
