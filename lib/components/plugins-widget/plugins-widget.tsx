import { VCheckbox } from '../v-checkbox/v-checkbox';
import { get } from '../../core/utils';
import { DB } from '../../setup/db';
import { IPlugins } from 'hatchery-editor';

export interface IPluginsWidgetProps {
    onChange: ( plugins: IPlugins ) => void;
}

export interface IPluginsWidgetState {
    plugins?: HatcheryServer.IPlugin[];
    activeVersion?: HatcheryServer.IPluginVersion | null,
    activePlugin?: HatcheryServer.IPlugin | null,
    loading?: boolean;
    error?: Error | null;
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
            error: null,
            plugins: []
        };
    }

    componentDidMount() {
        this.setState( { loading: true, error: null });

        get<Modepress.IGetArrayResponse<HatcheryServer.IPlugin>>( `${DB.API}/plugins` ).then(( response ) => {
            for ( const plugin of response.data )
                if ( !Array.isArray( plugin.versions! ) )
                    plugin.versions = [ plugin.versions as any ];

            this.setState( {
                plugins: response.data,
                loading: false
            });
        }).catch(( err: Error ) => {
            this.setState( {
                error: err,
                loading: false,
                plugins: []
            });
        });
    }

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

    /**
     * Generates the React code for displaying the plugins
     */
    createPluginHierarchy(): JSX.Element[] {
        const plugins = this.state.plugins!;

        return plugins.map(( plugin ) => {
            return (
                <div
                    key={plugin.name}
                    onMouseEnter={() => {
                        this.setState( { activePlugin: plugin });
                    } }
                    className={'plugin unselectable' + ( plugin.expanded ? ' expanded' : '' )} >
                    <div className={plugin === this.state.activePlugin ? ' background-view-light' : ''}>
                        <VCheckbox
                            onChange={( elm, checked ) => {
                                this.updateSelection( plugin, undefined );
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

        if ( this.state.activePlugin ) {
            previewContent = <div className="plugin-info background-view-light"
                style={{ display: ( this.state.activePlugin ? '' : 'none' ) }}>
                <h2>{( this.state.activePlugin ? this.state.activePlugin.name : '' )}</h2>
                {( this.state.activePlugin ? this.state.activePlugin.description : '' )}
            </div>
        }


        return <div className={
            'plugins-widget' + ( loading ? ' loading' : '' ) +
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