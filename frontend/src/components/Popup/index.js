import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import api from '../../services/api';
import './styles.css';

export default function Popup({ data, onClearAdversary }) {
    const [profileAdversary, setProfileAdversary] = useState({});

    const [view, setView] = useState({});

    useMemo(() => {
        setProfileAdversary(data[0].user);
        setView(data[1]);
    }, [data]);

    async function handleResponseGame(idAdversary, toggle) {
        const response = await api.post('socket', {
            message: 'response',
            adversary: idAdversary,
            toggle,
        });

        if (!response.data) {
            toast.error('Conexão com oponente foi perdida.');
        }

        if (toggle) {
            onClearAdversary(true);
        } else {
            onClearAdversary(false);
        }

        document.body.style.overflow = 'visible';
    }

    return (
        <div className="container-popup">
            <div>
                <img
                    src={profileAdversary.avatar}
                    alt={profileAdversary.username}
                />
                {view.playerView === 'challenger' ? (
                    <>
                        <p>
                            {view.playerrView}
                            Aguardando a confirmação de
                            <strong> {profileAdversary.username} </strong>
                            para iniciar a partida...
                        </p>
                        <button
                            type="button"
                            onClick={() =>
                                handleResponseGame(profileAdversary._id, false)
                            }
                        >
                            Cancelar
                        </button>
                    </>
                ) : (
                    <>
                        <p>
                            <strong> {profileAdversary.username} </strong>
                            deseja jogar uma partida com você.
                        </p>
                        <button
                            type="button"
                            className="confirm"
                            onClick={() =>
                                handleResponseGame(profileAdversary._id, true)
                            }
                        >
                            Confirmar
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                handleResponseGame(profileAdversary._id, false)
                            }
                        >
                            Negar
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
Popup.propTypes = {
    data: PropTypes.array,
    onClearAdversary: PropTypes.oneOfType([PropTypes.element, PropTypes.func])
        .isRequired,
};
