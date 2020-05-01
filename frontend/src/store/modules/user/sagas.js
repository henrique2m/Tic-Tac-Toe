import { takeLatest, call, put, all } from 'redux-saga/effects';
import { toast } from 'react-toastify';

import api from '../../../services/api';
import history from '../../../services/history';

import { signInSuccess, signFailure } from '../auth/actions';
import { signUpValidation, signUpLoading } from '../user/actions';

export function* signUp({ payload }) {
    try {
        const { email, password, confirmPassword } = payload;

        const response = yield call(api.post, 'register', {
            email,
            password,
            confirmPassword,
        });

        const { user, error } = response.data;

        if (error) {
            yield put(signUpLoading());

            if (error === 'email') {
                return toast.error(
                    'Já exite uma conta vinculada a esse e-mail.'
                );
            }
        }

        yield put(signUpValidation(user));
    } catch (err) {
        yield put(signFailure());

        return toast.error('Algo de errado ocorreu, tente novamente.');
    }
}

export function* signUpCode({ payload }) {
    try {
        const { idUser, code } = payload;

        const response = yield call(api.post, 'validation', {
            idUser,
            code,
        });

        const { token, user, error } = response.data;

        switch (error) {
            case 'ettemptExceeded':
                yield put(signUpLoading());

                yield call(api.post, 'cancel', { idUser });

                yield put(signFailure());

                return toast.error('Limite de tentativas excedido.');
            case 'codeInvalid':
                yield put(signUpLoading());

                return toast.error('Código invalido.');
            default:
        }

        api.defaults.headers.Authorization = `Bearer ${token}`;

        yield put(signInSuccess(token, user));

        history.push('/dashboard');
    } catch (err) {
        toast.error('Algo de errado ocorreu, tente novamente.');

        yield put(signFailure());
    }
}

export function* signUpCancel({ payload }) {
    try {
        const { idUser } = payload;

        const response = yield call(api.post, 'cancel', {
            idUser,
        });

        const { success } = response.data;

        if (success) {
            yield put(signFailure());
            return toast.success('Registro cancelado com sucesso.');
        }
    } catch (err) {
        yield put(signUpLoading());
        toast.error('Algo de errado ocorreu, tente novamente.');
    }
}

export default all([
    takeLatest('@auth/SIGN_UP_REQUEST', signUp),
    takeLatest('@auth/SIGN_UP_CONFIRM', signUpCode),
    takeLatest('@auth/SIGN_UP_CANCEL', signUpCancel),
]);
