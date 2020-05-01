const Game = require('./Game');

module.exports = {
    boardCreate(numBoard) {
        const gameTable = [];
        const board = numBoard == null ? 1 : numBoard;

        for (let i = 0; i < board * 9; i += 1) {
            gameTable.push({
                key: i,
                moveIdUser: '',
                avatar: '',
            });
        }

        return gameTable;
    },

    async validationMove(updateGameBoard, idGame, idUser, keyMove) {
        const game = await Game.findById(idGame);
        const cellMove = game.gameBoard[keyMove];
        const gameBoard = game.gameBoard;
        const numBoard = gameBoard.length / 9;

        if (cellMove.moveIdUser !== '') return { error: 'moveOff' };
        if (game.move === idUser) return { error: 'movePlayerOff' };

        const upGameBoard = await Game.updateOne(
            { _id: idGame },
            { $set: { gameBoard: updateGameBoard, move: idUser } }
        );

        if(!upGameBoard) return { error: 'updateBoardFailed'};

        cellMove.moveIdUser = idUser;

        let straight = [
            [-3, 3, { p1: false, p2: false, column: 0 }],
            [3, 6, { p1: false, p2: false, column: 0 }],
            [-3, -6, { p1: false, p2: false, column: 0 }],

            [1, 2, { p1: false, p2: false, column: 1 }],
            [4, 8, { p1: false, p2: false, column: 1 }],
            [-2, -4, { p1: false, p2: false, column: 1 }],

            [-1, 1, { p1: false, p2: false, column: 2 }],
            [-2, 2, { p1: false, p2: false, column: 2 }],
            [-4, 4, { p1: false, p2: false, column: 2 }],

            [-1, -2, { p1: false, p2: false, column: 3 }],
            [-4, -8, { p1: false, p2: false, column: 3 }],
            [2, 4, { p1: false, p2: false, column: 3 }],
        ];

        const movesNegative = [-1, -2, -3, -4, -6, -8];
        const movesPositive = [1, 2, 3, 4, 6, 8];

        const possibilityNegative = movesNegative.filter(move => {
            return !(keyMove + move < 0);
        });
        const possibilityPositive = movesPositive.filter(move => {
            return !(keyMove + move > 9 * numBoard - 1);
        });

        const validMoves = possibilityNegative.concat(possibilityPositive);

        for (let i = 0; i < validMoves.length; i++) {
            for (let s = 0; s < straight.length; s++) {
                if (validMoves[i] === straight[s][0]) {
                    straight[s][2].p1 = true;
                }

                if (validMoves[i] === straight[s][1]) {
                    straight[s][2].p2 = true;
                }
            }
        }

        let gameOver = [];
        const winner = [];
        let column = 0;

        if (keyMove % 3 === 0) {
            column = 1;
        }
        if ((keyMove - 1) % 3 === 0) {
            column = 2;
        }
        if ((keyMove - 2) % 3 === 0) {
            column = 3;
        }

        const validStraight = straight.filter(referee => {
            return (
                referee[2].p1 === true &&
                referee[2].p2 === true &&
                (referee[2].column === column || referee[2].column === 0)
            );
        });

        gameOver = gameOver.concat(validStraight);

        for (let i = 0; i < gameOver.length; i++) {
            if (
                gameBoard[cellMove.key + gameOver[i][0]].moveIdUser ===
                    cellMove.moveIdUser &&
                gameBoard[cellMove.key + gameOver[i][1]].moveIdUser ===
                    cellMove.moveIdUser &&
                gameBoard[cellMove.key].moveIdUser === cellMove.moveIdUser
            ) {
                for (let w = 0; w < 3; w++) {
                    if (w < 2) {
                        winner.push(gameBoard[cellMove.key + gameOver[i][w]].key);
                    } else {
                        winner.push(gameBoard[cellMove.key].key);
                    }
                }
            }
        }


        if (winner.length !== 0) {
            const upWinningMove = await Game.updateOne(
                { _id: idGame },
                { $set: { winningMove: winner} }
            );

           if(!upWinningMove) return { error: 'updateWinnerFailed' };

           return true;
        }

        const old = gameBoard.filter(playerNull => {
            return playerNull.moveIdUser === '';
        });

        if (old.length === 0) {
            const upGaveOld = await Game.updateOne(
                { _id: idGame },
                { $set: { gaveOld: true } }
            );

           if(!upGaveOld) return { error: 'updateGaveOldFailed' };

           return true;
        }

        return true;
    },
};
