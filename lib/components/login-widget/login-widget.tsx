namespace Animate {
    export enum LoginMode {
        LOGIN,
        REGISTER
    }

    export interface ILoginWidgetProps extends HatcheryProps {
        onLogin?: () => void,
        user?: IUser,
        editorState?: IEditorState
    }

    @ReactRedux.connect<IStore, ILoginWidgetProps>(( state ) => {
        return {
            user: state.user,
            editorState: state.editorState
        }
    })

    export class LoginWidget extends React.Component<ILoginWidgetProps, any> {
        private _user: User;

        /**
         * Creates a new instance
         */
        constructor( props: ILoginWidgetProps ) {
            super( props );
            this._user = User.get;
        }

        /**
         * Creates the component elements
         */
        render(): JSX.Element {

            let activePane: JSX.Element;
            const dispatch = this.props.dispatch!;
            const user = this.props.user!;

            if ( this.props.editorState!.loginState === 'login' )
                activePane = <LoginForm
                    isLoading={user.loading}
                    errorMsg={( user.error ? user.error.message : undefined )}
                    onRegisterRequested={() => dispatch( toggleLoginState( 'register' ) )}
                    onLoginRequested={( token ) => dispatch( login( token ) )}
                    />;
            else
                activePane = <RegisterForm
                    onLoginRequested={() => dispatch( toggleLoginState( 'login' ) )}
                    />;

            return <div id="log-reg" className={( user.loading ? 'loading' : undefined )}>
                <i className="fa fa-cog fa-spin fa-3x fa-fw"></i>
                <div className="avatar">
                    <img src="media/blank-user.png" />
                </div>
                {activePane}
            </div>;
        }
    }
}