namespace Animate {

    export type SelectValue = { label: string; value: string | number, selected?: boolean; };

    export interface IVSelectProps extends React.HTMLAttributes {

        /**
         * Called whenever an option is selected
         * @param {SelectValue} option
         * @param {HTMLSelectElement} element
         */
        onOptionSelected?: ( option: SelectValue, element: HTMLSelectElement ) => void;

        /**
         * An array of options to use with the select
         */
        options?: SelectValue[];

        /**
         * If true, then an empty option will be added
         */
        createEmptyOption?: boolean;

        /**
         * If true, then validation will pass when nothing is selected
         */
        allowEmptySelection?: boolean;

        /**
         * Called whenever the input fails a validation test
         */
        onValidationError?: ( e: Error, target: VSelect ) => void;

        /**
         * Called whenever the input passes a previously failed validation test
         */
        onValidationResolved?: ( target: VSelect ) => void;

        /**
         * An optional error message to use to describe when a problem occurs. If for example you have validation against
         * not having white space - when the error passed to onValidationError is 'Cannot be empty'. If however errorMsg is
         * provided, then that is used instead (for example 'Please specify a value for X')
         */
        errorMsg?: string;
    }


    /**
     * A verified select box is an one that can optionally have its value verified. The select must be used in conjunction
     * with the VForm.
     */
    export class VSelect extends React.Component<IVSelectProps, { error?: string, selected?: SelectValue, highlightError?: boolean }> {

        private _pristine: boolean;

        /**
         * Creates a new instance
         */
        constructor( props: IVSelectProps ) {
            super( props );
            this._pristine = true;
            this.state = {
                selected: null,
                error: null,
                highlightError: false
            };
        }

        /**
         * Gets the current selected option
         * @returns {SelectValue}
         */
        get value(): SelectValue {
            return this.state.selected;
        }

        /**
         * Called when the component is about to be mounted.
         */
        componentWillMount(): void {
            let selected: SelectValue = null;
            for ( let option of this.props.options )
                if ( option.selected ) {
                    selected = option;
                    break;
                }

            if ( !selected && !this.props.createEmptyOption )
                selected = ( this.props.options.length > 0 ? this.props.options[ 0 ] : null );

            const err = this.validate( selected && selected.value );

            // Call the optional error callback
            if ( err && !this._pristine && this.props.onValidationError )
                this.props.onValidationError( new Error( err ), this );

            this.setState( {
                selected: selected,
                error: ( err ? err : null )
            });
        }

        /**
         * Sets the highlight error state. This state adds a 'highlight-error' class which
         * can be used to bring attention to the component
         */
        set highlightError( val: boolean ) {
            this.setState( { highlightError: val });
        }

        /**
         * Checks the selected option
         * @returns An error string or null if there are no errors
         */
        validate( val: string | number ): string {
            let errorMsg: string = null;

            if ( val !== undefined )
                val = val;
            else if ( this.state.selected )
                val = this.state.selected.value;

            if ( !this.props.allowEmptySelection && ( !val || val === '' ) ) {
                errorMsg = 'Selection is required'
            }

            return ( errorMsg && this.props.errorMsg ? this.props.errorMsg : errorMsg );
        }

        /**
         * Called whenever the value changes
         */
        private onChange( e: React.FormEvent ) {
            const wasAnError = this.state.error;
            const val = ( e.target as HTMLSelectElement ).value;
            const err = this.validate( val );

            let selected: SelectValue = null;
            for ( let option of this.props.options )
                if ( option.value.toString() === val ) {
                    selected = option;
                    break;
                }

            this.setState( {
                selected: selected,
                error: ( err ? err : null ),
                highlightError: ( err && this.state.highlightError ? true : false )
            });

            // Call the optional error callback
            if ( err && this.props.onValidationError )
                this.props.onValidationError( new Error( err ), this );
            else if ( wasAnError && !err && this.props.onValidationResolved )
                this.props.onValidationResolved( this );


            if ( !err && this.props.onChange )
                this.props.onChange( e );
            if ( !err && this.props.onOptionSelected )
                this.props.onOptionSelected( selected, ReactDOM.findDOMNode( this ) as HTMLSelectElement );
        }

        /**
         * Gets if this input has not been touched by the user. False is returned if it has been
         */
        get pristine(): boolean {
            return this._pristine;
        }

        /**
         * Creates the component elements
         */
        render(): JSX.Element {
            // Remove the custom properties
            const props: IVSelectProps = Object.assign( {}, this.props );
            delete props.errorMsg;
            delete props.onValidationError;
            delete props.onValidationResolved;
            delete props.options;
            delete props.onOptionSelected;
            delete props.createEmptyOption;
            delete props.allowEmptySelection;

            let className = ( this.props.className ? this.props.className + ' dropdown v-select' : 'dropdown v-select' )
            if ( this.state.error )
                className += ' bad-input';
            if ( this.state.highlightError )
                className += ' highlight-error';
            if ( !this._pristine )
                className += ' dirty';

            return <select {...props}
                value={this.state.selected ? this.state.selected.value.toString() : ''}
                className={className}
                onFocus={( e ) => { this._pristine = false; } }
                onChange={( e ) => { this.onChange( e ); } }
                >
                {( this.props.createEmptyOption ? <option value=""></option> : null )}
                {
                    this.props.options.map(( option, index ) => {
                        return <option
                            key={'option-' + index}
                            value={option.value.toString()}>
                            {option.label}
                        </option>
                    })
                }
            </select>
        }
    }
}