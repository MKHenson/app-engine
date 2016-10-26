import { VInput } from '../v-input/v-input';
import { VForm } from '../v-form/v-form';
import { VCheckbox } from '../v-checkbox/v-checkbox';
import { Attention } from '../attention/attention';
import { ButtonPrimary } from '../buttons/buttons';
import { ValidationType, AttentionType } from '../../setup/enums';
import { capitalize } from '../../core/utils';

/**
 * An interface for describing the login form properties
 */
export interface ILoginFormProps {
    onLoginRequested: ( token: UsersInterface.ILoginToken ) => void;
    onResetPasswordRequest: ( username: string ) => void;
    onResendActivationRequest: ( username: string ) => void;
    onRegisterRequested: () => void;
    isLoading?: boolean;
    error?: boolean;
    message?: string;
}

/**
 * An interface for describing the login state
 */
export interface ILoginFormState {
    username?: string;
    error?: boolean;
    message?: string;
}

/**
 * A simple login form
 */
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
     * Creates the component elements
     */
    render(): JSX.Element {
        const isLoading = this.props.isLoading!;
        const error = this.props.error ? true : this.state.error;
        const message = this.props.message ? this.props.message : this.state.message;

        return <div className="login animate-all fade-in">
            <VForm name="login"
                onChange={( json ) => { this.setState( { username: json.username }) } }
                onValidationError={( errors ) => {
                    this.setState( {
                        error: true,
                        message: `${capitalize( errors[ 0 ].name )} : ${errors[ 0 ].error}`
                    })
                } }
                onValidationsResolved={() => {
                    this.setState( { message: '', error: false })
                } }
                onSubmitted={( json ) => {
                    this.props.onLoginRequested( {
                        username: json.username,
                        password: json.password,
                        rememberMe: json.remember
                    });
                } }>
                <VInput
                    autoComplete="off"
                    placeholder="Email or Username"
                    autoFocus={true}
                    type="text"
                    name="username"
                    validator={ValidationType.NOT_EMPTY | ValidationType.ALPHA_EMAIL}
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
                    onClick={() => {
                        const user = this.state.username!;
                        if ( user === '' )
                            return this.setState( { error: true, message: 'Please enter a username or email' });
                        this.props.onResetPasswordRequest( user );
                    } }>
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
                    onClick={() => {
                        const user = this.state.username!;
                        if ( user === '' )
                            return this.setState( { error: true, message: 'Please enter a username or email' });
                        this.props.onResendActivationRequest( user );
                    } }>
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