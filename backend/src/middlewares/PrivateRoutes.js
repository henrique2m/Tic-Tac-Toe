require('dotenv/config');
const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const { secret } = authConfig;

    if (!authHeader) return res.status(401).json({ error: 'Not authorized ' });

    const parts = authHeader.split(' ');

    if (!parts.length === 2)
        return res.status(401).json({ error: 'Token malformatted' });

    const scheme = parts[0];
    const token = parts[1];

    if (!/^Bearer$/i.test(scheme))
        return res.status(401).json({ error: 'Token malformatted' });

    jwt.verify(token, secret, (err, decoded) => {
        if (err) return res.json({ error: 'tokenInvalid' });

        const { _id } = decoded.params;

        req.userId = _id;
        return next();
    });
};
