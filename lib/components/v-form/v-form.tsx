// import { VInput } from '../v-input/v-input';
// import { VTextarea } from '../v-textarea/v-textarea';
// import { VCheckbox } from '../v-checkbox/v-checkbox';
// import { VSelect, SelectValue } from '../v-select/v-select';
// import { ValidationType } from '../../setup/enums';

// export type ValidationError = { name: string, error: string };
// export type VGeneric = VInput | VTextarea | VCheckbox | VSelect;
// export interface IVFormItem {
//     name: string;
//     before?: JSX.Element;
//     after?: JSX.Element;
// }
// export interface IVFormSelect extends IVFormItem {
//     type: 'select';
//     options?: SelectValue[];
//     value?: string | number;
//     defaultVal?: string | number;
//     allowEmptySelection?: boolean;
// };
// export interface IVFormCheckbox extends IVFormItem {
//     type: 'checkbox';
//     label?: string;
//     placeholder?: string;
//     defaultVal?: boolean;
//     value?: boolean;
// };
// export interface IVFormJsonText extends IVFormItem {
//     type: 'password' | 'text' | 'textarea';
//     placeholder?: string;
//     defaultVal?: string | null;
//     value?: string | null;
//     validators?: ValidationType
// };
// export interface IVFormJson { items: ( IVFormSelect | IVFormCheckbox | IVFormJsonText )[] };
// export interface IFormValue {
//     error: string | null,
//     value: string | boolean | number | null
// }

// export interface IVFormProps {
//     id?: string;
//     className?: string;
//     name?: string;
//     preventDefault?: boolean;
//     descriptor: IVFormJson;

//     /**
//      * A callback for when an input has been changed and the json updated
//      */
//     onChange?: ( json: any, form: VForm ) => void;

//     /**
//      * A callback for when submit is called and there are no validation errors
//      */
//     onSubmitted: ( json: any, form: VForm ) => void;

//     /**
//      * A callback for when a validation error has occurred
//      */
//     onValidationError: ( e: ValidationError[], form: VForm ) => void;

//     /**
//      * A callback for when a previously invalid form is validated
//      */
//     onValidationsResolved: ( form: VForm ) => void;
// }

// export interface IVFormState {
//     error?: boolean;
//     pristine?: boolean;
//     values?: { [ name: string ]: IFormValue }
// }

// /**
//  * A validated form is one which checks its children inputs for validation errors
//  * before allowing the form to be submitted. If there are errors the submit is not allowed.
//  * Only validated inputs are checked by the form (eg VInput). When the form is submitted
//  * via the onSubmitted callback, it sends a json object with the name and values of each of
//  * the validated inputs. The name is taken from the name of the input name attribute and the
//  * value from its value.
//  */
// export class VForm extends React.Component<IVFormProps, IVFormState> {
//     public static defaultProps: IVFormProps = {
//         preventDefault: true,
//         descriptor: { items: [] },
//         onValidationError: function() { throw new Error( 'onSubmitted not implemented' ) },
//         onValidationsResolved: function() { throw new Error( 'onSubmitted not implemented' ) },
//         onSubmitted: function() { throw new Error( 'onSubmitted not implemented' ) }
//     };

//     private _className: string;

//     /**
//      * Creates a new instance
//      */
//     constructor( props: IVFormProps ) {
//         super();
//         this._className = ( props.className ? props.className + ' v-form' : 'v-form' );
//         this.state = {
//             error: false,
//             pristine: true,
//             values: {}
//         }
//     }

//     componentWillMount() {
//         const values = this.state.values!;
//         for ( const descriptor of this.props.descriptor.items ) {
//             switch ( descriptor.type ) {
//                 case 'text':
//                 case 'password':
//                 case 'textarea':
//                     values[ descriptor.name! ] = { value: descriptor.value! || descriptor.defaultVal! || '', error: null }
//                     break;
//                 case 'select':
//                     values[ descriptor.name! ] = { value: descriptor.value! || descriptor.defaultVal! || null, error: null }
//                     break;
//                 case 'checkbox':
//                     values[ descriptor.name! ] = { value: descriptor.value! || descriptor.defaultVal! || false, error: null }
//                     break;
//             }
//         }
//     }

//     /**
//      * Focus on the name element once its mounted
//      */
//     componentDidMount() {
//         let firstInputHasFocus = false;

