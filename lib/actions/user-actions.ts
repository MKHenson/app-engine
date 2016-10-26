import { IUser } from 'hatchery-editor';
import { get, del, post } from '../core/utils';
import { DB } from '../setup/db';

/**
 * Describes each of the user action types
 */
export type UserActionType =
    'USER_REQUEST_PENDING' |
    'USER_REQUEST_REJECTED' |
    'USER_REQUEST_FULFILLED' |
    'USER_AUTHENTICATED' |
    'USER_LOGGED_IN' |
    'USER_REGISTRATION_SENT' |
    'USER_GET_PROJECTS' |
    'USER_LOGIN_FAILED' |
    'USER_PASSWORD_RESET' |
    'USER_ACTIVATION_RESENT' |
    'USER_REMOVED_PROJECT' |
    'USER_LOGGED_OUT';

/**
 * A base interface for describing user related actions
 */
export interface IUserAction extends Redux.Action {
    type: UserActionType;
    userData?: IUser;
};

/**
 * Describes the action for removing projects
 */
export interface IUserProjectRemovedAction extends Redux.Action {
    type: UserActionType;
    username?: string;
    project?: string;
};

/**
 * Sends a server request to check if a user is logged in
 */
export function authenticated() {

    return ( dispatch: Redux.Dispatch<IUserAction> ) => {
        dispatch<IUserAction>( { type: 'USER_REQUEST_PENDING' });

        get<UsersInterface.IAuthenticationResponse>( `${DB.USERS}/authenticated` ).then(( authResponse ): void => {

            if ( authResponse.error )
                throw new Error( authResponse.message );

            if ( !authResponse.authenticated ) {
                dispatch<IUserAction>( {
                    type: 'USER_AUTHENTICATED',
                    userData: {
                        isLoggedIn: false
                    }
                });
                return;
            }

            get<ModepressAddons.IGetDetails>( `${DB.API}/user-details/${authResponse.user!.username}` ).then(( metaResponse: ModepressAddons.IGetDetails ) => {

                if ( metaResponse && metaResponse.error )
                    throw new Error( metaResponse.message );

                dispatch<IUserAction>( {
                    type: 'USER_AUTHENTICATED',
                    userData: {
                        entry: authResponse.user,
                        meta: metaResponse.data,
                        isLoggedIn: true
                    }
                });

            })

        }).catch(( err: Error ) => {
            dispatch<IUserAction>( { type: 'USER_REQUEST_REJECTED', userData: { error: err } });
        });
    }
}

/**
 * Attempts to log the user out
 */
export function logout() {
    return ( dispatch: Redux.Dispatch<IUserAction> ) => {
        dispatch<IUserAction>( { type: 'USER_REQUEST_PENDING' });

        get<UsersInterface.IResponse>( `${DB.USERS}/logout` ).then( function( data ) {
            if ( data.error )
                throw new Error( data.message );

            dispatch<IUserAction>( { type: 'USER_LOGGED_OUT' });
        }).catch( function( err: Error ) {
            dispatch<IUserAction>( { type: 'USER_REQUEST_REJECTED', userData: { error: err } });
        })
    }
}


/**
 * Sends an instruction to the server to start the user password reset procedure
 */
export function resetPassword( user: string ) {
    return ( dispatch: Redux.Dispatch<IUserAction> ) => {
        dispatch<IUserAction>( { type: 'USER_REQUEST_PENDING' });

        get<UsersInterface.IResponse>( `${DB.USERS}/users/${user}/request-password-reset` ).then( function( response ) {
            if ( response.error )
                throw new Error( response.message );

            dispatch<IUserAction>( {
                type: 'USER_PASSWORD_RESET', userData: {
                    serverResponse: response.message
                }
            });
        }).catch( function( err: Error ) {
            dispatch<IUserAction>( { type: 'USER_REQUEST_REJECTED', userData: { error: err } });
        });
    }
}

/**
 * Sends an instruction to the server to resend the user account activation link
 */
