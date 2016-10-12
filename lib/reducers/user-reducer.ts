namespace Animate {

    const defaultState: IUser = {
        entry: null,
        error: null,
        isLoggedIn: false,
        loading: false,
        meta: null
    }

    /**
     * A reducer for processing project actions
     */
    export function userReducer( state: IUser, action: IUserAction ): IUser {
        switch ( action.type ) {
            case 'USER_REQUEST_PENDING':
                return Object.assign<IUser>( {}, state, { loading: true });
            case 'USER_REQUEST_REJECTED':
                return Object.assign<IUser>( {}, state, { loading: false }, action );
            case 'USER_AUTHENTICATED':
                return Object.assign<IUser>( {}, state, { loading: false }, action );
            default:
                return defaultState;
        }
    }
}