namespace Animate {

    /**
     * Describes each of the user action types
     */
    export type UserActionType =
        'USER_REQUEST_PENDING' |
        'USER_REQUEST_REJECTED' |
        'USER_REQUEST_FULFILLED' |
        'USER_AUTHENTICATED' |
        'USER_LOGGED_IN' |
        'USER_GET_PROJECTS' |
        'USER_LOGIN_FAILED';

    /**
     * A base interface for describing user related actions
     */
    export interface IUserAction extends Redux.Action {
        type: UserActionType;
        userData?: IUser;
    };

    /**
     * Fetches all the projects of a given user. This only works if the user is logged in and has access rights
     * @param user The username of the user we are fetching a project list for
     * @param index The index to  fetching projects for
     * @param limit The limit of how many items to fetch
     * @param search Optional search text
     */
    export function getProjectList( user: string, index: number, limit: number, search: string = '' ) {
        return ( dispatch: Redux.Dispatch<IUserAction> ) => {

            Utils.get<ModepressAddons.IGetProjects>( `${DB.API}/users/${user}/projects?verbose=false&index=${index}&limit=${limit}&search=${search}` ).then( function( response ) {
                if ( response.error )
                    throw new Error( response.message );

                const projects = response.data;

                // Assign the plugins
                for ( const project of projects ) {
                    const plugins = project.plugins!.map(( pluginName: string ) => {
                        const iPlugin = getPluginByID( pluginName );
                        if ( iPlugin )
                            return iPlugin;

                        throw new Error( `Could not find a plugin with the name '${pluginName}'` );
                    });

                    project.$plugins = plugins;
                }

                dispatch<IUserAction>( {
                    type: 'USER_GET_PROJECTS',
                    userData: {
                        projects: projects,
                        numProjects: response.count
                    }
                });

            }).catch( function( err: Error ) {
                dispatch<IUserAction>( { type: 'USER_REQUEST_REJECTED', userData: { error: err } });
            })
        }
    }

    /**
     * Checks if a user is logged in or not. This checks the server using
     * cookie and session data from the browser.
     */
    export function authenticated() {

        return ( dispatch: Redux.Dispatch<IUserAction> ) => {
            dispatch( { type: 'USER_REQUEST_PENDING' });

            Utils.get<UsersInterface.IAuthenticationResponse>( `${DB.USERS}/authenticated` ).then(( authResponse ): void => {

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

                Utils.get<ModepressAddons.IGetDetails>( `${DB.API}/user-details/${authResponse.user!.username}` ).then(( metaResponse: ModepressAddons.IGetDetails ) => {

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
     * This function is used to reset a user's password
     */
    export function resetPassword( user: string ) {
        return ( dispatch: Redux.Dispatch<IUserAction> ) => {
            Utils.get<UsersInterface.IResponse>( `${DB.USERS}/users/${user}/request-password-reset` ).then( function( response ) {
                if ( response.error )
                    throw new Error( response.message );

                return resolve( response );

            }).catch( function( err: Error ) {
                return reject( new Error( `An error occurred while connecting to the server. ${err.status}: ${err.message}` ) );
            });
        }
    }

    /**
     * This function is used to resend a user's activation code
     */
    export function resendActivation( user: string ): Promise<UsersInterface.IResponse> {
        return ( dispatch: Redux.Dispatch<IUserAction> ) => {
            Utils.get<UsersInterface.IResponse>( `${DB.USERS}/users/${user}/resend-activation` ).then( function( response ) {
                if ( response.error )
                    throw new Error( response.message );

                return resolve( response );

            }).catch( function( err: Error ) {
                return reject( new Error( `An error occurred while connecting to the server. ${err.status}: ${err.message}` ) );
            });
        }
    }

    /**
     * Tries to log the user in asynchronously
     * @param token An object with user login details
     */
    export function login( token: UsersInterface.ILoginToken ) {
        return ( dispatch: Redux.Dispatch<IUserAction> ) => {

            dispatch( { type: 'USER_REQUEST_PENDING' });
            let entry: UsersInterface.IUserEntry;

            Utils.post<UsersInterface.IAuthenticationResponse>( `${DB.USERS}/users/login`, token ).then(( authResponse ) => {
                if ( authResponse.error )
                    throw new Error( authResponse.message );

                if ( authResponse.authenticated ) {
                    entry = authResponse.user!;
                    return Utils.get<ModepressAddons.IGetDetails>( `${DB.API}/user-details/${authResponse.user!.username}` );
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
                        entry: entry
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
}