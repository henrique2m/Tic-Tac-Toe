module.exports = {
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
    default: {
        from: 'Tic-Tac-Toe <tictactoe.game.br@gmail.com>',
    },
};
