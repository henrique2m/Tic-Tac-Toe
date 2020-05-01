import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ClapSpinner } from 'react-spinners-kit';
import logo from '../../assets/logo-ttt.png';
import '../stylesGlobalForms.css';

import { signInRequest } from '../../store/modules/auth/actions';

export default function SignIn() {
    const dispatch = useDispatch();
    const loading = useSelector((state) => state.auth.loading);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();
        dispatch(signInRequest(email, password));
    }

    return (
        <div className="container">
            <form onSubmit={handleSubmit}>
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

                {loading ? (
                    <div className="buttonLoading">
                        <ClapSpinner color="#fff" />
                    </div>
                ) : (
                    <button type="submit"> Entrar </button>
                )}

                <Link to="/register"> Criar uma conta </Link>
            </form>
        </div>
    );
}
