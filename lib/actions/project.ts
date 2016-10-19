namespace Animate {

    /**
     * Describes each of the project action types
     */
    export type ProjectActionType =
        'PROJECT_REQUEST_PENDING' |
        'PROJECT_REQUEST_REJECTED' |
        'PROJECT_CREATED' |
        'PROJECT_OPENED';

    /**
     * A base interface for describing project related actions
     */
    export interface IProjectAction extends Redux.Action {
        type: ProjectActionType;
        project: IProject;
    };

    /**
     * Creates a new project for the authenticated user
     * @param options An object of projet defaults
     */
    export function createProject( options: HatcheryServer.IProject ) {
        return ( dispatch: Redux.Dispatch<IProjectAction> ) => {

            // Notify project loading
            dispatch( { type: 'PROJECT_REQUEST_PENDING' });

            // Create project
            Utils.post<ModepressAddons.ICreateProject>( `${DB.API}/projects`, options ).then( function( response ) {

                if ( response.error )
                    return dispatch<IProjectAction>( { type: 'PROJECT_REQUEST_REJECTED', project: { error: new Error( response.message ) } });

                // Assign the actual plugins
                const project = response.data;
                const plugins = project.plugins!.map(( pluginName: string ) => {
                    const iPlugin = getPluginByID( pluginName );
                    if ( iPlugin )
                        return iPlugin;

                    throw new Error( `Could not find a plugin with the name '${pluginName}'` );
                });

                project.$plugins = plugins;

                return dispatch<IProjectAction>( {
                    type: 'PROJECT_CREATED', project: {

                    }
                });

            }).catch( function( err: IAjaxError ) {
                return dispatch<IProjectAction>( {
                    type: 'PROJECT_REQUEST_REJECTED', project: {
                        error: new Error( `An error occurred while connecting to the server. ${err.status}: ${err.message}` )
                    }
                });
            });
        };
    }
}