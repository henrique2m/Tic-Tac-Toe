const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema(
    {
        challenger: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        challenged: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        gameBoard: [Object],
        winningMove: [Object],
        gaveOld: {
            type: Boolean,
            default: false,
        },
        playerStart: String,
        move: String,
    },
    { timestamps: true }
);

const Tictactoe = mongoose.model('Game', GameSchema);

module.exports = Tictactoe;
