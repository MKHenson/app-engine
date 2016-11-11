import { VCheckbox } from '../v-checkbox/v-checkbox';
import { get } from '../../core/utils';
import { DB } from '../../setup/db';

export interface IPluginsWidgetProps {
    onChange: ( plugins?: Array<{ id: string; version: string; }> ) => void;
    onError: ( error: Error ) => void;
}

export interface IPluginsWidgetState {
    plugins?: HatcheryServer.IPlugin[];
    activeVersion?: HatcheryServer.IPluginVersion | null,
    activePlugin?: HatcheryServer.IPlugin | null,
    loading?: boolean;
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
            activeVersion: null,
            activePlugin: null,
            loading: false,
            plugins: []
        };
    }

    /**
     * When the component is about to mount, we download a list of available plugins
     */
    componentWillMount() {
        this.setState( { loading: true });

        get<Modepress.IGetArrayResponse<HatcheryServer.IPlugin>>( `${DB.API}/plugins` ).then(( response ) => {

            // Below is needed to fix a bug with the server. It seems to flatten array if there is only 1 item in it.
            for ( const plugin of response.data ) {
                if ( !Array.isArray( plugin.versions! ) )
                    plugin.versions = [ plugin.versions as any ];


                // Sort the versions
                plugin.versions = plugin.versions!.sort(( a, b ) => {
                    if ( a === b )
                        return 0;

                    const aSemVar = a.version!.split( '.' );
                    const bSemVar = b.version!.split( '.' );

                    const len = Math.min( aSemVar.length, bSemVar.length );

                    // loop while the components are equal
                    for ( let i = 0; i < len; i++ ) {
                        // A bigger than B
                        if ( parseInt( aSemVar[ i ] ) > parseInt( bSemVar[ i ] ) )
                            return -1;

                        // B bigger than A
                        if ( parseInt( aSemVar[ i ] ) < parseInt( bSemVar[ i ] ) )
                            return 1;
                    }

                    // If one's a prefix of the other, the longer one is greater.
                    if ( aSemVar.length > bSemVar.length )
                        return -1;

                    if ( aSemVar.length < bSemVar.length )
                        return 1;

                    // Otherwise they are the same.
                    return 0;
                });
            }

            this.setState( {
                plugins: response.data,
                loading: false
            });

        }).catch(( err: Error ) => {
            this.setState( {
                loading: false,
                plugins: []
            });

            if ( this.props.onError )
                this.props.onError( err );
        });
    }

    /**
     * Selects / deselects the plugin and version
     */
    updateSelection( plugin: HatcheryServer.IPlugin, version?: HatcheryServer.IPluginVersion ) {

        if ( version === undefined )
            plugin.selected = !plugin.selected;
        else
            plugin.selected = true;

        if ( !plugin.selected ) {
            for ( const v of plugin.versions! )
                v.selected = false;

            return;
        }

        for ( const v of plugin.versions! )
            v.selected = false;

        if ( !version )
            version = plugin.versions![ 0 ];

        version.selected = true;
    }

    onChange( plugins: HatcheryServer.IPlugin[] ) {
        const selectedPlugins: Array<{ id: string; version: string; }> = [];
        for ( const plugin of plugins )
            if ( plugin.selected )
                selectedPlugins.push( {
                    id: plugin._id,
                    version: plugin.versions!.filter( v => v.selected ).pop() !.version!
                })
    }

    /**
     * Generates the React code for displaying the plugins
     */
    createPluginHierarchy(): JSX.Element[] {
        const plugins = this.state.plugins!;
        const activePlugin = this.state.activePlugin;

        return plugins.map(( plugin, pluginIndex ) => {
            return (
                <div
                    key={plugin.name}
                    onMouseEnter={() => {
                        this.setState( { activePlugin: plugin });
                    } }
                    className={'plugin unselectable' + ( plugin.expanded ? ' expanded' : '' )} >
                    <div className={plugin === activePlugin || ( pluginIndex === 0 && !activePlugin ) ? ' background-view-light' : ''}>
                        <VCheckbox
                            onChange={( elm, checked ) => {
                                this.updateSelection( plugin, undefined );
                                this.onChange( plugins );
                                this.setState( { plugins: plugins });
                            } }
                            id={`cb-${plugin._id}`}
                            checked={plugin.selected}
                            label={plugin.name}
                            >
                            <img src={plugin.image} />
                        </VCheckbox>
                        <span
                            className={'more fa ' + ( plugin.expanded ? 'fa-minus-circle' : 'fa-plus-circle' )}
                            onClick={() => {
                                plugin.expanded = !plugin.expanded;
                                this.onChange( plugins );
                                this.setState( { plugins: plugins });
                            } }
                            />
                    </div>
                    <div>
                        {
                            plugin.versions!.map(( version ) => {
                                return <div key={version.version}
                                    className={'version'}
                                    onMouseEnter={() => {
                                        this.setState( { activeVersion: version });
                                    } }>
                                    <VCheckbox
                                        onChange={( elm, checked ) => {
                                            this.updateSelection( plugin, version );
                                            this.setState( { plugins: plugins });
                                        } }
                                        id={`cb-${version.version}`}
                                        checked={version.selected}
                                        label={version.version}
                                        >
                                    </VCheckbox>
                                </div>
                            })
                        }
                    </div>
                </div>
            )
        })
    }

    /**
     * Creates the component elements
     */
    render(): JSX.Element {
        const loading = this.state.loading!;
        let previewContent: JSX.Element | undefined;

        const pluginToPreview = this.state.activePlugin || ( this.state.plugins && this.state.plugins.length > 0 ? this.state.plugins[ 0 ] : null );

        if ( pluginToPreview ) {

            let selectedVersion: JSX.Element | undefined;
            for ( const version of pluginToPreview.versions! ) {
                if ( version.selected ) {
                    selectedVersion = (
                        <div>
                            <div className="divider" />
                            <h3>Version: {version.version!}</h3>
                            <ul>
                                {version.deployables ? version.deployables.map(( d ) => <li>{d}</li> ) : undefined}
                            </ul>
                        </div> );
                }
            }

            previewContent = <div className="plugin-info background-view-light">
                <h2>{pluginToPreview.name}</h2>
                {pluginToPreview.description}
                {selectedVersion}
            </div>
        }


        return <div className={
            'plugins-widget' + ( loading ? ' loading' : '' )
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