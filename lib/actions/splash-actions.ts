import { post, get } from '../core/utils';
import { DB } from '../setup/db';

/**
 * Describes each of the splash screen action types
 */
export type SplashActionType =
    'SPLASH_REQUEST_PENDING' |
    'SPLASH_REQUEST_FULFILLED' |
    'SPLASH_REQUEST_REJECTED' |
    // 'SPLASH_PROJECT_CREATED' |
    'SPLASH_SET_SCREEN' |
    'SPLASH_GET_PROJECTS';

/**
 * A base interface for describing the splash screen actions
 */
export interface ISplashAction extends Redux.Action {
    type: SplashActionType;
    data?: HatcheryEditor.ISplashScreen;
};

/**
 * Fetches all the projects of a given user. This only works if the user is logged in and has access rights
 * @param user The username of the user we are fetching a project list for
 * @param index The index to  fetching projects for
 * @param limit The limit of how many items to fetch
 * @param search Optional search text
 */
export function getProjectList( user: string, index: number, limit: number, search: string = '' ) {
    return ( dispatch: Redux.Dispatch<ISplashAction> ) => {
        dispatch<ISplashAction>( { type: 'SPLASH_REQUEST_PENDING' });

        get<ModepressAddons.IGetProjects>( `${DB.API}/users/${user}/projects?verbose=false&index=${index}&limit=${limit}&search=${search}` ).then( function( response ) {
            if ( response.error )
                throw new Error( response.message );

            const projects = response.data;

            dispatch<ISplashAction>( {
                type: 'SPLASH_GET_PROJECTS',
                data: {
                    projects: projects,
                    numProjects: response.count
                }
            });

        }).catch( function( err: Error ) {
            dispatch<ISplashAction>( { type: 'SPLASH_REQUEST_REJECTED', data: { error: err } });
        })
    }
}

/**
 * Creates a new project for the authenticated user
 * @param options An object of projet defaults
 */
export function createProject( options: HatcheryServer.IProject ) {
    return ( dispatch: Redux.Dispatch<ISplashAction> ) => {

        // Notify project loading
        dispatch( { type: 'SPLASH_REQUEST_PENDING' });

        // Create project
        post<ModepressAddons.ICreateProject>( `${DB.API}/projects`, options ).then( function( response ) {

            if ( response.error )
                throw new Error( response.message );

            // dispatch<ISplashAction>( {
            //     type: 'SPLASH_PROJECT_CREATED', data: {
            //         selectedProject: response.data
            //     }
            // });

            dispatch( ReactRouterRedux.push( '/dashboard/' + response.data._id ) );

        }).catch( function( err: Error ) {
            return dispatch<ISplashAction>( {
                type: 'SPLASH_REQUEST_REJECTED', data: {
                    error: err,
                    serverResponse: err.message
                }
            });
        });
    };
}