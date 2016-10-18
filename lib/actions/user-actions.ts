namespace Animate {

    /**
     * Describes each of the user action types
     */
    export type UserActionType =
        'USER_REQUEST_PENDING' |
        'USER_REQUEST_REJECTED' |
        'USER_REQUEST_FULFILLED' |
        'USER_AUTHENTICATED';

    /**
     * A base interface for describing user related actions
     */
    export interface IUserAction extends Redux.Action {
        type: UserActionType;
        userData?: IUser;
    };

    /**
     * Checks if a user is logged in or not. This checks the server using
     * cookie and session data from the browser.
     */
    export function authenticated() {

        return ( dispatch: Redux.Dispatch<IUserAction> ) => {
            dispatch( { type: 'USER_REQUEST_PENDING' });

            Utils.get<UsersInterface.IAuthenticationResponse>( `${DB.USERS}/authenticated` ).then(( data ): void => {

                if ( data.error )
                    throw new Error( data.message );

                if ( !data.authenticated ) {
                    dispatch( {
                        type: 'USER_AUTHENTICATED',
                        userData: {
                            isLoggedIn: false
                        }
                    });
                    return;
                }

                Utils.get<ModepressAddons.IGetDetails>( `${DB.API}/user-details/${data.user!.username}` ).then(( meta: ModepressAddons.IGetDetails ) => {

                    if ( meta && meta.error )
                        throw new Error( meta.message );

                    dispatch( {
                        type: 'USER_AUTHENTICATED',
                        userData: {
                            entry: data.user,
                            meta: meta,
                            loggedIn: true
                        }
                    });

                })

            }).catch(( err: IAjaxError ) => {
                dispatch( { type: 'USER_REQUEST_REJECTED', userData: { error: err.message } });
            });
        }
    }
}