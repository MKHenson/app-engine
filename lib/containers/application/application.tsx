import { div, i, h2 } from '../../jml/jml';
import { User } from '../../core/user';

/**
 * The main GUI component of the application.
 */
export class Application extends HTMLElement {

    static get observedAttributes() {
        return [ 'loading', 'heading' ];
    }

    private _loadingElm: HTMLElement;

    constructor() {
        super();

        this._loadingElm =
            div( { className: 'loading-screen' }, [
                div( { className: 'loading-message fade-in' }, [
                    h2( null, 'Loading Hatchery Editor...' ),
                    i( { className: 'fa fa-cog fa-spin fa-3x fa-fw' })
                ] )
            ] );

        this.appendChild(
            div( { className: 'splash-view' }, [
                this.childNodes
            ] )
        );
    }

    set loading( val: boolean | string ) {
        if ( val === 'true' || val === true )
            this.insertBefore( this._loadingElm, this.childNodes[ 0 ] );
        else
            this._loadingElm.remove();
    }


    attributeChangedCallback( name, oldValue, newValue ) {
        this[ name ] = newValue;
    }

    get name(): string { return 'John'; }

    /**
     * When the component is added to the DOM
     */
    async connectedCallback() {
        this.loading = true;

        try {
            const authenticated = await User.get.authenticated()
            this.loading = false;
            alert( JSON.stringify( authenticated ) )
        }
        catch ( e ) {
            this.loading = false;
        }
    }
}

// define it specifying what's extending
customElements.define( 'x-application', Application );