import { ValidationError } from '../../core/utils';
import { ValidatedText } from '../validated-text/validated-text';
import { ValidatedSelect } from '../validated-select/validated-select';
import { Checkbox } from '../checkbox/checkbox';

export type JsonFormInput = HTMLInputElement | ValidatedText | ValidatedSelect | HTMLTextAreaElement | HTMLSelectElement | Checkbox;

/**
 * A smart Form that formats a JSON representation of its inputs as well as checks
 * for any validation errors. The validation checks are only performed on the custom
 * elements ValidatedText and ValidatedSelect. The JSON format is created as a map
 * whose keys are the names of the inputs, and the values are their corresponding value.
 *
 * eg:
 * const form = new JsonForm();
 * ...
 * (add input elements)
 * ...
 * form.onSubmit = (sender, json) => alert('The form was submitted with the JSON: ' + JSON.stringify(json) )
 * form.onChange = (sender, json) => alert('The form json was changed: ' + JSON.stringify(json) )
 * form.onError = (sender, errors) => alert('The form has some validation errors')
 * form.onResolved = (sender) => alert('The form validation errors have been resolved')
 * const json = form.json; // Gets the JSON without the use of events
 */
export class JsonForm extends HTMLFormElement {

    /**
     * Called whenever the form is submitted
     */
    public onSubmit?: ( sender: JsonForm, json: { [ name: string ]: string | boolean }) => void;

    /**
     * Called whenever a validated input flags a problem
     */
    public onError?: ( sender: JsonForm, errors: { [ name: string ]: ValidationError }) => void;

    /**
     * Called whenever a validated input's problem is resolved
     */
    public onResolved?: ( sender: JsonForm ) => void;

    /**
     * Called whenever the JSON represenation has changed
     */
    public onChange?: ( sender: JsonForm, json: { [ name: string ]: string | boolean }) => void;

    private _inputs: { [ name: string ]: JsonFormInput };
    private _errors: { [ name: string ]: ValidationError };
    private _pristine: boolean;

    constructor() {
        super();
        this._inputs = {};
        this._errors = {};
        this.pristine = true;
    }

    /**
     * Called if any of the validated inputs reported or resolved an error
     */
    private onValidationChanged( sender: ValidatedText | ValidatedSelect, error: ValidationError | null ) {

        if ( !sender.pristine )
            this.pristine = false;

        const errors = this._errors;
        if ( error )
            errors[ sender.name ] = error;
        else
            delete errors[ sender.name ];

        const hasErrors = this.hasErrors;
        if ( hasErrors && this.onError )
            this.onError( this, errors );
        else if ( !hasErrors && this.onResolved )
            this.onResolved( this );
    }

    /**
     * Called whenever any of the inputs fire a change event
     */
    private onInputChange() {
        const json = this.json;
        this.pristine = false;

        if ( this.onChange )
            this.onChange( this, json );
    }

    /**
     * Traverse all child elements and find the input elements.
     * The inputs are then mapped to an object and used for checking
     * validation errors and later, getting the values of the input for submission
     */
    traverseChildren( childNodes: NodeList ) {
        for ( let i = 0, l = childNodes.length; i < l; i++ ) {
            const child = childNodes[ i ];

            if ( child instanceof Checkbox ) {
                if ( !child.name || child.name === '' )
                    console.warn( 'Checkbox requires name for use in JsonForm' );

                this._inputs[ child.name ] = child;
                child.onChange = ( e ) => this.onInputChange();
            }
            else if ( child instanceof ValidatedText ) {
                if ( !child.name || child.name === '' )
                    console.warn( 'ValidatedText requires name for use in JsonForm' );

                this._inputs[ child.name ] = child;
                child.onValidationError = ( sender, e ) => this.onValidationChanged( sender, e );
                child.onValidationResolved = ( sender ) => this.onValidationChanged( sender, null );
                child.onChange = ( e ) => this.onInputChange();
            }
            else if ( child instanceof ValidatedSelect ) {
                if ( !child.name || child.name === '' )
                    console.warn( 'ValidatedSelect requires name for use in JsonForm' );

                this._inputs[ child.name ] = child;
                child.onValidationError = ( sender, e ) => this.onValidationChanged( sender, e );
                child.onValidationResolved = ( sender ) => this.onValidationChanged( sender, null );
                child.onChange = ( e ) => this.onInputChange();
            }
            else if ( child instanceof HTMLInputElement ) {
                if ( !child.name || child.name === '' )
                    console.warn( 'Input requires name for use in JsonForm' );

                this._inputs[ child.name ] = child;
                child.onchange = ( e ) => this.onInputChange();
            }
            else if ( child instanceof HTMLTextAreaElement ) {
                if ( !child.name || child.name === '' )
                    console.warn( 'Textarea requires name for use in JsonForm' );

                this._inputs[ child.name ] = child;
                child.onchange = ( e ) => this.onInputChange();
            }
            else if ( child instanceof HTMLSelectElement ) {
                if ( !child.name || child.name === '' )
                    console.warn( 'Select requires name for use in JsonForm' );

                this._inputs[ child.name ] = child;
                child.onchange = ( e ) => this.onInputChange();
            }
            else
                this.traverseChildren( child.childNodes );
        }
    }

    /**
     * Gets if the form is in a pristine state
     */
    get pristine(): boolean {
        return this._pristine;
    }

    /**
     * Sets if the form is in a pristine state
     */
    set pristine( val: boolean ) {
        this._pristine = val;
        this.classList.toggle( 'pristine', val );
    }

    /**
     * Called whenever the form is added to the dom
     */
    connectedCallback() {
        this.onsubmit = ( e ) => {
            e.preventDefault();
            this.initiateSubmit();
        }

        this.traverseChildren( this.childNodes );
    }

    /**
     * Checks if the form inputs have errors or not
     */
    get hasErrors(): boolean {
        return Object.keys( this._errors ).length === 0 ? false : true;
    }

    /**
     * Gets the generated json for this form
     */
    get json(): { [ name: string ]: string | boolean } {
        const inputs = this._inputs;
        const json: { [ name: string ]: string | boolean } = {};
        for ( let i in inputs ) {
            json[ i ] = inputs[ i ].value;
        }
        return json;
    }

    /**
     * When you click submit on the form it should flag any errors
     * and/or prevent submit if they exist
     */
    initiateSubmit() {
        const inputs = this._inputs;
        const errors = this._errors;

        // Highlight any errors
        for ( let i in inputs ) {
            const input = inputs[ i ];
            if ( input instanceof ValidatedText || input instanceof ValidatedSelect )
                input.highlight = ( errors[ i ] ? true : false );
        }

        const hasErrors = this.hasErrors;
        if ( !hasErrors && this.onSubmit )
            this.onSubmit( this, this.json );
    }
}