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
        private _app: Application;
        private $user: User;
        private $theme: any;
        private $activePane: string;
        private $loginError: string;
        private $loginRed: boolean;
        private $loading: boolean;

        /**
		* Creates an instance of the splash screen
		*/
        constructor(app: Application)
        {
            this._app = app;
            this._splashElm = jQuery(".splash").remove().clone();
            this._loginElm = jQuery(".login").remove().clone();
            this.$user = User.get;
            this.$activePane = "login";
            this.$loginError = "";
            this.$loginRed = true;
            this.$loading = false;

            // Create a random theme for the splash screen
            if (Math.random() < 0.4)
                this.$theme = { "welcome-blue": true };
            else
                this.$theme = { "welcome-pink": true };

            // Add the elements
            jQuery("#splash-view", this._splashElm).prepend(this._loginElm);

            // Build each of the templates
            Compiler.build(this._splashElm, this);
            Compiler.build(this._loginElm, this);
        }

        show()
        {
            this._app.element.detach();
            Compiler.digest(this._splashElm, this, true);

            jQuery("body").append(this._splashElm);
            jQuery("#en-login-username", this._loginElm).val("");
        }

        splashDimensions()
        {
            if (this.$activePane == "login")
                return { "compact": true, "wide": false };
        }

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

                if ((<any>this).$regPassword != (<any>this).$regPasswordCheck)
                    this.$loginError = "Your passwords do not match";
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

        loginError(err: Error)
        {
            this.$loading = false;
            this.$loginRed = true;
            this.$loginError = err.message;
            Compiler.digest(this._loginElm, this);
        }

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
                    Compiler.digest(that._splashElm, that, true);
                })
                .fail(this.loginError.bind(that))
                .done(function ()
                {
                    jQuery(".close-but", that._loginElm).trigger("click");
                    that.$loading = false;
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

                return Compiler.digest(that._loginElm, that);
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

                return Compiler.digest(that._loginElm, that);
            }

            that.$loading = true;
            this.$user.resetPassword(user)
                .then(this.loginSuccess.bind(that))
                .fail(this.loginError.bind(that));
        }

        /**
        * Attempts to resend the activation code
        * @param {string} user The username or email of the user to resend the activation
        */
        logout()
        {
            var that = this;
            that.$loading = true;
            this.$user.logout().then(function ()
            {
                that.$loading = false;
                that.$loginError = "";
                Application.getInstance().projectReset();
                Compiler.digest(that._splashElm, that, true);

            }).fail(this.loginError.bind(that));
        }
        
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