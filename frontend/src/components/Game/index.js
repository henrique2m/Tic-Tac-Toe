import React, { useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import io from 'socket.io-client';
import { toast } from 'react-toastify';
import { HeartSpinner, RotateSpinner } from 'react-spinners-kit';
import { GiCancel } from 'react-icons/gi';
import api from '../../services/api';
import x from '../../assets/x-ttt.svg';
import { store } from '../../store';
import GameOver from '../GameOver';
import GameOld from '../GameOld';
import websocket from '../../services/websocket';

import Lottie from 'react-lottie';
import click from '../../assets/json/click.json';
import flame from '../../assets/json/flame.json';

import './styles.css';

export default function Game({ onClearGame }) {
    const [dataGame, setDataGame] = useState([]);
    const idGame = localStorage.getItem('idGame');
    const { profile } = store.getState().user;
    const [loading, setLoading] = useState(false);
    const idUser = profile._id;
    const [keyMove, setKeyMove] = useState('');
    const [exitLoading, setExitLoading] = useState(false);
    const [exit, setExit] = useState(false);

    const socket = useMemo(
        () =>
            io(websocket, {
                query: { user: idUser },
            }),
        [idUser]
    );

    useMemo(() => {
        socket.on('update', dataUpGame => {
            async function loadGameUp() {
                try {
                    if (
                        idGame === '' ||
                        idGame === null ||
                        idGame === undefined
                    )
                        return false;

                    setLoading(true);
                    const res = await api.post('game', { idGame });

                    setLoading(false);
                    setDataGame(res.data);
                    setKeyMove(dataUpGame.key);
                } catch (error) {
                    toast.error('Ocorreu algo de errado, tente novamente.', {
                        toastId: 'updadeGame',
                    });
                }
            }

            loadGameUp();
        });
    }, [socket, idGame]);

    useEffect(() => {
        async function loadGame() {
            try {
                if (idGame === '' || idGame === null || idGame === undefined)
                    return false;

                setLoading(true);
                const res = await api.post('game', { idGame });
                setDataGame(res.data);
                setLoading(false);
                await api.post('socket', { message: 'online' });
            } catch (error) {
                toast.error('Ocorreu algo de errado, tente novamente.', {
                    toastId: 'updadeGame',
                });
            }
        }

        loadGame();
    }, [idGame]);

    useEffect(() => {
        function handlePlayerStart() {
            if (dataGame.length === 0) return false;

            const start = dataGame.game.gameBoard.filter(cell => {
                return cell.moveIdUser !== '';
            });

            if (start.length !== 0) return false;

            const playerStart = dataGame.game.playerStart;

            if (playerStart === profile._id) {
                toast.success(`Inicie a partida.`, { toastId: 'playerStart' });

                return true;
            }

            toast.success('Seu oponente irá iniciar a partida.', {
                toastId: 'playerStart',
            });
        }

        handlePlayerStart();
    }, [dataGame, profile]);

    async function requestGameUpdate(dataMoveGame) {
        const { key } = dataMoveGame;

        if (dataGame.game.move === profile._id) {
            toast.error(
                'Você já realizou sua jogada, aguarde o seu oponente.',
                { toastId: 'playerOff' }
            );
            return false;
        }

        if (dataGame.game.gameBoard[key].moveIdUser !== '') {
            toast.error('Jogada já foi realizada.', { toastId: 'cellOff' });
            return false;
        }

        const start = dataGame.game.gameBoard.filter(cell => {
            return cell.moveIdUser !== '';
        });

        if (start.length === 0) {
            if (dataGame.game.playerStart !== profile._id) {
                toast.error(`Aguarde seu oponente realizar a jogada.`, {
                    toastId: 'playerStart',
                });

                return false;
            }
        }

        const { challenger, challenged } = dataGame.game;

        dataGame.game.gameBoard[key] = {
            key,
            moveIdUser: profile._id,
            avatar: profile.avatar,
        };

        setLoading(true);
        setKeyMove(key);

        const res = await api.post('updateGame', {
            updateGameBoard: dataGame.game.gameBoard,
            idGame,
            idUserMove: profile._id,
            keyMove: key,
        });

        const { success } = res.data;

        if (success) {
            await api.post('socket', {
                message: 'update',
                challenger,
                adversary: challenged,
                idGame,
                key,
            });
        } else {
            toast.error(`Algo deu errado, teste novamente.`, {
                toastId: 'playerMove',
            });

            dataGame.game.gameBoard[key] = {
                key,
                moveIdUser: '',
                avatar: '',
            };
        }
    }

    function checkWinner() {
        if (dataGame.length === 0) return false;

        const gaveOld = dataGame.game.gaveOld;

        if (gaveOld) {
            return (
                <GameOld
                    data={dataGame.challenger}
                    gameReset={() => gameLogout()}
                />
            );
        }

        const winner = dataGame.game.winningMove;

        if (winner.length === 0) return false;

        const move = dataGame.game.move;
        const challenger = dataGame.challenger;

        if (move === challenger._id) {
            return (
                <GameOver data={challenger} gameReset={() => gameLogout()} />
            );
        }

        if (move === dataGame.challenged._id) {
            return (
                <GameOver
                    data={dataGame.challenged}
                    gameReset={() => gameLogout()}
                />
            );
        }

        return false;
    }

    function handleClick() {
        return (
            <>
                <div className="animation">
                    <Lottie
                        options={{
                            animationData: flame,
                            loop: true,
                        }}
                    />
                </div>
                <div className="animation">
                    <Lottie
                        options={{
                            animationData: click,
                            loop: false,
                        }}
                    />
                </div>
            </>
        );
    }

    function handleExitConfirm() {
        return (
            <div className="exit-confirm">
                <p>Tem certeza que deseja sair da partida?</p>
                <button type="button" onClick={() => gameExit()}>
                    {' '}
                    Sair{' '}
                </button>
                <button
                    type="button"
                    onClick={() => setExit(false)}
                    className="back"
                >
                    {' '}
                    Voltar{' '}
                </button>
            </div>
        );
    }

    function gameLogout() {
        setDataGame([]);
        onClearGame();
    }

    async function gameExit() {
        try {
            const cadidates = [
                dataGame.challenger._id,
                dataGame.challenged._id,
            ];

            const idAdversary = cadidates.filter(id => {
                return id !== profile._id;
            });

            setExitLoading(true);

            await Promise.all([
                api.put('updatePlaying', {
                    idUser: profile._id,
                    playing: false,
                }),
                api.post('deleteGame', { idGame }),
            ]);

            api.post('socket', {
                message: 'exit',
                adversary: idAdversary[0],
            });

            setExitLoading(false);

            localStorage.removeItem('idGame');
            setDataGame([]);
            onClearGame();
        } catch (error) {
            toast.error('Algo deu errado, tente novamente.', {
                toastId: 'gameExit',
            });
            setExitLoading(false);
        }
    }

    useMemo(() => {
        socket.on('exit', () => {
            async function exit() {
                toast.error('Seu oponente desistiu da partida.', {
                    toastId: 'gameExit',
                });

                try {
                    setExitLoading(true);
                    await api.put('updatePlaying', {
                        idUser: profile._id,
                        playing: false,
                    });

                    localStorage.removeItem('idGame');
                    setExitLoading(false);
                    setDataGame([]);
                    onClearGame();
                } catch (error) {
                    toast.error('Algo deu errado, tente novamente.', {
                        toastId: 'errorExitSocket',
                    });
                    setExitLoading(false);
                }
            }

            exit();
        });
    }, [socket]);

    return (
        <div className="container-game">
            {checkWinner()}
            {dataGame.length !== 0 ? (
                <div>
                    {!exitLoading ? (
                        <button
                            type="button"
                            onClick={() => setExit(true)}
                            className="reset"
                        >
                            <GiCancel size={30} />
                        </button>
                    ) : (
                        <button type="button" className="reset">
                            <HeartSpinner />
                        </button>
                    )}

                    <ol>
                        <li>
                            <img
                                src={dataGame.challenger.avatar}
                                alt={dataGame.challenger.username}
                            />
                            <strong> {dataGame.challenger.username} </strong>
                        </li>
                        <li>
                            <img src={x} alt="x" />
                        </li>
                        <li>
                            <img
                                src={dataGame.challenged.avatar}
                                alt={dataGame.challenged.username}
                            />
                            <strong>{dataGame.challenged.username} </strong>
                        </li>
                    </ol>

                    <ul id="gameBoard">
                        {dataGame.game.gameBoard.map(cell => (
                            <li key={cell.key}>
                                <button
                                    type="button"
                                    onClick={() => requestGameUpdate(cell)}
                                >
                                    <img
                                        src={cell.avatar}
                                        alt={cell.moveIdUser}
                                        className={
                                            cell.moveIdUser ===
                                            dataGame.challenger._id
                                                ? 'challenger'
                                                : cell.moveIdUser ===
                                                  dataGame.challenged._id
                                                ? 'challenged'
                                                : 'null'
                                        }
                                    />
                                </button>
                                {keyMove === cell.key ? handleClick() : null}
                            </li>
                        ))}
                    </ul>

                    {loading &&
                    (dataGame.game.move === profile._id ||
                        dataGame.game.move === '') ? (
                        <div className="loading">
                            <HeartSpinner />
                        </div>
                    ) : null}

                    {exit && handleExitConfirm()}
                </div>
            ) : (
                <div className="loading">
                    <RotateSpinner size={20} color="#FF9A1A" />
                </div>
            )}
        </div>
    );
}

Game.propTypes = {
    onClearGame: PropTypes.oneOfType([PropTypes.element, PropTypes.func])
        .isRequired,
};
