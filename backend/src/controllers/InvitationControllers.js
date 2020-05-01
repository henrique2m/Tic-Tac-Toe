const Mail = require('../lib/Mail');

module.exports = {
    async sendHbs(req, res) {
        const { email, username } = req.body;
        const arrayEmail = email.split('@');

        try {
            await Mail.sendMail({
                to: `${arrayEmail[0]} <${email}>`,
                subject: 'Convite',
                template: 'invitation',
                context: {
                    emailFriend: arrayEmail[0],
                    userName: username,
                },
            });

            return res.json({ sendMail: true });
        } catch (error) {
            return res.status(400).json({
                error: 'The invitation could note sent, please try again.',
            });
        }
    },
};