export function resendActivation( user: string ) {
    return ( dispatch: Redux.Dispatch<IUserAction> ) => {
        dispatch<IUserAction>( { type: 'USER_REQUEST_PENDING' });

        get<UsersInterface.IResponse>( `${DB.USERS}/users/${user}/resend-activation` ).then( function( response ) {
            if ( response.error )
                throw new Error( response.message );

            dispatch<IUserAction>( {
                type: 'USER_ACTIVATION_RESENT', userData: {
                    serverResponse: response.message
                }
            });
        }).catch( function( err: Error ) {
            dispatch<IUserAction>( { type: 'USER_REQUEST_REJECTED', userData: { error: err } });
        });
    }
}

/**
 * Removes a user's project by its id
 * @param username The username of the user we are removing a project for
 * @param pid The id of the project to remove
 */
export function removeProject( username: string, pid: string ) {
    return ( dispatch: Redux.Dispatch<IUserAction> ) => {

        dispatch( { type: 'USER_REQUEST_PENDING' });

        del<Modepress.IResponse>( `${DB.API}/users/${username}/projects/${pid}` ).then( function( data ) {
            if ( data.error )
                throw new Error( data.message );

            dispatch<IUserProjectRemovedAction>( {
                type: 'USER_REMOVED_PROJECT',
                project: pid,
                username: username
            });

            dispatch<IUserAction>( {
                type: 'USER_REQUEST_FULFILLED', userData: {
                    serverResponse: data.message
                }
            });

        }).catch( function( err: Error ) {
            dispatch<IUserAction>( {
                type: 'USER_REQUEST_REJECTED', userData: {
                    error: new Error( err.message )
                }
            });
        });
    }
}

/**
 * Attempts to log the user in using the token provided
 */
export function login( token: UsersInterface.ILoginToken ) {
    return ( dispatch: Redux.Dispatch<IUserAction> ) => {

        dispatch( { type: 'USER_REQUEST_PENDING' });
        let entry: UsersInterface.IUserEntry;
        let message: string;

        post<UsersInterface.IAuthenticationResponse>( `${DB.USERS}/users/login`, token ).then(( authResponse ) => {
            if ( authResponse.error )
                throw new Error( authResponse.message );

            if ( authResponse.authenticated ) {
                entry = authResponse.user!;
                message = authResponse.message;
                return get<ModepressAddons.IGetDetails>( `${DB.API}/user-details/${authResponse.user!.username}` );
            }
            else
                throw new Error( `User could not be authenticated: '${authResponse.message}'` );

        }).then(( metaResponse: ModepressAddons.IGetDetails ) => {
            if ( metaResponse.error )
                throw new Error( metaResponse.message );

            dispatch<IUserAction>( {
                type: 'USER_LOGGED_IN', userData: {
                    isLoggedIn: true,
                    meta: metaResponse!.data,
                    entry: entry,
                    serverResponse: message
                }
            });

        }).catch(( err: Error ) => {
            dispatch<IUserAction>( {
                type: 'USER_LOGIN_FAILED', userData: {
                    error: new Error( err.message )
                }
            });
        })
    };
}

/**
 * Attempts to register the user with the provided token
 */
export function register( token: UsersInterface.IRegisterToken ) {
    return ( dispatch: Redux.Dispatch<IUserAction> ) => {
        dispatch<IUserAction>( { type: 'USER_REQUEST_PENDING' });

        post<UsersInterface.IAuthenticationResponse>( `${DB.USERS}/users/register`, token ).then( function( response ) {
            if ( response.error )
                throw new Error( response.message );

            dispatch<IUserAction>( {
                type: 'USER_REGISTRATION_SENT', userData: {
                    entry: response.user!,
                    isLoggedIn: response.authenticated,
                    serverResponse: response.message
                }
            });
        }).catch( function( err: Error ) {
            dispatch<IUserAction>( { type: 'USER_REQUEST_REJECTED', userData: { error: err } });
        });
    }
}