import { RegisterForm } from '../../components/register-form/register-form';
import { LoginForm } from '../../components/login-form/login-form';
import { JML, empty } from '../../jml/jml';
import { User } from '../../core/user';
import { AttentionType } from '../../setup/enums';

/**
 * Login mode
 */
export enum LoginWidgetMode {
    LOGIN,
    REGISTER
}

/**
 * A widget for logging the user in
 */
export class LoginWidget extends HTMLElement {
    public onLogin: () => void;
    private _mode: LoginWidgetMode;

    static get observedAttributes() {
        return [ 'loading' ];
    }

    /**
     * Creates an instance of the widget
     */
    constructor() {
        super();
        this.className = 'fade-in';

        this.appendChild( JML.h2( null, 'Please Login or Register' ) );
        this.appendChild(
            JML.div( { className: 'background control' }, [
                JML.i( { className: 'fa fa-cog fa-spin fa-3x fa-fw' }),
                JML.div( { className: 'avatar' }, [
                    JML.img( { src: 'media/blank-user.png' })
                ] ),
                JML.div( { className: 'content' })
            ] )
        );

        this.mode = LoginWidgetMode.LOGIN;
    }

    /**
     * Handles a request to the server and how the widget should React
     */
    private request<T>( promise: Promise<T> ): Promise<T> {
        return new Promise<T>(( resolve, reject ) => {
            this.loading = true;

            promise.then(( val: T ) => {
                this.loading = false;
                resolve( val );
            }).catch(( err: Error ) => {
                this.loading = false;
                this.form.message( err.message );
            });
        });
    }

    /**
     * Sets the mode of the login widet
     */
    set mode( val: LoginWidgetMode ) {
        const content = this.querySelector( '.content' ) as HTMLElement;
        empty( content );

        if ( val === LoginWidgetMode.LOGIN ) {
            content.appendChild(
                JML.elm<LoginForm>( new LoginForm(), {
                    onRegisterRequested: () => this.mode = LoginWidgetMode.REGISTER,
                    onResetPasswordRequest: ( username ) => {
                        this.request( User.get.resetPassword( username ) ).then(( message ) => {
                            this.form.message( message!, AttentionType.SUCCESS );
                        });
                    },
                    onLoginRequested: ( json ) => {
                        this.request( User.get.login( json ) ).then(() => {
                            this.form.message( 'Logged in', AttentionType.SUCCESS );
                        });
                    },
                    onResendActivationRequest: ( username ) => {
                        this.request( User.get.resendActivation( username ) ).then(( message ) => {
                            this.form.message( message!, AttentionType.SUCCESS );
                        });
                    }
                }) );
        }
        else {
            content.appendChild(
                JML.elm<RegisterForm>( new RegisterForm(), {
                    onLoginRequested: () => this.mode = LoginWidgetMode.LOGIN,
                    onRegisterRequested: ( json ) => {
                        this.request( User.get.register( json ) ).then(() => {
                            this.form.message( 'Please check your email for further instructions', AttentionType.SUCCESS );
                        });
                    }
                })
            );
        }
    }

    /**
     * Gets the currently active form
     */
    get form(): LoginForm | RegisterForm {
        const content = this.querySelector( '.content' ) as HTMLElement;
        return content.children[ 0 ] as LoginForm | RegisterForm;
    }

    /**
     * Gets the mode of the login widet
     */
    get mode(): LoginWidgetMode {
        return this._mode;
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
        this.classList.toggle( 'loading', val );
        this.form.loading = val;
    }
}