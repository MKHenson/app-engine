import { Component } from '../../component';
import { ENUM } from '../../../core/event-dispatcher';

export class ToolbarNumberEvents extends ENUM {
    constructor( v: string ) { super( v ); }
    static CHANGED: ToolbarNumberEvents = new ToolbarNumberEvents( 'toolbar_number_changed' );
}



/**
*  A toolbar button for numbers
*/
export class ToolbarNumber extends Component {
    private static input: any//InputBox;
    private static numInstances: number = 0;

    private defaultVal: number;
    private minValue: number;
    private maxValue: number;
    private delta: number;
    private startPos: number;


    private label: Component;
    private leftArrow: Component;
    private rightArrow: Component;

    // Proxies
    private stageUpPoxy: any;
    private stageMovePoxy: any;
    private downProxy: any;
    private clickProxy: any;
    private wheelProxy: any;
    private keyProxy: any;

    /**
    * @param {Component} parent The parent of this toolbar
    */
    constructor( parent: Component, text: string, defaultVal: number, minValue: number, maxValue: number, delta: number = 1 ) {
        super( '<div class=\'toolbar-button tooltip scrolling-number\'></div>', parent );

        const container: Component = this.addChild( '<div class=\'number-holder\'></div>' );
        this.addChild( '<div class=\'tooltip-text tooltip-text-bg\'>' + text + '</div>' );

        this.defaultVal = defaultVal;
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.delta = delta;

        if ( !ToolbarNumber.input ) {
            //ToolbarNumber.input = new InputBox( null, '' );
            ToolbarNumber.input.element.css( { 'pointer-events': 'all' });
            ToolbarNumber.numInstances = 0;
        }

        this.label = container.addChild( '<div class=\'number-label\'>' + defaultVal + '</div>' );
        const arrows = container.addChild( '<div class=\'arrows\'></div>' );
        this.leftArrow = arrows.addChild( '<div class=\'left\'>←</div>' );
        this.rightArrow = arrows.addChild( '<div class=\'right\'>→</div>' );

        this.element.css( 'pointer-events', 'all' );

        this.startPos = 0;

        // TODO: Must find a way that ensures the mouse move events are not lost when we move over an iframe...

        //Events
        this.stageUpPoxy = jQuery.proxy( this.onStageUp, this );
        this.stageMovePoxy = jQuery.proxy( this.onStageMove, this );
        this.downProxy = jQuery.proxy( this.onDown, this );
        this.clickProxy = jQuery.proxy( this.onClick, this );
        this.wheelProxy = jQuery.proxy( this.onWheel, this );
        this.keyProxy = jQuery.proxy( this.onKeyDown, this );

        this.leftArrow.element.on( 'mousedown', this.downProxy );
        this.rightArrow.element.on( 'mousedown', this.downProxy );
        this.leftArrow.element.on( 'click', this.clickProxy );
        this.rightArrow.element.on( 'click', this.clickProxy );
        this.label.element.on( 'click', this.clickProxy );
        this.element.on( 'mousewheel', this.wheelProxy );
    }

    /**
    * Called when the mouse is down on the DOM
    * @param <object> e The jQuery event
    */
    onStageUp( e ) {
        const inputOnDOM: boolean = ( ToolbarNumber.input.parent ? true : false );

        // Remove listeners
        const body = jQuery( window );
        body.off( 'mouseup', this.stageUpPoxy );
        body.off( 'mousemove', this.stageMovePoxy );
        jQuery( document ).off( 'keydown', this.keyProxy );

        // If input present, then check what we are over
        if ( inputOnDOM ) {
            const targetComp = jQuery( e.target ).data( 'component' );

            if ( !targetComp )
                return;

            if ( targetComp.parent === ToolbarNumber.input && !e.keyCode )
                return;

            this.defaultVal = parseFloat( parseFloat( ToolbarNumber.input.text ).toFixed( 2 ) );
            ToolbarNumber.input.parent.removeChild( ToolbarNumber.input );

            if ( this.defaultVal < this.minValue )
                this.defaultVal = this.minValue;
            if ( this.defaultVal > this.maxValue )
                this.defaultVal = this.maxValue;

            this.label.element.text( this.defaultVal.toString() );

            //this.emit( new ToolbarNumberEvent( ToolbarNumberEvents.CHANGED, this.defaultVal ) );
        }
    }

