import { JsonForm } from '../v-form/v-form';
import { ButtonPrimary } from '../buttons/buttons';
import { ValidatedText } from '../validated-text/validated-text';
import { ValidatedSelect } from '../validated-select/validated-select';
import { ValidatedCheckbox } from '../validated-checkbox/validated-checkbox';
import { JML } from '../../jml/jml';

import { ValidationType } from '../../setup/enums';

// import { VForm } from '../v-form/v-form';
// import { Attention } from '../attention/attention';
// import { ButtonPrimary } from '../buttons/buttons';
// import { ValidationType, AttentionType } from '../../setup/enums';
// import { capitalize } from '../../core/utils';

// /**
//  * An interface for describing the login form properties
//  */
// export interface ILoginFormProps {
//     onLoginRequested: ( token: UsersInterface.ILoginToken ) => void;
//     onResetPasswordRequest: ( username: string ) => void;
//     onResendActivationRequest: ( username: string ) => void;
//     onRegisterRequested: () => void;
//     isLoading?: boolean;
//     error?: boolean;
//     message?: string;
// }

// /**
//  * An interface for describing the login state
//  */
// export interface ILoginFormState {
//     username?: string;
//     error?: boolean;
//     message?: string;
// }

// /**
//  * A simple login form
//  */
// export class LoginForm extends React.Component<ILoginFormProps, ILoginFormState> {

//     /**
//      * Creates a new instance
//      */
//     constructor( props: ILoginFormProps ) {
//         super( props );
//         this.state = {
//             error: false,
//             message: '',
//             username: ''
//         };
//     }

//     /**
//      * Creates the component elements
//      */
//     render(): JSX.Element {
//         const isLoading = this.props.isLoading!;
//         const error = this.props.error ? true : this.state.error;
//         const message = this.props.message ? this.props.message : this.state.message;

// return <div className="login animate-all fade-in">
//     <VForm name="login"
//         descriptor={{
//             items: [
//                 { name: 'username', type: 'text', placeholder: 'Email or Username', validators: ValidationType.NOT_EMPTY | ValidationType.ALPHA_EMAIL },
//                 { name: 'password', type: 'password', placeholder: 'Password', validators: ValidationType.NOT_EMPTY | ValidationType.ALPHANUMERIC_PLUS },
//                 { name: 'remember', type: 'checkbox', value: true, label: 'Remember me' }
//             ]
//         }}
//         onChange={( json ) => { this.setState( { username: json.username }) } }
//         onValidationError={( errors ) => {
//             this.setState( {
//                 error: true,
//                 message: `${capitalize( errors[ 0 ].name )} : ${errors[ 0 ].error}`
//             })
//         } }
//         onValidationsResolved={() => {
//             this.setState( { message: '', error: false })
//         } }
//         onSubmitted={( json ) => {
//             this.props.onLoginRequested( {
//                 username: json.username,
//                 password: json.password,
//                 rememberMe: json.remember
//             });
//         } }>

//         <a id="forgot-pass" className={( isLoading ? 'disabled' : undefined )}
//             onClick={() => {
//                 const user = this.state.username!;
//                 if ( user === '' )
//                     return this.setState( { error: true, message: 'Please enter a username or email' });
//                 this.props.onResetPasswordRequest( user );
//             } }>
//             Forgot
//         </a>
//         <br />
//         <a
//             className={( isLoading ? 'disabled' : '' )}
//             onClick={() => {
//                 const user = this.state.username!;
//                 if ( user === '' )
//                     return this.setState( { error: true, message: 'Please enter a username or email' });
//                 this.props.onResendActivationRequest( user );
//             } }>
//             Resend Activation Email
//         </a>
//         <br />
//         <div>
//             {( message !== '' ?
//                 <Attention allowClose={false} mode={error ? AttentionType.ERROR : AttentionType.SUCCESS}>
//                     {message}
//                 </Attention>
//                 : null
//             )}
//         </div>
//         <div className="double-column">
//             <ButtonPrimary type="button" disabled={isLoading} onClick={() => {
//                 if ( this.props.onRegisterRequested )
//                     this.props.onRegisterRequested()
//             } }>
//                 Register <span className="fa fa-user" />
//             </ButtonPrimary>
//         </div>
//         <div className="double-column">
//             <ButtonPrimary type="submit" preventDefault={false} disabled={isLoading}>
//                 Login <span className="fa fa-sign-in" />
//             </ButtonPrimary>
//         </div>
//     </VForm>
// </div>
//     }
// }

/**
 * A simple login form
 */
export class LoginForm extends HTMLElement {

