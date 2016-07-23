module Animate.Components
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

    export class LoginForm extends React.Component<any, ILoginForm>
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

            this.setState({
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
            });
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

        updateState(param: string, e : React.FormEvent)
        {
            var state : ILoginForm = {};
            state[param] = (e.target as HTMLInputElement).value;
            this.setState(state);
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
                    //if (that.$user.isLoggedIn)
                    //    that.goState("welcome", true);
                })
                .catch(this.loginError.bind(that));
        }

        validateRegister()
        {
            return  false;
        }

        validateLogin()
        {
            return  false;
        }

        render()
        {
            var that = this;
            var activePane : JSX.Element;

            if ( this.state.mode )
            {
                activePane = <div className='login animate-all fade-in'>
                    <form name="login" autocomplete="off" en-change="ctrl.reportError(elm)" onSubmit={!that.validateRegister() && that.login(that.state.$logUsername, that.state.$logPassword, that.state.$logRemember)}>
                        <div className="avatar"><img src="media/blank-user.png" /></div>
                        <div className='input-box'>
                            <input autocomplete="off" placeholder="Email or Username" autofocus="" type='text' name="username" id="en-login-username" className={( this.$error ? 'bad-input' : null )} en-validate="non-empty|email-plus" value={that.state.$logUsername} onChange />
                        </div>
                        <div className='input-box'>
                            <input autocomplete="off" placeholder="Password" autofocus="" type='password' name="password" id="en-login-password" className={( this.$error ? 'bad-input' : null )} en-validate="non-empty|alpha-numeric-plus" value={that.state.$logPassword} />
                            <a id="forgot-pass" className={(this.state.loading ? 'disabled' : null)} onClick={that.resetPassword(that.state.$logUsername)}>Forgot</a>
                        </div>
                        <div className={( this.$errorRed ? 'error' : null ) + 'label login-msg fade-in animate-slow'} style={{ 'max-height': (this.$errorMsg != '' ? '150px' : ''), padding: (this.$errorMsg != '' ? '10px' : '0') }}>
                            {this.$errorMsg}
                        </div>
                        <div className="checkbox">
                            <div className="tick-box" onClick={(e)=>this.setState({$logRemember: !this.state.$logRemember})}>
                                <div className="tick" stlye={( !this.state.$logRemember ? { display : 'none' } : null )}></div>
                            </div>
                            Remember me
                        </div>
                        <a className={(this.state.loading ? 'disabled' : null)} onClick={that.resendActivation(that.state.$logUsername || that.state.$regUsername || that.state.$regEmail )}>
                            Resend Activation Email
                        </a><br />
                        <div className="double-column">
                            <div className={(this.state.loading ? 'disabled' : null) + "button reg-gradient en-register animate-all"} onClick={that.setState({ mode : LoginMode.REGISTER })}>Register</div>
                        </div>
                        <div className="double-column">
                            <input type='submit' className={(this.state.loading ? 'disabled' : null) + "button reg-gradient en-login animate-all"} value="Login" />
                        </div>
                    </form>
                </div>
            }
            else
            {
                activePane = <div className='login animate-all fade-in'>
                    <form name="register" autocomplete="off" en-change="ctrl.reportError(elm)" onSubmit={!that.validateLogin() && that.register(that.state.$regUsername, that.state.$regPassword, that.state.$regEmail, that.state.$regCaptcha, that.state.$regChallenge )}>
                        <div className='input-box'>
                            <input type='text' placeholder="Username" autocomplete="off" name="username" value={that.state.$regUsername} onChange={(e)=>this.setState({$regUsername: (e.target as HTMLInputElement).value})} id="en-reg-username" className={( this.$error ? 'bad-input' : null )} en-validate="non-empty|alpha-numeric-plus" />
                        </div>
                        <div className='input-box'>
                            <input type='text' placeholder="Email" autocomplete="off" name="email" value={that.state.$regEmail} onChange={(e)=>this.setState({$regEmail: (e.target as HTMLInputElement).value})} id="en-reg-email" className={( this.$error ? 'bad-input' : null )} en-validate="non-empty|email" />
                        </div>
                        <div className='input-box'>
                            <input type='password' placeholder="Password" autocomplete="off" name="password" value={this.state.$regPassword} onChange={(e)=>this.setState({$regPassword: (e.target as HTMLInputElement).value})} id="en-reg-password" className={( this.$error ? 'bad-input' : null )} en-validate="non-empty|alpha-numeric-plus" />
                        </div>
                        <div className={( this.$errorRed ? 'error' : null ) + 'label login-msg fade-in animate-slow'} style={{ 'max-height': (this.$errorMsg != '' ? '150px' : ''), padding: (this.$errorMsg != '' ? '10px' : '0') }}>
                            {this.$errorMsg}
                        </div>
                        <div id='animate-captcha'></div>
                        <div className="double-column">
                            <div className={(this.state.loading ? 'disabled' : null) + "button reg-gradient en-register animate-all"} onClick={that.setState({ mode : LoginMode.LOGIN })}>&#10094; Login</div>
                        </div>
                        <div className="double-column">
                            <input type='submit' className={(this.state.loading ? 'disabled' : null) + "button reg-gradient en-register animate-all"} value="Register" />
                        </div>
                    </form>
                </div>
            }

            return <div id="log-reg">{activePane}</div>;
        }
    }
}