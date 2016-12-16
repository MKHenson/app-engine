import { JML, empty } from '../../jml/jml';
import { ValidationType, ValidationErrorType } from '../../setup/enums';
import { checkValidation, ValidationError } from '../../core/utils';

/**
 * A wrapper for an input or text area that adds functionality for validating the user input.
 * Validations are set as min and max character limits and validator enums. You can hook into events
 * such as onValidationError, onValidationResolved and onChange to extract data. You can
 * aslo call value.
 *
 * e.g:
 * const input = new ValidatedText();
 * input.value = 'hello world';
 * input.min = 5;
 * input.validator = ValidationType.EMAIL | ValidationType.NOT_EMPTY;
 */
export class ValidatedText extends HTMLElement {
    private _selectOnClick: boolean;
    private _inputType: 'text' | 'password' | 'textarea';

    public validator: ValidationType;
    public min: number;
    public max: number;
    public hint: string;
    public onChange?: ( sender: ValidatedText ) => void;
    public onValidationError?: ( sender: ValidatedText, error: ValidationError ) => void;
    public onValidationResolved?: ( sender: ValidatedText ) => void;

    static get observedAttributes() {
        return [
            'placeholder',
            'type',
            'select-on-click',
            'min',
            'max',
            'highlight',
            'read-only',
            'name',
            'hint',
            'validator'
        ];
    }

    /**
     * Creates an instance
     */
    constructor() {
        super();
        this._selectOnClick = true;
        this.min = -1;
        this.max = -1;
        this.className = 'validated-text';
        this.hint = '';
        this._inputType = 'text';
        this.type = 'text';
    }

    /**
     * If the attributes change we update the internal state
     */
    attributeChangedCallback( name: string, oldValue: string, newValue: string ) {
        switch ( name ) {
            case 'placeholder':
            case 'type':
            case 'name':
            case 'hint':
                this[ name ] = newValue;
                break;
            case 'validator':
            case 'min':
            case 'max':
                this[ name ] = parseInt( newValue );
                break;
            case 'select-on-click':
                this.selectOnClick = newValue === 'true' ? true : false;
                break;
            case 'read-only':
                this.readOnly = newValue === 'true' ? true : false;
                break;
            default:
                this[ name ] = newValue === 'true' ? true : false;
                break;
        }
    }

    /**
     * Only applicable if hints are active. Sets the input value to that of the hint
     * if it matches it.
     */
    private onKeyUp( e: KeyboardEvent ) {
        if ( this.hint === '' )
            return;

        const keycode = e.keyCode;
        const keyAccepted =
            ( keycode > 47 && keycode < 58 ) || // number keys
            keycode === 32 || keycode === 13 || // spacebar & return key(s) (if you want to allow carriage returns)
            ( keycode > 64 && keycode < 91 ) || // letter keys
            ( keycode > 95 && keycode < 112 ) || // numpad keys
            ( keycode > 185 && keycode < 193 ) || // ;=,-./` (in order)
            ( keycode > 218 && keycode < 223 );   // [\]' (in order)

        if ( keyAccepted ) {
            const input = e.target as HTMLInputElement;
            let val = input.value;
            let index = this.hint.toLowerCase().indexOf( val.toLowerCase() );

            if ( val === this.hint )
                return;

            if ( index === 0 ) {
                let valLen = val.length;
                val = this.hint;
                const hintStart = index + valLen;
                const hintEnd = this.hint.length;
                input.value = val;
                input.setSelectionRange( hintStart, hintEnd );

                // Trigger a change event
                const event = document.createEvent( 'CustomEvent' );
                event.initCustomEvent( 'change', false, false, {});
                input.dispatchEvent( event );
            }
        }
    }

    /**
     * Called whenever the value changes by user input. The input checks
     * the validation rules and triggers any events accordingly
     */
    private onInputChange( e: Event ) {
        let wasAnError = this.invalid;
        let val = ( e.target as HTMLInputElement | HTMLTextAreaElement ).value;
        let err = this.getValidationErrorMsg( val );

        // Call the optional error callback
        if ( err && this.onValidationError )
            this.onValidationError( this, err );
        else if ( wasAnError && !err && this.onValidationResolved )
            this.onValidationResolved( this );

        this.invalid = err ? true : false;
        if ( !err && this.onChange )
            this.onChange( this );
    }

