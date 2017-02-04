import { JML } from '../../jml/jml';

/**
 * Extends the element object with handles that allow for the element to be resized by the user
 * eg:
 * const resizable = new Resizable();
 * resizable.innerHTML = 'This can be resized';
 */
export class Resizable extends HTMLElement {


    public onDragStart?( e: MouseEvent ): boolean;
    public onResized?( size: { width: number; height: number; }): void;

    private _upProxy;
    private _moveProxy;
    private _allowMouseX: boolean;
    private _allowMouseY: boolean;
    private _originRect: ClientRect;
    private _ghost: HTMLElement;
    private _resizable: boolean;

    /**
     * Creates an instance of the resizer
     */
    constructor() {
        super();

        this._resizable = true;

        this._upProxy = this.onResizeStop.bind( this );
        this._moveProxy = this.onResizing.bind( this );
        this._allowMouseX = false;
        this._allowMouseY = false;
        this.classList.toggle( 'resizable', true );
        this._ghost = JML.div( { className: 'ghost' });

        this.appendChild( JML.div( { className: 'east resizable-handle', onmousedown: ( e ) => this.onResizeStart( e, true, false ) }) );
        this.appendChild( JML.div( { className: 'south resizable-handle', onmousedown: ( e ) => this.onResizeStart( e, false, true ) }) );
        this.appendChild( JML.div( { className: 'south-east resizable-handle', onmousedown: ( e ) => this.onResizeStart( e, true, true ) }) );
    }

    /**
     * When unmounting, we remove any listeners that may still remain
     */
    disconnectedCallback() {
        window.removeEventListener( 'mouseup', this._upProxy );
        window.removeEventListener( 'mousemove', this._moveProxy );
        if ( document.body.contains( this._ghost ) )
            document.body.removeChild( this._ghost );
    }

    /**
     * Gets if the element shows its resizable elements and can be resized by the user
     */
    get resizable(): boolean {
        return this._resizable;
    }

    /**
     * Sets if the element shows its resizable elements and can be resized by the user
     */
    set resizable( val: boolean ) {
        this._resizable = val;
        this.classList.toggle( 'resizable', val );
    }

    /**
     * When the mouse is down on the component, we add the move and up listeners
     */
    protected onResizeStart( e: MouseEvent, allowMouseX: boolean, allowMouseY: boolean ) {
        if ( !this.resizable )
            return;

        if ( this.onDragStart && this.onDragStart( e ) === false )
            return;

        this._originRect = this.getBoundingClientRect();
        this._allowMouseX = allowMouseX;
        this._allowMouseY = allowMouseY;

        this._ghost.style.left = this._originRect.left + 'px';
        this._ghost.style.top = this._originRect.top + 'px';
        this._ghost.style.width = this._originRect.width + 'px';
        this._ghost.style.height = this._originRect.height + 'px';

        e.preventDefault();
        window.addEventListener( 'mouseup', this._upProxy );
        window.addEventListener( 'mousemove', this._moveProxy );

        if ( !document.body.contains( this._ghost ) )
            document.body.appendChild( this._ghost );
    }

    /**
     * When the mouse is up we remove the events
     */
    protected onResizeStop( e: MouseEvent ) {
        window.removeEventListener( 'mouseup', this._upProxy );
        window.removeEventListener( 'mousemove', this._moveProxy );
        document.body.removeChild( this._ghost );

        this.style.width = this._ghost.style.width;
        this.style.height = this._ghost.style.height;

        const h = this._allowMouseY ? ( e.pageY - this._originRect.top ) : this._originRect.height;
        const w = this._allowMouseX ? ( e.pageX - this._originRect.left ) : this._originRect.width

        if ( this.onResized )
            this.onResized( { width: w, height: h });
    }

    /**
     * When the mouses moves we resize the component
     */
    protected onResizing( e: MouseEvent ) {
        this.getBoundingClientRect();
        const h = this._allowMouseY ? ( e.pageY - this._originRect.top ) : this._originRect.height;
        const w = this._allowMouseX ? ( e.pageX - this._originRect.left ) : this._originRect.width
        this._ghost.style.width = ( w ) + 'px';
        this._ghost.style.height = ( h ) + 'px';
    }
}