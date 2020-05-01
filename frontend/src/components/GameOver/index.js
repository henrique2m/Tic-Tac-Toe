import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Lottie from 'react-lottie';

import winner from '../../assets/json/winner.json';
import fireworks from '../../assets/json/fireworks.json';
import { HeartSpinner } from 'react-spinners-kit';

import { toast } from 'react-toastify';

import api from '../../services/api';
import { store } from '../../store';

import './styles.css';

export default function GameOver({ data, gameReset }) {
    const playerWinner = data;
    const [loading, setLoading] = useState(false);
    const { profile } = store.getState().user;

    async function updatePlaying() {
        setLoading(true);

        const resPlaying = await api.put('updatePlaying', {
            idUser: profile._id,
            playing: false,
        });

        setLoading(false);

        if (resPlaying.data.error) {
            toast.error('Algo deu errado, tente novamente.', {
                toastId: 'updatePlaying',
            });

            return false;
        }

        await api.post('socket', {
            message: 'online',
        });

        localStorage.removeItem('idGame');
        gameReset();
    }

    async function gameLogout() {
        if (profile._id !== playerWinner._id) {
            updatePlaying();
            return true;
        }

        setLoading(true);

        const idGame = localStorage.getItem('idGame');

        if (idGame === '' || idGame === null) return false;

        const resGame = await api.post('deleteGame', { idGame });

        setLoading(false);

        if (resGame.data.error) {
            toast.error('Algo deu errado, tente novamente.', {
                toastId: 'gameDelete',
            });

            return false;
        }

        updatePlaying();
    }

    return (
        <div className="container-gameOver">
            <div>
                <article>
                    <img
                        src={playerWinner.avatar}
                        alt={playerWinner.username}
                    />

                    <div>
                        <Lottie
                            options={{
                                animationData: winner,
                            }}
                        />
                    </div>
                </article>
                <strong>
                    <span>{playerWinner.username}</span> ganhou a partida
                </strong>
                {!loading ? (
                    <button
                        type="button"
                        onClick={() => {
                            gameLogout();
                        }}
                    >
                        Sair
                    </button>
                ) : (
                    <span>
                        <HeartSpinner />
                    </span>
                )}
            </div>
            <article className="fireworks">
                <Lottie
                    options={{
                        animationData: fireworks,
                    }}
                />
            </article>
        </div>
    );
}

GameOver.propTypes = {
    data: PropTypes.object,
    gameReset: PropTypes.oneOfType([PropTypes.element, PropTypes.func])
        .isRequired,
};
