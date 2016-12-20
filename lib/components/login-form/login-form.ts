import { JsonForm } from '../json-form/json-form';
import { ButtonPrimary } from '../buttons/buttons';
import { ValidatedText } from '../validated-text/validated-text';
import { Checkbox } from '../checkbox/checkbox';
import { Attention } from '../attention/attention';
import { JML } from '../../jml/jml';
import { capitalize } from '../../core/utils';
import { ValidationType, AttentionType } from '../../setup/enums';

/**
 * A simple login form with event hooks for the different login actions
 */
export class LoginForm extends HTMLElement {

    public onLoginRequested: ( token: UsersInterface.ILoginToken ) => void;
    public onResetPasswordRequest: ( username: string ) => void;
    public onResendActivationRequest: ( username: string ) => void;
    public onRegisterRequested: () => void;
    private _loading: boolean;

    /**
     * Creates an instance of the Login Form
     */
    constructor() {
        super();

        this.className = 'login animate-all fade-in';
        this._loading = false;

        this.appendChild(
            JML.elm<JsonForm>( new JsonForm(), {
                onError: ( sender, errors ) => {
                    if ( !sender.pristine && Object.keys( errors ).length !== 0 ) {
                        const firstKey = Object.keys( errors )[ 0 ];
                        const error = errors[ firstKey ];
                        this.error( `${capitalize( firstKey )} : ${error.message}` );
                    }
                },
                onResolved: ( sender, errors ) => this.error( null ),
                onSubmit: ( sender, json ) => {
                    this.onLoginRequested( json );
                }
            }, [
                    JML.elm<ValidatedText>( new ValidatedText(), {
                        name: 'username',
                        placeholder: 'Email or Username',
                        validator: ValidationType.EMAIL | ValidationType.ALPHA_EMAIL
                    }),
                    JML.elm<ValidatedText>( new ValidatedText(), {
                        name: 'password',
                        placeholder: 'Password',
                        type: 'password',
                        validator: ValidationType.NOT_EMPTY | ValidationType.ALPHANUMERIC_PLUS
                    }),
                    JML.elm<Checkbox>( new Checkbox(), {
                        checked: true,
                        label: 'Remember me',
                        id: 'remember-me-checkbox',
                        name: 'remember'
                    }),
                    JML.a( {
                        id: 'forgot-pass',
                        onclick: ( e: MouseEvent ) => {
                            e.preventDefault();
                            const username = ( this.children[ 0 ] as JsonForm ).json[ 'username' ] as string;

                            if ( this.loading )
                                return;

                            if ( username === '' || !username )
                                return this.error( 'Please enter a valid username or email' );

                            this.onResetPasswordRequest( username );
                        }
                    }, 'Forgot' ),
                    JML.br(),
                    JML.a( {
                        onclick: ( e: MouseEvent ) => {
                            e.preventDefault();
                            const username = ( this.children[ 0 ] as JsonForm ).json[ 'username' ] as string;

                            if ( this.loading )
                                return;

                            if ( username === '' || !username )
                                return this.error( 'Please enter a valid username or email' );

                            this.onResendActivationRequest( username );
                        }
                    }, 'Resend Activation Email' ),
                    JML.br(),
                    JML.elm<Attention>( new Attention(), {
                        text: 'Message goes here',
                        canClose: false,
                        style: { display: 'none' },
                        mode: AttentionType.ERROR
                    }),
                    JML.div( { className: 'double-column' }, [
                        JML.elm<ButtonPrimary>( new ButtonPrimary(), {
                            onclick: ( e ) => {
                                this.onRegisterRequested()
                            }
                        }, [
                                'Register ',
                                JML.span( { className: 'fa fa-user' })
                            ] )
                    ] ),
                    JML.div( { className: 'double-column' }, [
                        JML.elm<ButtonPrimary>( new ButtonPrimary(), {
                            type: 'submit'
                        }, [
                                'Login ',
                                JML.span( { className: 'fa fa-sign-in' })
                            ] )
                    ] ),
                ] )
        );
    }

    /**
     * Shows an error message
     */
    private error( message: string | null ) {
        const attention = this.querySelector( 'x-attention' ) ! as Attention;
        if ( message ) {
            attention.text = message;
            attention.style.display = '';
        }
        else
            attention.style.display = 'none';
    }

    /**
     * Gets if the login form is loading
     */
    get loading(): boolean {
        return this._loading;
    }

    /**
     * Sets if the login form is loading
     */
    set loading( val: boolean ) {
        const buttons = this.querySelectorAll( 'x-primary' );
        for ( let i = 0, l = buttons.length; i < l; i++ )
            ( buttons[ i ] as HTMLButtonElement ).disabled = val;

        this._loading = val;
    }
}