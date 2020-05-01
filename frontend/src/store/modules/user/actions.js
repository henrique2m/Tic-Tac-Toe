export function signUpRequest(email, password, confirmPassword) {
    return {
        type: '@auth/SIGN_UP_REQUEST',
        payload: { email, password, confirmPassword },
    };
}

export function signUpValidation(idUser) {
    return {
        type: '@auth/SIGN_UP_VALIDATION',
        payload: { idUser },
    };
}

export function signUpConfirm(idUser, code) {
    return {
        type: '@auth/SIGN_UP_CONFIRM',
        payload: { idUser, code },
    };
}

export function signUpLoading() {
    return {
        type: '@auth/SIGN_UP_LOADING',
    };
}

export function signUpCancel(idUser) {
    return {
        type: '@auth/SIGN_UP_CANCEL',
        payload: { idUser },
    };
}
