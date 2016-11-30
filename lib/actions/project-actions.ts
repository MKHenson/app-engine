import { IPlugin } from 'hatchery-editor-plugins';
import { get, all } from '../core/utils';
import { DB } from '../setup/db';

/**
 * Describes each of the project action types
 */
export type ProjectActionType =
    'PROJECT_PLUGIN_LOADED' |
    'PROJECT_PLUGIN_INSTANCE_ADDED' |
    'PROJECT_REQUEST_PENDING' |
    'PROJECT_REQUEST_REJECTED' |
    'PROJECT_CREATED' |
    'PROJECT_LOADED';

/**
 * A base interface for describing project related actions
 */
export interface IProjectAction extends Redux.Action {
    type: ProjectActionType;
    project?: HatcheryEditor.IProject;
};

export interface IProjectPluginAction extends IProjectAction {
    plugin: HatcheryServer.IPlugin;
};

/**
 * Attempts to load a project by its id
 */
export function loadProject( id: string, username: string ) {
    return ( dispatch: Redux.Dispatch<IProjectAction> ) => {
        dispatch( { type: 'PROJECT_REQUEST_PENDING' });

        get<ModepressAddons.IGetProject>( `${DB.API}/users/${username}/projects/${id}` ).then(( response ) => {
            if ( response.error )
                throw new Error( response.message );

            // New project created with entry data set from server and all plugins wiped
            dispatch<IProjectAction>( {
                type: 'PROJECT_LOADED',
                project: {
                    entry: response.data,
                    plugins: [],
                    loading: true // Still loading plugins
                }
            });

            // Now that the project is loaded,
            // lets load each of the plugins based in the version specified
            const promises: Promise<ModepressAddons.IGetPlugin>[] = [];
            for ( const version of response.data.versions! )
                promises.push( get<ModepressAddons.IGetPlugin>( `${DB.API}/plugins/${version.id}` ) );

            all( promises, ( item, percent ) => {
                if ( item.error ) {
                    dispatch<IProjectPluginAction>( {
                        type: 'PROJECT_PLUGIN_LOADED',
                        plugin: { error: item.message, loaded: false }
                    });
                }
                else {
                    dispatch<IProjectPluginAction>( {
                        type: 'PROJECT_PLUGIN_LOADED',
                        plugin: Object.assign<HatcheryServer.IPlugin>( item.data, { error: null, loaded: false })
                    });
                }

            }).then(( plugins ) => {

                const scriptPromises: Promise<HatcheryServer.IPlugin>[] = [];
                for ( const plugin of plugins )
                    scriptPromises.push( loadPlugin( plugin.data ) );

                return all( scriptPromises, ( plugin ) => {
                    dispatch<IProjectPluginAction>( {
                        type: 'PROJECT_LOADED',
                        plugin: Object.assign<HatcheryServer.IPlugin>( { error: null, loaded: true })
                    });
                });


            }).catch(( err ) => {
                throw err
            });

        }).catch(( err ) => {
            dispatch<IProjectAction>( {
                type: 'PROJECT_REQUEST_REJECTED',
                project: { error: err }
            });
        })
    }
}

/**
 * Attempts to log the user in using the token provided
 */
export function loadPlugin( pluginDefinition: HatcheryServer.IPlugin ): Promise<HatcheryServer.IPlugin> {
    return new Promise<HatcheryServer.IPlugin>(( resolve, reject ) => {
        // Create the script element
        const script = document.createElement( 'script' );

        // If an error occurs then display it
        script.onerror = function() {
            reject();
        }

        // When we successfully load a script
        script.onload = function() {
            resolve( pluginDefinition );
        }

        script.async = true;
        script.src = pluginDefinition.url!;
        document.head.appendChild( script );
    });
}

/**
 * Adds a plugin instance to its parent plugin
 */
export function addPluginInstance( plugin: HatcheryServer.IPlugin, instance: IPlugin ) {
    return {
        type: 'PROJECT_PLUGIN_INSTANCE_ADDED',
        plugin: { _id: plugin._id, $instance: instance }
    } as IProjectPluginAction;
}