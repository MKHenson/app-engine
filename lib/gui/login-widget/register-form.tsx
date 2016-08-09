module Animate {
    export interface IRegisterFormProps {
        onLogin?: () => void;
        onLoadingChange? : (loading: boolean) => void;
        switchMode: () => void;
    }

    export interface IRegisterFormState {
        loading?: boolean;
        errorMsg?: string;
        error?: boolean;
    }

    export class RegisterForm extends React.Component< IRegisterFormProps, IRegisterFormState> {
        private _user: User;
        private _captchaId: number;

        /**
         * Creates a new instance
         */
        constructor() {
            super();
            this._user = User.get;
            this.state = {
                loading: false,
                errorMsg : "",
                error : false
            };
        }

        /**
        * Attempts to register a new user
        */
        register( json : any ) {
            var that = this;

            if ( this.props.onLoadingChange )
                this.props.onLoadingChange(true);

            this.setState({
                loading: true
            });

            this._user.register(json.username, json.password, json.email, grecaptcha.getResponse(this._captchaId) ).then((data) => {
                    if ( this.props.onLoadingChange )
                        this.props.onLoadingChange(false);

                    this.setState({
                        loading: false,
                        errorMsg: data.message,
                        error:false
                    });
                })
                .catch( (err: Error) => {
                    if ( this.props.onLoadingChange )
                        this.props.onLoadingChange(false);

                    grecaptcha.reset();
                    this.setState({
                        loading: false,
                        error: true,
                        errorMsg: err.message
                    });
                });
        }

        /**
         * Called when the captcha div has been mounted and is ready
         * to be rendered
         * @param {HTMLDivElement} div The div being rendered
         */
        mountCaptcha(div : HTMLDivElement) {
            if (div && div.childNodes.length == 0)
                this._captchaId = grecaptcha.render(div, { theme: "white", sitekey : "6LcLGSYTAAAAAMr0sDto-BBfQYoLhs21CubsZxWb" } );
        }

        /**
         * Called when the component is unmounted
         */
        componentWillUnmount() {
            grecaptcha.reset(this._captchaId);
        }

        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render() : JSX.Element {
            return <div className='login animate-all fade-in'>
                <VForm
                    name="register"
                    autoComplete="off"
                    onValidationError={(errors, form)=> {
                        this.setState({
                            errorMsg: `${Utils.capitalize(errors[0].name)} : ${errors[0].error}`,
                            error : true
                        })
                    }}
                    onValidationsResolved={(form)=> {
                        this.setState({ errorMsg: '' })
                    }}
                    onSubmitted={( json, form) => {
                        this.register(json)
                    }}>

                    <VInput type='text'
                        placeholder="Username"
                        autoComplete="off"
                        name="username"
                        validator={ValidationType.NOT_EMPTY | ValidationType.ALPHANUMERIC_PLUS}
                        />

                    <VInput type='text'
                        placeholder="Email"
                        autoComplete="off"
                        name="email"
                        validator={ValidationType.NOT_EMPTY | ValidationType.EMAIL}
                        />

                    <VInput type='password'
                        placeholder="Password"
                        autoComplete="off"
                        name="password"
                        validator={ValidationType.NOT_EMPTY | ValidationType.ALPHANUMERIC_PLUS}
                        />
                    <div id='animate-captcha' ref={(e) => { this.mountCaptcha(e) }}></div>
                    <div>
                        {( this.state.errorMsg != '' ?
                            <Attention mode={this.state.error ? AttentionType.ERROR : AttentionType.SUCCESS}>
                                {this.state.errorMsg}
                            </Attention>
                            : null
                        )}
                    </div>
                    <div className="double-column">
                        <button
                            type="button"
                            disabled={this.state.loading}
                            className="button reg-gradient en-register animate-all"
                            onClick={(e) => this.props.switchMode()}>
                            <span className='fa-chevron-left fa' /> Login
                        </button>
                    </div>
                    <div className="double-column">
                        <button type='submit'
                            disabled={this.state.loading}
                            className="button reg-gradient en-register animate-all">
                            Register
                        </button>
                    </div>
                </VForm>
            </div>
        }
    }
}