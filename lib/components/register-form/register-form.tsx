import { VInput } from '../v-input/v-input';
import { VForm } from '../v-form/v-form';
import { Attention } from '../attention/attention';
import { ButtonPrimary } from '../buttons/buttons';
import { ValidationType, AttentionType } from '../../setup/enums';
import { capitalize } from '../../core/utils';
import { User } from '../../core/user';

export interface IRegisterFormProps {
    onRegisterRequested?: ( token: UsersInterface.IRegisterToken ) => void;
    onLoginRequested?: () => void;
    isLoading?: boolean;
    error?: boolean;
    message?: string;
}

export interface IRegisterFormState {
    message?: string;
    error?: boolean;
}

/**
 * A simple register form
 */
export class RegisterForm extends React.Component<IRegisterFormProps, IRegisterFormState> {
    private _user: User;
    private _captchaId: number;

    /**
     * Creates a new instance
     */
    constructor() {
        super();
        this._user = User.get;
        this.state = {
            message: '',
            error: false
        };
    }

    /**
     * Called when the captcha div has been mounted and is ready
     * to be rendered
     * @param div The div being rendered
     */
    mountCaptcha( div: HTMLDivElement ) {
        if ( div && div.childNodes.length === 0 )
            this._captchaId = grecaptcha.render( div, { theme: 'white', sitekey: '6LcLGSYTAAAAAMr0sDto-BBfQYoLhs21CubsZxWb' });
    }

    /**
     * Called when the component is unmounted
     */
    componentWillUnmount() {
        grecaptcha.reset( this._captchaId );
    }

    /**
     * Creates the component elements
     */
    render(): JSX.Element {
        const isLoading = this.props.isLoading!;
        const error = this.props.error ? true : this.state.error;
        const message = this.props.message ? this.props.message : this.state.message;

        return <div className="register animate-all fade-in">
            <VForm
                name="register"
                onValidationError={( errors ) => {
                    this.setState( {
                        message: `${capitalize( errors[ 0 ].name )} : ${errors[ 0 ].error}`,
                        error: true
                    })
                } }
                onValidationsResolved={() => {
                    this.setState( { message: '' })
                } }
                onSubmitted={( json: UsersInterface.IRegisterToken ) => {
                    json.captcha = grecaptcha.getResponse( this._captchaId );
                    if ( this.props.onRegisterRequested )
                        this.props.onRegisterRequested( json );
                } }>

                <VInput type="text"
                    placeholder="Username"
                    autoComplete="off"
                    name="username"
                    validator={ValidationType.NOT_EMPTY | ValidationType.ALPHANUMERIC_PLUS}
                    />

                <VInput type="text"
                    placeholder="Email"
                    autoComplete="off"
                    name="email"
                    validator={ValidationType.NOT_EMPTY | ValidationType.EMAIL}
                    />

                <VInput type="password"
                    placeholder="Password"
                    autoComplete="off"
                    name="password"
                    validator={ValidationType.NOT_EMPTY | ValidationType.ALPHANUMERIC_PLUS}
                    />
                <div id="animate-captcha" ref={( e ) => { this.mountCaptcha( e ) } }></div>
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
                        if ( this.props.onLoginRequested )
                            this.props.onLoginRequested()
                    } }>
                        <span className="fa-chevron-left fa" /> Login
                        </ButtonPrimary>
                </div>
                <div className="double-column">
                    <ButtonPrimary type="submit" preventDefault={false} disabled={isLoading}>
                        Register
                        </ButtonPrimary>
                </div>
            </VForm>
        </div>
    }
}