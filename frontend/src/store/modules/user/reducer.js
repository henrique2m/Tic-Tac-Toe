import produce from 'immer';

const INITIAL_STATE = {
    profile: null,
    loading: false,
    validation: false,
};

export default function auth(state = INITIAL_STATE, action) {
    return produce(state, draft => {
        switch (action.type) {
            case '@auth/SIGN_UP_REQUEST': {
                draft.loading = true;
                break;
            }
            case '@auth/SIGN_UP_VALIDATION': {
                draft.validation = true;
                draft.profile = action.payload.idUser;
                draft.loading = false;
                break;
            }
            case '@auth/SIGN_UP_CONFIRM': {
                draft.loading = true;
                break;
            }
            case '@auth/SIGN_IN_SUCCESS': {
                draft.profile = action.payload.user;
                draft.loading = false;
                draft.validation = false;
                break;
            }
            case '@auth/SIGN_FAILURE': {
                draft.loading = false;
                draft.validation = false;
                draft.profile = null;
                break;
            }
            case '@auth/SIGN_OUT': {
                draft.profile = null;
                break;
            }
            case '@auth/SIGN_UP_LOADING': {
                draft.loading = false;
                break;
            }
            case '@auth/SIGN_UP_CANCEL': {
                draft.loading = true;
                break;
            }

            default:
        }
    });
}
