namespace Animate {

    /**
     * Describes each of the splash screen action types
     */
    export type SplashActionType =
        'SPLASH_REQUEST_PENDING' |
        'SPLASH_REQUEST_FULFILLED' |
        'SPLASH_REQUEST_REJECTED' |
        'SPLASH_GET_PROJECTS';

    /**
     * A base interface for describing the splash screen actions
     */
    export interface ISplashAction extends Redux.Action {
        type: SplashActionType;
        data?: ISplashScreen;
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
}