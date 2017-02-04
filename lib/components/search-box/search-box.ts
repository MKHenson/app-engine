import { JML } from '../../jml/jml';

/**
 * Wraps an input box with HTML that makes it look like a search bar.
 * Add a listener for the onChange event and it will be triggered either when the input
 * changes, or the search button is pressed.
 */
export class SearchBox extends HTMLElement {

    public onSearch: ( e: Event, searchText: string ) => void;
    public triggerOnBlur?: boolean;

    /**
     * Creates an instance of the search box
     */
    constructor() {
        super();

        this.appendChild( JML.input( {
            onkeyup: ( e: KeyboardEvent ) => {
                if ( e.keyCode === 13 && this.onSearch )
                    this.onSearch( e, ( e.target as HTMLInputElement ).value || '' );
            },
            onblur: ( e ) => this.onBlur( e ),
            onchange: ( e ) => this.onChange( e ),
            type: 'text'
        }) );

        this.appendChild( JML.label( {
            onclick: ( e ) => {
                if ( this.disabled )
                    return;

                if ( this.onSearch )
                    this.onSearch( e, ( ( this.children[ 0 ] as HTMLInputElement ).value || '' ) );
            }
        }, JML.i( {
            className: 'fa fa-search'
        }) ) );
    }

    get disabled(): boolean {
        return this.classList.contains( 'disabled' );
    }
    set disabled( val: boolean ) {
        this.classList.toggle( 'disabled', val );
    }

    get id(): string {
        return ( this.children[ 0 ] as HTMLInputElement ).id;
    }
    set id( val: string ) {
        ( this.children[ 0 ] as HTMLInputElement ).id = val;
    }

    get placeholder(): string {
        return ( this.children[ 0 ] as HTMLInputElement ).placeholder;
    }
    set placeholder( val: string ) {
        ( this.children[ 0 ] as HTMLInputElement ).placeholder = val;
    }

    get name(): string {
        return ( this.children[ 0 ] as HTMLInputElement ).name;
    }
    set name( val: string ) {
        ( this.children[ 0 ] as HTMLInputElement ).name = val;
    }

    /**
     * Called whenever the input changes
     */
    private onChange( e: Event ) {
        let text = ( e.target as HTMLInputElement ).value as string;

        if ( this.disabled )
            return;

        if ( this.triggerOnBlur )
            return;

        if ( this.onSearch )
            this.onSearch( e, text || '' );
    }

    /**
     * Called whenever the input loses focus
     */
    private onBlur( e: Event ) {
        let text = ( e.target as HTMLInputElement ).value as string;

        if ( this.disabled )
            return;

        if ( this.onSearch )
            this.onSearch( e, text || '' );
    }
}