    /**
     * Checks the value against all validators.
     * @returns A ValidationError if validators don't pass
     */
    private getValidationErrorMsg( val: string ): ValidationError | null {
        let errorMsg: string | null = null;

        if ( this.min !== -1 && val.length < this.min )
            return new ValidationError( `You have too few characters`, ValidationErrorType.MIN_CHARACTERS );
        if ( this.max !== -1 && val.length > this.max )
            return new ValidationError( `You have too many characters`, ValidationErrorType.MAX_CHARACTERS );

        if ( !errorMsg ) {
            const validator = checkValidation( val, this.validator );
            if ( validator )
                return new ValidationError( validator.message, ValidationErrorType[ ValidationType[ validator.type ] ] );
        }

        return errorMsg;
    }

    /**
     * Sets the input type. Can be either 'text', 'password' or 'textarea'
     */
    set type( val: 'text' | 'password' | 'textarea' ) {
        empty( this );

        // Add the input
        if ( val === 'text' || val === 'password' ) {
            this.appendChild(
                JML.input( {
                    type: val,
                    onfocus: ( e: FocusEvent ) => {
                        this.classList.toggle( 'focussed', true );
                        this.classList.toggle( 'dirty', true );
                        if ( this._selectOnClick )
                            ( e.target as HTMLInputElement ).setSelectionRange( 0, ( e.target as HTMLInputElement ).value.length );
                    },
                    onblur: () => {
                        this.classList.toggle( 'focussed', false )
                    },
                    onchange: ( e ) => this.onInputChange( e ),
                    onkeyup: ( e ) => this.onKeyUp( e )
                })
            );
        }
        else {
            this.appendChild(
                JML.textarea( {
                    onfocus: ( e: FocusEvent ) => {
                        this.classList.toggle( 'focussed', true );
                        this.classList.toggle( 'dirty', true );
                        if ( this._selectOnClick )
                            ( e.target as HTMLTextAreaElement ).setSelectionRange( 0, ( e.target as HTMLTextAreaElement ).value.length );
                    },
                    onblur: () => {
                        this.classList.toggle( 'focussed', false )
                    },
                    onchange: ( e ) => this.onInputChange( e )
                })
            );
        }

        // Add a underline highlight
        this.appendChild( JML.div( {
            className: 'input-highlighter'
        }) );
    }

    /**
     * Gets the input type
     */
    get type(): 'text' | 'password' | 'textarea' {
        return this._inputType;
    }

    /**
     * Sets the input name
     */
    set name( val: string ) {
        ( this.children[ 0 ] as HTMLInputElement | HTMLTextAreaElement ).name = val;
    }

    /**
     * Gets the input name
     */
    get name(): string {
        return ( this.children[ 0 ] as HTMLInputElement | HTMLTextAreaElement ).name;
    }

    /**
     * Sets the input placeholder text
     */
    set placeholder( val: string ) {
        ( this.children[ 0 ] as HTMLInputElement | HTMLTextAreaElement ).placeholder = val;
    }

    /**
     * Gets the input placeholder text
     */
    get placeholder(): string {
        return ( this.children[ 0 ] as HTMLInputElement | HTMLTextAreaElement ).placeholder;
    }

    /**
     * Sets if the input selects all the text when its focussed
     */
    set selectOnClick( val: boolean ) {
        this._selectOnClick = val;
    }

    /**
     * Gets if the input selects all the text when its focussed
     */
    get selectOnClick(): boolean {
        return this._selectOnClick;
    }

    /**
     * Sets if the input is read only
     */
    set readOnly( val: boolean ) {
        ( this.children[ 0 ] as HTMLInputElement | HTMLTextAreaElement ).readOnly = val;
    }

    /**
     * Gets if the input is read only
     */
    get readOnly(): boolean {
        return ( this.children[ 0 ] as HTMLInputElement | HTMLTextAreaElement ).readOnly;
    }

    /**
     * Sets if the input is in a pristine state
     */
    set pristine( val: boolean ) {
        this.classList.toggle( 'dirty', !val );
    }

    /**
     * Gets if the input is in a pristine state
     */
    get pristine(): boolean {
        return this.classList.contains( 'dirty' );
    }

    /**
     * Sets if the input is highlighted or not
     */
    set highlight( val: boolean ) {
        this.classList.toggle( 'highlight-error', val );
    }

    /**
     * Gets if the input is highlighted or not
     */
    get highlight(): boolean {
        return this.classList.contains( 'highlight-error' );
    }

    /**
     * Sets if the input is invalid in its current form
     */
    set invalid( val: boolean ) {
        this.classList.toggle( 'invalid', val );
    }

    /**
     * Gets if the input is invalid in its current form
     */
    get invalid(): boolean {
        return this.classList.contains( 'invalid' );
    }
}