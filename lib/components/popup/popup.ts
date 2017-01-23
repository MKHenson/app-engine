/**
 * An abstract class that is used as a base for others that popup over other elements.
 * Similar to a menu window or drop down.
 */
export abstract class Popup extends HTMLElement {

    private _onStageClickProxy: any;
    private _prevParent: HTMLElement | null;

    /**
     * Creates an instance of the popup
     */
    constructor() {
        super();

        this.className = 'popup';
        this._prevParent = null;
        this._onStageClickProxy = this.onStageClick.bind( this );
    }

    /**
     * When we click on the dom, but not on any part of the popup,
     * we hide the element. If we click somewhere on the popup then
     * we do nothing.
     */
    protected onStageClick( e: MouseEvent ) {

        // If any of the parent elements of the click are part of this element
        // then do nothing
        let p: Node | null = e.target as Node;
        while ( p ) {
            if ( p === this )
                return;

            p = p.parentNode;
        }

        this.hide();
    }

    /**
     * Removes the popup from the dom
     */
    hide( animate: boolean = false ) {
        this.classList.toggle( 'closing', true );

        if ( animate ) {
            setTimeout(() => {
                if ( this.parentElement )
                    this.parentElement.removeChild( this );
            }, 500 );
        }
        else if ( this.parentElement )
            this.parentElement.removeChild( this );
    }

    /**
     * Clean up any event listeners
     */
    disconnectedCallback() {
        this._prevParent!.removeEventListener( 'click', this._onStageClickProxy );
        this.classList.toggle( 'active', false );
        this._prevParent = null;
    }

    /**
     * When added to the dom, create a fade in effect
     */
    connectedCallback() {
        this.classList.toggle( 'closing', false );
        this._prevParent = this.parentElement!;
        setTimeout(() => this.classList.toggle( 'active', true ), 30 );
        this._prevParent!.addEventListener( 'click', this._onStageClickProxy );
    }

    /**
     * Shows the popup menu at the designated x and y coordinates. You can optionally
     * pass in a parent parameter to specify what the popup is appended to.
     */
    show( x: number, y: number, parent?: HTMLElement ) {
        parent = parent ? parent : document.body;
        this.style.left = `${x}px`;
        this.style.top = `${y}px`;
        parent.appendChild( this );
    }
}