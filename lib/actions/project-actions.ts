import { IPlugin } from 'hatchery-editor-plugins';
import { get } from '../core/utils';
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

            dispatch<IProjectAction>( {
                type: 'PROJECT_LOADED',
                project: { entry: response.data }
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
export function loadPlugin( pluginDefinition: HatcheryServer.IPlugin ) {
    return ( dispatch: Redux.Dispatch<IProjectAction> ) => {

        dispatch( { type: 'PROJECT_REQUEST_PENDING' });

        // Create the script element
        const script = document.createElement( 'script' );

        // If an error occurs then display it
        script.onerror = function() {
            dispatch<IProjectPluginAction>( {
                type: 'PROJECT_REQUEST_REJECTED',
                project: { error: new Error( `'${pluginDefinition.name}' could not be downloaded` ) },
                plugin: { _id: pluginDefinition._id, $loaded: false }
            });
        }

        // When we successfully load a script
        script.onload = function() {
            pluginDefinition.$loaded = true;

            dispatch<IProjectPluginAction>( {
                type: 'PROJECT_PLUGIN_LOADED',
                plugin: { _id: pluginDefinition._id, $loaded: true }
            });
        }

        script.async = true;
        script.src = pluginDefinition.url!;
        document.head.appendChild( script );
    };
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