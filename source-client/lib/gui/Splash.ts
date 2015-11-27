module Animate
{
    /**
	* The splash screen when starting the app
	*/
    export class Splash
    {
        private static _singleton: Splash;
        private _splashElm: JQuery;
        private _loginElm: JQuery;
        private _welcomeElm: JQuery;
        private _newProject: JQuery;
        private _loadingProject: JQuery;
        private _app: Application;
        private _captureInitialized: boolean;
        private $user: User;
        private $theme: any;
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
        constructor(app: Application)
        {
            this._app = app;
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

            // Create a random theme for the splash screen
            if (Math.random() < 0.4)
                this.$theme = { "welcome-blue": true };
            else
                this.$theme = { "welcome-pink": true };

            // Add the elements
            jQuery("#splash-view", this._splashElm).prepend(this._loginElm);
            jQuery("#splash-view", this._splashElm).prepend(this._welcomeElm);
            jQuery("#splash-view", this._splashElm).prepend(this._newProject);
            jQuery("#splash-view", this._splashElm).prepend(this._loadingProject);
        }

        /*
        * Shows the splash screen
        */
        show()
        {
            var that = this;
            that._app.element.detach();
            jQuery("body").append(that._splashElm);
            jQuery("#en-login-username", that._loginElm).val("");
            that.$loading = true;
            
            if (!that._captureInitialized)
            {
                that._captureInitialized = true;

                // Build each of the templates
                Compiler.build(this._loginElm, this);
                Compiler.build(this._welcomeElm, this);
                Compiler.build(this._newProject, this);
                Compiler.build(this._loadingProject, this);
                Compiler.build(this._splashElm, this);                
                Recaptcha.create("6LdiW-USAAAAAGxGfZnQEPP2gDW2NLZ3kSMu3EtT", <any>document.getElementById("animate-captcha"), { theme: "white" });
            }
            else
            {
                Compiler.digest(this._splashElm, that, true);
                Recaptcha.reload();                
            }
           
            that.$user.authenticated().done(function( val )
            {
                that.$loading = false;
                if (!val)
                    that.goState("login", true);
                else
                    that.goState("welcome", true);

            }).fail(function (err)
            {
                that.$loading = false;
                that.goState("login", true);
            });
        }

        /*
        * Gets the dimensions of the splash screen based on the active pane
        */
        splashDimensions(): any
        {
            if (this.$activePane == "login" || this.$activePane == "register" || this.$activePane == "loading-project")
                return { "compact": true, "wide": false };
            else
                return { "compact": false, "wide": true };
        }
        
        /*
        * Goes to pane state
        * @param {string} state The name of the state
        * @param {boolean} digest If true, the page will revalidate
        */
        goState(state: string, digest: boolean = false)
        {
            var that = this;
            that.$activePane = state;
            that.$errorMsg = "";
           
            if (state == "welcome")
                this.fetchProjects(this.$pager.index, this.$pager.limit);
            else if (state == "new-project")
            {
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
        removeProject( messageBoxAnswer : string )
        {
            if (messageBoxAnswer == "No")
                return;
            
            var that = this;
            this.$user.removeProject(this.$selectedProject._id).done(function ()
            {
                that.$projects.splice(that.$projects.indexOf(that.$selectedProject), 1);
                that.$selectedProject = null;
                Animate.Compiler.digest(that._welcomeElm, that);

            }).fail(function (err: Error)
            {
                MessageBox.show(err.message);
            });
        }

        /*
        * Loads the selected project
        * @param {IProject} project The project to load
        */
        openProject(project: Engine.IProject)
        {
            var that = this;
            var numLoaded = 0;
            that.$loading = true;

            //Notif of the reset
            Application.getInstance().projectReset();
            
            // Start Loading the plugins            
            that.goState("loading-project", true);

            // Go through each plugin and load it
            for (var i = 0, l = project.$plugins.length; i < l; i++)
                PluginManager.getSingleton().loadPlugin(project.$plugins[i]).fail(function (err: Error)
                {
                    that.$errorMsg = err.message;

                }).always(function ()
                {
                    Animate.Compiler.digest(that._splashElm, that, true);

                    // Check if all plugins are loaded
                    numLoaded++;
                    if (numLoaded >= project.$plugins.length)
                    {
                        // Everything loaded - so prepare the plugins
                        for (var t = 0, tl = project.$plugins.length; t < tl; t++)
                            PluginManager.getSingleton().preparePlugin(project.$plugins[t]);

                        // Load the scene in and get everything ready
                        that.loadScene(); 
                    }
                });
        }

        loadScene()
        {
            var project = this.$user.project;
            project.entry = this.$selectedProject;

            Toolbar.getSingleton().newProject();
            CanvasTab.getSingleton().projectReady();
            TreeViewScene.getSingleton().projectReady(project);
            

            //project.load();

            // Make sure the title tells us which project is open
            document.title = 'Animate: p' + project.entry._id + " - " + project.entry.name;
            
            Logger.getSingleton().logMessage(`Project '${this.$selectedProject.name}' has been opened`, null, LogType.MESSAGE);

            // Attach the DOM
            this._splashElm.detach();
            Application.bodyComponent.addChild(Application.getInstance());
        }

        /*
        * Fetches a list of user projects
        * @param {number} index 
        * @param {number} limit
        */
        fetchProjects(index: number, limit: number)
        {
            var that = this;
            that.$loading = true;
            that.$errorMsg = "";
            that.$selectedProject = null;
            Animate.Compiler.digest(that._splashElm, that);

            that.$user.getProjectList(that.$pager.index, that.$pager.limit).then(function (projects)
            {
                that.$pager.last = projects.count || 1;
                that.$projects = projects.data;

            }).fail(function (err: Error)
            {
                that.$errorMsg = err.message;

            }).done(function ()
            {
                that.$loading = false;
                Animate.Compiler.digest(that._splashElm, that);
                Animate.Compiler.digest(that._welcomeElm, that);
            });
        }

        /*
        * Called when we select a project
        * @param {IProject} The project to select
        */
        selectProject(project: Engine.IProject)
        {
            if (this.$selectedProject)
                (<any>this.$selectedProject).selected = false;

            (<any>project).selected = true;

            if (this.$selectedProject != project)
                this.$selectedProject = project;
            else
            {
                (<any>this.$selectedProject).selected = false;
                this.$selectedProject = null;
            }
        }

        /*
        * Called when we select a project
        * @param {IPlugin} The plugin to select
        */
        selectPlugin(plugin: Engine.IPlugin)
        {
            // If this plugin is not selected
            if (this.$selectedPlugins.indexOf(plugin) == -1)
            {
                // Make sure if another version is selected, that its de-selected
                for (var i = 0, l = this.$selectedPlugins.length; i < l; i++)
                    if (this.$selectedPlugins[i].name == plugin.name)
                    {
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
        showVersions(plugin: Engine.IPlugin)
        {
            for (var n in this.$plugins)
                for (var i = 0, l = this.$plugins[n].length; i < l; i++)
                {
                    if (this.$plugins[n][i].name == plugin.name)
                    {
                        (<any>this.$plugins[n][i]).$showVersions = !(<any>this.$plugins[n][i]).$showVersions;
                    }
                }
        }

        /*
        * Checks if a plugin is selected
        * @param {IPlugin} The plugin to check
        */
        isPluginSelected(plugin): boolean
        {
            if (this.$selectedPlugins.indexOf(plugin) != -1)
                return true;
            else
                return false;
        }

        /*
        * Called by the app when everything needs to be reset
        */
        reset()
        {
        }

        /**
		* Given a form element, we look at if it has an error and based on the expression. If there is we set 
        * the login error message
        * @param {EngineForm} The form to check.
        * @param {boolean} True if there is an error
		*/
        reportError(form: NodeForm): boolean
        {
            if (!form.$error)
                this.$errorMsg = "";
            else
            {
                var name = form.$errorInput;
                name = name.charAt(0).toUpperCase() + name.slice(1);

                switch (form.$errorExpression)
                {
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

            if (this.$activePane == "register")
            {
                (<any>this).$regCaptcha = jQuery("#recaptcha_response_field").val();
                (<any>this).$regChallenge = jQuery("#recaptcha_challenge_field").val();

                if ((<any>this).$regCaptcha == "")
                    this.$errorMsg = "Please enter the capture code";
            }

            if (this.$errorMsg == "")
            {
                this.$errorRed = false;
                return false;
            }
            else
            {
                this.$errorRed = true;
                return true;
            }
        }

        /**
		* Creates a new user project
        * @param {EngineForm} The form to check.
        * @param {boolean} True if there is an error
		*/
        newProject(name: string, description: string, plugins: Array<Engine.IPlugin>)
        {
            var that = this;
            that.$loading = true;
            that.$errorRed = false;
            that.$errorMsg = "Just a moment while we hatch your appling...";
            Compiler.digest(this._splashElm, this, false);
            var ids = plugins.map<string>(function (value) { return value._id; });

            this.$user.newProject(name, ids, description).then(function (data)
            {
                that.$loading = false;
                that.$errorRed = false;
                that.$errorMsg = "";
                that.$selectedProject = data.data;
                that.$projects.push(data.data);

                // Start Loading the plugins
                that.openProject(that.$selectedProject);

            }).fail(function (err: Error)
            {
                that.$errorRed = true;
                that.$errorMsg = err.message;
                that.$loading = false;
                Animate.Compiler.digest(that._splashElm, that, true);
            });

        }

        /*
        * General error handler
        */
        loginError(err: Error)
        {
            this.$loading = false;
            this.$errorRed = true;
            this.$errorMsg = err.message;
            Compiler.digest(this._loginElm, this);
            Compiler.digest(this._splashElm, this);
        }

        /*
        * General success handler
        */
        loginSuccess(data: UsersInterface.IResponse)
        {
            if (data.error)
                this.$errorRed = true;
            else
                this.$errorRed = false;

            this.$loading = false;
            this.$errorMsg = data.message;
            Compiler.digest(this._splashElm, this, true);
        }

        /**
		* Attempts to log the user in
        * @param {string} user The username
        * @param {string} password The user password
        * @param {boolean} remember Should the user cookie be saved
		*/
        login(user: string, password: string, remember: boolean)
        {
            var that = this;
            that.$loading = true;
            this.$user.login(user, password, remember)
                .then(function (data)
                {
                    if (data.error)
                        that.$errorRed = true;
                    else
                        that.$errorRed = false;

                    that.$errorMsg = data.message;
                    
                })
                .fail(this.loginError.bind(that))
                .done(function ()
                {
                    that.$loading = false;
                    if (that.$user.isLoggedIn)
                        that.goState("welcome", true)
                    else
                        Compiler.digest(that._splashElm, that, true);
                });
        }

        /**
		* Attempts to register a new user
        * @param {string} user The username of the user.
		* @param {string} password The password of the user.
		* @param {string} email The email of the user.
		* @param {string} captcha The captcha of the login screen
		* @param {string} captha_challenge The captha_challenge of the login screen
		*/
        register(user: string, password: string, email: string, captcha: string, challenge: string)
        {
            var that = this;
            that.$loading = true;
            this.$user.register(user, password, email, captcha, challenge)
                .then(this.loginSuccess.bind(that))
                .fail(function (err: Error)
                {
                    that.$errorRed = true;
                    that.$errorMsg = err.message;
                    that.$loading = false;
                    Recaptcha.reload();
                    Compiler.digest(that._loginElm, that);
                    Compiler.digest(that._splashElm, that);
                });
        }

        /**
        * Attempts to resend the activation code
        * @param {string} user The username or email of the user to resend the activation
        */
        resendActivation(user: string)
        {
            var that = this;

            if (!user)
            {
                this.$errorMsg = "Please specify a username or email to fetch";
                jQuery("form[name='register'] input[name='username'], form[name='register'] input[name='email']", this._loginElm).each(function (index, elem)
                {
                    this.$error = true;
                });

                Compiler.digest(that._loginElm, that);
                Compiler.digest(that._splashElm, that);
                return;
            }

            that.$loading = true;
            this.$user.resendActivation(user)
                .then(this.loginSuccess.bind(that))
                .fail(this.loginError.bind(that));
        }

        /**
        * Attempts to reset the users password
        * @param {string} user The username or email of the user to resend the activation
        */
        resetPassword(user: string)
        {
            var that = this;

            if (!user)
            {
                this.$errorMsg = "Please specify a username or email to fetch";
                jQuery("form[name='register'] input[name='username'], form[name='register'] input[name='email']", this._loginElm).each(function (index, elem)
                {
                    this.$error = true;
                });

                Compiler.digest(that._loginElm, that);
                Compiler.digest(that._splashElm, that);
                return;
            }

            that.$loading = true;
            this.$user.resetPassword(user)
                .then(this.loginSuccess.bind(that))
                .fail(this.loginError.bind(that));
        }

        /**
        * Attempts to resend the activation code
        */
        logout()
        {
            var that = this;
            that.$loading = true;
            this.$user.logout().then(function ()
            {
                that.$loading = false;
                that.$errorMsg = "";
            })
            .fail(this.loginError.bind(that))
            .always(function ()
            {
                Application.getInstance().projectReset();
                that.$loading = false;
                that.goState("login", true);
            });
        }
        
        /**
		* Initializes the spash screen
		* @returns {Splash}
		*/
        static init(app: Application): Splash
        {
            Splash._singleton = new Splash(app);
            return Splash._singleton;
        }

        /**
		* Gets the singleton reference of this class.
		* @returns {Splash}
		*/
        static get get(): Splash
        {
            return Splash._singleton;
        }
    }
}