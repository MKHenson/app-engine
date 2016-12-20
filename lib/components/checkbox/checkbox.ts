import { JML } from '../../jml/jml';

export class Checkbox extends HTMLElement {

    public onChange?: ( sender: Checkbox ) => void;

    static get observedAttributes() {
        return [
            'label',
            'checked',
            'name',
            'read-only'
        ];
    }

    /**
     * Creates an instance
     */
    constructor() {
        super();
        this.appendChild( JML.input( {
            type: 'checkbox',
            onchange: ( e ) => this.onInputChange( e ),
            onclick: ( e: MouseEvent ) => {
                if ( this.readOnly )
                    return e.preventDefault();
            }
        }) );
        this.appendChild( JML.label( {
            onclick: ( e: MouseEvent ) => {
                if ( this.readOnly )
                    return e.preventDefault();
            }
        }) );
    }

    /**
     * If the attributes change we update the internal state
     */
    attributeChangedCallback( name: string, oldValue: string, newValue: string ) {
        switch ( name ) {
            case 'checked':
                this.checked = newValue === 'true' ? true : false;
                break;
            case 'name':
            case 'label':
                this[ name ] = newValue;
                break;
            case 'read-only':
                this.readOnly = newValue === 'true' ? true : false;
                break;
        }
    }

    /**
     * Called whenever the checkbox input changes
     */
    onInputChange( e: Event ) {
        if ( this.onChange )
            this.onChange( this );
    }

    /**
     * Sets the checkbox name
     */
    set name( val: string ) {
        ( this.children[ 0 ] as HTMLInputElement ).name = val;
    }

    /**
     * Gets the checkbox name
     */
    get name(): string {
        return ( this.children[ 0 ] as HTMLInputElement ).name;
    }

    /**
     * Sets the checkbox id
     */
    set id( val: string ) {
        ( this.children[ 0 ] as HTMLInputElement ).id = val;
        ( this.children[ 1 ] as HTMLLabelElement ).htmlFor = val;
    }

    /**
     * Gets the checkbox id
     */
    get id(): string {
        return ( this.children[ 0 ] as HTMLInputElement ).id;
    }

    /**
     * Sets the checkbox label
     */
    set label( val: string ) {
        ( this.children[ 1 ] as HTMLLabelElement ).innerText = val;
    }

    /**
     * Gets the checkbox label
     */
    get label(): string {
        return ( this.children[ 1 ] as HTMLLabelElement ).innerText;
    }

    /**
     * Sets if the checkbox is read only
     */
    set readOnly( val: boolean ) {
        this.classList.toggle( 'read-only', val );
    }

    /**
     * Gets if the checkbox is read only
     */
    get readOnly(): boolean {
        return this.classList.contains( 'read-only' );
    }

    /**
     * Sets if the checkbox is checked
     */
    set checked( val: boolean ) {
        ( this.children[ 0 ] as HTMLInputElement ).checked = val;
    }

    /**
     * Gets if the checkbox is checked
     */
    get checked(): boolean {
        return ( this.children[ 0 ] as HTMLInputElement ).checked;
    }

    /**
     * Sets if the checkbox is checked
     */
    set value( val: boolean ) {
        ( this.children[ 0 ] as HTMLInputElement ).checked = val;
    }

    /**
     * Gets if the checkbox is checked
     */
    get value(): boolean {
        return ( this.children[ 0 ] as HTMLInputElement ).checked;
    }
}