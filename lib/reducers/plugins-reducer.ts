import { IPluginAction, IPluginSelectAction, IPluginToggleAction } from '../actions/plugin-actions';
import { IPlugins } from 'hatchery-editor';

// The defaults of the plugin store
const defaults: IPlugins = {
    plugins: [],
    error: null,
    loading: false,
    map: {},
    serverResponse: null
}

function createPluginMap( plugins: HatcheryServer.IPlugin[] ) {
    const toRet = {};

    for ( let i = 0, l = plugins.length; i < l; i++ ) {
        if ( !toRet[ plugins[ i ].name! ] )
            toRet[ plugins[ i ].name! ] = [];
        else
            continue;

        let pluginArray = toRet[ plugins[ i ].name! ];

        for ( let ii = 0; ii < l; ii++ )
            if ( plugins[ ii ].name === plugins[ i ].name )
                pluginArray.push( plugins[ ii ] );

        // Sort the plugins based on their versions
        pluginArray = pluginArray.sort( function compare( a, b ) {
            if ( a === b )
                return 0;

            const a_components = a.version!.split( '.' );
            const b_components = b.version!.split( '.' );

            const len = Math.min( a_components.length, b_components.length );

            // loop while the components are equal
            for ( let i = 0; i < len; i++ ) {
                // A bigger than B
                if ( parseInt( a_components[ i ] ) > parseInt( b_components[ i ] ) )
                    return 1;

                // B bigger than A
                if ( parseInt( a_components[ i ] ) < parseInt( b_components[ i ] ) )
                    return -1;
            }

            // If one's a prefix of the other, the longer one is greater.
            if ( a_components.length > b_components.length )
                return 1;

            if ( a_components.length < b_components.length )
                return -1;

            // Otherwise they are the same.
            return 0;
        });

        pluginArray.reverse();
    }

    return toRet;
}

/**
 * A reducer that processes state changes of the plugins
 */
export function pluginReducer( state: IPlugins = defaults, action: IPluginAction ): IPlugins {
    let toRet = state;

    switch ( action.type ) {
        case 'PLUGINS_REQUEST_PENDING':
            toRet = Object.assign<IPlugins>( {}, state, { loading: true, error: null });
            break;
        case 'PLUGINS_REQUEST_REJECTED':
            toRet = Object.assign<IPlugins>( {}, state, action.data!, { loading: false });
            break;
        case 'PLUGINS_DOWNLOADED':
            toRet = Object.assign<IPlugins>( {}, state, action.data! );
            toRet.map = createPluginMap( toRet.plugins! );
            break;
        case 'PLUGINS_EXPAND_TOGGLE':
            toRet = Object.assign<IPlugins>( {}, state, {
                plugins: state.plugins!.map(( item ) => {
                    if ( item.name === ( action as IPluginToggleAction ).plugin )
                        return Object.assign<HatcheryServer.IPlugin>( {}, item, { expanded: !item.expanded! });
                    else
                        return item;
                })
            });
            toRet.map = createPluginMap( toRet.plugins! );
            break;
        case 'PLUGINS_SELECTED':
            toRet = Object.assign<IPlugins>( {}, state, {
                plugins: action.data!.plugins!.map(( item ) => {
                    if ( item._id === ( action as IPluginSelectAction ).id )
                        return Object.assign<HatcheryServer.IPlugin>( {}, item, { selected: ( action as IPluginSelectAction ).selected });
                    else
                        return item;
                })
            });
            toRet.map = createPluginMap( toRet.plugins! );
            break;
        default:
            break;
    }

    if ( toRet.plugins )
        for ( const plugin of toRet.plugins )
            if ( !Array.isArray( plugin.versions! ) )
                plugin.versions = [ plugin.versions as any ];

    return toRet;
}