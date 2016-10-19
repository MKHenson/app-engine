namespace Animate {
    export interface ILoginFormProps {
        onLoginRequested: ( token: UsersInterface.ILoginToken ) => void;
        onResetPasswordRequest: ( username: string ) => void;
        onRegisterRequested: () => void;
        isLoading?: boolean;
        errorMsg?: string;
    }

    export interface ILoginFormState {
        username?: string;
        error?: boolean;
        message?: string;
    }

    export class LoginForm extends React.Component<ILoginFormProps, ILoginFormState> {

        /**
         * Creates a new instance
         */
        constructor( props: ILoginFormProps ) {
            super( props );
            this.state = {
                error: false,
                message: '',
                username: ''
            };
        }

        /**
         * Attempts to reset the users password
         */
        resetPassword() {
            // const that = this;
            // if ( this.state.username === '' ) {
            //     return this.setState( {
            //         error: true,
            //         errorMsg: 'Please specify a username or email to fetch'
            //     });
            // }

            // // if ( this.props.onLoadingChange )
            // //     this.props.onLoadingChange( true );

            // this.setState( { loading: true });
            // this._user.resetPassword( this.state.username! )
            //     .then( this.loginSuccess.bind( that ) )
            //     .catch( this.loginError.bind( that ) );
        }

        /**
         * Attempts to resend the activation code
         */
        resendActivation() {
            const user = this.state.username!;
            this.props.onResetPasswordRequest( user );
            // const that = this;

            // if ( user === '' ) {
            //     return this.setState( {
            //         error: true,
            //         errorMsg: 'Please specify a username or email to fetch'
            //     });
            // }

            // // if ( this.props.onLoadingChange )
            // //     this.props.onLoadingChange( true );

            // this.setState( { loading: true });
            // this._user.resendActivation( user )
            //     .then( this.loginSuccess.bind( that ) )
            //     .catch( this.loginError.bind( that ) );
        }

        /**
         * Attempts to log the user in
         */
        login( json ) {
            this.props.onLoginRequested( {
                username: json.username,
                password: json.password,
                rememberMe: json.remember
            });
        }

        /**
         * Creates the component elements
         */
        render(): JSX.Element {
            const isLoading = this.props.isLoading!;
            const error = this.props.errorMsg ? true : this.state.error;
            const message = this.props.errorMsg ? this.props.errorMsg : this.state.message;

            return <div className="login animate-all fade-in">
                <VForm name="login"
                    autoComplete="off"
                    onValidationError={( errors ) => {
                        this.setState( {
                            error: true,
                            message: `${Utils.capitalize( errors[ 0 ].name )} : ${errors[ 0 ].error}`
                        })
                    } }
                    onValidationsResolved={() => {
                        this.setState( { message: '', error: false })
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
                        validator={ValidationType.NOT_EMPTY | ValidationType.ALPHA_EMAIL}
                        onChange={( e, newText ) => {
                            e; // Supresses unused param error
                            this.setState( { username: newText })
                        } }
                        value={this.state.username}
                        />

                    <VInput
                        autoComplete="off"
                        placeholder="Password"
                        autoFocus={false}
                        type="password"
                        name="password"
                        validator={ValidationType.NOT_EMPTY | ValidationType.ALPHANUMERIC_PLUS}
                        />

                    <a id="forgot-pass" className={( isLoading ? 'disabled' : undefined )}
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
                        className={( isLoading ? 'disabled' : '' )}
                        onClick={() => this.resendActivation()}>
                        Resend Activation Email
                    </a>
                    <br />
                    <div>
                        {( message !== '' ?
                            <Attention mode={error ? AttentionType.ERROR : AttentionType.SUCCESS}>
                                {message}
                            </Attention>
                            : null
                        )}
                    </div>
                    <div className="double-column">
                        <ButtonPrimary type="button" disabled={isLoading} onClick={() => {
                            if ( this.props.onRegisterRequested )
                                this.props.onRegisterRequested()
                        } }>
                            Register <span className="fa fa-user" />
                        </ButtonPrimary>
                    </div>
                    <div className="double-column">
                        <ButtonPrimary type="submit" preventDefault={false} disabled={isLoading}>
                            Login <span className="fa fa-sign-in" />
                        </ButtonPrimary>
                    </div>
                </VForm>
            </div>
        }
    }
}