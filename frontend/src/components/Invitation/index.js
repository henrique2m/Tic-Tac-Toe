import React, { useState } from 'react';
import { HeartSpinner } from 'react-spinners-kit';
import api from '../../services/api';
import { store } from '../../store';
import './styles.css';
import { toast } from 'react-toastify';

export default function Invitation() {
    const [email, setEmail] = useState('');
    const { profile } = store.getState().user;
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();

        if (email === '') {
            return toast.error('Por favor, informe um e-mail.', {
                toastId: 'emailNull',
            });
        }

        try {
            setLoading(true);
            await api.post('ivitation', {
                email: email,
                username: profile.username,
            });
            setLoading(false);

            setEmail('');

            return toast.success('Convite enviado com sucesso! (:', {
                toastId: 'ivitationSuccess',
            });
        } catch (error) {
            return toast.error(
                'Não foi possível enviar o convite, verifique o e-mail e tente novamente.',
                {
                    toastId: 'errorEmail',
                }
            );
        }
    }

    return (
        <div className="container-invitation">
            {!loading ? (
                <form onSubmit={handleSubmit}>
                    <header>
                        <h3>Convide um amigo</h3>
                    </header>
                    <input
                        type="email"
                        placeholder="E-mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <button type="submit"> Convidar </button>
                </form>
            ) : (
                <HeartSpinner />
            )}
        </div>
    );
}
