namespace Animate {
    export interface ILoginFormProps {
        onLogin: () => void;
        onLoadingChange?: ( loading: boolean ) => void;
        switchMode: () => void;
    }

    export interface ILoginFormState {
        loading?: boolean;
        username?: string;
        errorMsg?: string;
        error?: boolean;
    }

    export class LoginForm extends React.Component<ILoginFormProps, ILoginFormState> {
        private _user: User;

        /**
         * Creates a new instance
         */
        constructor() {
            super();
            this._user = User.get;
            this.state = {
                loading: false,
                username: '',
                errorMsg: '',
                error: false
            };
        }

        /**
         * When the component is mounted we check if the user is logged in
         */
        componentWillMount() {

            if ( this.props.onLoadingChange )
                this.props.onLoadingChange( true );

            this.state = {
                loading: true,
                error: false
            };

            User.get.authenticated().then(() => {

                if ( this.props.onLoadingChange )
                    this.props.onLoadingChange( false );

                this.setState( {
                    loading: false
                });

                if ( this._user.isLoggedIn )
                    this.props.onLogin();

            }).catch( this.loginError.bind( this ) );
        }

        /*
        * General error handler
        */
        loginError( err: Error ) {
            if ( this.props.onLoadingChange )
                this.props.onLoadingChange( false );

            this.setState( {
                loading: false,
                errorMsg: err.message,
                error: true
            });
        }

        /*
        * General success handler
        */
        loginSuccess( data: UsersInterface.IResponse ) {
            if ( this.props.onLoadingChange )
                this.props.onLoadingChange( false );

            this.setState( {
                loading: false,
                errorMsg: data.message,
                error: data.error
            });
        }

        /**
         * Attempts to reset the users password
         */
        resetPassword() {
            const that = this;
            if ( this.state.username === '' ) {
                return this.setState( {
                    error: true,
                    errorMsg: 'Please specify a username or email to fetch'
                });
            }

            if ( this.props.onLoadingChange )
                this.props.onLoadingChange( true );

            this.setState( { loading: true });
            this._user.resetPassword( this.state.username! )
                .then( this.loginSuccess.bind( that ) )
                .catch( this.loginError.bind( that ) );
        }

        /**
         * Attempts to resend the activation code
         */
        resendActivation() {
            const user = this.state.username!;
            const that = this;

            if ( user === '' ) {
                return this.setState( {
                    error: true,
                    errorMsg: 'Please specify a username or email to fetch'
                });
            }

            if ( this.props.onLoadingChange )
                this.props.onLoadingChange( true );

            this.setState( { loading: true });
            this._user.resendActivation( user )
                .then( this.loginSuccess.bind( that ) )
                .catch( this.loginError.bind( that ) );
        }

        /**
        * Attempts to log the user in
        */
        login( json ) {
            const that = this;

            if ( this.props.onLoadingChange )
                this.props.onLoadingChange( true );

            this.setState( {
                loading: true
            });

            this._user.login( json.username, json.password, json.remember ).then(( data ) => {
                if ( this.props.onLoadingChange )
                    this.props.onLoadingChange( false );

                this.setState( {
                    loading: false,
                    errorMsg: data.message,
                    error: data.error
                });

                if ( that._user.isLoggedIn )
                    this.props.onLogin();
            })
                .catch( this.loginError.bind( that ) );
        }

        /**
         * Creates the component elements
         */
        render(): JSX.Element {
            return <div className="login animate-all fade-in">
                <VForm name="login"
                    autoComplete="off"
                    onValidationError={( errors ) => {
                        this.setState( {
                            errorMsg: `${Utils.capitalize( errors[ 0 ].name )} : ${errors[ 0 ].error}`,
                            error: true
                        })
                    } }
                    onValidationsResolved={() => {
                        this.setState( { errorMsg: '' })
                    } }
                    onSubmitted={( json ) => {
                        this.login( json );
                    } }>
                    <VInput
                        autoComplete="off"
                        placeholder="Email or Username"
                        autoFocus={true}
                        type="text"
                        name="username"
                        onChange={( e, newText ) => {
                            e; // Supresses unused param error
                            this.setState( { username: newText })
                        } }
                        value={this.state.username}
                        validator={ValidationType.NOT_EMPTY | ValidationType.ALPHA_EMAIL}
                        />

                    <VInput
                        autoComplete="off"
                        placeholder="Password"
                        autoFocus={false}
                        type="password"
                        name="password"
                        validator={ValidationType.NOT_EMPTY | ValidationType.ALPHANUMERIC_PLUS}
                        />

                    <a id="forgot-pass" className={( this.state.loading ? 'disabled' : undefined )}
                        onClick={() => this.resetPassword()}>
                        Forgot
                    </a>
                    <VCheckbox
                        label="Remember me"
                        checked={true}
                        name="remember"
                        />
                    <br />
                    <a
                        className={( this.state.loading ? 'disabled' : '' )}
                        onClick={() => this.resendActivation()}>
                        Resend Activation Email
                    </a>
                    <br />
                    <div>
                        {( this.state.errorMsg ?
                            <Attention mode={this.state.error ? AttentionType.ERROR : AttentionType.SUCCESS}>
                                {this.state.errorMsg}
                            </Attention>
                            : null
                        )}
                    </div>
                    <div className="double-column">
                        <ButtonPrimary type="button" disabled={this.state.loading} onClick={() => this.props.switchMode()}>
                            Register <span className="fa fa-user" />
                        </ButtonPrimary>
                    </div>
                    <div className="double-column">
                        <ButtonPrimary type="submit" preventDefault={false} disabled={this.state.loading}>
                            Login <span className="fa fa-sign-in" />
                        </ButtonPrimary>
                    </div>
                </VForm>
            </div>
        }
    }
}