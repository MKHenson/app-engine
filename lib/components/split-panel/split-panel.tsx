import { div } from '../../jml/jml';

export type SplitOrientation = 'vertical' | 'horizontal';

/**
 * An element that holds 2 child elements and a splitter to split the space between them.
 * The user can grab the splitter to resize the shared space of the two child elements.
 */
export class SplitPanel extends HTMLElement {

    static get observedAttributes() {
        return [ 'orientation', 'ratio' ];
    }

    private _orientation: SplitOrientation;
    private _ratio: number;
    private _dividerSize: number;
    private _dragging: boolean;
    private _mouseUpProxy: any;
    private _mouseMoveProxy: any;
    private _ratioChanged: undefined | ( ( ratio: number ) => void );

    /**
     * Creates a new instance
     */
    constructor() {
        super();

        this._orientation = 'vertical';
        this._ratio = 0.5;
        this._dividerSize = 6;
        this._dragging = false;
        this._mouseUpProxy = this.onStageMouseUp.bind( this );
        this._mouseMoveProxy = this.onStageMouseMove.bind( this );
        this.className = `split-panel ${this._orientation}`;

        // <div className="panel1" style={panel1Style}>
        //     {this.state.dragging ? <div className="panel-input"></div> : null}
        //     {this.props.left || this.props.top}
        // </div>
        // <div ref="divider" onMouseDown={( e ) => { this.onDividerMouseDown( e ) } }
        //     style={dividerStyle}
        //     className="split-panel-divider background-dark" />
        // <div
        //     ref="scrubber"
        //     className="split-panel-divider-dragging"
        //     style={{
        //         display: ( !this.state.dragging ? 'none' : '' )
        //     }} />
        // <div className="panel2" style={panel2Style}>
        //     {this.state.dragging ? <div className="panel-input"></div> : null}
        //     {this.props.right || this.props.bottom}
        // </div>
        // <div className="fix"></div>

        this.appendChild( div( { className: 'panel1' }) );
        this.appendChild( div( { className: 'split-panel-divider background-dark', onmousedown: ( e ) => this.onDividerMouseDown( e ) }) );
        this.appendChild( div( { className: 'split-panel-divider-dragging', style: { display: 'none' } }) ) as HTMLElement;
        this.appendChild( div( { className: 'panel2' }) );
        this.appendChild( div( { className: 'fix' }) );
    }


    attributeChangedCallback( name, oldValue, newValue ) {
        this[ name ] = newValue;
    }

    /**
     * Gets the orientation of the split panel
     */
    get orientation(): SplitOrientation { return this._orientation; }

    /**
     * Sets the orientation of the split panel
     */
    set orientation( val: SplitOrientation ) {
        this._orientation = val;
        this.updateStyles();
    }

    /**
     * Call this function to get the ratio of the panel. Values are from 0 to 1
     */
    get ratio(): number { return this._ratio; }

    /**
     * Call this function to set the ratio of the panel. Values are from 0 to 1.
     * @param val The ratio from 0 to 1 of where the divider should be
     */
    set ratio( val: number ) {
        if ( val > 1 )
            val = 1;
        else if ( val < 0 )
            val = 0;

        this._ratio = val;
        this.updateStyles();
    }

    updateStyles() {
        const orientation = this._orientation;
        const dividerSize = this._dividerSize;
        const dividerSizeHalf = dividerSize * 0.5;
        const ratio = this._ratio;
        this.className = `split-panel ${this._orientation}`;

        // Calculate ratios etc...
        if ( orientation === 'vertical' ) {
            ( this.children[ 0 ] as HTMLElement ).setAttribute( 'style', `width='calc(${ratio * 100}% - ${dividerSizeHalf}px)' height: '100%'` );
            ( this.children[ 1 ] as HTMLElement ).setAttribute( 'style', `width='${dividerSize}px' height: '100%'` );
            ( this.children[ 2 ] as HTMLElement ).setAttribute( 'style', `width='calc(${( 1 - ratio ) * 100}% - ${dividerSizeHalf}px)' height: '100%'` );
        }
        else {
            ( this.children[ 0 ] as HTMLElement ).setAttribute( 'style', `width='100%' height: 'calc(${ratio * 100}% - ${dividerSizeHalf}px)'` );
            ( this.children[ 1 ] as HTMLElement ).setAttribute( 'style', `width='100%' height: '${dividerSize}px'` );
            ( this.children[ 2 ] as HTMLElement ).setAttribute( 'style', `width='100%' height: 'calc(${( 1 - ratio ) * 100}% - ${dividerSizeHalf}px)'` );
        }
    }

