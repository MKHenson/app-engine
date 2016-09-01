module Animate {

    export interface IVInputProps extends React.HTMLAttributes {
        /**
         * The type of validation to perform on the input. This can be treated as enum flags and use multiple validations. For example
         * validator = ValidationType.NOT_EMPTY | ValidationType.EMAIL
         */
        validator?: ValidationType;

        value?: string;

        /**
         * If specified, the hint will help users type out a word
         */
        hint? : string;

        /**
         * The minimum number of characters allowed
         */
        minCharacters?: number;

        /**
         * The maximum number of characters allowed
         */
        maxCharacters?: number;

        /**
         * Called whenever the input fails a validation test
         */
        onValidationError?: (e: Error, target: VInput) => void;

        /**
         * Called whenever the input passes a previously failed validation test
         */
        onValidationResolved?: (target: VInput) => void;

        /**
         * An optional error message to use to describe when a problem occurs. If for example you have validation against
         * not having white space - when the error passed to onValidationError is 'Cannot be empty'. If however errorMsg is
         * provided, then that is used instead (for example 'Please specify a value for X')
         */
        errorMsg?: string;

        /**
         * If true, then the input will select everything when clicked
         */
        selectOnClick?: boolean;
    }


    /**
     * A verified input is an input that can optionally have its value verified. The input must be used in conjunction
     * with the VForm.
     */
    export class VInput extends React.Component<IVInputProps, { error? : string, value?: string, highlightError? : boolean }> {
        static defaultProps : IVInputProps = {
            selectOnClick: true
        }
        private _pristine: boolean;
        private _hintStart = -1;
        private _hintEnd = -1;

        /**
         * Creates a new instance
         */
        constructor(props) {
            super(props);
            this._pristine = true;
            this._hintStart = -1;
            this._hintEnd = -1;
            this.state = {
                value : props.value || '',
                error: null,
                highlightError: false
            };
        }

        /**
         * Gets the current value of the input
         * @returns {string}
         */
        get value() : string { return this.state.value; }

        /**
         * Called when the component is about to be mounted.
         */
        componentWillMount(): void {
            var err = this.getValidationErrorMsg( this.props.value );

             // Call the optional error callback
            if ( err && !this._pristine && this.props.onValidationError )
               this.props.onValidationError( new Error(err), this );

            this.setState({
                error: (err? err: null)
            });
        }

        /**
         * Called when the props are updated
         */
        componentWillReceiveProps(nextProps: IVCheckboxProps) {
            if (nextProps.value as string !== this.props.value)
                this.setState({  value: nextProps.value as string });
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
            let errorMsg: string = null;

            val = ( val !== undefined ? val : this.state.value );

            if (this.props.minCharacters !== undefined && val.length < this.props.minCharacters )
                errorMsg = `You have too few characters`;
            if (this.props.maxCharacters !== undefined && val.length > this.props.maxCharacters )
                errorMsg = `You have too many characters`;

            if ( !errorMsg )
                errorMsg = Utils.checkValidation(val, this.props.validator)

            return ( errorMsg && this.props.errorMsg ? this.props.errorMsg : errorMsg );
        }

        componentDidUpdate(nextProps) {
            if (this._hintStart != -1)
                ( ReactDOM.findDOMNode(this) as HTMLInputElement).setSelectionRange( this._hintStart, this._hintEnd );
        }

        /**
         * Only called when we have hints enabled
         */
        onKeyUp(e : React.KeyboardEvent) {

            // Backspace, or arrow keys, do nothing
            if (e.keyCode == 8 || e.keyCode == 40 || e.keyCode == 39 || e.keyCode == 38 || e.keyCode == 37 ) {
                if (this.props.onKeyUp)
                    this.props.onKeyUp(e);
                return;
            }

            let val = (e.target as HTMLInputElement).value;

            if ( this.props.hint ) {
                let isMatching = true;
                let index = this.props.hint.toLowerCase().indexOf(val.toLowerCase());

                if ( index == 0 ) {
                    let valLen = val.length;
                    val = this.props.hint;
                    this._hintStart = index + valLen;
                    this._hintEnd = this.props.hint.length;
                }
                else {
                    this._hintStart = -1;
                    this._hintEnd = -1;
                }

                this.setState({
                    value: val
                });
            }

            if (this.props.onKeyUp)
                this.props.onKeyUp(e);
        }

        /**
         * Called whenever the value changes
         * @param {React.FormEvent} e
         */
        private onChange(e: React.FormEvent) {
            let wasAnError = this.state.error;
            let val = (e.target as HTMLInputElement).value;
            let err = this.getValidationErrorMsg(val);

            // Call the optional error callback
            if ( err && this.props.onValidationError )
               this.props.onValidationError( new Error(err), this );
            else if (wasAnError && !err && this.props.onValidationResolved)
                this.props.onValidationResolved(this);

            this.setState({
                value: val,
                error: (err? err : null),
                highlightError: (err && this.state.highlightError ? true : false)
            });

            if (!err && this.props.onChange)
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
            delete divProps.selectOnClick;
            delete divProps.hint;

            var className = ( this.props.className ? this.props.className + ' v-input' : 'v-input' )
            if (this.state.error)
                className += ' bad-input';
            if (this.state.highlightError)
                className += ' highlight-error';
            if (!this._pristine)
                className += ' dirty';

            return <input
                {...divProps}
                onKeyUp={ (e) => {this.onKeyUp(e)} }
                onFocus={(e) => {
                    this._pristine = false;
                    if (this.props.selectOnClick)
                        (e.target as HTMLInputElement).setSelectionRange(0, (e.target as HTMLInputElement).value.length);
                }}
                className={className}
                value={this.state.value}
                onChange={(e)=>{ this.onChange(e); }}
            />;
        }
    }
}