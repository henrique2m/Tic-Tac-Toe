const User = require('../model/User');
const Mail = require('../lib/Mail');
const Validation = require('../model/Validation');

module.exports = {
    async store(req, res) {
        try {
            const { email, password } = req.body;
            const arrayEmail = email.split('@');
            const username = arrayEmail[0];
            const avatar = `https://api.adorable.io/avatars/50/${username}.png`;

            if (await User.findOne({ email }))
                return res.json({
                    error: 'email',
                    message: 'E-mail already exists.',
                });

            if (await User.findOne({ username }))
                return res.json({
                    error: 'username',
                    message: 'Username already exists, please enter another.',
                });

            const dataUser = { email, username, password, avatar };
            const user = await User.create(dataUser);

            const code = Math.floor(Math.random() * 9000) + 999;
            const dataValidation = { user: user._id, code };

            await Validation.create(dataValidation);

            await Mail.sendMail({
                to: `${username} <${email}>`,
                subject: 'Código de validação',
                template: 'validation',
                context: {
                    player: username,
                    code: code,
                },
            });

            return res.json({
                success: 'register',
                message: 'Awaiting email validation.',
                user: user._id,
            });
        } catch (err) {
            return res.status(400).json({ error: 'Registration failed' });
        }
    },

    async show(req, res) {
        try {
            const { userId } = req;
            const user = await User.findById(userId);

            return res.json(user);
        } catch (err) {
            return res.status(401).json({ error: 'User not found.' });
        }
    },

    async update(req, res) {
        try {
            const { userId, data } = req.body;
            const update = await User.findById(userId);

            if (!update)
                return res.status(401).json({ error: 'User not found.' });

            if (data.oldPassword !== update.password)
                return res
                    .status(401)
                    .json({ error: 'Old password is incorrect.' });

            update.password = data.NewPassword;
            await update.save();

            return res
                .status(200)
                .json({ success: 'Password changed successfully.' });
        } catch (err) {
            return res
                .status(401)
                .json('It was not possible to delete your account, try again.');
        }
    },

    async delete(req, res) {
        try {
            const { userId } = req.body;
            await User.deleteOne(userId);
            return res.status(200).json();
        } catch (err) {
            return res
                .status(401)
                .json('It was not possible to delete your account, try again.');
        }
    },
};
