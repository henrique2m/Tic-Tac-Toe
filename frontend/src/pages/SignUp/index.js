import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ClapSpinner } from 'react-spinners-kit';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo-ttt.png';
import '../stylesGlobalForms.css';
import { store } from '../../store';
import { toast } from 'react-toastify';

import {
    signUpRequest,
    signUpConfirm,
    signUpCancel,
} from '../../store/modules/user/actions';

export default function Login() {
    const { profile } = store.getState().user;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const dispatch = useDispatch();
    const loading = useSelector((state) => state.user.loading);
    const validation = useSelector((state) => state.user.validation);

    async function handleRegister(e) {
        e.preventDefault();

        if (password.length < 6 || password.length > 8) {
            return toast.error(
                'Sua senha deve ter no mínimo 6 e no máximo 8 caracteres.',
                { toastId: 'passwordInvalid' }
            );
        }

        if (password !== confirmPassword) {
            return toast.error(
                'Os campos (Senha) e (Senha de confirmação) não correspondem.',
                {
                    toastId: 'passwordDivergent',
                }
            );
        }

        dispatch(signUpRequest(email, password, confirmPassword));
    }

    async function handleValidation(e) {
        e.preventDefault();
        if (code === '') {
            return toast.error('Insira seu código mágico...', {
                toastId: 'codeNull',
            });
        }
        if (code.length > 4) {
            return toast.error('Formato de código inválido', {
                toastId: 'codeFormat',
            });
        }

        dispatch(signUpConfirm(profile, code));
        setEmail('');
        setPassword('');
    }

    async function handleCancel() {
        dispatch(signUpCancel(profile));
    }

    return (
        <div className="container">
            {!validation && (
                <form onSubmit={handleRegister}>
                    <img src={logo} alt="TicTacToe" />
                    <input
                        type="email"
                        placeholder="E-mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Cofirme sua senha"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />

                    {loading ? (
                        <div className="buttonLoading">
                            <ClapSpinner color="#fff" />
                        </div>
                    ) : (
                        <button type="submit"> Criar conta </button>
                    )}

                    <Link to="/"> Já tenho uma conta </Link>
                </form>
            )}

            {validation && (
                <form onSubmit={handleValidation}>
                    <img src={logo} alt="TicTacToe" />
                    <p>Insira abaixo o código que enviamos para seu E-mail</p>
                    <input
                        type="text"
                        placeholder="Seu código mágico..."
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                    />

                    {loading ? (
                        <div className="buttonLoading">
                            <ClapSpinner color="#fff" />
                        </div>
                    ) : (
                        <>
                            <button type="submit"> Validar código </button>
                            <button
                                type="button"
                                className="cancel"
                                onClick={() => handleCancel()}
                            >
                                Cancelar
                            </button>
                        </>
                    )}
                </form>
            )}
        </div>
    );
}
