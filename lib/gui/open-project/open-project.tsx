module Animate {

    export interface IOpenProjectProps {
        onCancel: () => void;
        project: Engine.IProject;
    }

    export interface IOpenProjectState {
        $selectedProject?: Engine.IProject;
        $errorMsg?: string;
        $loading?: boolean;
    }

    export class OpenProject extends React.Component<IOpenProjectProps, IOpenProjectState> {

        /**
         * Creates a new instance
         */
        constructor(props: IOpenProjectProps) {
            super(props);
            this.state = {
                $loading: true,
                $errorMsg: null,
                $selectedProject: props.project
            }
        }

        /*
        * Loads the selected project
        */
        componentWillMount() {

            let numLoaded = 0;
            let project : Engine.IProject = this.state.$selectedProject;

            this.setState({
                $loading: true
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
                            $loading: false
                        });

                        // Load the scene in and get everything ready
                        // this.loadScene();
                    }
                    else {
                        this.setState({
                            $loading: false
                        });
                    }
                }).catch( (err: Error) => {
                    plugin.$error = err.message;
                    this.setState({
                        $errorMsg: err.message
                    });
                });
            });
        }

        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render() : JSX.Element {
            var loadingPanel : JSX.Element;
            if (this.state.$selectedProject) {
                loadingPanel = <div className="loading-panel">
                    {
                        this.state.$selectedProject.$plugins.map((plugin, index) => {

                            var pluginElm : JSX.Element;
                            if (!plugin.$error) {
                                pluginElm = <VCheckbox checked={plugin.$loaded} noInteractions={true} label="" />
                                    {( !plugin.$loaded ?
                                        <i className="fa fa-cog fa-spin fa-3x fa-fw light plugin-loading"></i> :
                                        <div className="success plugin-loading">Complete</div>
                                    )}
                                    <div className="plugin">{plugin.name}</div>
                            }
                            else {
                                pluginElm = <Attention mode={AttentionType.ERROR}>{plugin.$error}</Attention>
                            }

                            return <div className="load-item">
                                {pluginElm}
                            </div>
                        })
                    }
                </div>
            }

            return <div id="splash-loading-project" className='loading-project fade-in background'>
                <div>
                    { this.state.$selectedProject ? <h2>Loading '{this.state.$selectedProject.name}'</h2> : <h2>Project Loading</h2> }
                    { this.state.$errorMsg ? <Attention mode={AttentionType.ERROR} className="error">An error has occurred: {this.state.$errorMsg}</Attention> : null }
                    {loadingPanel}
                </div>
                <button className="button reg-gradient animate-all" onClick={(e)=>{
                    e.preventDefault();
                    this.props.onCancel();
                }}><i className="fa fa-chevron-left" aria-hidden="true"></i> Back</button>
            </div>
        }
    }
}