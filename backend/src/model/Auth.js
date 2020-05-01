require('dotenv/config');
const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');

module.exports = {
    Token(params = {}) {
        const { secret } = authConfig;
        const token = jwt.sign({ params }, secret, {
            expiresIn: '7d',
        });

        return token;
    },
};
