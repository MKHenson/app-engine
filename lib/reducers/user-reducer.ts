namespace Animate {

    const defaultMeta: HatcheryServer.IUserMeta = {
        bio: '',
        plan: UserPlan.Free,
        image: 'media/blank-user.png',
        maxProjects: 0,
        website: ''
    }

    const defaultState: IUser = {
        entry: null,
        error: null,
        isLoggedIn: false,
        loading: false,
        meta: defaultMeta,
        serverResponse: null
    }

    /**
     * A reducer for processing project actions
     */
    export function userReducer( state: IUser, action: IUserAction ): IUser {
        let toReturn = state;

        switch ( action.type ) {
            case 'USER_REQUEST_PENDING':
                toReturn = Object.assign<IUser>( {}, toReturn, { loading: true, error: null });
                break;
            case 'USER_REQUEST_REJECTED':
            case 'USER_AUTHENTICATED':
            case 'USER_LOGGED_IN':
            case 'USER_GET_PROJECTS':
            case 'USER_PASSWORD_RESET':
            case 'USER_ACTIVATION_RESENT':
            case 'USER_REGISTRATION_SENT':
            case 'USER_REQUEST_FULFILLED':
                toReturn = Object.assign<IUser>( {}, toReturn, { loading: false }, action.userData! );
                break;
            case 'USER_LOGIN_FAILED':
                toReturn = Object.assign<IUser>( {}, toReturn, {
                    loading: false,
                    isLoggedIn: false,
                    meta: Object.assign<HatcheryServer.IUserMeta>( {}, defaultMeta )
                }, action.userData! );
                break;
            case 'USER_LOGGED_OUT':
                toReturn = Object.assign<IUser>( {}, defaultState, {
                    meta: Object.assign<HatcheryServer.IUserMeta>( {}, defaultMeta )
                });
                break;
            default:
                toReturn = defaultState;
                break;
        }
        return toReturn;
    }
}