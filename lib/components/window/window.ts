import { JML } from '../../jml/jml';
// TODO: Implement resizable?
// import { Resizable } from '../resizable/resizable';

/**
 * A component that shows elements on top of other content in the DOM.
 * The window's conent is accessed via its content property. It can optionally
 * have a header, title and close button. As well as be manually shown and hidden.
 * e.g.
 *
 * const win = new Window();
 * win.title = 'My new window';
 * win.controlBox = true;
 * win.closeButton = true;
 * const div = document.createElement('div');
 * div.innerHTML = 'Window content!';
 * win.content.appendChild( div );
 * win.show();
 */
export class Window extends HTMLElement {

    public modal: boolean;
    public autoCenter: boolean;
    // public canResize: true;
    // public animated: true
    public centerOnShow: boolean;

    private _resizeProxy: any;
    private _mouseMoveProxy: any;
    private _mouseUpProxy: any;
    private _mouseDeltaX: number;
    private _mouseDeltaY: number;
    private _modal: HTMLDivElement;

    /**
     * Creates an instance of the window
     */
    constructor() {
        super();

        this._resizeProxy = this.onResize.bind( this );
        this._mouseMoveProxy = this.onMouseMove.bind( this );
        this._mouseUpProxy = this.onMouseUp.bind( this );
        this._mouseDeltaX = 0;
        this._mouseDeltaY = 0;
        this.centerOnShow = true;
        this.autoCenter = true;
        this.modal = true;


        this._modal = JML.div( { className: 'modal-backdrop' });
        this.classList.toggle( 'animated', true );
        this.appendChild(
            JML.div( {
                className: 'window-control-box',
                onmousedown: ( e ) => this.onHeaderDown( e )
            }, [
                    JML.div( {
                        className: 'close-but',
                        onclick: () => this.hide()
                    }, 'X' ),
                    JML.div( { className: 'window-header' }),
                    JML.div( { className: 'fix' })
                ] )
        );
        this.appendChild( JML.div( { className: 'window-content' }) );
    }

    /**
     * When added to the dom
     */
    connectedCallback() {
        if ( this.modal )
            this._modal.onclick = () => {
                this.classList.toggle( 'anim-shadow-focus', false );
                setTimeout(() => this.classList.toggle( 'anim-shadow-focus', true ), 30 );
            };

        this.classList.toggle( 'closing', false );
        setTimeout(() => this.classList.toggle( 'active', true ), 30 );

        // When the component is mounted, check if it needs to be centered
        if ( this.autoCenter ) {
            window.addEventListener( 'resize', this._resizeProxy );
            this.style.left = ( ( this.parentElement!.offsetWidth * 0.5 ) - ( this.offsetWidth * 0.5 ) ) + 'px';
            this.style.top = ( ( this.parentElement!.offsetHeight * 0.5 ) - ( this.offsetHeight * 0.5 ) ) + 'px';
        }
    }

    /**
     * Clean up any event listeners
     */
    disconnectedCallback() {
        if ( this.autoCenter )
            window.removeEventListener( 'resize', this._resizeProxy );

        if ( this.modal )
            this._modal.onclick = null!;

        if ( this._modal.parentNode )
            this._modal.parentNode.removeChild( this._modal );

        window.removeEventListener( 'resize', this._resizeProxy );
        window.removeEventListener( 'mouseup', this._mouseUpProxy );
        if ( this.parentNode )
            this.parentNode.removeEventListener( 'mousemove', this._mouseMoveProxy );
    }

    /**
     * Shows the window by adding it to the top of the dom or provided parent
     * @param parent [Optional] The optional parent to add the element to
     */
    show( parent?: Node ) {
        let p = parent || document.body;
        if ( this.modal )
            p.appendChild( this._modal );
        p.appendChild( this );
    }

    /**
     * Hides/Removes the window
     */
    hide() {
        this.classList.toggle( 'active', false );
        if ( this.parentNode )
            this.parentNode.removeChild( this );
    }

    /**
     * When the user clicks the the header bar we initiate its dragging
     */
    onHeaderDown( e: React.MouseEvent ) {
        e.preventDefault();
        let bounds = this.getBoundingClientRect();
        this._mouseDeltaX = e.pageX - bounds.left;
        this._mouseDeltaY = e.pageY - bounds.top;
        window.addEventListener( 'mouseup', this._mouseUpProxy );
        document.body.addEventListener( 'mousemove', this._mouseMoveProxy );
    }

    /**
     * When the mouse moves and we are dragging the header bar we move the window
     */
    onMouseMove( e: MouseEvent ) {
        let elm = this;
        let x = e.pageX - this._mouseDeltaX;
        let y = e.pageY - this._mouseDeltaY;
        elm.style.left = x + 'px';
        elm.style.top = y + 'px';
    }

    /**
     * When the mouse is up we remove the dragging event listeners
     */
    onMouseUp() {
        window.removeEventListener( 'mouseup', this._mouseUpProxy );
        document.body.removeEventListener( 'mousemove', this._mouseMoveProxy );
        let bounds = this.getBoundingClientRect();
        let pBounds = this.parentElement!.getBoundingClientRect();
        const gracePadding = 40;

        // Ensure its within the bound after dropping the window
        if ( bounds.left + gracePadding > pBounds.left + pBounds.width )
            this.style.left = ( pBounds.left + pBounds.width - gracePadding ) + 'px';
        else if ( bounds.left + bounds.width + gracePadding < pBounds.left )
            this.style.left = ( pBounds.left + bounds.width + gracePadding ) + 'px';

        if ( bounds.top + bounds.height + gracePadding > pBounds.top + pBounds.height )
            this.style.top = ( pBounds.top + pBounds.height - gracePadding ) + 'px';
    }

    /**
     * Called when the window is resized
     */
    onResize() {
        if ( this.autoCenter ) {
            this.style.left = ( ( this.parentElement!.offsetWidth * 0.5 ) - ( this.offsetWidth * 0.5 ) ) + 'px';
            this.style.top = ( ( this.parentElement!.offsetHeight * 0.5 ) - ( this.offsetHeight * 0.5 ) ) + 'px';
        }
    }

    /**
     * Gets the container div to which content can be added
     */
    get content(): Element {
        return this.querySelector( '.window-content' ) !;
    }

    /**
     * Gets the title of the window header
     */
    get title(): string {
        return this.querySelector( '.window-header' ) !.textContent!;
    }

    /**
     * Sets the title of the window header
     */
    set title( val: string ) {
        this.querySelector( '.window-header' ) !.textContent = val;
    }

    /**
     * Gets if the window has a control box
     */
    get controlBox(): boolean {
        return ( ( this.querySelector( '.window-control-box' ) ! as HTMLDivElement ).style.display === 'none' ? false : true );
    }

    /**
     * Sets if the window has a control box
     */
    set controlBox( val: boolean ) {
        ( this.querySelector( '.window-control-box' ) ! as HTMLDivElement ).style.display = ( val ? '' : 'none' );
        ( this.querySelector( '.window-content' ) ! as HTMLElement ).classList.toggle( 'no-control', !val );
    }

    /**
     * Gets if the window has a close button
     */
    get closeButton(): boolean {
        return ( ( this.querySelector( '.close-but' ) ! as HTMLDivElement ).style.display === 'none' ? false : true );
    }

    /**
     * Sets if the window has a close button
     */
    set closeButton( val: boolean ) {
        ( this.querySelector( '.close-but' ) ! as HTMLDivElement ).style.display = ( val ? '' : 'none' );
    }
}