import { IStorePlugins } from 'hatchery-editor';
import { get } from '../core/utils';
import { DB } from '../setup/db';

/**
 * Describes the different types of plugin action types
 */
export type PluginActionType =
    'PLUGINS_REQUEST_PENDING' |
    'PLUGINS_DOWNLOADED' |
    'PLUGINS_REQUEST_REJECTED';

/**
 * An interface for describing plugin actions
 */
export interface IPluginAction extends Redux.Action {
    type: PluginActionType;
    data?: IStorePlugins;
};

/**
 * Attempts to download the available plugins for use in the editor
 */
export function downloadPluginList() {
    return ( dispatch: Redux.Dispatch<IPluginAction> ) => {
        dispatch<IPluginAction>( { type: 'PLUGINS_REQUEST_PENDING' });

        get<Modepress.IGetArrayResponse<HatcheryServer.IPlugin>>( `${DB.API}/plugins` ).then(( response: ModepressAddons.IGetProjects ) => {
            dispatch<IPluginAction>( { type: 'PLUGINS_DOWNLOADED', data: { plugins: response.data } });
        }).catch(( err: Error ) => {
            dispatch<IPluginAction>( { type: 'PLUGINS_REQUEST_REJECTED', data: { error: err } });
        });
    }
}