//         for ( let i in this.refs ) {

//             if ( this.refs[ i ] instanceof VInput || this.refs[ i ] instanceof VTextarea ) {
//                 let component = this.refs[ i ] as HTMLInputElement | HTMLTextAreaElement;
//                 let domNode = ReactDOM.findDOMNode( component ) as HTMLInputElement | HTMLTextAreaElement;

//                 // Focus first element
//                 if ( !firstInputHasFocus ) {
//                     firstInputHasFocus = true;
//                     domNode.focus();
//                     return;
//                 }
//             }
//         }
//     }

//     /**
//      * Called when the form is submitted. VForms automatically cancel the request with preventDefault.
//      * This can be disabled with the preventDefault property.
//      */
//     onSubmit( e: React.FormEvent ) {
//         if ( this.props.preventDefault )
//             e.preventDefault();

//         this.initiateSubmit();
//     }

//     /**
//      * Goes through the validations and calls submit if everything passes
//      */
//     initiateSubmit() {
//         let error = false;
//         let firstInputWithError: VInput | VTextarea | VSelect | undefined;
//         let textInput: VInput | VTextarea;
//         let select: VSelect;
//         const values = this.state.values!;

//         for ( let i in this.refs ) {

//             if ( this.refs[ i ] instanceof VInput || this.refs[ i ] instanceof VTextarea ) {
//                 textInput = this.refs[ i ] as VInput | VTextarea;

//                 if ( textInput.state.error ) {
//                     firstInputWithError = textInput;
//                     textInput.highlightError = true;
//                     error = true;
//                     values[ textInput.props.name! ].error = textInput.state.error;
//                 }
//                 else
//                     textInput.highlightError = false;
//             }
//             else if ( this.refs[ i ] instanceof VSelect ) {
//                 select = this.refs[ i ] as VSelect;

//                 if ( select.state.error ) {
//                     firstInputWithError = select;
//                     select.highlightError = true;
//                     values[ select.props.name! ].error = select.state.error;
//                     error = true;
//                 }
//                 else
//                     select.highlightError = false;
//             }
//         }

//         this.setState( { pristine: false, error: error, values: this.state.values! });

//         if ( firstInputWithError && firstInputWithError.state.error )
//             this.onError();

//         if ( error )
//             return;

//         const json = {};
//         for ( let i in values )
//             json[ i ] = values[ i ].value;

//         this.props.onSubmitted( json, this );
//     }

//     /**
//      * Called whenever any of the inputs fire a change event
//      */
//     onChange() {

//         const json = {};
//         for ( let i in this.state.values! )
//             json[ i ] = this.state.values![ i ].value;

//         if ( this.props.onChange )
//             this.props.onChange( json, this );

//         this.setState( { values: this.state.values! });
//     }

//     /**
//      * Called if any of the validated inputs reported or resolved an error
//      */
//     onError() {
//         let errors: { name: string, error: string }[] = [];
//         const values = this.state.values!;

//         for ( let i in values )
//             if ( values[ i ].error )
//                 errors.push( { name: i, error: values[ i ].error! });

//         // Notify any events
//         if ( this.props.onValidationError && errors.length > 0 )
//             this.props.onValidationError( errors, this );
//         else if ( errors.length === 0 && this.props.onValidationsResolved )
//             this.props.onValidationsResolved( this );

//         this.setState( { error: errors.length > 0 ? true : false, pristine: false });
//         this.onChange();
//     }

//     /**
//      * Gets if this form has not been touched by the user. False is returned if it has been,
//      */
//     get pristine(): boolean {
//         return this.state.pristine!;
//     }

//     /**
//      * Creates the component elements
//      */
//     render(): JSX.Element {
//         // Remove the custom properties
//         let props: IVFormProps = Object.assign( {}, this.props );
//         delete props.onSubmitted;
//         delete props.onValidationError;
//         delete props.onValidationsResolved;
//         delete props.preventDefault;
//         delete props.onChange;
//         delete props.descriptor;

//         let className = this._className;
//         if ( this.state.error )
//             className += ' has-errors';
//         if ( !this.state.pristine )
//             className += ' dirty';
//         else
//             className += ' pristine';

//         const values = this.state.values!;

