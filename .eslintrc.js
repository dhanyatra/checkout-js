module.exports = {
    root: true,
    env: {
        browser: true
    },
    extends: [
        'airbnb-base',
        'prettier'
    ],
    plugins: ['prettier'],
    rules: {
        'prettier/prettier': 'error',
        'import/prefer-default-export': false
    }
}