import { IStore, IEditorState, HatcheryProps, IUser } from 'hatchery-editor';
import { login, register, resetPassword, resendActivation } from '../../actions/user-actions';
import { toggleLoginState } from '../../actions/editor-actions';
import { RegisterForm } from '../../components/register-form/register-form';
import { LoginForm } from '../../components/login-form/login-form';

export enum LoginMode {
    LOGIN,
    REGISTER
}

export interface ILoginWidgetProps extends HatcheryProps {
    onLogin?: () => void,
    user?: IUser,
    editorState?: IEditorState
}

class LoginWidget extends React.Component<ILoginWidgetProps, any> {

    /**
     * Creates a new instance
     */
    constructor( props: ILoginWidgetProps ) {
        super( props );
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
                error={( user.error ? true : false )}
                message={( user.error ? user.error.message : user.serverResponse! )}
                onRegisterRequested={() => dispatch( toggleLoginState( 'register' ) )}
                onResetPasswordRequest={( username ) => dispatch( resetPassword( username ) )}
                onResendActivationRequest={( username ) => dispatch( resendActivation( username ) )}
                onLoginRequested={( token ) => dispatch( login( token ) )}
                />;
        else
            activePane = <RegisterForm
                ref="register"
                isLoading={user.loading}
                error={( user.error ? true : false )}
                message={( user.error ? user.error.message : user.serverResponse! )}
                onRegisterRequested={( token ) => dispatch( register( token ) )}
                onLoginRequested={() => dispatch( toggleLoginState( 'login' ) )}
                />;

        return <div id="login-widget">
            <div id="log-reg" className={( user.loading ? ' loading' : undefined )}>
                <i className="fa fa-cog fa-spin fa-3x fa-fw"></i>
                <div className="avatar">
                    <img src="media/blank-user.png" />
                </div>
                {activePane}
            </div>
        </div>;
    }
}

const ConnectedWidget = ReactRedux.connect<ILoginWidgetProps, any, any>(( state: IStore ) => {
    return {
        user: state.user,
        editorState: state.editorState
    }
})( LoginWidget )

export { ConnectedWidget as LoginWidget };