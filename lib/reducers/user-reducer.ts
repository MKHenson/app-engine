import { IUserAction } from '../actions/user-actions';
import { UserPlan } from '../setup/enums';
import { IUser } from 'hatchery-editor';

const defaultMetaState: HatcheryServer.IUserMeta = {
    bio: '',
    plan: UserPlan.Free,
    image: 'media/blank-user.png',
    maxProjects: 0,
    website: ''
}

const defaultUserState: IUser = {
    entry: null,
    error: null,
    isLoggedIn: false,
    loading: false,
    meta: defaultMetaState,
    serverResponse: null
}

/**
 * A reducer for processing project actions
 */
export function userReducer( state: IUser = defaultUserState, action: IUserAction ): IUser {
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
                meta: Object.assign<HatcheryServer.IUserMeta>( {}, defaultMetaState )
            }, action.userData! );
            break;
        case 'USER_LOGGED_OUT':
            toReturn = Object.assign<IUser>( {}, defaultUserState, {
                meta: Object.assign<HatcheryServer.IUserMeta>( {}, defaultMetaState )
            });
            break;
    }

    return toReturn;
}