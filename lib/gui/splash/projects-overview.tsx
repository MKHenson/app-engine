module Animate {

    export interface IProjectsOverviewState {
        loading? : boolean;
        selectedProject?: IInteractiveProject;
        errorMsg? : string;
    }

    /**
     * A component for viewing projects, displaying their stats, removing, adding or opening them.
     */
    export class ProjectsOverview extends React.Component<React.HTMLAttributes, IProjectsOverviewState> {

        /**
         * Creates an instance of the projects overview
         */
        constructor(props: React.HTMLAttributes) {
            super(props);
            this.state = {
                loading: false,
                selectedProject: null,
                errorMsg: null
            };
        }

        /*
        * Removes the selected project if confirmed by the user
        * @param {string} messageBoxAnswer The messagebox confirmation/denial from the user
        */
        removeProject( messageBoxAnswer : string ) {
            // if (messageBoxAnswer == "No")
            //     return;

            // var that = this;
            // this.$user.removeProject(this.$selectedProject._id).then(function () {
            //     that.$projects.splice(that.$projects.indexOf(that.$selectedProject), 1);
            //     that.$selectedProject = null;
            //     Animate.Compiler.digest(that._welcomeElm, that);

            // }).catch(function (err: Error) {
            //     MessageBox.show(err.message);
            // });
        }

        /*
        * Loads the selected project
        * @param {IProject} project The project to load
        */
        openProject(project: IInteractiveProject) {
            // var that = this;
            // var numLoaded = 0;
            // that.$loading = true;

            // //Notif of the reset
            // Application.getInstance().projectReset();

            // // Start Loading the plugins
            // that.goState("loading-project", true);

            // // Go through each plugin and load it
            // for (var i = 0, l = project.$plugins.length; i < l; i++)
            //     PluginManager.getSingleton().loadPlugin(project.$plugins[i]).then(function () {
            //         Animate.Compiler.digest(that._splashElm, that, true);

            //         // Check if all plugins are loaded
            //         numLoaded++;
            //         if (numLoaded >= project.$plugins.length) {
            //             // Everything loaded - so prepare the plugins
            //             for (var t = 0, tl = project.$plugins.length; t < tl; t++)
            //                 PluginManager.getSingleton().preparePlugin(project.$plugins[t]);

            //             // Load the scene in and get everything ready
            //             that.loadScene();
            //         }
            //     }).catch(function (err: Error) {
            //         that.$errorMsg = err.message;
            //         Animate.Compiler.digest(that._splashElm, that, true);

            //     });
        }

        newProject() {

        }

         /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render() : JSX.Element {
            var projectInfo : JSX.Element;
            var project: Engine.IProject = (this.state.selectedProject ? this.state.selectedProject : null);

            // If we have a project
            if (this.state.selectedProject)
                projectInfo = <div className="fade-in project-details">
                    <div>
                        <h2>{project.name}</h2>
                        <p><span className="info">Created By :</span><span className="detail"><b>{project.user}</b></span></p>
                        <p><span className="info">Created On :</span><span className="detail">{new Date(project.createdOn).toLocaleDateString()}</span></p>
                        <p><span className="info">Last Modified On :</span><span className="detail">{new Date(project.lastModified).toLocaleDateString()}</span></p>
                        <p><span className="info">No. Plugins :</span><span className="detail">{this.state.selectedProject.plugins.length}</span></p>
                        <div className="fix"></div>
                        <p>{project.description}</p>
                    </div>
                    <div className="buttons">
                        <div className="button">
                            <a onClick={ () => {
                                Animate.MessageBox.show('Are you sure you want to permanently remove the project `' + project.name + '`?',
                                    ['Yes Delete It', 'No'], this.removeProject, this);
                            }}>REMOVE</a>
                        </div>
                        <div className="button green animate-all"
                            onClick={() => {
                                this.openProject(this.state.selectedProject)
                            }}>
                            OPEN <span className="fa fa-chevron-right" />
                        </div>
                    </div>
                </div>

            return <div className="projects-overview">
                <ProjectList
                    className="projects-view background-view animate-all"
                    style={{width: (this.state.selectedProject ? '70%' : '') }}
                    onProjectSelected={(project) => {
                        this.setState({ selectedProject: project });
                    }}>
                    <div className="button reg-gradient" onClick={()=>{ this.newProject()} }>
                        <div className="cross"></div>New Appling
                    </div>
                </ProjectList>
                <div className="project-info background animate-all" style={{ width: (this.state.selectedProject ? '30%' : ''), left : (this.state.selectedProject ? '70%' : '') }}>
                    {projectInfo}
                </div>
            </div>
        }
    }
}