    /**
    * Called when we move on the stage
    * @param <object> e The jQuery event
    */
    onStageMove( e ) {
        const delta = e.screenX - this.startPos;
        this.startPos = e.screenX;

        if ( delta < 0 )
            this.defaultVal -= this.delta;
        else
            this.defaultVal += this.delta;

        if ( this.defaultVal < this.minValue )
            this.defaultVal = this.minValue;
        if ( this.defaultVal > this.maxValue )
            this.defaultVal = this.maxValue;

        this.defaultVal = parseFloat( this.defaultVal.toFixed( 2 ) );

        this.label.element.text( this.defaultVal.toString() );
        //this.emit( new ToolbarNumberEvent( ToolbarNumberEvents.CHANGED, this.defaultVal ) );
    }

    /**
    * Set or get the value
    * @param {number} val The value we are setting
    */
    set value( val: number ) {
        this.defaultVal = val;
        if ( this.defaultVal < this.minValue )
            this.defaultVal = this.minValue;
        if ( this.defaultVal > this.maxValue )
            this.defaultVal = this.maxValue;

        this.defaultVal = parseFloat( this.defaultVal.toFixed( 2 ) );
        this.label.element.text( this.defaultVal.toString() );
    }

    /**
    * Set or get the value
    * @param {number} val The value we are setting
    */
    get value(): number { return this.defaultVal; }

    onWheel( event, delta ) {
        event; // Supresses unused param error

        if ( delta < 0 )
            this.defaultVal -= this.delta;
        else
            this.defaultVal += this.delta;

        if ( this.defaultVal < this.minValue )
            this.defaultVal = this.minValue;
        if ( this.defaultVal > this.maxValue )
            this.defaultVal = this.maxValue;

        this.defaultVal = parseFloat( this.defaultVal.toFixed( 2 ) );

        this.label.element.text( this.defaultVal.toString() );
        // this.emit( new ToolbarNumberEvent( ToolbarNumberEvents.CHANGED, this.defaultVal ) );
    }

    onKeyDown( e ) {
        //If enter
        if ( e.keyCode === 13 ) {
            this.onStageUp( e );
        }
    }


    onDown( e ) {
        const body = jQuery( window );
        body.off( 'mouseup', this.stageUpPoxy );
        body.off( 'mousemove', this.stageMovePoxy );

        body.on( 'mouseup', this.stageUpPoxy );
        body.on( 'mousemove', this.stageMovePoxy );

        this.startPos = e.screenX;

        // Stops text selection
        e.preventDefault();
    }

    onClick( e ) {
        // Do nothing if the input box is present
        if ( ToolbarNumber.input.parent )
            return;

        const target = jQuery( e.currentTarget ).data( 'component' );

        //If you click on the label, we replace it with an input box so you can enter data by typing
        if ( target === this.label ) {
            ToolbarNumber.input.text = target.element.text();
            target.element.text( '' );
            target.addChild( ToolbarNumber.input );
            jQuery( 'body' ).off( 'mouseup', this.stageUpPoxy );
            jQuery( 'body' ).on( 'mouseup', this.stageUpPoxy );
            jQuery( document ).on( 'keydown', this.keyProxy );
            return;
        }

        if ( target === this.leftArrow )
            this.defaultVal -= this.delta;
        else if ( target === this.rightArrow )
            this.defaultVal += this.delta;


        if ( this.defaultVal < this.minValue )
            this.defaultVal = this.minValue;

        if ( this.defaultVal > this.maxValue )
            this.defaultVal = this.maxValue;

        this.defaultVal = parseFloat( this.defaultVal.toFixed( 2 ) );
        this.label.element.text( this.defaultVal.toString() );

        // this.emit( new ToolbarNumberEvent( ToolbarNumberEvents.CHANGED, this.defaultVal ) );
    }

    /**
    * Cleans up the component
    */
    dispose(): void {
        const body = jQuery( window );
        body.off( 'mouseup', this.stageUpPoxy );
        body.off( 'mousemove', this.stageMovePoxy );

        this.leftArrow.element.off( 'mousedown', this.downProxy );
        this.rightArrow.element.off( 'mousedown', this.downProxy );
        this.element.off( 'mousewheel', this.wheelProxy );
        this.leftArrow.element.off( 'click', this.clickProxy );
        this.rightArrow.element.off( 'click', this.clickProxy );
        this.label.element.off( 'click', this.clickProxy );
        this.downProxy = null;
        this.clickProxy = null;
        this.wheelProxy = null;
        this.stageUpPoxy = null;
        this.stageMovePoxy = null;

        ToolbarNumber.numInstances--;
        if ( ToolbarNumber.numInstances <= 0 ) {
            ToolbarNumber.numInstances = 0;
            ToolbarNumber.input.dispose();
            ToolbarNumber.input = null;
        }

        //Call super
        super.dispose();
    }
}