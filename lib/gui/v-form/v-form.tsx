module Animate
{
    export interface IVFormProps extends React.HTMLAttributes
    {
        /** If true, prevents the form being automatically submitted */
        preventDefault?: boolean;
        /** A callback for when submit is called and there are no validation errors */
        onSubmitted?: (e: React.FormEvent, json: any, form : VForm ) => void;
        /** A callback for when a validation error has occurred */
        onValidationError?: (e : { name:string, error: string }[], form: VForm) => void;
        /** A callback for when a previously invalid form is validated */
        onValidationsResolved?: (form: VForm) => void;
    }

    /**
     * A validated form is one which checks its children inputs for validation errors
     * before allowing the form to be submitted. If there are errors the submit is not allowed.
     * Only validated inputs are checked by the form (eg VInput). When the form is submitted
     * via the onSubmitted callback, it sends a json object with the name and values of each of
     * the validated inputs. The name is taken from the name of the input name attribute and the
     * value from its value.
     */
    export class VForm extends React.Component<IVFormProps, { error? : boolean, pristine?: boolean }>
    {
        public static defaultProps : IVFormProps = {
            preventDefault: true
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
        constructor(props: IVFormProps)
        {
            super();
            this._values = {};
            this._className = ( props.className ? props.className + ' v-form' : 'v-form' );
            this.state = {
                error : false,
                pristine: true
            }
        }

        /**
         * Called when the form is submitted. VForms automatically cancel the request with preventDefault.
         * This can be disabled with the preventDefault property.
         * @param {React.FormEvent} e
         */
        onSubmit(e: React.FormEvent)
        {
            if (this.props.preventDefault)
                e.preventDefault();

            let error = false;
            for (let i in this.refs)
                if ((this.refs[i] as VInput).state.error)
                {
                    (this.refs[i] as VInput).highlightError = true;
                    error = true;
                }
                else
                    (this.refs[i] as VInput).highlightError = false;

            this.setState({pristine : false, error : error });

            if (error)
                return;

            let json = {};
            for ( let i in  this._values )
                json[i] = this._values[i].value;

            this.props.onSubmitted( e, json, this );
        }

        /**
         * Called whenever any of the inputs fire a change event
         * @param {React.FormEvent} e
         */
        onChange(e : React.FormEvent)
        {
            let input = (e.target as HTMLInputElement);
            this._values[input.name] = { value: input.value, error : null };
        }

        /**
         * Called if any of the validated inputs reported or resolved an error
         * @param {Error} e The error that occurred
         * @param {VInput} target The input that triggered the error
         */
        onError(e : Error, target : VInput )
        {
            let pristine = this.state.pristine;
            if (!target.pristine)
                pristine = false;

            let wasError = this.state
            let errors: { name:string, error: string }[] = [];

            // Check if there was previously an error
            for (let i in this._values )
                if (this._values[i].error)
                {
                    wasError = true;
                    break;
                }

            // Check there are any subsequent errors
            this._values[target.props.name] = { value: target.state.value, error : ( e ? e.message : null ) };
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
        get pristine() : boolean
        {
            return this.state.pristine;
        }

        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element
        {
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
                onSubmit={(e)=>{ this.onSubmit(e); }}>
                {
                    React.Children.map( this.props.children, ( i : React.ReactElement<any>, index ) => {
                        if ( i.type == VInput )
                            return React.cloneElement( i, {
                                ref: index.toString(),
                                onChange : (e)=>{ this.onChange( e ); },
                                onValidationError : (e, input) => { this.onError( e, input ) },
                                onValidationResolved : (input) => { this.onError( null, input ) }
                            } as Animate.IVInputProps )
                        else if ( i.type == VCheckbox )
                        {
                            return React.cloneElement( i, {
                                ref: index.toString(),
                                onChange : (e)=>{ this.onChange( e ); }
                            } as React.HTMLAttributes )
                        }
                        else
                            return i;
                    })
                }
                </form>;
        }
    }
}
