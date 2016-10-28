import { IPluginAction } from '../actions/plugin-actions';
import { IStorePlugins } from 'hatchery-editor';

// The defaults of the plugin store
const defaults: IStorePlugins = {
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
export function editorReducer( state: IStorePlugins = defaults, action: IPluginAction ): IStorePlugins {
    let toRet = state;

    switch ( action.type ) {
        case 'PLUGINS_REQUEST_PENDING':
            toRet = Object.assign<IStorePlugins>( {}, state, { loading: true, error: null });
            break;
        case 'PLUGINS_REQUEST_REJECTED':
            toRet = Object.assign<IStorePlugins>( {}, state, action.data! );
            break;
        case 'PLUGINS_DOWNLOADED':
            toRet = Object.assign<IStorePlugins>( {}, state, action.data! );
            toRet.map = createPluginMap( toRet.plugins! );
            break;
        default:
            break;
    }

    return toRet;
}