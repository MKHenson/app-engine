import { IStorePlugins } from 'hatchery-editor';
import { get } from '../core/utils';
import { DB } from '../setup/db';

/**
 * Describes the different types of plugin action types
 */
export type PluginActionType =
    'PLUGINS_REQUEST_PENDING' |
    'PLUGINS_DOWNLOADED' |
    'PLUGINS_EXPAND_TOGGLE' |
    'PLUGINS_SELECTED' |
    'PLUGINS_REQUEST_REJECTED';

/**
 * An interface for describing plugin actions
 */
export interface IPluginAction extends Redux.Action {
    type: PluginActionType;
    data?: IStorePlugins;
};

/**
 * An interface for describing plugin expand actions
 */
export interface IPluginToggleAction extends IPluginAction {
    plugin: string;
};

/**
 * An interface for describing plugin select actions
 */
export interface IPluginSelectAction extends IPluginAction {
    id: string;
    selected: boolean;
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

/*
 * Toggles if a plugin should show all its versions or not
 * @param plugins The name of the plugin to toggle
 */
export function toggleExpanded( plugin: string ): IPluginToggleAction {
    return {
        type: 'PLUGINS_EXPAND_TOGGLE', plugin: plugin
    };
}

/*
 * Selects or unselects a plugin by ID
 * @param plugins The name of the plugin to toggle
 */
export function select( id: string, selected: boolean ): IPluginSelectAction {
    return {
        type: 'PLUGINS_SELECTED', id: id, selected: selected
    };
}