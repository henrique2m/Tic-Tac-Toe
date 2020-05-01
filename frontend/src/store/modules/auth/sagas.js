import { takeLatest, call, put, all } from 'redux-saga/effects';

import { toast } from 'react-toastify';

import api from '../../../services/api';
import history from '../../../services/history';

import { signInSuccess, signFailure } from './actions';

export function* signIn({ payload }) {
    try {
        const { email, password } = payload;

        const response = yield call(api.post, 'auth', {
            email,
            password,
        });

        const { token, user, error } = response.data;

        if (error) {
            if (error === 'email') {
                yield put(signFailure());
                return toast.error('Usuário não cadastrado.');
            }

            if (error === 'password') {
                yield put(signFailure());
                return toast.error('Senha incorreta.');
            }
        }

        api.defaults.headers.Authorization = `Bearer ${token}`;

        yield put(signInSuccess(token, user));

        history.push('/dashboard');
    } catch (err) {
        toast.error('Algo deu errado, tente novamente. :(');
        yield put(signFailure());
    }
}

export function* signOut({ payload }) {
    try {
        const { idUser } = payload;

        yield call(api.post, 'socketDelete', {
            user: idUser,
        });

        yield call(api.post, 'socket', {
            message: 'online',
        });

        history.push('/');
    } catch (err) {
        return toast.error('Algo deu errado, tente novamente.');
    }
}

export default all([
    takeLatest('@auth/SIGN_IN_REQUEST', signIn),
    takeLatest('@auth/SIGN_OUT', signOut),
]);
