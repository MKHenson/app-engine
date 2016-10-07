namespace Animate {

	/**
	 * Links connect 2 behaviours to one another. Each link is connected by a start and end portal on both the origin
     * and destination behaviours. Links are drawn on the schema as an SVG line.
	 */
    export class Link extends CanvasItem {
        public startPortal: string;
        public endPortal: string;
        public width: number;
        public height: number;
        public selected: boolean;
        public startBehaviour: number;
        public endBehaviour: number;
        public points: Point[];
        private _properties: EditableSet;

		/**
		 * Creates a new instance of a link
		 */
        constructor() {
            super();
            this.startPortal = '';
            this.endPortal = '';
            this.selected = false;
            this.startBehaviour = -1;
            this.endBehaviour = -1;
            this.points = [];
            this.width = 0;
            this.height = 0;
            this._properties = new EditableSet( this );
            this._properties.addVar( new PropNum( 'Frame Delay', 1, 0, Number.MAX_VALUE, 0, 1 ) );
        }

        /**
         * Serializes the data into a JSON.
         */
        serialize( id: number ): ILinkItem {
            let toRet = <ILinkItem>super.serialize( id );
            toRet.type = 'link';
            toRet.width = this.width;
            toRet.height = this.height;
            toRet.startBehaviour = this.startBehaviour;
            toRet.endBehaviour = this.endBehaviour;
            toRet.startPortal = this.startPortal;
            toRet.endPortal = this.endPortal;
            toRet.points = [];

            for ( const p of this.points )
                toRet.points.push( { x: p.x, y: p.y });

            return toRet;
        }

        /**
         * De-Serializes data from a JSON.
         * @param data The data to import from
         */
        deSerialize( data: ILinkItem ) {
            super.deSerialize( data );

            this.width = data.width;
            this.height = data.height;
            this.startBehaviour = data.startBehaviour;
            this.endBehaviour = data.endBehaviour;
            this.startPortal = data.startPortal;
            this.endPortal = data.endPortal;

            this.points.splice( 0, this.points.length );
            for ( const p of data.points )
                this.points.push( { x: p.x, y: p.y });
        }

        calculateDimensions() {
            // const items = this.store.getItems();
            // const startBehaviour = items[this.startBehaviour] as Behaviour;
            // const endBehaviour = items[this.endBehaviour] as Behaviour;
            // const startPortal = startBehaviour.getPortal( this.startPortal );
            // const endPortal = startBehaviour.getPortal( this.endPortal );
            // const leftMostBehaviour = startBehaviour.left < endBehaviour.left ? startBehaviour : endBehaviour;
            // const topMostBehaviour = startBehaviour.top < endBehaviour.top ? startBehaviour : endBehaviour;

            // this.left = leftMostBehaviour.left + startPortal.left;
            // this.top = topMostBehaviour.top + startPortal.top;
            // this.width = leftMostBehaviour.left + startPortal.left;
            // this.top = startBehaviour.top + startPortal.top;
        }

        // /**
        // * Tokenizes the data into a JSON.
        // * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage
        // * @returns {ILinkItem}
        // */
        // tokenize(slim: boolean = false): ILinkItem {
        //     var toRet = <ILinkItem>super.tokenize(slim);
        //     toRet.endBehaviour = this._endBehaviour.shallowId;
        //     toRet.startBehaviour = this._startBehaviour.shallowId;
        //     toRet.endPortal = this.endPortal.property.name;
        //     toRet.startPortal = this.startPortal.property.name;
        //     toRet.frameDelay = <number>this._properties.getVar("Frame Delay").getVal();
        //     toRet.type = CanvasItemType.Link;

        //     return toRet;
        // }

        // /**
        // * De-Tokenizes data from a JSON.
        // * @param {ILinkItem} data The data to import from
        // */
        // deTokenize(data: ILinkItem) {
        //     super.deTokenize(data);
        //     this._properties.getVar("Frame Delay").setVal(data.frameDelay);
        // }

        // /**
        // * Called after de-tokenization. This is so that the items can link up to any other items that might have been created in the process.
        // * @param {number} originalId The original shallow ID of the item when it was tokenized.
        // * @param {LinkMap} items The items loaded from the detokenization process. To get this item you can do the following: items[originalId].item
        // * or to get the token you can use items[originalId].token
        // */
        // link(originalId: number, items: LinkMap) {
        //     var exportedToken = <ILinkItem>items[originalId].token;

        //     // This link was probably copied - but not with both of the end behavours - so remove it
        //     if (!items[exportedToken.endBehaviour] || !items[exportedToken.startBehaviour]) {
        //         this.dispose();
        //         return;
        //     }

        //     this._endBehaviour = <Behaviour>items[exportedToken.endBehaviour].item;
        //     this._startBehaviour = <Behaviour>items[exportedToken.startBehaviour].item;
        //     this.endPortal = this._endBehaviour.getPortal(exportedToken.endPortal);
        //     this.startPortal = this._startBehaviour.getPortal(exportedToken.startPortal);
        //     this.endPortal.addLink(this);
        //     this.startPortal.addLink(this);
        //     this.element.css("pointer-events", "");

        //     this.updatePoints();
        // }

        // /**
        // * This is called when we need a link to start drawing. This will
        // * follow the mouse and draw a link from the original mouse co-ordinates to an
        // * end portal.
        // * @param {Portal} startPortal
        // * @param {any} e
        // */
        // start( startPortal : Portal, e ) {
        // 	this.startPortal = startPortal;

        // 	// Attach events
        // 	this.parent.element.on( "mousemove", this._mouseMoveProxy );
        // 	this.parent.element.on( "mouseup", this._mouseUpProxy );
        // 	jQuery( ".portal", this.parent.element ).on( "mouseup", this._mouseUpAnchorProxy );

        // 	// Get the start coords
        // 	var positionOnCanvas = startPortal.positionOnCanvas();
        // 	this._startClientX = e.clientX;
        // 	this._startClientY = e.clientY;
        // 	this.delta = ( startPortal.element.width() / 2 );
        // 	this._startX = positionOnCanvas.left + this.delta;
        // 	this._startY = positionOnCanvas.top + this.delta;

        // 	this.element.css( {
        // 		left: this._startX + "px",
        // 		top: this._startY + "px"
        // 	});

        // 	// Add glow
        // 	if ( this.startPortal.type === PortalType.PRODUCT )
        // 		jQuery( ".parameter" ).addClass( "green-glow" );
        // 	else if ( this.startPortal.type === PortalType.OUTPUT )
        // 		jQuery( ".input" ).addClass( "green-glow" );

        // 	this.onMouseMove( e );
        // }

        // /**
        // * Check if a point is actually selecting the link
        // * @param {any} e
        // */
        // hitTestPoint( e : any ) {
        // 	var mouse = Utils.getMousePos( e, this.id );// this.getMousePos( e );

        // 	// Get image data at the mouse x,y pixel
        // 	var imageData = this._graphics.getImageData( mouse.x - 4, mouse.y - 4, 8, 8 );
        // 	var index = ( mouse.x + mouse.y * imageData.width ) * 4;

        // 	// If the mouse pixel exists, select and break
        // 	for ( var i = 0; i < imageData.data.length; i++ )
        // 		if ( imageData.data[i] > 0 )
        // 			return true;

        // 	return false;
        // }


        // /**
        // * Builds the dimensions of link based on the line points
        // */
        // buildDimensions() {
        // 	var linePoints = this._linePoints;
        // 	var canvas = this._canvas;

        // 	var length = linePoints.length;

        // 	var left = 99999;
        // 	var top = 99999;
        // 	var right = 0;
        // 	var bottom = 0;

        // 	// Get the extremes
        // 	for ( var i = 0; i < length; i++ ) {
        // 		var x = linePoints[i].x;
        // 		var y = linePoints[i].y;

        // 		if ( x < left )
        // 			left = x;
        // 		else if ( x > right )
        // 			right = x;

        // 		if ( y < top )
        // 			top = y;
        // 		else if ( y > bottom )
        // 			bottom = y;
        // 	}

        // 	var w = ( right - left ) + 4 + 20;
        // 	var h = ( bottom - top ) + 4 + 20;
        // 	if ( w <= 4 )
        // 		w = 4 + 20;
        // 	if ( h <= 4 )
        // 		h = 4 + 20;

        // 	canvas.width = w;
        // 	canvas.height = h;

        // 	// Set the element size and location
        // 	this.element.css( {
        // 		left: ( left - 5 ) + "px",
        // 		top: ( top - 5 ) + "px",
        // 		width: w + "px",
        // 		height: h + "px"
        // 	});

        // 	// Now reset the points so that they are relative
        // 	for ( var i = 0; i < length; i++ ) {
        // 		var lp = linePoints[i];
        // 		lp.x = ( lp.x - left ) + 5;
        // 		lp.y = ( lp.y - top ) + 5;
        // 	}
        // }

        // /**
        // * Use this function to build the line points that define the link
        // */
        // buildLinePoints( e ) {
        // 	var linePoints = this._linePoints;

        // 	// We create a list of array points that define the link
        // 	// Clear all points
        // 	linePoints.splice( 0, linePoints.length );

        // 	// Get the start coords
        // 	var positionOnCanvas = this.startPortal.positionOnCanvas();
        // 	this.delta = ( this.startPortal.element.width() / 2 );
        // 	var delta = this.delta;
        // 	this._startX = positionOnCanvas.left + this.delta;
        // 	this._startY = positionOnCanvas.top + this.delta;
        // 	var pPosition = this.parent.element.offset();

        // 	var startX = this._startX;
        // 	var startY = this._startY;
        // 	var endX = 0;
        // 	var endY = 0;

        // 	if ( this.endPortal !== null ) {
        // 		var endPositionOnCanvas = this.endPortal.positionOnCanvas();
        // 		endX = endPositionOnCanvas.left + delta;
        // 		endY = endPositionOnCanvas.top + delta;
        // 	}
        // 	else {
        // 		if ( e === null )
        // 			return;

        //         var t = 2;
        // 		endX = startX + e.clientX - this._startClientX + t;
        // 		endY = startY + e.clientY - this._startClientY + t;
        // 	}

        // 	// Now the end coords
        // 	if ( this.endPortal !== null ) {
        // 		// If this loops on itself then we need to make it look nice.
        // 		if ( this.startPortal.behaviour === this.endPortal.behaviour &&
        // 			this.startPortal !== this.endPortal ) {
        // 			// First the start points
        // 			linePoints.push( { x: startX, y: startY });
        // 			if ( this.startPortal.type === PortalType.OUTPUT )
        // 				linePoints.push( { x: startX + 10, y: startY });
        // 			else
        // 				linePoints.push( { x: startX, y: startY + 20 });

        // 			var behaviourLeft = parseFloat( ( this.endPortal.behaviour.element.css( "left" ).split( "px" ) )[0] );
        // 			var behaviourTop = parseFloat( ( this.endPortal.behaviour.element.css( "top" ).split( "px" ) )[0] );
        // 			var behaviourWidth = this.endPortal.behaviour.element.width();
        // 			var behaviourHeight = this.endPortal.behaviour.element.height();

        // 			if ( this.startPortal.type === PortalType.PRODUCT )
        // 				linePoints.push( { x: behaviourLeft + behaviourWidth + 20, y: startY + 20 });

        // 			linePoints.push( { x: behaviourLeft + behaviourWidth + 20, y: startY });
        // 			linePoints.push( { x: behaviourLeft + behaviourWidth + 20, y: behaviourTop - 20 });

        // 			if ( this.endPortal.type === PortalType.INPUT ) {
        // 				linePoints.push( { x: behaviourLeft - 20, y: behaviourTop - 20 });
        // 				linePoints.push( { x: behaviourLeft - 20, y: endY });
        // 			}

        // 			if ( this.endPortal.type === PortalType.PARAMETER || this.endPortal.type === PortalType.INPUT ) {
        // 				// Set the 'just before end' point
        // 				if ( this.endPortal.type === PortalType.INPUT )
        // 					linePoints.push( { x: endX - 10, y: endY });
        // 				else
        // 					linePoints.push( { x: endX, y: endY - 10 });
        // 			}
        // 		}
        // 		else if ( this.endPortal.type === PortalType.PARAMETER || this.endPortal.type === PortalType.INPUT ) {
        // 			// First the start points
        // 			linePoints.push( { x: startX, y: startY });
        // 			if ( this.startPortal.type === PortalType.OUTPUT )
        // 				linePoints.push( { x: startX + 20, y: startY });
        // 			else
        // 				linePoints.push( { x: startX, y: startY + 30 });


        // 			// Set the 'just before end' point
        // 			if ( this.endPortal.type === PortalType.INPUT )
        // 				linePoints.push( { x: endX - 20, y: endY });
        // 			else
        // 				linePoints.push( { x: endX, y: endY - 20 });
        // 		}
        // 	}
        // 	else {
        // 		// First the start points
        // 		linePoints.push( { x: startX, y: startY });
        // 		if ( this.startPortal.type === PortalType.OUTPUT )
        // 			linePoints.push( { x: startX + 20, y: startY });
        // 		else
        // 			linePoints.push( { x: startX, y: startY + 30 });

        // 		linePoints.push( { x: endX - 20, y: endY });
        // 	}

        // 	// Finally set the end point
        // 	linePoints.push( { x: endX, y: endY });
        // }

        // /**
        // * Updates the link points (should they have been moved).
        // */
        // updatePoints() {
        // 	// First build the points
        // 	this.buildLinePoints( null );

        // 	// Set the dimensions
        // 	this.buildDimensions();

        // 	var graphics = this._graphics;
        // 	graphics.clearRect( 0, 0, this._canvas.width, this._canvas.height );
        // 	this.draw();
        // }

        // /**
        // * When the mouse moves we resize the stage.
        // * @param {any} e
        // */
        // onMouseMove( e ) {
        // 	var curTarget : Component = this._curTarget;

        // 	// Check if a portal
        // 	if ( curTarget !== null )
        // 		curTarget.element.css( "cursor", "" );


        // 	var target = jQuery( e.target );
        // 	this.endPortal = null;
        // 	if ( target.hasClass( "portal" ) ) {
        // 		this._curTarget = target.data( "component" );
        // 		curTarget = this._curTarget;
        // 		this.endPortal = <Portal>curTarget;

        // 		if ( (<Portal>curTarget).checkPortalLink( this.startPortal ) )
        // 			curTarget.element.css( "cursor", "" );
        // 		else
        // 			curTarget.element.css( "cursor", "no-drop" );
        // 	}
        // 	else {
        // 		target.css( "cursor", "crosshair" );
        // 		this._curTarget = target.data( "component" );
        // 	}

        // 	// First build the points
        // 	this.buildLinePoints( e );

        // 	// Set the dimensions
        // 	this.buildDimensions();

        // 	var graphics = this._graphics;
        // 	graphics.clearRect( 0, 0, this._canvas.width, this._canvas.height );
        // 	this.draw();
        // }

        //  /**
        // * Draws a series of lines
        // */
        // draw() : void {
        // 	var points = this._linePoints;
        // 	var len = points.length;

        // 	if ( len === 0 )
        // 		return;

        // 	var prevMidpt = null;
        // 	var pt1 = null;
        // 	var pt2 = null;
        // 	var graphics = this._graphics;
        // 	var element = this.element;
        // 	var startPortal = this.startPortal;
        // 	var endPortal = this.endPortal;
        // 	var startPortalBehaviour = startPortal.behaviour;
        // 	var endPortalBehaviour = ( endPortal ? endPortal.behaviour : null );
        // 	var loops = false;

        // 	graphics.lineCap = 'round';
        // 	graphics.lineJoin = 'round';


        // 	if ( startPortal.type !== PortalType.OUTPUT ) {
        // 		// Set dashed lines (only some browsers support this)
        //         if (graphics.setLineDash !== undefined)
        //             graphics.setLineDash([5]);
        // 	}

        // 	graphics.beginPath();

        // 	// If this loops on itself then we need to make it look nice.
        // 	if ( endPortal && startPortalBehaviour === endPortalBehaviour && startPortal !== endPortal )
        // 		loops = true;

        // 	for ( var i = 1; i < len; i++ ) {
        // 		pt1 = { x: points[i - 1].x, y: points[i - 1].y };
        // 		pt2 = { x: points[i].x, y: points[i].y };

        // 		var midpt = { x: pt1.x + ( pt2.x - pt1.x ) * 0.5, y: pt1.y + ( pt2.y - pt1.y ) / 2 };

        // 		// Draw the curves:
        // 		if ( !loops ) {
        // 			if ( prevMidpt ) {
        // 				graphics.moveTo( prevMidpt.x, prevMidpt.y );
        // 				if ( !loops )
        // 					graphics.quadraticCurveTo( pt1.x, pt1.y, midpt.x, midpt.y );
        // 				else
        // 					graphics.lineTo( pt1.x, pt1.y );
        // 			}
        // 			else {
        // 				// Draw start segment:
        // 				graphics.moveTo( pt1.x, pt1.y );
        // 				graphics.lineTo( midpt.x, midpt.y );
        // 			}
        // 		}
        // 		else {
        // 			// Draw start segment:
        // 			graphics.moveTo( pt1.x, pt1.y );
        // 			graphics.lineTo( pt2.x, pt2.y );
        // 		}

        // 		prevMidpt = midpt;
        // 	}


        // 	// Draw end segment:
        // 	if ( pt2 )
        // 		graphics.lineTo( pt2.x, pt2.y - 1 );

        // 	if ( startPortal.type === PortalType.OUTPUT ) {
        // 		graphics.lineWidth = 3;
        // 		if ( element.data( "selected" ) )
        // 			graphics.strokeStyle = "#FF0000";
        // 		else
        //             graphics.strokeStyle = "#9D5BAF";
        // 		graphics.stroke();

        // 		//Now draw the line text
        //         var canvas = this._canvas;
        //         var frameDelay: number = <number>this._properties.getVar("Frame Delay").getVal();
        // 		var canvasW : number = 0;
        //         var canvasH: number = 0;

        //         if (loops) {
        //             canvasW = canvas.width * 0.5 - 5;
        //             canvasH = 8;
        //         }
        //         else {
        //             canvasW = canvas.width * 0.5 - 5;
        //             canvasH = canvas.height * 0.5 + 3;
        //         }

        // 		graphics.lineWidth = 5;
        // 		graphics.strokeStyle = "#ffffff";
        // 		graphics.strokeText( frameDelay.toString(), canvasW, canvasH );
        // 		graphics.fillText( frameDelay.toString(), canvasW, canvasH );
        // 	}
        // 	else {
        // 		// Draw pipe lines
        // 		graphics.lineWidth = 2;
        // 		if ( element.data( "selected" ) )
        // 			graphics.strokeStyle = "#FF0000";
        // 		else
        // 			graphics.strokeStyle = "#E2B31F";

        // 		graphics.stroke();
        // 	}
        // }

        // /**
        // * Remove listeners.
        // * @param {any} e
        // */
        // onMouseUpAnchor( e ) {
        // 	if ( this._curTarget )
        // 		this._curTarget.element.css( "cursor", "" );

        // 	this.parent.element.css( "cursor", "" );
        // 	this.startPortal.element.css( "cursor", "" );

        // 	// Add remove glow
        // 	if ( this.startPortal.type === PortalType.PRODUCT )
        // 		jQuery( ".parameter" ).removeClass( "green-glow" );
        // 	else if ( this.startPortal.type === PortalType.OUTPUT )
        // 		jQuery( ".input" ).removeClass( "green-glow" );

        // 	var elm : JQuery = jQuery( e.target );
        // 	if ( elm.hasClass( "portal" ) ) {
        // 		this._curTarget = elm.data( "component" );

        // 		if ( this._curTarget.type === PortalType.PRODUCT || this._curTarget.type === PortalType.OUTPUT )
        // 			this.dispose();
        // 		else {
        // 			if (
        // 				( this.startPortal.type === PortalType.OUTPUT && this._curTarget.type === PortalType.INPUT ) ||
        // 				( this.startPortal.type === PortalType.PRODUCT && this._curTarget.type === PortalType.PARAMETER )
        // 				) {
        // 				if ( this._curTarget.checkPortalLink( this.startPortal ) ) {
        // 					//Drop is ok
        // 					this.parent.element.off( "mousemove", this._mouseMoveProxy );
        // 					this.parent.element.off( "mouseup" );
        // 					jQuery( ".portal", this.parent.element ).off( "mouseup", this._mouseUpAnchorProxy );
        // 					this.endPortal = this._curTarget;
        // 					this.startPortal.addLink( this );
        //                     this.endPortal.addLink(this);

        //                     this._endBehaviour = this.endPortal.behaviour;
        //                     this._startBehaviour = this.startPortal.behaviour;

        // 					this.element.css( "pointer-events", "" );

        // 					// Notify of change
        //                     this.parent.emit( new CanvasEvent( CanvasEvents.MODIFIED, <Canvas>this.parent ) );
        // 				}

        // 				this._curTarget.element.css( "cursor", "" );
        // 			}
        // 			else
        // 				this.dispose();
        // 		}
        // 	}
        // 	else {
        // 		this.dispose();
        // 	}

        // 	this._curTarget = null;
        // }

        // /**
        // * When the link properties are edited
        // */
        // onEdit(type: string, event: EditEvent, sender?: EventDispatcher) {
        //     this.draw();
        // }

        /**
		* Gets the properties of this link
        * @returns {EditableSet}
		*/
        get properties(): EditableSet { return this._properties; }

		/**
		* Cleanup the link
		*/
        dispose(): void {
            // if ( this.startPortal && this.startPortal instanceof Portal )
            // 	this.startPortal.removeLink( this );
            // if ( this.endPortal && this.endPortal instanceof Portal )
            // 	this.endPortal.removeLink( this );

            // // Unbind
            // this.off("edited", this.onEdit, this);
            // this.parent.element.off( "mousemove", this._mouseMoveProxy );
            // this.parent.element.off( "mouseup" );
            // jQuery( ".portal", this.parent.element ).off( "mouseup", this._mouseUpAnchorProxy );
            // this.element.off();

            // // Nullify
            // this.startPortal = null;
            // this.endPortal = null;
            // this._mouseMoveProxy = null;
            // this._mouseUpProxy = null;
            // this._mouseUpAnchorProxy = null;
            // this._prevPortal = null;
            // this._canvas = null;
            // this._graphics = null;
            // this._linePoints = null;
            // this._curTarget = null;
            // this._properties = null;
            // this._endBehaviour = null;
            // this._startBehaviour = null;

            //Call parent
            super.dispose();
        }
    }
}