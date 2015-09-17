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
        private $selectedProjects: Array<Engine.IProject>;
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
            this.$user = User.get;
            this.$activePane = "loading";
            this.$errorMsg = "";
            this.$errorRed = true;
            this.$loading = false;
            this.$projects = [];
            this.$plugins = __plugins;
            //for (var projectName in __plugins)
            //{
            //    this.$pluginsNames.push(projectName);
            //    var versionObj: { [version: string]: Engine.IProject } = {};
            //    for (var i = 0, l = __plugins[projectName].length; i < l; i++)
            //        versionObj[__plugins[projectName][i].version] = __plugins[projectName][i].plugin;

            //    this.$pluginVersions.push(versionObj);
            //}

            this.$selectedProjects = [];
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
                // Build each of the templates
                Compiler.build(this._loginElm, this);
                Compiler.build(this._welcomeElm, this);
                Compiler.build(this._newProject, this);
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
                if (!val)
                    that.goState("login", true);
                else
                    that.goState("welcome", true);

            }).fail(function (err)
            {
                that.goState("login", true);
            });
        }

        /*
        * Gets the dimensions of the splash screen based on the active pane
        */
        splashDimensions(): any
        {
            if (this.$activePane == "login" || this.$activePane == "register")
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
            that.$loading = false;
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
        * Fetches a list of user projects
        * @param {number} index 
        * @param {number} limit
        */
        fetchProjects(index: number, limit: number)
        {
            var that = this;
            that.$loading = true;
            that.$errorMsg = "";
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
        */
        private selectProject(project: Engine.IProject)
        {
            (<any>project).selected = !(<any>project).selected;

            if (this.$selectedProjects.indexOf(project) == -1)
                this.$selectedProjects.push(project);
            else
                this.$selectedProjects.splice(this.$selectedProjects.indexOf(project), 1);


            if (this.$selectedProjects.length > 0)
                this.$selectedProject = this.$selectedProjects[this.$selectedProjects.length - 1];
            else
                this.$selectedProject = null;
        }

        /*
        * Called when we select a project
        */
        private selectPlugin(plugin: Engine.IPlugin)
        {
            (<any>plugin).selected = !(<any>plugin).selected;

            if (this.$selectedPlugins.indexOf(plugin) == -1)
                this.$selectedPlugins.push(plugin);
            else
                this.$selectedPlugins.splice(this.$selectedPlugins.indexOf(plugin), 1);


            if (this.$selectedPlugins.length > 0)
                this.$selectedPlugin = this.$selectedPlugins[this.$selectedPlugins.length - 1];
            else
                this.$selectedPlugin = null;
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
        reportError(form: EngineForm): boolean
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
            this.$loading = true;
            this.$errorRed = false;
            this.$errorMsg = "Just a moment while we hatch your appling...";
            Compiler.digest(this._splashElm, this, false);
            this.$user.newProject(name, description);
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