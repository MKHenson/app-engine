module Animate {

    export type ValidationError = {name:string, error: string};

    export type VGeneric = VInput | VTextarea | VCheckbox | VSelect;

    export interface IVFormProps extends React.HTMLAttributes {
        /**
         * If true, prevents the form being automatically submitted
         */
        preventDefault?: boolean;

        /**
         * A callback for when submit is called and there are no validation errors
         */
        onSubmitted: (json: any, form : VForm ) => void;

        /**
         * A callback for when a validation error has occurred
         */
        onValidationError: (e : ValidationError[], form: VForm) => void;

        /**
         * A callback for when a previously invalid form is validated
         */
        onValidationsResolved: (form: VForm) => void;
    }

    /**
     * A validated form is one which checks its children inputs for validation errors
     * before allowing the form to be submitted. If there are errors the submit is not allowed.
     * Only validated inputs are checked by the form (eg VInput). When the form is submitted
     * via the onSubmitted callback, it sends a json object with the name and values of each of
     * the validated inputs. The name is taken from the name of the input name attribute and the
     * value from its value.
     */
    export class VForm extends React.Component<IVFormProps, { error? : boolean, pristine?: boolean }> {
        public static defaultProps : IVFormProps = {
            preventDefault: true,
            onValidationError: null,
            onValidationsResolved: null,
            onSubmitted: null
        };

        private _proxyInputProblem: any;
        private _className: string;

        private _values: {
            [name:string]: {
                error: string,
                value : string | boolean | number
            }
        };

        /**
         * Creates a new instance
         */
        constructor(props: IVFormProps) {
            super();
            this._values = {};
            this._className = ( props.className ? props.className + ' v-form' : 'v-form' );
            this.state = {
                error : false,
                pristine: true
            }
        }

        /**
         * Focus on the name element once its mounted
         */
        componentDidMount() {
            let firstInputHasFocus = false;

            for (let i in this.refs) {
                if ( this.refs[i] instanceof VInput || this.refs[i] instanceof VTextarea ) {
                    let component = this.refs[i] as HTMLInputElement | HTMLTextAreaElement;
                    let domNode = ReactDOM.findDOMNode(component) as HTMLInputElement | HTMLTextAreaElement;

                    // Focus first element
                    if (!firstInputHasFocus) {
                        firstInputHasFocus = true;
                        domNode.focus();
                    }

                    // Set the initial values for inputs and text areas
                    this._values[domNode.name] = { value: component.value, error : null };
                }
                else if ( this.refs[i] instanceof VCheckbox ) {

                    let component = this.refs[i] as VCheckbox;
                    let domNode = ReactDOM.findDOMNode(this.refs[i]) as HTMLInputElement;

                    // Set the initial values of checkbox
                    this._values[component.props.name] = { value: component.checked, error : null };
                }
                else if ( this.refs[i] instanceof VSelect ) {

                    let component = this.refs[i] as VSelect;
                    let domNode = ReactDOM.findDOMNode(this.refs[i]) as HTMLSelectElement;

                    // Set the initial values of checkbox
                    this._values[component.props.name] = { value: (component.value ? component.value.value : null), error : null };
                }
            }
        }

        /**
         * Called when the form is submitted. VForms automatically cancel the request with preventDefault.
         * This can be disabled with the preventDefault property.
         * @param {React.FormEvent} e
         */
        onSubmit(e: React.FormEvent) {
            if (this.props.preventDefault)
                e.preventDefault();

            this.initiateSubmit();
        }

        /**
         * Goes through the validations and calls submit if everything passes
         */
        initiateSubmit() {
            let error = false;
            let firstInputWithError: VInput | VTextarea | VSelect;
            let textInput : VInput | VTextarea;
            let select: VSelect;

            for (let i in this.refs) {

                if ( this.refs[i] instanceof VInput || this.refs[i] instanceof VTextarea ) {
                    textInput = this.refs[i] as VInput | VTextarea;

                    if ( textInput.state.error ) {
                        firstInputWithError = textInput;
                        textInput.highlightError = true;
                        error = true;
                    }
                    else
                        textInput.highlightError = false;
                }
                else if ( this.refs[i] instanceof VSelect ) {
                    select = this.refs[i] as VSelect;

                    if ( select.state.error ) {
                        firstInputWithError = select;
                        select.highlightError = true;
                        error = true;
                    }
                    else
                        select.highlightError = false;
                }
            }

            this.setState({pristine : false, error : error });

            if (firstInputWithError)
                this.onError(new Error(firstInputWithError.state.error), firstInputWithError);

            if (error)
                return;

            let json = {};
            for ( let i in  this._values )
                json[i] = this._values[i].value;

            this.props.onSubmitted( json, this );
        }

        /**
         * Called whenever any of the inputs fire a change event
         * @param {React.FormEvent} e
         */
        onChange(e : React.FormEvent) {
            let input = (e.target as HTMLInputElement);
            this._values[input.name] = { value: input.value, error : null };
        }

        /**
         * Called if any of the validated inputs reported or resolved an error
         * @param {Error} e The error that occurred
         * @param {VGeneric} target The input that triggered the error
         */
        onError(e : Error, target : VGeneric ) {
            let pristine = this.state.pristine;
            if (!target.pristine)
                pristine = false;

            let wasError = this.state
            let errors: { name:string, error: string }[] = [];

            // Check if there was previously an error
            for (let i in this._values )
                if (this._values[i].error) {
                    wasError = true;
                    break;
                }

            // Check there are any subsequent errors
            if ( target instanceof VInput || target instanceof VTextarea )
                this._values[target.props.name] = { value: target.state.value, error : ( e ? e.message : null ) };
            else if (target instanceof VCheckbox)
                this._values[target.props.name] = { value: target.state.checked, error : ( e ? e.message : null ) };
            else if (target instanceof VSelect)
                this._values[target.props.name] = { value: ( target.state.selected ? target.state.selected.value : null ), error : ( e ? e.message : null ) };

            for (let i in this._values )
                if (this._values[i].error)
                    errors.push({ name : i, error: this._values[i].error });

            // Notify any events
            if ( this.props.onValidationError && errors.length > 0 )
                this.props.onValidationError( errors, this);
            else if ( wasError && errors.length == 0 && this.props.onValidationsResolved )
                this.props.onValidationsResolved(this);

            this.setState({ error: errors.length > 0 ? true : false, pristine : pristine });
        }

        /**
         * Gets if this form has not been touched by the user. False is returned if it has been,
         * @returns {boolean}
         */
        get pristine() : boolean {
            return this.state.pristine;
        }

        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element {
            // Remove the custom properties
            let props : IVFormProps  = Object.assign({}, this.props);
            delete props.onSubmitted;
            delete props.onValidationError;
            delete props.onValidationsResolved;
            delete props.preventDefault;

            let className = this._className;
            if (this.state.error)
                className += ' has-errors';
            if (!this.state.pristine)
                className += ' dirty';
            else
                className += ' pristine';

            return <form
                {...props}
                className={className}
                onSubmit={(e)=>{ this.onSubmit(e); }}> {
                    React.Children.map( this.props.children, ( i : React.ReactElement<any>, index ) => {
                        if (!i)
                            return null;

                        if ( i.type == VInput )
                            return React.cloneElement( i, {
                                ref: index.toString(),
                                onChange : (e)=>{ this.onChange( e ); },
                                onValidationError : (e, input) => { this.onError( e, input ) },
                                onValidationResolved : (input) => { this.onError( null, input ) }
                            } as Animate.IVInputProps )
                        else if ( i.type == VTextarea )
                            return React.cloneElement( i, {
                                ref: index.toString(),
                                onChange : (e)=>{ this.onChange( e ); },
                                onValidationError : (e, input) => { this.onError( e, input ) },
                                onValidationResolved : (input) => { this.onError( null, input ) }
                            } as Animate.IVInputProps )
                        else if ( i.type == VCheckbox ) {
                            return React.cloneElement( i, {
                                ref: index.toString(),
                                onChecked : (e, checked, input)=>{
                                    this._values[input.name] = { value: checked, error : null };
                                }
                            } as IVCheckboxProps )
                        }
                        else if ( i.type == VSelect ) {
                            return React.cloneElement( i, {
                                ref: index.toString(),
                                onOptionSelected : (option, element)=>{
                                    this._values[element.name] = { value: (option ? option.value : null), error : null };
                                }
                            } as IVSelectProps )
                        }
                        else
                            return i;
                    })
                }
                </form>;
        }
    }
}
