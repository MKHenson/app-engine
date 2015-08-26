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
        private $loginError: string;
        private $loginRed: boolean;
        private $loading: boolean;
        private $projects: Array<Engine.IProject>;
        private $selectedProjects: Array<Engine.IProject>;
        private $selectedProject: Engine.IProject;
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
            this.$loginError = "";
            this.$loginRed = true;
            this.$loading = false;
            this.$projects = [];
            this.$selectedProjects = [];
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
                Compiler.build(this._splashElm, this);
                Compiler.build(this._loginElm, this);
                Compiler.build(this._welcomeElm, this);
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
        * @param {state} The name of the state
        */
        goState(state: string, digest: boolean = false)
        {
            var that = this;
            that.$loading = false;
            that.$activePane = state;
            that.$loginError = "";
            if (digest)
                Animate.Compiler.digest(that._splashElm, that, true);

            if (state == "welcome")
                this.fetchProjects(this.$pager.index, this.$pager.limit);
        }

        fetchProjects(index: number, limit: number)
        {
            var that = this;
            that.$loading = true;
            that.$loginError = "";
            Animate.Compiler.digest(that._splashElm, that);

            that.$user.getProjectList(that.$pager.index, that.$pager.limit).then(function (projects)
            {
                that.$pager.last = projects.count;
                that.$projects = projects.data;

            }).fail(function (err: Error)
            {
                that.$loginError = err.message;

            }).done(function ()
            {
                that.$loading = false;
                Animate.Compiler.digest(that._splashElm, that);
                Animate.Compiler.digest(that._welcomeElm, that);
            });
        }

        selectProject(project: any)
        {
            project.selected = !project.selected;

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
        * Called by the app when everything needs to be reset
        */
        reset()
        {
        }

        /**
		* Given a form element, we look at if it has an error and based on the expression. If there is we set 
        * the login error message
        * @param {EngineForm} The form to check.
        * @param {boolean} registerCheck Check register password and assign captcha
        * @param {boolean} True if there is an error
		*/
        reportError(form: EngineForm, registerCheck: boolean = false): boolean
        {
            if (!form.$error)
                this.$loginError = "";
            else
            {
                var name = form.$errorInput;
                name = name.charAt(0).toUpperCase() + name.slice(1);

                switch (form.$errorExpression)
                {
                    case "alpha-numeric":
                        this.$loginError = `${name} must only contain alphanumeric characters`;
                        break;
                    case "non-empty":
                        this.$loginError = `${name} cannot be empty`;
                        break;
                    case "email":
                        this.$loginError = `${name} must be a valid email`;
                        break;
                    case "alpha-numeric-plus":
                        this.$loginError = `${name} must only contain alphanumeric characters and '-', '!', or '_'`;
                        break;
                    default:
                        this.$loginError = "";
                        break;
                }
            }

            if (registerCheck)
            {
                (<any>this).$regCaptcha = jQuery("#recaptcha_response_field").val();
                (<any>this).$regChallenge = jQuery("#recaptcha_challenge_field").val();

                if ((<any>this).$regCaptcha == "")
                    this.$loginError = "Please enter the capture code";
            }

            if (this.$loginError == "")
            {
                this.$loginRed = false;
                return false;
            }
            else
            {
                this.$loginRed = true;
                return true;
            }
        }

        /*
        * General error handler
        */
        loginError(err: Error)
        {
            this.$loading = false;
            this.$loginRed = true;
            this.$loginError = err.message;
            Compiler.digest(this._loginElm, this);
            Compiler.digest(this._splashElm, this);
        }

        /*
        * General success handler
        */
        loginSuccess(data: UsersInterface.IResponse)
        {
            if (data.error)
                this.$loginRed = true;
            else
                this.$loginRed = false;

            this.$loading = false;
            this.$loginError = data.message;
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
                        that.$loginRed = true;
                    else
                        that.$loginRed = false;

                    that.$loginError = data.message;
                    
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
                    that.$loginRed = true;
                    that.$loginError = err.message;
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
                this.$loginError = "Please specify a username or email to fetch";
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
                this.$loginError = "Please specify a username or email to fetch";
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
                that.$loginError = "";
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