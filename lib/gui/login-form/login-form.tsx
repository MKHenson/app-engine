module Animate
{
    export enum LoginMode {
        LOGIN,
        REGISTER
    }

    export interface ILoginForm
    {
        mode?: LoginMode;
        loading?: boolean;
        $logRemember?: boolean;
        $logUsername?: string;
        $regUsername?: string;
        $regEmail?: string;
        $regPassword?: string;
        $logPassword?: string;
        $regCaptcha?: string;
        $regChallenge?: string;
    }

    export class LoginForm extends React.Component<{ onLogin: () => void }, ILoginForm>
    {
        $user: User;
        $errorMsg: string;
        $errorRed: boolean;
        $error: boolean;

        constructor()
        {
            super();
            this.$user = User.get;
            this.$errorMsg = "";

            this.$error = false;
            this.$errorRed = true;

            this.state = {
                mode : LoginMode.LOGIN,
                loading: false,
                $logUsername : "",
                $regUsername : "",
                $regEmail : "",
                $regPassword : "",
                $logPassword : "",
                $regCaptcha : "",
                $regChallenge : "",
                $logRemember : false
            };
        }

        /*
        * General error handler
        */
        loginError(err: Error)
        {
            this.setState({ loading: false });
            this.$errorRed = true;
            this.$errorMsg = err.message;
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

            this.setState({ loading: false });
            this.$errorMsg = data.message;
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
                // this.$errorMsg = "Please specify a username or email to fetch";
                // jQuery("form[name='register'] input[name='username'], form[name='register'] input[name='email']", this._loginElm).each(function (index, elem)
                // {
                //     this.$error = true;
                // });

                return;
            }

            this.setState({ loading: true });
            this.$user.resetPassword(user)
                .then(this.loginSuccess.bind(that))
                .catch(this.loginError.bind(that));
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
                // this.$errorMsg = "Please specify a username or email to fetch";
                // jQuery("form[name='register'] input[name='username'], form[name='register'] input[name='email']", this._loginElm).each(function (index, elem)
                // {
                //     this.$error = true;
                // });

                return;
            }

            this.setState({ loading: true });
            this.$user.resendActivation(user)
                .then(this.loginSuccess.bind(that))
                .catch(this.loginError.bind(that));
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
            this.setState({ loading: true });
            this.$user.register(user, password, email, captcha, challenge)
                .then(this.loginSuccess.bind(that))
                .catch(function (err: Error)
                {
                    that.$errorRed = true;
                    that.$errorMsg = err.message;
                    this.setState({ loading: false });
                    grecaptcha.reset();
                });
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
            this.setState({ loading: true });
            this.$user.login(user, password, remember)
                .then(function (data)
                {
                    if (data.error)
                        that.$errorRed = true;
                    else
                        that.$errorRed = false;

                    that.$errorMsg = data.message;
                    this.setState({ loading: false });

                    if (that.$user.isLoggedIn)
                        this.props.onLogin();
                })
                .catch(this.loginError.bind(that));
        }

        validateRegister()
        {
            return  true;
        }

        validateLogin()
        {
            return  true;
        }

        render()
        {
            var activePane : JSX.Element;

            // if (!that._captureInitialized)
            // {
            //     that._captureInitialized = true;

            //     // Build each of the templates
            //     Compiler.build(this._loginElm, this);
            //     Compiler.build(this._welcomeElm, this);
            //     Compiler.build(this._newProject, this);
            //     Compiler.build(this._loadingProject, this);
            //     Compiler.build(this._splashElm, this);
            //     grecaptcha.render(document.getElementById("animate-captcha"), { theme: "white",
            //         sitekey : "6LdiW-USAAAAAGxGfZnQEPP2gDW2NLZ3kSMu3EtT" });
            // }
            // else
            // {
            //     Compiler.digest(this._splashElm, that, true);
            //     grecaptcha.reset();
            // }

            if ( this.state.mode == LoginMode.LOGIN )
            {
                activePane = <div className='login animate-all fade-in'>
                    <form name="login"
                        autoComplete="off"
                        onSubmit={(e) => {
                            e.preventDefault();
                            this.validateLogin() && this.login(this.state.$logUsername, this.state.$logPassword, this.state.$logRemember)}
                        }>

                        <div className="avatar"><img src="media/blank-user.png" /></div>
                        <div className='input-box'>
                            <input autoComplete="off"
                                placeholder="Email or Username"
                                autoFocus=""
                                type='text'
                                name="username"
                                id="en-login-username"
                                onChange={(e)=>{ this.setState({ $logUsername : (e.target as HTMLInputElement).value })}}
                                className={( this.$error ? 'bad-input' : null )}
                                value={this.state.$logUsername}
                                />
                        </div>
                        <div className='input-box'>
                            <input autoComplete="off"
                                placeholder="Password"
                                autoFocus=""
                                type='password'
                                name="password"
                                id="en-login-password"
                                className={( this.$error ? 'bad-input' : null )}
                                onChange={(e)=>{ this.setState({ $logPassword : (e.target as HTMLInputElement).value })}}
                                value={this.state.$logPassword}
                                />
                            <a id="forgot-pass" className={(this.state.loading ? 'disabled' : null)}
                                onClick={(e) => this.resetPassword(this.state.$logUsername)}>
                                Forgot
                            </a>
                        </div>
                        <div
                            className={( this.$errorRed ? 'error' : null ) + 'label login-msg fade-in animate-slow'}
                            style={{ maxHeight: (this.$errorMsg != '' ? '150px' : ''), padding: (this.$errorMsg != '' ? '10px' : '0') }}>
                            {this.$errorMsg}
                        </div>
                        <div className="checkbox">
                            <div className="tick-box" onClick={(e)=>this.setState({$logRemember: !this.state.$logRemember})}>
                                <div className="tick" style={( !this.state.$logRemember ? { display : 'none' } : null )}></div>
                            </div>
                            Remember me
                        </div>
                        <a
                            className={(this.state.loading ? 'disabled' : null)}
                            onClick={(e) => this.resendActivation(this.state.$logUsername || this.state.$regUsername || this.state.$regEmail )}>
                            Resend Activation Email
                        </a>
                        <br />
                        <div className="double-column">
                            <div
                                className={(this.state.loading ? 'disabled' : null) + "button reg-gradient en-register animate-all"}
                                onClick={(e) => this.setState({ mode : LoginMode.REGISTER })}>
                                Register
                            </div>
                        </div>
                        <div className="double-column">
                            <input type='submit'
                                className={(this.state.loading ? 'disabled' : null) + "button reg-gradient en-login animate-all"}
                                value="Login"
                            />
                        </div>
                    </form>
                </div>
            }
            else
            {
                activePane = <div className='login animate-all fade-in'>
                    <form
                        name="register"
                        autoComplete="off"
                        onSubmit={(e) => {
                            e.preventDefault();
                            this.validateRegister() && this.register(this.state.$regUsername, this.state.$regPassword, this.state.$regEmail, this.state.$regCaptcha, this.state.$regChallenge )}
                        }>

                        <div className='input-box'>
                            <input type='text'
                                placeholder="Username"
                                autoComplete="off"
                                name="username"
                                value={this.state.$regUsername}
                                onChange={(e)=>this.setState({$regUsername: (e.target as HTMLInputElement).value})}
                                id="en-reg-username"
                                className={( this.$error ? 'bad-input' : null )}
                                />
                        </div>
                        <div className='input-box'>
                            <input type='text'
                                placeholder="Email"
                                autoComplete="off"
                                name="email"
                                value={this.state.$regEmail}
                                onChange={(e)=>this.setState({$regEmail: (e.target as HTMLInputElement).value})}
                                id="en-reg-email"
                                className={( this.$error ? 'bad-input' : null )}
                                />
                        </div>
                        <div className='input-box'>
                            <input type='password'
                                placeholder="Password"
                                autoComplete="off"
                                name="password"
                                value={this.state.$regPassword}
                                onChange={(e)=>this.setState({$regPassword: (e.target as HTMLInputElement).value})}
                                id="en-reg-password"
                                className={( this.$error ? 'bad-input' : null )}
                                />
                        </div>
                        <div
                            className={( this.$errorRed ? 'error' : null ) + 'label login-msg fade-in animate-slow'}
                            style={{ maxHeight: (this.$errorMsg != '' ? '150px' : ''), padding: (this.$errorMsg != '' ? '10px' : '0') }}>
                                {this.$errorMsg}
                        </div>
                        <div id='animate-captcha'></div>
                        <div className="double-column">
                            <div
                                className={(this.state.loading ? 'disabled' : null) + "button reg-gradient en-register animate-all"}
                                onClick={(e) => this.setState({ mode : LoginMode.LOGIN })}>
                                &#10094; Login
                            </div>
                        </div>
                        <div className="double-column">
                            <input
                                type='submit'
                                className={(this.state.loading ? 'disabled' : null) + "button reg-gradient en-register animate-all"}
                                value="Register"
                                />
                        </div>
                    </form>
                </div>
            }

            return <div id="log-reg">{activePane}</div>;
        }
    }
}