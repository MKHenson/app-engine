module Animate {

    export interface IVTextareaProps extends React.HTMLAttributes {
        /**
         * The type of validation to perform on the input. This can be treated as enum flags and use multiple validations. For example
         * validator = ValidationType.NOT_EMPTY | ValidationType.EMAIL
         * */
        validator?: ValidationType;

        value?: string;

        /** The minimum number of characters allowed */
        minCharacters?: number;

        /** The maximum number of characters allowed */
        maxCharacters?: number;

        /** Called whenever the input fails a validation test */
        onValidationError?: (e: Error, target: VTextarea) => void;

        /** Called whenever the input passes a previously failed validation test*/
        onValidationResolved?: (target: VTextarea) => void;

        /**
         * An optional error message to use to describe when a problem occurs. If for example you have validation against
         * not having white space - when the error passed to onValidationError is 'Cannot be empty'. If however errorMsg is
         * provided, then that is used instead (for example 'Please specify a value for X')
         */
        errorMsg?: string;
    }


    /**
     * A verified textarea is an input that can optionally have its value verified. The textarea must be used in conjunction
     * with the VForm.
     */
    export class VTextarea extends React.Component<IVTextareaProps, { error? : boolean, value?: string, highlightError? : boolean, className? : string }> {
        private _pristine: boolean;

        /**
         * Creates a new instance
         */
        constructor(props) {
            super(props);
            this._pristine = true;
            this.state = {
                value : props.value || '',
                error: false,
                highlightError: false,
                className:  ( props.className ? props.className + ' v-textarea' : 'v-textarea' )
            };
        }

        /**
         * Called when the component is about to be mounted.
         */
        componentWillMount(): void {
            var err = this.getValidationErrorMsg( this.props.value );

             // Call the optional error callback
            if ( err && this.props.onValidationError )
               this.props.onValidationError( new Error(err), this );

            this.setState({
                error: (err? true: false)
            });
        }

        /**
         * Sets the highlight error state. This state adds a 'highlight-error' class which
         * can be used to bring attention to the component
         */
        set highlightError( val : boolean ) {
            this.setState({ highlightError : val });
        }

        /**
         * Checks the string against all validators.
         * @returns {string} An error string or null if there are no errors
         */
        getValidationErrorMsg(val : string): string {
            let validators = Utils.validators;
            let validator = null;
            let error : boolean = false;
            let errorMsg: string = null;

            val = ( val !== undefined ? val : this.state.value );

            if (this.props.minCharacters !== undefined && val.length < this.props.minCharacters )
                errorMsg = `You have too few characters`;
            if (this.props.maxCharacters !== undefined && val.length > this.props.maxCharacters )
                errorMsg = `You have too many characters`;

            if ( !error )
                errorMsg = Utils.checkValidation(val, this.props.validator)

            return ( errorMsg && this.props.errorMsg ? this.props.errorMsg : errorMsg );
        }

        /**
         * Called whenever the value changes
         * @param {React.FormEvent} e
         */
        private onChange(e: React.FormEvent) {
            var wasAnError = this.state.error;
            var val = (e.target as HTMLInputElement).value;
            var err = this.getValidationErrorMsg(val);

            // Call the optional error callback
            if ( err && this.props.onValidationError )
               this.props.onValidationError( new Error(err), this );
            else if (wasAnError && !err && this.props.onValidationResolved)
                this.props.onValidationResolved(this);

            this.setState({
                value: val,
                error: (err? true : false),
                highlightError: (err && this.state.highlightError ? true : false)
            });

            if (!err)
                this.props.onChange(e);
        }

        /**
         * Gets if this input has not been touched by the user. False is returned if it has been
         * @returns {boolean}
         */
        get pristine() : boolean {
            return this._pristine;
        }

        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element {
            // Remove the custom properties
            const divProps : IVInputProps  = Object.assign({}, this.props);
            delete divProps.validator;
            delete divProps.minCharacters;
            delete divProps.maxCharacters;
            delete divProps.errorMsg;
            delete divProps.onValidationError;
            delete divProps.onValidationResolved;

            var className = this.state.className;
            if (this.state.error)
                className += ' bad-input';
            if (this.state.highlightError)
                className += ' highlight-error';
            if (!this._pristine)
                className += ' dirty';

            return <textarea
                {...divProps}
                onFocus={(e) => {
                    this._pristine = false;
                }}
                className={className}
                value={this.state.value}
                onChange={(e)=>{ this.onChange(e); }}
            />;
        }
    }
}