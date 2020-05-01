const Socket = require('../model/Socket');

module.exports = {
    async socket(req, res) {
        const sockertIO = req.io;
        const {
            message,
            adversary,
            challenger,
            toggle,
            idGame,
            key,
        } = req.body;

        //Monitorar jogadores online
        //Monitor players online
        if (message === 'online') {
            sockertIO.emit('online', true);
            return res.status(200).json();
        }

        const playerAdversary = await Socket.findOne({ user: adversary });
        const playerChallenger = await Socket.findOne({ user: challenger });

        if (!playerAdversary)
            return res.status(400).json({ error: 'Socket connection failed' });

        if (idGame) {
            if (!playerChallenger)
                return res
                    .status(400)
                    .json({ error: 'Socket connection failed' });
        }

        switch (message) {
            //Jogador faz uma solicitação de partida
            //Player makes a match request
            case 'solicitation':
                if (playerAdversary.playing)
                    return res
                        .status(400)
                        .json({ error: 'Player is already in a match.' });

                sockertIO
                    .to(playerAdversary.idSocket)
                    .emit('solicitation', challenger);

                return res.json({ success: true });
            //Oponente reponde a solicitação
            //Opponent responts to requests
            case 'response':
                sockertIO.to(playerAdversary.idSocket).emit('response', toggle);

                return res.json({ success: true });
            //Inicia a partida entre os jogadores
            //Starts the match between the players
            case 'start':
                sockertIO.to([playerChallenger.idSocket]).emit('start', idGame);
                sockertIO.to([playerAdversary.idSocket]).emit('start', idGame);

                await Socket.updateOne(
                    { idSocket: playerChallenger.idSocket },
                    { $set: { playing: true } }
                );

                await Socket.updateOne(
                    { idSocket: playerAdversary.idSocket },
                    { $set: { playing: true } }
                );

                return res.json({ success: true });
            //Monitora a jogada de cada jogador
            //Monitor each player's play
            case 'update':
                const dataUpGame = { idGame: idGame, key: key };
                sockertIO
                    .to([playerChallenger.idSocket])
                    .emit('update', dataUpGame);
                sockertIO
                    .to([playerAdversary.idSocket])
                    .emit('update', dataUpGame);

                return res.json({ success: true });
            // Saída do jogador da partida
            // Player departure from the match
            case 'exit':
                sockertIO
                    .to([playerAdversary.idSocket])
                    .emit('exit', adversary);
        }
    },

    async index(req, res) {
        try {
            const { idUser } = req.body;
            const online = await Socket.find({
                user: { $ne: idUser },
            }).populate('user');

            return res.json({ players: online });
        } catch (err) {
            return res.status(400).json({ error: 'Socket connection failed' });
        }
    },

    async store(req) {
        // executado apenas servidor
        // Runs on the server only
        try {
            const { idSocket, user } = req;
            const userExist = await Socket.findOne({ user });

            if (userExist) {
                userExist.idSocket = idSocket;
                await userExist.save();
                return true;
            }

            await Socket.create({ idSocket, user });
            return true;
        } catch (err) {
            return err;
        }
    },

    async delete(req, res) {
        try {
            const { user } = req.body;
            await Socket.deleteOne({ user });

            return res.json({ logout: true });
        } catch (err) {
            return res.status(400).json({ error: 'Socket connection failed' });
        }
    },

    async update(req, res) {
        try {
            const { idUser, playing } = req.body;

            await Socket.updateOne({ user: idUser }, { $set: { playing } });

            return res.status(200).json();
        } catch (err) {
            return res
                .status(400)
                .json({ error: ' Error trying to update player status' });
        }
    },
};
