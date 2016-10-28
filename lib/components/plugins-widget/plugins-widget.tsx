import { get } from '../../core/utils';
import { DB } from '../../setup/db';
import { VCheckbox } from '../v-checkbox/v-checkbox';

export interface IPluginsWidgetProps {
    onChange( selectedPlugins: HatcheryServer.IPlugin[] );
    onError( error: Error );
}

export interface IPluginsWidgetState {
    loading?: boolean;
    plugins?: HatcheryServer.IPlugin,
    selectedPlugin?: HatcheryServer.IPlugin | null,
    activePlugin?: HatcheryServer.IPlugin | null,
    selectedPlugins?: HatcheryServer.IPlugin[]
}

/**
 * A class for displaying a list of available plugins that can be used with a project.
 */
export class PluginsWidget extends React.Component<IPluginsWidgetProps, IPluginsWidgetState> {

    /**
     * Creates an instance
     */
    constructor( props: IPluginsWidgetProps ) {
        super( props );
        this.state = {
            loading: false,
            plugins: {},
            selectedPlugin: null,
            activePlugin: null,
            selectedPlugins: []
        };
    }

    /**
     * When the component is mounted, we download the latest plugins
     */
    componentWillMount() {
        this.setState( {
            loading: true,
            plugins: {}
        });

        // Donwload the plugins available to this user
        get<Modepress.IGetArrayResponse<HatcheryServer.IPlugin>>( `${DB.API}/plugins` ).then(( response: ModepressAddons.IGetProjects ) => {
            const plugins = this.onPluginsLoaded( response.data );
            this.setState( {
                loading: false,
                plugins: plugins
            });

        }).catch(( err: Error ) => {
            this.setState( {
                loading: false
            });
            this.props.onError( new Error( 'Could not load plugins : ' + err.message ) );
        });
    }

    /**
     * Gets the currently selected plugins
     */
    get selectedPlugins(): HatcheryServer.IPlugin[] {
        return this.state.selectedPlugins!;
    }

    /*
    * Called when we select a plugin
    * @param The plugin to select
    */
    selectPlugin( plugin: HatcheryServer.IPlugin ) {

        const selectedPlugins = this.state.selectedPlugins!;

        // If this plugin is not selected
        if ( selectedPlugins.indexOf( plugin ) === -1 ) {

            // Make sure if another version is selected, that its de-selected
            for ( let i = 0, l = selectedPlugins.length; i < l; i++ )
                if ( selectedPlugins[ i ].name === plugin.name ) {
                    selectedPlugins.splice( i, 1 );
                    break;
                }

            selectedPlugins.push( plugin );
        }
        else
            selectedPlugins.splice( selectedPlugins.indexOf( plugin ), 1 );

        // Set the active selected plugin
        if ( selectedPlugins.length > 0 )
            this.setState( { selectedPlugin: selectedPlugins[ selectedPlugins.length - 1 ] });
        else
            this.setState( { selectedPlugin: null });

        this.props.onChange( selectedPlugins );
    }

    /*
    * Checks if a plugin must show a tick. This happens if its selected, or if a different version of the same plugin is.
    * @param The plugin to check
    */
    mustShowPluginTick( plugin, index: number ): boolean {
        const selectedPlugins = this.state.selectedPlugins!;
        if ( index === 0 ) {
            // Make sure if another version is selected, that its de-selected
            for ( let i = 0, l = selectedPlugins.length; i < l; i++ )
                if ( selectedPlugins[ i ].name === plugin.name ) {
                    return true;
                }

            return false;
        }
        else {
            if ( selectedPlugins.indexOf( plugin ) !== -1 )
                return true;
            else
                return false;
        }
    }

    /*
    * Toggles if a plugin should show all its versions or not
    * @param The plugin to toggle
    */
    showVersions( plugin: HatcheryServer.IPlugin ) {
        const plugins = this.state.plugins!;
        for ( const n in plugins )
            for ( let i = 0, l = plugins[ n ].length; i < l; i++ ) {
                if ( plugins[ n ][ i ].name === plugin.name ) {
                    plugins[ n ][ i ].expanded = !plugins[ n ][ i ].expanded;
                }
            }

        this.setState( { plugins: plugins });
    }

    /**
     * Once the plugins are loaded from the DB
     */
    onPluginsLoaded( plugins: Array<HatcheryServer.IPlugin> ): HatcheryServer.IPlugin {

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
     * Generates the React code for displaying the plugins
     */
    createPluginHierarchy(): JSX.Element[] {
        const pluginArray = this.state.plugins!;
        const arr: { name: string; array: HatcheryServer.IPlugin[] }[] = [];
        for ( const i in pluginArray )
            arr.push( { name: i, array: pluginArray[ i ] });

        return arr.map(( pluginGrp ) => {
            return <div key={pluginGrp.name}>
                {
                    pluginGrp.array.map(( plugin, index ) => {

                        const isLatestPlugin: boolean = index === 0;
                        const moreThanOnePlugin: boolean = pluginGrp.array.length > 1;
                        const showTick = this.mustShowPluginTick( plugin, index );
                        const isSelected = this.state.selectedPlugins!.indexOf( plugin ) !== -1;

                        return <div
                            key={plugin._id}
                            className={'plugin unselectable' +
                                ( this.state.activePlugin === plugin ? ' background-view-light' : '' ) +
                                ( isLatestPlugin ? ' primary-plugin' : ' secondary-plugin' ) +
                                ( moreThanOnePlugin ? '' : ' no-other-versions' ) +
                                ( plugin.expanded ? ' expanded' : '' )
                            }
                            onMouseEnter={() => {
                                this.setState( { activePlugin: plugin });
                            } }>
                            <VCheckbox
                                className={(
                                    showTick && !isSelected ? 'not-directly-selected' : '' )}
                                onChecked={() => {
                                    this.selectPlugin( plugin );
                                } }
                                id={`cb-${plugin._id}`}
                                checked={showTick}
                                label={( isLatestPlugin ? `${pluginGrp.name} ${plugin.version}` : plugin.version )}>
                                {( isLatestPlugin ? <img src={plugin.image} /> : <span className="fa fa-caret-right" /> )}
                            </VCheckbox>
                            <span
                                className={'more fa ' + ( plugin.expanded ? 'fa-minus-circle' : 'fa-plus-circle' )}
                                onClick={() => { this.showVersions( plugin ); } }
                                />
                        </div>
                    })
                }
            </div>
        })
    }

    /**
     * Creates the component elements
     */
    render(): JSX.Element {

        let previewContent: JSX.Element | undefined;

        if ( this.state.activePlugin ) {
            previewContent = <div className="plugin-info background-view-light"
                style={{ display: ( this.state.activePlugin ? '' : 'none' ) }}>
                <h2>{( this.state.activePlugin ? this.state.activePlugin.name : '' )}</h2>
                {( this.state.activePlugin ? this.state.activePlugin.description : '' )}
            </div>
        }


        return <div className={
            'plugins-widget' + ( this.state.loading ? ' loading' : '' ) +
            ( !this.state.activePlugin ? ' no-plugin' : '' )
        }>
            <div className="double-column">
                <h2><i className="fa fa-puzzle-piece" aria-hidden="true"></i>Choose Plugins<i className="fa fa-cog fa-spin fa-3x fa-fw"></i></h2>
                <div className="plugins">
                    {this.createPluginHierarchy()}
                </div>
            </div>
            <div className="double-column">
                {previewContent}
            </div>
        </div>
    }
}