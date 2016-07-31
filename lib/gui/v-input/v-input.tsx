module Animate {
    /**
     * An enum to describe the different types of validation
     * */
    export enum ValidationType {
        /** The value must be a valid email format */
        EMAIL = 1,
        /** The value must be a number */
        NUMBER = 2,
        /** The value must only have alphanumeric characters */
        ALPHANUMERIC = 4,
        /** The value must not be empty */
        NOT_EMPTY = 8,
        /** The value cannot contain html */
        NO_HTML = 16,
        /** The value must only alphanumeric characters as well as '_', '-' and '!' */
        ALPHANUMERIC_PLUS = 32,
        /** The value must be alphanumeric characters as well as '_', '-' and '@' */
        ALPHA_EMAIL = 64
    }


    export interface IVInputProps extends React.HTMLAttributes {
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
        onValidationError?: (e: Error, target: VInput) => void;

        /** Called whenever the input passes a previously failed validation test*/
        onValidationResolved?: (target: VInput) => void;

        /**
         * An optional error message to use to describe when a problem occurs. If for example you have validation against
         * not having white space - when the error passed to onValidationError is 'Cannot be empty'. If however errorMsg is
         * provided, then that is used instead (for example 'Please specify a value for X')
         */
        errorMsg?: string;
    }


    /**
     * A verified input is an input that can optionally have its value verified. The input must be used in conjunction
     * with the VForm.
     */
    export class VInput extends React.Component<IVInputProps, { error? : boolean, value?: string, highlightError? : boolean, className? : string }> {
        private static validators : { [type: number ] : { regex: RegExp, name : string, negate : boolean; message : string; } };
        private _pristine: boolean;

        /**
         * Creates a new instance
         */
        constructor(props) {
            super();
            if (!VInput.validators) {
                VInput.validators = {};
                VInput.validators[ValidationType.ALPHANUMERIC] = { regex: /^[a-z0-9]+$/i, name: "alpha-numeric", negate: false, message: "Only alphanumeric characters accepted" };
                VInput.validators[ValidationType.NOT_EMPTY] = { regex: /\S/, name: "non-empty", negate: false, message: "Cannot be empty" };
                VInput.validators[ValidationType.ALPHANUMERIC_PLUS] = { regex: /^[a-zA-Z0-9_\-!]+$/, name: "alpha-numeric-plus", negate: false, message: "Only alphanumeric, '_', '-' and '!' characters accepted" };
                VInput.validators[ValidationType.EMAIL] = { regex: /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i, name: "email", negate: false, message: "Email format not accepted" };
                VInput.validators[ValidationType.NO_HTML] = { regex: /(<([^>]+)>)/ig, name: "no-html", negate: true, message: "HTML is not allowed" };
                VInput.validators[ValidationType.ALPHA_EMAIL] = { regex: /^[a-zA-Z0-9_\-!@\.]+$/, name: "email-plus", negate: false, message: "Only alphanumeric, '_', '-', '@' and '!' characters accepted" };
            }

            this._pristine = true;
            this.state = {
                value : props.value || '',
                error: false,
                highlightError: false,
                className:  ( props.className ? props.className + ' v-input' : 'v-input' )
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
            let validators = VInput.validators;
            let validator = null;
            let error : boolean = false;
            let errorMsg: string = null;

            val = ( val !== undefined ? val : this.state.value );

            if (this.props.minCharacters !== undefined && val.length < this.props.minCharacters )
                errorMsg = `You have too few characters`;
            if (this.props.maxCharacters !== undefined && val.length > this.props.maxCharacters )
                errorMsg = `You have too many characters`;

            for ( let i in ValidationType ) {
                if ( !isNaN(parseInt(i)) )
                    continue;

                if ( !error && ( this.props.validator & ValidationType[i as string] ) & ValidationType[i as string] ) {
                    validator = validators[ ValidationType[i as string] ];
                    let match = val.match( validator.regex );

                    if ( validator.negate ) {
                        if (match) {
                            errorMsg = validator.message;
                            break;
                        }
                    }

                    if ( !validator.negate ) {
                        if (!match) {
                            errorMsg = validator.message;
                            break;
                        }
                    }
                }
            }

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

            return <input
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