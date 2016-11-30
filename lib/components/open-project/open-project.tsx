import { VCheckbox } from '../v-checkbox/v-checkbox';
import { Attention } from '../attention/attention';
import { ButtonPrimary } from '../buttons/buttons';
import { AttentionType } from '../../setup/enums';

export interface IOpenProjectProps {
    onCancel: () => void;
    project: HatcheryEditor.IProject;
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
        // let project = User.get.project;
        // project.entry = this.props.project;

        // let message = `Loading project '${this.props.project.entry!.name}'...`

        // this.setState( {
        //     mode: AttentionType.SUCCESS,
        //     loading: true,
        //     message: message
        // });

        // this.props.dispatch( LogActions.message( message ) );

        // // Attempts to load all the project resources
        // project.loadResources().then(( resources ) => {
        //     message = `Loaded [${resources.length}] resources`;
        //     this.setState( {
        //         message: message
        //     });

        //     this.props.dispatch( LogActions.message( message ) );
        //     return project.loadBuild();

        // }).then(( build ) => {

        //     message = `Loaded project build '${build.entry.name} - v${build.entry.version}'`;
        //     this.setState( {
        //         loading: false,
        //         message: message
        //     });

        //     this.props.dispatch( LogActions.message( message ) );

        //     // Make sure the title tells us which project is open
        //     document.title = `Hatchery: ${project.entry.name} ${project.entry._id}`;

        //     // Log
        //     this.props.dispatch( LogActions.message( `Project '${this.props.project.entry!.name}' has successfully been opened` ) );

        //     // Everything done
        //     this.props.onComplete();

        // }).catch(( err: Error ) => {
        //     this.setState( {
        //         mode: AttentionType.ERROR,
        //         message: err.message
        //     });
        // });
    }

    /*
     * Loads the selected project
     */
    componentWillMount() {

        // let numLoaded = 0;
        // let project: HatcheryServer.IProject = this.props.project;
        // this.setState( {
        //     mode: AttentionType.SUCCESS,
        //     loading: true
        // });

        // const plugs = project.plugins!;

        // // Go through each plugin and load it
        // plugs.forEach(( plugin ) => {
        //     plugin.$error = null;
        //     PluginManager.getSingleton().loadPlugin( plugin ).then(() => {

        //         // Check if all plugins are loaded
        //         numLoaded++;
        //         if ( numLoaded >= plugs.length ) {
        //             // Everything loaded - so prepare the plugins
        //             for ( let t = 0, tl = plugs.length; t < tl; t++ )
        //                 PluginManager.getSingleton().preparePlugin( plugs[ t ] );

        //             this.setState( {
        //                 loading: false
        //             });

        //             this.loadScene();
        //         }
        //         else {
        //             this.setState( {
        //                 loading: false
        //             });
        //         }
        //     }).catch(( err: Error ) => {
        //         plugin.$error = `Failed to load ${plugin.name} : ${err.message}`;
        //         this.setState( {
        //             mode: AttentionType.ERROR,
        //             message: 'Could not load all of the plugins'
        //         });
        //     });
        // });
    }

    /**
     * Creates the component elements
     */
    render(): JSX.Element {
        let pluginsPanel: JSX.Element | undefined;
        const project = this.props.project;
        const projectEntry = this.props.project && this.props.project.entry || null;
        const error = project.error ? true : false;
        const message = project.error ? project.error.message : null;

        if ( project ) {
            pluginsPanel = <div className="plugins-panel">
                {
                    project.plugins!.map(( plugin, index ) => {

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

        return (
            <div id="loading-project">
                <div className="loading-project fade-in background">
                    <div className="plugins-panel">
                        {projectEntry ?
                            <h2><i className="fa fa-cog fa-spin fa-3x fa-fw light plugin-loading"></i>Loading '{projectEntry.name} '</h2> :
                            <h2><i className="fa fa-cog fa-spin fa-3x fa-fw light plugin-loading"></i>Loading Project...</h2>}
                        {pluginsPanel}
                        {error ?
                            <div className="summary-message">
                                <Attention
                                    allowClose={false}
                                    mode={AttentionType.ERROR}
                                    className="error">{message}
                                </Attention>
                            </div> : null}

                    </div>
                    <ButtonPrimary onClick={() => { this.props.onCancel(); } }>
                        <i className="fa fa-chevron-left" aria-hidden="true"></i> Back
                    </ButtonPrimary>
                </div>
            </div>
        )
    }
}