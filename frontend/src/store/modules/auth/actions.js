export function signInRequest(email, password) {
    return {
        type: '@auth/SIGN_IN_REQUEST',
        payload: { email, password },
    };
}

export function signInSuccess(token, user) {
    return {
        type: '@auth/SIGN_IN_SUCCESS',
        payload: { user, token },
    };
}

export function signFailure() {
    return {
        type: '@auth/SIGN_FAILURE',
    };
}

export function signOut(idUser) {
    return {
        type: '@auth/SIGN_OUT',
        payload: { idUser },
    };
}
