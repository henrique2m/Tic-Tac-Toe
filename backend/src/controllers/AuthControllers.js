require('dotenv/config');
const bcryptjs = require('bcryptjs');
const User = require('../model/User');
const Auth = require('../model/Auth');
const authConfig = require('../config/auth');

module.exports = {
    async show(req, res) {
        try {
            const { email, password } = req.body;
            const { sal } = authConfig;

            const user = await User.findOne({
                email,
                validation: { $ne: false },
            }).select('+password');

            if (!user)
                return res.json({ error: 'email', message: 'User not found.' });

            const passwordSal = `${password}${sal}`;

            if (!(await bcryptjs.compare(passwordSal, user.password)))
                return res.json({
                    error: 'password',
                    message: 'Invalid password.',
                });

            user.password = undefined;

            const token = Auth.Token({ _id: user._id });

            return res.json({ user, token });
        } catch (err) {
            return res
                .status(400)
                .json({ error: 'Error in authentication, please try again.' });
        }
    },

    session(req, res) {
        return res.status(200).json({ session: true });
    },
};
