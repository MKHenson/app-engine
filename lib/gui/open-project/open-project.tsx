module Animate {

    export interface IOpenProjectProps {
        onCancel: () => void;
        onComplete: () => void;
        project: Engine.IProject;
    }

    export interface IOpenProjectState {
        selectedProject?: Engine.IProject;
        message?: string;
        mode?: AttentionType;
        loading?: boolean;
    }

    export class OpenProject extends React.Component<IOpenProjectProps, IOpenProjectState> {

        /**
         * Creates a new instance
         */
        constructor(props: IOpenProjectProps) {
            super(props);
            this.state = {
                mode: AttentionType.SUCCESS,
                loading: true,
                message: null,
                selectedProject: props.project
            }
        }

        /**
        * Attempts to load the project and setup the scene
        */
        loadScene() {
            let project = User.get.project;
            project.entry = this.state.selectedProject;

            // Notify of new project
            // Toolbar.getSingleton().newProject(project);
            CanvasTab.getSingleton().projectReady(project);
            TreeViewScene.getSingleton().projectReady(project);
            PluginManager.getSingleton().projectReady(project);

            let message = `Loading project '${this.state.selectedProject.name}'...`

            this.setState({
                mode: AttentionType.SUCCESS,
                loading: true,
                message: message
            });

            Logger.logMessage(message, null, LogType.MESSAGE);

            // Attempts to load all the project resources
            project.loadResources().then( (resources) => {
                message = `Loaded [${resources.length}] resources`;
                this.setState({
                    message: message
                });

                Logger.logMessage( message, null, LogType.MESSAGE);
                return project.loadBuild();

            }).then( (build) => {

                message = `Loaded project build '${build.entry.name} - v${build.entry.version}'`;
                this.setState({
                    loading : false,
                    message: message
                });

                Logger.logMessage( message, null, LogType.MESSAGE);

                // Make sure the title tells us which project is open
                document.title = `Hatchery: ${project.entry.name} ${project.entry._id}`;

                // Log
                Logger.logMessage(`Project '${this.state.selectedProject.name}' has successfully been opened`, null, LogType.MESSAGE);

                // Everything done
                this.props.onComplete();

            }).catch( (err: Error) => {
                this.setState({
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
            let project : Engine.IProject = this.state.selectedProject;
            this.setState({
                mode: AttentionType.SUCCESS,
                loading: true
            });

            // Notify the reset
            Application.getInstance().projectReset();

            // Go through each plugin and load it
            project.$plugins.forEach((plugin) => {
                plugin.$error = null;
                PluginManager.getSingleton().loadPlugin( plugin ).then( () => {

                    // Check if all plugins are loaded
                    numLoaded++;
                    if (numLoaded >= project.$plugins.length) {
                        // Everything loaded - so prepare the plugins
                        for (let t = 0, tl = project.$plugins.length; t < tl; t++)
                            PluginManager.getSingleton().preparePlugin(project.$plugins[t]);

                        this.setState({
                            loading: false
                        });

                        this.loadScene();
                    }
                    else {
                        this.setState({
                            loading: false
                        });
                    }
                }).catch( (err: Error) => {
                    plugin.$error = `Failed to load ${plugin.name} : ${err.message}`;
                    this.setState({
                        mode: AttentionType.ERROR,
                        message: "Could not load all of the plugins"
                    });
                });
            });
        }

        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render() : JSX.Element {
            let loadingPanel : JSX.Element;
            if (this.state.selectedProject) {
                loadingPanel = <div className="loading-panel">
                    {
                        this.state.selectedProject.$plugins.map((plugin, index) => {

                            let pluginElm : JSX.Element;
                            if (!plugin.$error) {
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

                            return <div className="load-item" key={"plugin-" + index}>
                                {pluginElm}
                            </div>
                        })
                    }
                </div>
            }

            return <div id="splash-loading-project" className='loading-project fade-in background'>
                <div>
                    { this.state.selectedProject ? <h2>Loading '{this.state.selectedProject.name}'</h2> : <h2>Project Loading</h2> }
                    {loadingPanel}
                    { this.state.message ?
                        <div className="summary-message"><Attention
                            allowClose={false}
                            mode={this.state.mode}
                            className="error">{this.state.message}
                        </Attention></div> : null }

                </div>
                <button className="button reg-gradient animate-all" onClick={(e)=>{
                    e.preventDefault();
                    this.props.onCancel();
                }}><i className="fa fa-chevron-left" aria-hidden="true"></i> Back</button>
            </div>
        }
    }
}