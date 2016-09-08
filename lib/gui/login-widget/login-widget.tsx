namespace Animate {
    export enum LoginMode {
        LOGIN,
        REGISTER
    }

    export interface ILoginWidgetState {
        mode?: LoginMode;
        loading?: boolean;
    }

    export class LoginWidget extends React.Component<{ onLogin: () => void }, ILoginWidgetState> {
        private _user: User;

        /**
         * Creates a new instance
         */
        constructor() {
            super();
            this._user = User.get;
            this.state = {
                mode: LoginMode.LOGIN,
                loading: false
            };
        }

        switchState() {
            this.setState( { mode: ( this.state.mode === LoginMode.LOGIN ? LoginMode.REGISTER : LoginMode.LOGIN ) })
        }

        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element {
            let activePane: JSX.Element;
            if ( this.state.mode === LoginMode.LOGIN )
                activePane = <LoginForm
                    switchMode={() => this.switchState() }
                    onLogin={() => {
                        if ( this.props.onLogin )
                            this.props.onLogin();
                    } }
                    onLoadingChange={( loading ) => this.setState( { loading: loading }) }
                    />
            else
                activePane = <RegisterForm
                    switchMode={() => this.switchState() }
                    onLoadingChange={( loading ) => this.setState( { loading: loading }) }
                    />

            return <div id="log-reg" className={( this.state.loading ? 'loading' : null ) }>
                <i className="fa fa-cog fa-spin fa-3x fa-fw"></i>
                <div className="avatar">
                    <img src="media/blank-user.png" />
                </div>
                {activePane}
            </div>;
        }
    }
}