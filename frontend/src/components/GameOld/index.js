import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Lottie from 'react-lottie';
import { toast } from 'react-toastify';
import gaveOld from '../../assets/json/gaveOld.json';

import { HeartSpinner } from 'react-spinners-kit';

import api from '../../services/api';
import { store } from '../../store';

import './styles.css';

export default function GameOld({ data, gameReset }) {
    const [loading, setLoading] = useState(false);
    const challenger = data;
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
        if (profile._id === challenger._id) {
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
        <div className="container-gameOld">
            <div>
                <article>
                    <div>
                        <Lottie
                            options={{
                                animationData: gaveOld,
                            }}
                        />
                    </div>
                </article>
                <strong> DEU VELHA! </strong>
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
        </div>
    );
}

GameOld.propTypes = {
    data: PropTypes.object,
    gameReset: PropTypes.oneOfType([PropTypes.element, PropTypes.func])
        .isRequired,
};
