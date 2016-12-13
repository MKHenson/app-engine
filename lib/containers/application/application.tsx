import { div, i, h2 } from '../../jml/jml';
import { User } from '../../core/user';
import { Router } from '../../core/router';

/**
 * The main GUI component of the application.
 */
export class Application extends HTMLElement {

    static get observedAttributes() {
        return [ 'loading', 'heading' ];
    }

    private _loadingElm: HTMLElement;

    /**
     * Creates a new instance an application element
     */
    constructor() {
        super();

        this._loadingElm =
            div( { className: 'loading-screen' }, [
                div( { className: 'loading-message fade-in' }, [
                    h2( null, 'Loading Hatchery Editor...' ),
                    i( { className: 'fa fa-cog fa-spin fa-3x fa-fw' })
                ] )
            ] );

        this.innerHTML = `
            <x-split-panel ratio="0.6" orientation="vertical">
                <div class="left">
                    <h2>This is the left panel!</h2>
                </div>
                <div class="right">
                    <h2>This is the right panel!</h2>
                </div>
            </x-split-panel>`;
    }

    /**
     * Gets if the loading element is visible
     */
    get loading(): boolean { return this._loadingElm.parentNode ? true : false; }

    /**
     * Sets if the loading element is visible
     */
    set loading( val: boolean ) {
        if ( val === true )
            this.insertBefore( this._loadingElm, this.childNodes[ 0 ] );
        else
            this._loadingElm.remove();
    }

    /**
     * If the attributes change we update the internal state
     */
    attributeChangedCallback( name: string, oldValue: string, newValue: string ) {
        this[ name ] = newValue;
    }

    /**
     * When the component is added to the DOM
     */
    async connectedCallback() {
        this.loading = true;

        try {
            const authenticated = await User.get.authenticated();
            this.loading = false;

            // Setup the routes
            Router.get.init( [
                {
                    name: 'splash',
                    path: '/splash/:section?',
                    onStateEnter: ( state ) => this.innerHTML = `<div></div>`
                },
                {
                    name: 'login',
                    path: '/login/:forward?',
                    onStateEnter: ( state ) => {
                        if ( authenticated && state.params.forward ) {
                            Router.get.push( state.params.forward );
                        }
                        else if ( authenticated )
                            Router.get.push( '/splash' );
                        else
                            this.innerHTML = `<x-login-widget></x-login-widget>`
                    }
                },
                {
                    name: 'default',
                    path: '/',
                    isIndex: true,
                    onStateEnter: ( state ) => Router.get.push( '/login' )
                },
                {
                    name: 'error',
                    path: '*',
                    onStateEnter: ( state ) => this.innerHTML = `<div>404 - What you done phillis!?</div>`
                }
            ] );
        }
        catch ( e ) {
            this.loading = false;
        }
    }
}