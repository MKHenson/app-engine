module Animate {
    export enum SplashMode {
        WELCOME,
        LOGIN,
        NEW_PROJECT,
        OPENING
    }

    export interface ISplashProps {
        onClose : () => void;
    }

    export interface ISplashStats {
        mode? : SplashMode
        $loading?: boolean;
        project?: Engine.IProject;
    }

    /**
    * The splash screen when starting the app
    */
    export class Splash extends React.Component<ISplashProps, ISplashStats > {
        private static _singleton: Splash;
        private _splashElm: JQuery;
        private _loginElm: JQuery;
        private _welcomeElm: JQuery;
        private _newProject: JQuery;
        private _loadingProject: JQuery;
        private _app: Application;
        private _captureInitialized: boolean;
        private $user: User;
        private $theme: string;
        private $activePane: string;
        private $errorMsg: string;
        private $errorRed: boolean;
        private $loading: boolean;
        private $projects: Array<Engine.IProject>;
        private $plugins: { [name:string] : Array<Engine.IPlugin> };
        private $selectedPlugins: Array<Engine.IProject>;
        private $selectedProject: Engine.IProject;
        private $selectedPlugin: Engine.IPlugin;
        private $pager: PageLoader;

        /**
        * Creates an instance of the splash screen
        */
        constructor(props: ISplashProps) {
            super(props)
            //this._app = app;
            this._captureInitialized = false;
            this._splashElm = jQuery("#splash").remove().clone();
            this._loginElm = jQuery("#log-reg").remove().clone();
            this._welcomeElm = jQuery("#splash-welcome").remove().clone();
            this._newProject = jQuery("#splash-new-project").remove().clone();
            this._loadingProject = jQuery("#splash-loading-project").remove().clone();

            this.$user = User.get;
            this.$activePane = "loading";
            this.$errorMsg = "";
            this.$errorRed = true;
            this.$loading = false;
            this.$projects = [];
            this.$plugins = __plugins;
            this.$selectedPlugins = [];
            this.$selectedProject = null;
            this.$pager = new PageLoader(this.fetchProjects.bind(this));
            let t = SplashMode.LOGIN;
            // Create a random theme for the splash screen
            if (Math.random() < 0.4)
                this.$theme = "welcome-blue";
            else
                this.$theme = "welcome-pink";

            this.state = {
                mode: SplashMode.LOGIN,
                $loading: true
            };

            // // Add the elements
            // jQuery("#splash-view", this._splashElm).prepend(this._loginElm);
            // jQuery("#splash-view", this._splashElm).prepend(this._welcomeElm);
            // jQuery("#splash-view", this._splashElm).prepend(this._newProject);
            // jQuery("#splash-view", this._splashElm).prepend(this._loadingProject);
        }

        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render() : JSX.Element {
            let mainView : JSX.Element;
            if (this.state.mode == SplashMode.LOGIN)
                mainView = <LoginWidget
                    onLogin={()=>{
                        this.setState({ mode : SplashMode.WELCOME });
                    }} />;
            else if (this.state.mode == SplashMode.WELCOME)
                mainView = <ProjectsOverview
                        onCreateProject={() => {
                            this.setState({ mode: SplashMode.NEW_PROJECT });
                        }}
                        onOpenProject={(project) => {
                            this.setState({
                                mode: SplashMode.OPENING,
                                project: project
                            });
                        }}
                     />;
            else if (this.state.mode == SplashMode.NEW_PROJECT)
                mainView = <NewProject
                        onCancel={() => {
                            this.setState({ mode: SplashMode.WELCOME });
                        }}
                        onProjectCreated={(project) => {
                            this.setState({
                                mode: SplashMode.OPENING,
                                project: project
                            });
                        }}
                    />;
            else if (this.state.mode == SplashMode.OPENING)
                mainView = <OpenProject
                        project={this.state.project}
                        onComplete={()=>{
                            this.loadScene();
                        }}
                        onCancel={() => {
                            this.setState({ mode: SplashMode.WELCOME });
                        }}
                    />;

            return <div id='splash' className={this.$theme}>
                <div className="logo">
                    {( this.$user.isLoggedIn ? <div className="logout background-a"><a onClick={() => this.logout()}><i className="fa fa-sign-out" aria-hidden="true"></i> Logout</a></div> : null )}
                    <h2>
                        <img id="splash-loading-icon" style={( !this.$loading ? {display:'none'} : null )} className="loading" src='media/loading-white.gif' />Hatchery
                    </h2>
                </div>
                <div
                    id="splash-view"
                    style={( this.$activePane == 'loading' && this.$loading ? {display : 'none'} : null )}
                    className={ this.splashDimensions() + ' background curve-small animate-slow shadow-med fade-in' }>
                        {mainView}
                </div>
            </div>
        }

        /*
        * Shows the splash screen
        */
        show() {
            this.$user.authenticated().then( ( val ) => {
                this.setState({
                    $loading: false,
                    mode: ( !val ? SplashMode.LOGIN : SplashMode.WELCOME )
                });

            }).catch( (err: Error) =>  {
                this.setState({
                    $loading: false,
                    mode: SplashMode.LOGIN
                });
            });

            this.setState({
                $loading: true
            });
        }

        /*
        * Gets the dimensions of the splash screen based on the active pane
        */
        splashDimensions(): string {
            if (this.state.mode == SplashMode.LOGIN || this.state.mode == SplashMode.OPENING )
                return "compact";
            else
                return "wide";
        }

        /*
        * Goes to pane state
        * @param {string} state The name of the state
        * @param {boolean} digest If true, the page will revalidate
        */
        goState(state: string, digest: boolean = false) {
            let that = this;
            that.$activePane = state;
            that.$errorMsg = "";

            if (state == "welcome")
                this.fetchProjects(this.$pager.index, this.$pager.limit);
            else if (state == "new-project") {
                this.$errorMsg = "Give your project a name and select the plugins you woud like to use";
                this.$errorRed = false;
            }

            if (digest)
                Animate.Compiler.digest(that._splashElm, that, true);
        }

        /*
        * Removes the selected project if confirmed by the user
        * @param {string} messageBoxAnswer The messagebox confirmation/denial from the user
        */
        removeProject( messageBoxAnswer : string ) {
            if (messageBoxAnswer == "No")
                return;

            let that = this;
            this.$user.removeProject(this.$selectedProject._id).then(function () {
                that.$projects.splice(that.$projects.indexOf(that.$selectedProject), 1);
                that.$selectedProject = null;
                Animate.Compiler.digest(that._welcomeElm, that);

            }).catch(function (err: Error) {
                MessageBox.show(err.message);
            });
        }

        /*
        * Loads the selected project
        * @param {IProject} project The project to load
        */
        openProject(project: Engine.IProject) {
            let that = this;
            let numLoaded = 0;
            that.$loading = true;

            //Notif of the reset
            Application.getInstance().projectReset();

            // Start Loading the plugins
            that.goState("loading-project", true);

            // Go through each plugin and load it
            for (let i = 0, l = project.$plugins.length; i < l; i++)
                PluginManager.getSingleton().loadPlugin(project.$plugins[i]).then(function () {
                    Animate.Compiler.digest(that._splashElm, that, true);

                    // Check if all plugins are loaded
                    numLoaded++;
                    if (numLoaded >= project.$plugins.length) {
                        // Everything loaded - so prepare the plugins
                        for (let t = 0, tl = project.$plugins.length; t < tl; t++)
                            PluginManager.getSingleton().preparePlugin(project.$plugins[t]);

                        // Load the scene in and get everything ready
                        that.loadScene();
                    }
                }).catch(function (err: Error) {
                    that.$errorMsg = err.message;
                    Animate.Compiler.digest(that._splashElm, that, true);

                });
        }

        /**
        * Attempts to load the project and setup the scene
        */
        loadScene() {
            let that = this;
            let project = this.$user.project;
            project.entry = this.$selectedProject;

            // Notify of new project
            Toolbar.getSingleton().newProject(project);
            CanvasTab.getSingleton().projectReady(project);
            TreeViewScene.getSingleton().projectReady(project);
            PluginManager.getSingleton().projectReady(project);

            Logger.logMessage(`Loading project '${that.$selectedProject.name}'...`, null, LogType.MESSAGE);

            // Attempts to load all the project resources
            project.loadResources().then(function (resources) {
                Logger.logMessage(`Loaded [${resources.length}] resources`, null, LogType.MESSAGE);
                return project.loadBuild();

            }).then( function(build) {
                Logger.logMessage(`Loaded project build '${build.entry.name} - v${build.entry.version}'`, null, LogType.MESSAGE);

                // Make sure the title tells us which project is open
                document.title = 'Animate: p' + project.entry._id + " - " + project.entry.name;

                // Log
                Logger.logMessage(`Project '${that.$selectedProject.name}' has successfully been opened`, null, LogType.MESSAGE);

                // Remove splash
                that._splashElm.detach();
                Application.bodyComponent.addChild(Application.getInstance());

            }).catch(function (err: Error) {
                that.$errorMsg = err.message;
                Animate.Compiler.digest(that._splashElm, that, true);
            });
        }

        /*
        * Fetches a list of user projects
        * @param {number} index
        * @param {number} limit
        */
        fetchProjects(index: number, limit: number) {
            let that = this;
            that.$loading = true;
            that.$errorMsg = "";
            that.$selectedProject = null;
            Animate.Compiler.digest(that._splashElm, that);

            that.$user.getProjectList(that.$pager.index, that.$pager.limit).then(function (projects) {
                that.$pager.last = projects.count || 1;
                that.$projects = projects.data;
                that.$loading = false;
                Animate.Compiler.digest(that._splashElm, that);
                Animate.Compiler.digest(that._welcomeElm, that);

            }).catch(function (err: Error) {
                that.$errorMsg = err.message;
                that.$loading = false;
                Animate.Compiler.digest(that._splashElm, that);
                Animate.Compiler.digest(that._welcomeElm, that);
            });
        }

        /*
        * Called when we select a project
        * @param {IProject} The project to select
        */
        selectProject(project: Engine.IProject) {
            if (this.$selectedProject)
                (this.$selectedProject as any).selected = false;

            (project as any).selected = true;

            if (this.$selectedProject != project)
                this.$selectedProject = project;
            else {
                (this.$selectedProject as any).selected = false;
                this.$selectedProject = null;
            }
        }

        /*
        * Called when we select a project
        * @param {IPlugin} The plugin to select
        */
        selectPlugin(plugin: Engine.IPlugin) {
            // If this plugin is not selected
            if (this.$selectedPlugins.indexOf(plugin) == -1) {
                // Make sure if another version is selected, that its de-selected
                for (let i = 0, l = this.$selectedPlugins.length; i < l; i++)
                    if (this.$selectedPlugins[i].name == plugin.name) {
                        this.$selectedPlugins.splice(i, 1);
                        break;
                    }

                this.$selectedPlugins.push(plugin);
            }
            else
                this.$selectedPlugins.splice(this.$selectedPlugins.indexOf(plugin), 1);

            // Set the active selected plugin
            if (this.$selectedPlugins.length > 0)
                this.$selectedPlugin = this.$selectedPlugins[this.$selectedPlugins.length - 1];
            else
                this.$selectedPlugin = null;
        }

        /*
        * Toggles if a plugin should show all its versions or not
        * @param {IPlugin} The plugin to toggle
        */
        showVersions(plugin: Engine.IPlugin) {
            for (let n in this.$plugins)
                for (let i = 0, l = this.$plugins[n].length; i < l; i++) {
                    if (this.$plugins[n][i].name == plugin.name) {
                        (this.$plugins[n][i] as any).$showVersions = !(this.$plugins[n][i] as any).$showVersions;
                    }
                }
        }

        /*
        * Checks if a plugin is selected
        * @param {IPlugin} The plugin to check
        */
        isPluginSelected(plugin): boolean {
            if (this.$selectedPlugins.indexOf(plugin) != -1)
                return true;
            else
                return false;
        }

        /*
        * Called by the app when everything needs to be reset
        */
        reset() {
        }

        /**
        * Given a form element, we look at if it has an error and based on the expression. If there is we set
        * the login error message
        * @param {EngineForm} The form to check.
        * @param {boolean} True if there is an error
        */
        reportError(form: NodeForm): boolean {
            if (!form.$error)
                this.$errorMsg = "";
            else {
                let name = form.$errorInput;
                name = name.charAt(0).toUpperCase() + name.slice(1);

                switch (form.$errorExpression) {
                    case "alpha-numeric":
                        this.$errorMsg = `${name} must only contain alphanumeric characters`;
                        break;
                    case "email-plus":
                        this.$errorMsg = `${name} must only contain alphanumeric characters or a valid email`;
                        break;
                    case "non-empty":
                        this.$errorMsg = `${name} cannot be empty`;
                        break;
                    case "email":
                        this.$errorMsg = `${name} must be a valid email`;
                        break;
                    case "alpha-numeric-plus":
                        this.$errorMsg = `${name} must only contain alphanumeric characters and '-', '!', or '_'`;
                        break;
                    case "no-html":
                        this.$errorMsg = `${name} must not contain any html`;
                        break;
                    default:
                        this.$errorMsg = "";
                        break;
                }
            }

            if (this.$activePane == "new-project" && this.$selectedPlugins.length == 0)
                this.$errorMsg = "Please choose at least 1 plugin to work with";

            if (this.$activePane == "register") {
                (this as any).$regCaptcha = jQuery("#recaptcha_response_field").val();
                (this as any).$regChallenge = jQuery("#recaptcha_challenge_field").val();

                if ((this as any).$regCaptcha == "")
                    this.$errorMsg = "Please enter the capture code";
            }

            if (this.$errorMsg == "") {
                this.$errorRed = false;
                return false;
            }
            else {
                this.$errorRed = true;
                return true;
            }
        }

        /**
        * Creates a new user project
        * @param {EngineForm} The form to check.
        * @param {boolean} True if there is an error
        */
        newProject(name: string, description: string, plugins: Array<Engine.IPlugin>) {
            let that = this;
            that.$loading = true;
            that.$errorRed = false;
            that.$errorMsg = "Just a moment while we hatch your appling...";
            Compiler.digest(this._splashElm, this, false);
            let ids = plugins.map<string>(function (value) { return value._id; });

            this.$user.newProject(name, ids, description).then(function (data) {
                that.$loading = false;
                that.$errorRed = false;
                that.$errorMsg = "";
                that.$selectedProject = data.data;
                that.$projects.push(data.data);

                // Start Loading the plugins
                that.openProject(that.$selectedProject);

            }).catch(function (err: Error) {
                that.$errorRed = true;
                that.$errorMsg = err.message;
                that.$loading = false;
                Animate.Compiler.digest(that._splashElm, that, true);
            });

        }




        /**
        * Attempts to resend the activation code
        */
        logout() {
            this.setState({ $loading : true });
            this.$user.logout().then( () => {
                this.$loading = false;
                this.$errorMsg = "";

                Application.getInstance().projectReset();
                this.setState({
                    $loading : false,
                    mode : SplashMode.LOGIN
                });
            })
            .catch((err) => {
                this.$errorRed = true;
                this.$errorMsg = err.message;
                Compiler.digest(this._loginElm, this);
                Compiler.digest(this._splashElm, this);

                this.setState({
                    $loading : false
                });
            });
        }

        /**
        * Gets the singleton reference of this class.
        * @returns {Splash}
        */
        static get get(): Splash {
            return Splash._singleton;
        }
    }
}