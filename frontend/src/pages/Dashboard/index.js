import React, { useMemo, useState, useEffect } from 'react';
import io from 'socket.io-client';
import { IoLogoGameControllerA } from 'react-icons/io';
import { GiLightSabers } from 'react-icons/gi';
import { toast } from 'react-toastify';
import { store } from '../../store';
import logo from '../../assets/logo-ttt.png';
import api from '../../services/api';
import Popup from '../../components/Popup';
import Start from '../../components/Start';
import Profiles from '../../components/Profile';
import Invitation from '../../components/Invitation';
import Game from '../../components/Game';
import { useDispatch } from 'react-redux';
import { signOut } from '../../store/modules/auth/actions';
import history from '../../services/history';
import websocket from '../../services/websocket';
import './styles.css';

export default function Dashboard() {
    const dispatch = useDispatch();
    const [profile, setProfile] = useState([]);
    const [players, setPlayers] = useState([]);
    const [adversary, setAdversary] = useState('');
    const [start, setStart] = useState([]);
    const [game, setGame] = useState([]);

    const _idUser = store.getState().user.profile._id;

    api.defaults.headers.Authorization = `Bearer ${
        store.getState().auth.token
    }`;

    const socket = useMemo(
        () =>
            io(websocket, {
                query: { user: _idUser },
            }),
        [_idUser]
    );

    socket.on('response', (toggle) => {
        if (toggle) {
            setStart({ profile, adversary });
            setAdversary('');
        } else {
            toast.error('Solicitação negada. :(', { toastId: 'cancel' });
            if (!toast.isActive('cancel')) {
                setStart([]);
                setAdversary('');
                document.body.style.overflow = 'visible';
            }
        }
    });

    socket.on('solicitation', (idAdversary) => {
        const dataAdversary = players.filter((playerAdversary) => {
            return playerAdversary.user._id === idAdversary;
        });

        if (dataAdversary.length !== 0) {
            dataAdversary.push({ playerView: 'challenged' });
            setAdversary(dataAdversary);
        }
    });

    socket.on('start', (gameStartId) => {
        localStorage.setItem('idGame', gameStartId);

        function handleViewGame() {
            setGame(true);
            setStart([]);
        }

        setTimeout(() => handleViewGame(), 3000);
    });

    useMemo(() => {
        socket.on('online', (update) => {
            if (store.getState().user.profile === null) return false;

            if (update) {
                async function handleOnlineUpdate() {
                    const session = await api.post('/session');

                    const { error } = session.data;

                    if (error === 'tokenInvalid') {
                        toast.error('Sua sessão expirou. :(', {
                            toastId: 'errorSession',
                        });
                        return dispatch(signOut(_idUser));
                    }

                    try {
                        const response = await api.post('/online', {
                            idUser: _idUser,
                        });

                        const { players } = response.data;

                        if (!players) return false;

                        setPlayers(players);
                    } catch (error) {
                        console.log(error);
                        toast.error('Algo de errado ocorreu. ;(', {
                            toastId: 'errorUpdatePlayersOnline',
                        });
                    }
                }
                handleOnlineUpdate();
            }
        });
    }, [socket, _idUser, dispatch]);

    useEffect(() => {
        async function handleOnline() {
            const session = await api.post('/session');

            const { error } = session.data;

            if (error === 'tokenInvalid') {
                toast.error('Sua sessão expirou. :(', {
                    toastId: 'errorSession',
                });
                return dispatch(signOut(_idUser));
            }

            try {
                const response = await api.post('/online', { idUser: _idUser });

                const { players } = response.data;

                if (!players) return false;

                setPlayers(players);

                await api.post('socket', {
                    message: 'online',
                });
            } catch (error) {
                toast.error('Não foi possível encontrar mais jogadores :(', {
                    toastId: 'errorPlayersOnline',
                });
            }
        }
        handleOnline();
        setProfile(store.getState().user.profile);
    }, [_idUser, dispatch]);

    useEffect(() => {
        async function gameExist() {
            const idGame = localStorage.getItem('idGame');
            if (idGame) {
                try {
                    await api.post('game', { idGame });
                    setGame(true);
                    setStart([]);
                } catch (error) {
                    localStorage.removeItem('idGame');
                }
            }
        }
        gameExist();
    }, []);

    async function handleSolicitationGame(idAdversary) {
        const session = await api.post('/session');

        const { error } = session.data;

        if (error === 'tokenInvalid') {
            toast.error('Sua sessão expirou :(', {
                toastId: 'errorSession',
            });
            return dispatch(signOut(_idUser));
        }

        try {
            await api.post('/socket', {
                message: 'solicitation',
                challenger: _idUser,
                adversary: idAdversary,
            });
        } catch (error) {
            console.log(error);
            toast.error(
                'Não foi possível realizar a solicitação de partida. :(',
                {
                    toastId: 'errorSolicitation',
                }
            );

            return false;
        }

        const dataAdversary = players.filter((playerAdversary) => {
            return playerAdversary.user._id === idAdversary;
        });

        dataAdversary.push({ playerView: 'challenger' });
        setAdversary(dataAdversary);
    }

    function onClearAdversary(toggle) {
        if (toggle) {
            setStart({ profile, adversary });
            setAdversary('');
        } else {
            setStart([]);
            setAdversary('');
        }
    }

    function onClearGame() {
        document.body.style.overflow = 'visible';
        history.push('/');
        setGame([]);
    }

    function onClearStart(DataGame) {
        async function handleGameStart() {
            await api.post('/socket', {
                message: 'start',
                challenger: DataGame.challenger,
                adversary: DataGame.challenged,
                idGame: DataGame._id,
            });
        }

        handleGameStart();
    }

    function handlePopup() {
        if (adversary !== '') {
            document.body.style.overflow = 'hidden';
            return (
                <Popup
                    data={adversary}
                    onClearAdversary={(toggle) => onClearAdversary(toggle)}
                />
            );
        }
    }

    function handleStart() {
        if (start.length !== 0)
            return (
                <Start
                    data={start}
                    onClearStart={(containerDataGame) =>
                        onClearStart(containerDataGame)
                    }
                />
            );
    }

    function handleGame() {
        if (game.length !== 0) {
            return <Game onClearGame={() => onClearGame()} />;
        }
    }

    function handleListPlayers() {
        return (
            <aside>
                <p className="header">
                    <span>
                        <IoLogoGameControllerA size="20" />
                    </span>
                    <strong> Jogadores online</strong>
                </p>
                <ul>
                    {players.length !== 0 ? (
                        <>
                            {players.map((player) => (
                                <li key={player.user._id}>
                                    <div>
                                        <img
                                            src={player.user.avatar}
                                            alt={player.user.username}
                                        />
                                        <strong>{player.user.username} </strong>
                                        <div />
                                    </div>

                                    {player.playing === false ? (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleSolicitationGame(
                                                    player.user._id
                                                )
                                            }
                                        >
                                            <IoLogoGameControllerA size="40" />
                                        </button>
                                    ) : (
                                        <p type="button" className="playing">
                                            <GiLightSabers size="40" />
                                        </p>
                                    )}
                                </li>
                            ))}
                        </>
                    ) : (
                        <Invitation />
                    )}
                </ul>
            </aside>
        );
    }

    return (
        <div className="main">
            <header>
                <img src={logo} alt="TicTacToe" />
            </header>
            <div className="dashboard">
                {handlePopup()}
                {handleStart()}
                {handleGame()}
                <Profiles />
                {handleListPlayers()}
            </div>
        </div>
    );
}
