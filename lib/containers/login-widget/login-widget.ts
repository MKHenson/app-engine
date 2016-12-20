// import { login, register, resetPassword, resendActivation } from '../../actions/user-actions';
// import { toggleLoginState } from '../../actions/editor-actions';
// import { RegisterForm } from '../../components/register-form/register-form';
import { LoginForm } from '../../components/login-form/login-form';
// import { authenticated } from '../../actions/user-actions';
import { JML } from '../../jml/jml';

// export interface ILoginWidgetProps extends HatcheryEditor.HatcheryProps {
//     onLogin?: () => void,
//     user?: HatcheryEditor.IUser,
//     editorState?: HatcheryEditor.IEditorState;
//     forward?: string;
// }

// class LoginWidget extends React.Component<ILoginWidgetProps, any> {

//     /**
//      * Creates a new instance
//      */
//     constructor( props: ILoginWidgetProps ) {
//         super( props );
//     }

//     componentWillMount() {
//         this.props.dispatch!( authenticated( this.props.forward ) );
//     }

//     /**
//      * Creates the component elements
//      */
//     render(): JSX.Element {

//         let activePane: JSX.Element;
//         const dispatch = this.props.dispatch!;
//         const user = this.props.user!;

//         if ( this.props.editorState!.loginState === 'login' )
//             activePane = <LoginForm
//                 isLoading={user.loading}
//                 error={( user.error ? true : false )}
//                 message={( user.error ? user.error.message : user.serverResponse! )}
//                 onRegisterRequested={() => dispatch( toggleLoginState( 'register' ) )}
//                 onResetPasswordRequest={( username ) => dispatch( resetPassword( username ) )}
//                 onResendActivationRequest={( username ) => dispatch( resendActivation( username ) )}
//                 onLoginRequested={( token ) => dispatch( login( token, this.props.forward ) )}
//                 />;
//         else
//             activePane = <RegisterForm
//                 ref="register"
//                 isLoading={user.loading}
//                 error={( user.error ? true : false )}
//                 message={( user.error ? user.error.message : user.serverResponse! )}
//                 onRegisterRequested={( token ) => dispatch( register( token ) )}
//                 onLoginRequested={() => dispatch( toggleLoginState( 'login' ) )}
//                 />;

//         return <div id="login-widget" className="background fade-in">
//             <div id="log-reg" className={( user.loading ? ' loading' : undefined )}>
//                 <i className="fa fa-cog fa-spin fa-3x fa-fw"></i>
//                 <div className="avatar">
//                     <img src="media/blank-user.png" />
//                 </div>
//                 {activePane}
//             </div>
//         </div>;
//     }
// }

/**
 * A widget for logging the user in
 */
export class LoginWidget extends HTMLElement {

    static get observedAttributes() {
        return [ 'loading' ];
    }

    constructor() {
        super();
        this.className = 'background fade-in';

        this.appendChild(
            JML.div( { id: 'log-reg' }, [
                JML.i( { className: 'fa fa-cog fa-spin fa-3x fa-fw' }),
                JML.div( { className: 'avatar' }, [
                    JML.img( { src: 'media/blank-user.png' })
                ] ),
                JML.div( { className: 'content' }, [
                    JML.elm<LoginForm>( new LoginForm(), {})
                    // JML.elm<LoginForm>( new LoginForm() )
                ] )
            ] )
        );
    }

    /**
     * If the attributes change we update the internal state
     */
    attributeChangedCallback( name: string, oldValue: string, newValue: string ) {
        if ( name === 'loading' )
            this.loading = newValue === 'true' ? true : false;
    }

    /**
    * Gets if the loading element is visible
    */
    get loading(): boolean {
        return this.querySelector( '#log-reg' ) !.className.indexOf( 'loading' ) === -1 ? false : true;
    }

    /**
     * Sets if the loading element is visible
     */
    set loading( val: boolean ) {
        this.querySelector( '#log-reg' ) !.className = val ? 'loading' : '';
    }
}