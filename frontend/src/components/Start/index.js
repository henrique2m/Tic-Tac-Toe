import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { HeartSpinner } from 'react-spinners-kit';
import x from '../../assets/x-ttt.svg';
import api from '../../services/api';
import './styles.css';

export default function Start({ data, onClearStart }) {
    const [challenger, setChallenger] = useState({}); // desafiador
    const [challenged, setChallenged] = useState([]); // desafiado
    const [status, setStatus] = useState(true);

    useMemo(() => {
        setChallenger(data.profile);
        setChallenged(data.adversary);
    }, [data]);

    useMemo(() => {
        async function loadGame() {
            const response = await api.post('startgame', {
                challenger: challenger._id,
                challenged: challenged[0].user._id,
            });

            const { _id } = response.data;

            if (_id) {
                setStatus(false);
                onClearStart(response.data);
            }
        }

        if (
            challenged.length !== 0 &&
            challenged[1].playerView === 'challenger'
        ) {
            if (status) {
                loadGame();
            }
        }
    }, [challenged, challenger._id, onClearStart, status]);

    return (
        <div className="container-start">
            <div>
                <h3>Estamos preparando tudo para uma partida memorável</h3>
                <ul>
                    {challenged.length !== 0 ? (
                        <>
                            {challenged[1].playerView === 'challenger' ? (
                                <>
                                    <li>
                                        <img
                                            src={challenger.avatar}
                                            alt={challenged.username}
                                        />
                                        <strong>{challenger.username}</strong>
                                    </li>
                                    <li>
                                        <img src={x} alt="x" />
                                    </li>
                                    <li>
                                        <img
                                            src={challenged[0].user.avatar}
                                            alt={challenged[0].user.username}
                                        />
                                        <strong>
                                            {challenged[0].user.username}
                                        </strong>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li>
                                        <img
                                            src={challenged[0].user.avatar}
                                            alt={challenged[0].user.username}
                                        />
                                        <strong>
                                            {challenged[0].user.username}
                                        </strong>
                                    </li>
                                    <li>
                                        <img src={x} alt="x" />
                                    </li>
                                    <li>
                                        <img
                                            src={challenger.avatar}
                                            alt={challenged.username}
                                        />
                                        <strong>{challenger.username}</strong>
                                    </li>
                                </>
                            )}
                        </>
                    ) : null}
                </ul>
                <span>
                    <HeartSpinner size={80} />
                </span>
            </div>
        </div>
    );
}

Start.propTypes = {
    data: PropTypes.object,
    onClearStart: PropTypes.oneOfType([PropTypes.element, PropTypes.func])
        .isRequired,
};