    // /**
    //  * Creates the component elements
    //  */
    // render(): JSX.Element {


    //     return <div className={'split-panel ' + ( orientation === SplitOrientation.VERTICAL ? 'vertical' : 'horizontal' )} >
    //         <div className="panel1" style={panel1Style}>
    //             {this.state.dragging ? <div className="panel-input"></div> : null}
    //             {this.props.left || this.props.top}
    //         </div>
    //         <div ref="divider" onMouseDown={( e ) => { this.onDividerMouseDown( e ) } }
    //             style={dividerStyle}
    //             className="split-panel-divider background-dark" />
    //         <div
    //             ref="scrubber"
    //             className="split-panel-divider-dragging"
    //             style={{
    //                 display: ( !this.state.dragging ? 'none' : '' )
    //             }} />
    //         <div className="panel2" style={panel2Style}>
    //             {this.state.dragging ? <div className="panel-input"></div> : null}
    //             {this.props.right || this.props.bottom}
    //         </div>
    //         <div className="fix"></div>
    //     </div>
    // }

    /**
      * This function is called when the mouse is down on the divider
      */
    onDividerMouseDown( e: MouseEvent ) {
        e.preventDefault();
        this._dragging = true;
        const ratio = this._ratio;
        const orientation = this._orientation;
        const scrubber = this.children[ 2 ] as HTMLElement;
        const dividerSize = this._dividerSize;
        const dividerSizeHalf = this._dividerSize * 0.5;

        scrubber.style.height = ( orientation === 'vertical' ? '100%' : dividerSize + 'px' );
        scrubber.style.width = ( orientation === 'vertical' ? dividerSize + 'px' : '100%' );
        scrubber.style.left = ( orientation === 'vertical' ? `calc(${ratio * 100}% - ${dividerSizeHalf}px)` : `0` );
        scrubber.style.top = ( orientation === 'vertical' ? `0` : `calc(${ratio * 100}% - ${dividerSizeHalf}px)` );

        window.addEventListener( 'mouseup', this._mouseUpProxy );
        document.body.addEventListener( 'mousemove', this._mouseMoveProxy );
    }

    /**
     * Recalculate the ratios on mouse up
     */
    onStageMouseUp(): void {

        window.removeEventListener( 'mouseup', this._mouseUpProxy );
        document.body.removeEventListener( 'mousemove', this._mouseMoveProxy );

        const orientation = this._orientation;
        const scrubber = this.children[ 2 ] as HTMLElement;

        // Get the new ratio
        const left = parseFloat( scrubber.style.left!.split( 'px' )[ 0 ] );
        const top = parseFloat( scrubber.style.top!.split( 'px' )[ 0 ] );
        const w = scrubber.parentElement.clientWidth;
        const h = scrubber.parentElement.clientHeight;
        let ratio = 0;

        if ( orientation === 'vertical' )
            ratio = left / w;
        else
            ratio = top / h;

        if ( ratio < 0 )
            ratio = 0;
        if ( ratio > 1 )
            ratio = 1;

        this._dragging = false;
        this._ratio = ratio;
        this.updateStyles();

        if ( this._ratioChanged )
            this._ratioChanged( ratio );
    }

    /**
     * This function is called when the mouse is up from the body of stage.
     */
    onStageMouseMove( e: MouseEvent ) {
        let orientation = this._orientation;
        const scrubber = this.children[ 2 ] as HTMLElement;
        let bounds = scrubber.parentElement.getBoundingClientRect();
        let left = e.clientX - bounds.left;
        let top = e.clientY - bounds.top;

        scrubber.style.left = ( orientation === 'vertical' ? `${left}px` : `0` );
        scrubber.style.top = ( orientation === 'horizontal' ? `${top}px` : `0` );
    }


}

// define it specifying what's extending
customElements.define( 'x-split-panel', SplitPanel );