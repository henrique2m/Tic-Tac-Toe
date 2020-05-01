require('dotenv/config');
const User = require('../model/User');
const Auth = require('../model/Auth');
const Validation = require('../model/Validation');
const authConfig = require('../config/auth');
const bcryptjs = require('bcryptjs');

module.exports = {
    async show(req, res) {
        try {
            const { sal } = authConfig;
            const { idUser, code } = req.body;
            const validation = await Validation.findOne({ user: idUser });
            const attempt = validation.attempt;

            if (attempt > 2) {
                return res.json({
                    error: 'ettemptExceeded',
                    message: 'Attempted limit exceeded.',
                });
            }

            const codeSal = `${code}${sal}`;

            if (!(await bcryptjs.compare(codeSal, validation.code))) {
                validation.attempt = attempt + 1;
                await validation.save();

                return res.json({
                    error: 'codeInvalid',
                    message: 'Invalid code.',
                });
            }

            await User.updateOne(
                { _id: idUser },
                { $set: { validation: true } }
            );

            const user = await User.findById({ _id: idUser });

            const token = Auth.Token({ _id: user._id });

            await Validation.deleteOne({ user: idUser });

            user.password = undefined;

            return res.json({ user, token });
        } catch (err) {
            console.log(err);
            return res.status(400).json({
                error:
                    'Something went wrong while checking the code, try again.',
            });
        }
    },

    async delete(req, res) {
        try {
            const { idUser } = req.body;

            await User.deleteOne({ _id: idUser });

            await Validation.deleteOne({ user: idUser });

            return res.json({ success: true });
        } catch (err) {
            console.log(err);
            return res.status(400).json({
                error: 'Error canceling registration, try again.',
            });
        }
    },
};