    constructor() {
        super();

        this.className = 'login animate-all fade-in';
        this.appendChild(
            JML.elm<JsonForm>( new JsonForm(), {
                onApproved: ( json ) => { alert( 'Approved!' ) }
            }, [
                    JML.elm<ValidatedText>( new ValidatedText(), {
                        highlight: false,
                        hint: 'hello world',
                        validator: ValidationType.EMAIL | ValidationType.NOT_EMPTY
                    }),
                    JML.elm<ValidatedSelect>( new ValidatedSelect(), {
                        allowEmpty: false,
                        options: [ '', 'option 1', 'option 2' ]
                    }),
                    JML.elm<ValidatedCheckbox>( new ValidatedCheckbox(), {
                        label: 'This is a checkbox',
                        id: 'checkbox-1',
                        name: 'checky'
                    }),
                    JML.a( { id: 'forgot-pass' }, 'Forgot' ),
                    JML.br(),
                    JML.a( {}, 'Resend Activation Email' ),
                    JML.br(),
                    JML.div( {}, 'Message goes here' ),
                    JML.div( { className: 'double-column' }, [
                        JML.elm( new ButtonPrimary(), {}, [
                            'Register ',
                            JML.span( { className: 'fa fa-user' })
                        ] )
                    ] ),
                    JML.div( { className: 'double-column' }, [
                        JML.elm( new ButtonPrimary(), {}, [
                            'Login ',
                            JML.span( { className: 'fa fa-sign-in' })
                        ] )
                    ] ),
                ] )
        );
        // this.innerHTML = `
        //     <x-json-form>
        //         <input />
        //         <a id="forgot-pass">Forgot</a><br />
        //         <a>Resend Activation Email</a><br />
        //         <div>
        //             message goes here
        //         </div>
        //         <div class="double-column">
        //             <x-primary>Register <span className="fa fa-user" /></x-primary>
        //         </div>
        //         <div className="double-column">
        //             <x-primary>Login <span className="fa fa-sign-in" /></x-primary>
        //         </div>
        //     </x-json-form>`;



        // this.innerHTML = `
        //     <VForm name="login"
        //         descriptor={{
        //             items: [
        //                 { name: 'username', type: 'text', placeholder: 'Email or Username', validators: ValidationType.NOT_EMPTY | ValidationType.ALPHA_EMAIL },
        //                 { name: 'password', type: 'password', placeholder: 'Password', validators: ValidationType.NOT_EMPTY | ValidationType.ALPHANUMERIC_PLUS },
        //                 { name: 'remember', type: 'checkbox', value: true, label: 'Remember me' }
        //             ]
        //         }}
        //         onChange={( json ) => { this.setState( { username: json.username }) } }
        //         onValidationError={( errors ) => {
        //             this.setState( {
        //                 error: true,
        //                 message: `${capitalize( errors[ 0 ].name )} : ${errors[ 0 ].error}`
        //             })
        //         } }
        //         onValidationsResolved={() => {
        //             this.setState( { message: '', error: false })
        //         } }
        //         onSubmitted={( json ) => {
        //             this.props.onLoginRequested( {
        //                 username: json.username,
        //                 password: json.password,
        //                 rememberMe: json.remember
        //             });
        //         } }>

        //         <a id="forgot-pass" className={( isLoading ? 'disabled' : undefined )}
        //             onClick={() => {
        //                 const user = this.state.username!;
        //                 if ( user === '' )
        //                     return this.setState( { error: true, message: 'Please enter a username or email' });
        //                 this.props.onResetPasswordRequest( user );
        //             } }>
        //             Forgot
        //         </a>
        //         <br />
        //         <a
        //             className={( isLoading ? 'disabled' : '' )}
        //             onClick={() => {
        //                 const user = this.state.username!;
        //                 if ( user === '' )
        //                     return this.setState( { error: true, message: 'Please enter a username or email' });
        //                 this.props.onResendActivationRequest( user );
        //             } }>
        //             Resend Activation Email
        //         </a>
        //         <br />
        //         <div>
        //             {( message !== '' ?
        //                 <Attention allowClose={false} mode={error ? AttentionType.ERROR : AttentionType.SUCCESS}>
        //                     {message}
        //                 </Attention>
        //                 : null
        //             )}
        //         </div>
        //         <div className="double-column">
        //             <ButtonPrimary type="button" disabled={isLoading} onClick={() => {
        //                 if ( this.props.onRegisterRequested )
        //                     this.props.onRegisterRequested()
        //             } }>
        //                 Register <span className="fa fa-user" />
        //             </ButtonPrimary>
        //         </div>
        //         <div className="double-column">
        //             <ButtonPrimary type="submit" preventDefault={false} disabled={isLoading}>
        //                 Login <span className="fa fa-sign-in" />
        //             </ButtonPrimary>
        //         </div>
        //     </VForm>`;
    }

    connectedCallback() {
        const form = this.children[ 0 ] as JsonForm;

        form.onApproved = () => {
            alert( 'Yay!' );
        }
    }

    // private error( msg: string ) {

    // }
}