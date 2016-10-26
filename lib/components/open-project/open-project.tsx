import { LogActions, ILoggerAction } from '../../actions/logger-actions';
import { VCheckbox } from '../v-checkbox/v-checkbox';
import { Attention } from '../attention/attention';
import { ButtonPrimary } from '../buttons/buttons';
import { AttentionType } from '../../setup/enums';
import { PluginManager } from '../../core/plugin-manager';
import { User } from '../../core/user';
import { Application } from '../../containers/application/application';

export interface IOpenProjectProps {
    dispatch: Redux.Dispatch<ILoggerAction>,
    onCancel: () => void;
    onComplete: () => void;
    project: HatcheryServer.IProject;
}

export interface IOpenProjectState {
    message?: string | null;
    mode?: AttentionType;
    loading?: boolean;
}

export class OpenProject extends React.Component<IOpenProjectProps, IOpenProjectState> {

    /**
     * Creates a new instance
     */
    constructor( props: IOpenProjectProps ) {
        super( props );
        this.state = {
            mode: AttentionType.SUCCESS,
            loading: true,
            message: null
        }
    }

    /**
     * Attempts to load the project and setup the scene
     */
    loadScene() {
        let project = User.get.project;
        project.entry = this.props.project;

        // Notify of new project
        // TODO: ALL NEEDS TO BE UPDATED
        // ==========================================
        // Toolbar.getSingleton().newProject(project);
        // CanvasTab.getSingleton().projectReady(project);
        // TreeViewScene.getSingleton().projectReady(project);
        // PluginManager.getSingleton().projectReady(project);
        // ==========================================

        let message = `Loading project '${this.props.project.name}'...`

        this.setState( {
            mode: AttentionType.SUCCESS,
            loading: true,
            message: message
        });

        this.props.dispatch( LogActions.message( message ) );

        // Attempts to load all the project resources
        project.loadResources().then(( resources ) => {
            message = `Loaded [${resources.length}] resources`;
            this.setState( {
                message: message
            });

            this.props.dispatch( LogActions.message( message ) );
            return project.loadBuild();

        }).then(( build ) => {

            message = `Loaded project build '${build.entry.name} - v${build.entry.version}'`;
            this.setState( {
                loading: false,
                message: message
            });

            this.props.dispatch( LogActions.message( message ) );

            // Make sure the title tells us which project is open
            document.title = `Hatchery: ${project.entry.name} ${project.entry._id}`;

            // Log
            this.props.dispatch( LogActions.message( `Project '${this.props.project.name}' has successfully been opened` ) );

            // Everything done
            this.props.onComplete();

        }).catch(( err: Error ) => {
            this.setState( {
                mode: AttentionType.ERROR,
                message: err.message
            });
        });
    }

    /*
     * Loads the selected project
     */
    componentWillMount() {

        let numLoaded = 0;
        let project: HatcheryServer.IProject = this.props.project;
        this.setState( {
            mode: AttentionType.SUCCESS,
            loading: true
        });

        // Notify the reset
        Application.getInstance().projectReset();

        const plugs = project.$plugins!;

        // Go through each plugin and load it
        plugs.forEach(( plugin ) => {
            plugin.$error = null;
            PluginManager.getSingleton().loadPlugin( plugin ).then(() => {

                // Check if all plugins are loaded
                numLoaded++;
                if ( numLoaded >= plugs.length ) {
                    // Everything loaded - so prepare the plugins
                    for ( let t = 0, tl = plugs.length; t < tl; t++ )
                        PluginManager.getSingleton().preparePlugin( plugs[ t ] );

                    this.setState( {
                        loading: false
                    });

                    this.loadScene();
                }
                else {
                    this.setState( {
                        loading: false
                    });
                }
            }).catch(( err: Error ) => {
                plugin.$error = `Failed to load ${plugin.name} : ${err.message}`;
                this.setState( {
                    mode: AttentionType.ERROR,
                    message: 'Could not load all of the plugins'
                });
            });
        });
    }

    /**
     * Creates the component elements
     */
    render(): JSX.Element {
        let loadingPanel: JSX.Element | undefined;
        if ( this.props.project ) {
            loadingPanel = <div className="loading-panel">
                {
                    this.props.project.$plugins!.map(( plugin, index ) => {

                        let pluginElm: JSX.Element;
                        if ( !plugin.$error ) {
                            pluginElm = <div className="plugin-item">
                                <VCheckbox checked={plugin.$loaded} noInteractions={true} label="" />
                                <span className="plugin">{plugin.name}</span>
                                {( !plugin.$loaded ?
                                    <i className="fa fa-cog fa-spin fa-3x fa-fw light plugin-loading"></i> :
                                    <div className="success plugin-loading">Complete</div>
                                )}
                            </div>
                        }
                        else {
                            pluginElm = <Attention mode={AttentionType.ERROR}>{plugin.$error}</Attention>
                        }

                        return <div className="load-item" key={'plugin-' + index}>
                            {pluginElm}
                        </div>
                    })
                }
            </div>
        }

        return <div id="splash-loading-project" className="loading-project fade-in background">
            <div>
                {this.props.project ? <h2>Loading '{this.props.project.name} '</h2> : <h2>Project Loading</h2>}
                {loadingPanel}
                {this.state.message ?
                    <div className="summary-message"><Attention
                        allowClose={false}
                        mode={this.state.mode}
                        className="error">{this.state.message}
                    </Attention></div> : null}

            </div>
            <ButtonPrimary onClick={() => { this.props.onCancel(); } }>
                <i className="fa fa-chevron-left" aria-hidden="true"></i> Back
                </ButtonPrimary>
        </div>
    }
}