//         return <form
//             {...props as any}
//             className={className}
//             onSubmit={( e ) => { this.onSubmit( e ); } }
//             >
//             {
//                 this.props.descriptor.items.map(( descriptor, index ) => {

//                     let elm: JSX.Element | undefined;

//                     switch ( descriptor.type ) {
//                         case 'text':
//                         case 'password':
//                             elm = <VInput
//                                 ref={index.toString()}
//                                 name={descriptor.name}
//                                 type={descriptor.type === 'password' ? 'password' : 'text'}
//                                 placeholder={descriptor.placeholder as string}
//                                 validator={descriptor.validators}
//                                 value={values[ descriptor.name! ].value! as string}
//                                 onChange={( e, value ) => {
//                                     values[ descriptor.name! ].value = value!;
//                                     this.onChange();
//                                 }
//                                 }
//                                 onValidationError={( e, input, value ) => {
//                                     values[ descriptor.name! ].value = value!;
//                                     values[ descriptor.name! ].error = e.message;
//                                     this.onError()
//                                 }
//                                 }
//                                 onValidationResolved={( input ) => {
//                                     values[ descriptor.name! ].error = null;
//                                     this.onError()
//                                 }
//                                 }
//                                 />
//                             break;
//                         case 'textarea':
//                             elm = <VTextarea
//                                 ref={index.toString()}
//                                 name={descriptor.name}
//                                 value={values[ descriptor.name! ].value! as string}
//                                 placeholder={descriptor.placeholder as string}
//                                 validator={descriptor.validators}
//                                 onChange={( e, value ) => {
//                                     values[ descriptor.name! ].value = value!;
//                                     this.onChange();
//                                 }
//                                 }
//                                 onValidationError={( e, input, value ) => {
//                                     values[ descriptor.name! ].value = value!;
//                                     values[ descriptor.name! ].error = e.message;
//                                     this.onError()
//                                 }
//                                 }
//                                 onValidationResolved={( input ) => {
//                                     values[ descriptor.name! ].error = null;
//                                     this.onError()
//                                 }
//                                 }
//                                 />
//                             break;
//                         case 'checkbox':
//                             elm = <VCheckbox
//                                 ref={index.toString()}
//                                 name={descriptor.name}
//                                 checked={values[ descriptor.name! ].value! as boolean}
//                                 label={descriptor.label}
//                                 onChange={( e, checked ) => {
//                                     values[ descriptor.name! ].value = checked!;
//                                     this.onChange();
//                                 } }
//                                 />
//                             break;
//                         case 'select':
//                             elm = <VSelect
//                                 ref={index.toString()}
//                                 name={descriptor.name}
//                                 value={values[ descriptor.name! ].value! as string}
//                                 allowEmptySelection={descriptor.allowEmptySelection!}
//                                 options={descriptor.options!}
//                                 onOptionSelected={( option, element ) => {
//                                     values[ descriptor.name! ].value = option ? option.value : null;
//                                     this.onChange();
//                                 } }
//                                 />
//                             break;
//                     }

//                     return <div key={'key' + index.toString()} className="form-item">
//                         {descriptor.before}
//                         {elm}
//                         {descriptor.after}
//                     </div>;

//                 })
//             }
//             {
//                 this.props.children
//             }
//         </form>;
//     }
// }


export class JsonForm extends HTMLFormElement {

    onApproved?: ( json: any ) => void;
    onError?: ( errors: any ) => void;
    private _inputs: { [ name: string ]: HTMLElement };

    constructor() {
        super();
        this._inputs = {};
    }


    traverseChildren( childNodes: NodeList ) {
        for ( let i = 0, l = childNodes.length; i < l; i++ ) {
            const child = childNodes[ i ];
            this.traverseChildren( child.childNodes );
            if ( child instanceof HTMLInputElement )
                this._inputs[ child.name ] = child;
            else if ( child instanceof HTMLTextAreaElement )
                this._inputs[ child.name ] = child;
            else if ( child instanceof HTMLSelectElement )
                this._inputs[ child.name ] = child;

        }
    }

    connectedCallback() {
        this.onsubmit = ( e ) => {
            e.preventDefault();
            this.initiateSubmit();
        }

        this.traverseChildren( this.childNodes );
    }

    initiateSubmit() {
        if ( this.onApproved )
            this.onApproved( {});
    }
}