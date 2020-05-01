const Game = require('../model/Game');
const User = require('../model/User');
const Board = require('../model/Board');

module.exports = {
    async store(req, res) {
        try {
            const gameBoard = Board.boardCreate(1);
            const { challenger, challenged } = req.body;
            const number = (Math.floor(Math.random() * 100)) % 2;
            const playerStart = number === 0 ? challenger : challenged;
            const move = "";
            const dataGame = {
                challenger,
                challenged,
                gameBoard,
                move,
                playerStart
            };
            const game = await Game.create(dataGame);

            return res.json(game);
        } catch (err) {
            return res
                .status(404)
                .json({ err: 'it was no possible to generate the game.' });
        }
    },

    async show(req, res) {
        try {
            const { idGame } = req.body;
            const game = await Game.findById(idGame);
            const challenger = await User.findById(game.challenger);
            const challenged = await User.findById(game.challenged);

            return res.json({ game, challenger, challenged });
        } catch (err) {
            return res.status(404).json({ err: 'Game not found.' });
        }
    },

    async update(req, res) {
        try {
            const { updateGameBoard, idGame, idUserMove, keyMove } = req.body;

            const validation = await Board.validationMove(
                updateGameBoard,
                idGame,
                idUserMove,
                keyMove
            );

            if(validation.error) return res.json(validation);

            return res.json({success: true});

        } catch (err) {
            return res
                .status(400)
                .json({ err: 'It was not possible to apdate the game.' });
        }
    },

    async delete(req, res) {
        try {
            const { idGame } = req.body;

            await Game.deleteOne({ _id: idGame });

            return res.status(200).json();

        } catch (err) {
            return res.status(404).json({ error: 'Game not found.' });
        }
    },
};
