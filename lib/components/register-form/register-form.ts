import { JsonForm } from '../json-form/json-form';
import { ButtonPrimary } from '../buttons/buttons';
import { ValidatedText } from '../validated-text/validated-text';
import { Attention } from '../attention/attention';
import { JML, empty } from '../../jml/jml';
import { capitalize } from '../../core/utils';
import { ValidationType, AttentionType } from '../../setup/enums';

/**
 * A simple register form with event hooks for the different register actions
 */
export class RegisterForm extends HTMLElement {

    public onRegisterRequested: ( token: UsersInterface.IRegisterToken ) => void;
    public onLoginRequested: () => void;
    private _loading: boolean;
    private _captchaId: number;

    /**
     * Creates an instance of the Login Form
     */
    constructor() {
        super();

        this.className = 'register animate-all fade-in';
        this._loading = false;

        this.appendChild(
            JML.elm<JsonForm>( new JsonForm(), {
                onError: ( sender, errors ) => {
                    if ( !sender.pristine && Object.keys( errors ).length !== 0 ) {
                        const firstKey = Object.keys( errors )[ 0 ];
                        const error = errors[ firstKey ];
                        this.message( `${capitalize( firstKey )} : ${error.message}`, AttentionType.ERROR );
                    }
                },
                onResolved: ( sender, errors ) => this.message( null, AttentionType.ERROR ),
                onSubmit: ( sender, json ) => {
                    json.captcha = grecaptcha.getResponse( this._captchaId );
                    this.onRegisterRequested( json );
                }
            }, [
                    JML.elm<ValidatedText>( new ValidatedText(), {
                        name: 'username',
                        placeholder: 'Username',
                        validator: ValidationType.NOT_EMPTY | ValidationType.ALPHANUMERIC_PLUS
                    }),
                    JML.elm<ValidatedText>( new ValidatedText(), {
                        name: 'email',
                        placeholder: 'Email',
                        validator: ValidationType.NOT_EMPTY | ValidationType.EMAIL
                    }),
                    JML.elm<ValidatedText>( new ValidatedText(), {
                        name: 'password',
                        placeholder: 'Password',
                        type: 'password',
                        validator: ValidationType.NOT_EMPTY | ValidationType.ALPHANUMERIC_PLUS
                    }),
                    JML.div( { id: 'animate-captcha' }),
                    JML.div( { className: 'user-message' }),
                    JML.div( { className: 'double-column' }, [
                        JML.elm<ButtonPrimary>( new ButtonPrimary(), {
                            onclick: ( e ) => {
                                this.onLoginRequested()
                            }
                        }, [
                                JML.span( { className: 'fa-chevron-left fa' }),
                                ' Login '
                            ] )
                    ] ),
                    JML.div( { className: 'double-column' }, [
                        JML.elm<ButtonPrimary>( new ButtonPrimary(), {
                            type: 'submit'
                        }, [
                                'Register '
                            ] )
                    ] ),
                ] )
        );
    }

    /**
     * When the component is mounted we initiate the captcha
     */
    connectedCallback() {
        const captchaElm = this.querySelector( '#animate-captcha' ) as HTMLElement;
        this._captchaId = grecaptcha.render( captchaElm, { theme: 'white', sitekey: '6LcLGSYTAAAAAMr0sDto-BBfQYoLhs21CubsZxWb' });
    }

    /**
     * Called when the component is removed we remove the captcha
     */
    disconnectedCallback() {
        grecaptcha.reset( this._captchaId );
    }

    /**
     * Shows a message to the user
     */
    message( message: string | null, mode: AttentionType = AttentionType.ERROR ) {
        const messageDiv = this.querySelector( '.user-message' ) as HTMLElement;
        empty( messageDiv );
        if ( message ) {
            messageDiv.appendChild(
                JML.elm<Attention>( new Attention(), {
                    text: message,
                    canClose: false,
                    mode: mode
                })
            );
        }
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