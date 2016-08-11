module Animate {

	export enum SplitOrientation {
		VERTICAL,
		HORIZONTAL
	}

	export interface ISplitPanelProps {
		left: JSX.Element;
		right: JSX.Element;
		orientation?: SplitOrientation;
		ratio? : number;
		dividerSize? : number;
	}

	export interface ISplitPanelState {
		ratio?: number;
		mPercent?: number;
		dragging?: boolean;
	}

	/**
	* A Component that holds 2 sub Components and a splitter to split between them.
	*/
	export class SplitPanel extends React.Component<ISplitPanelProps, ISplitPanelState> {

		static defaultProps : ISplitPanelProps = {
			orientation : SplitOrientation.VERTICAL,
			ratio : 0.5,
			dividerSize : 6,
			left: null,
			right: null
		}

		// private offsetLeft : number;
		// private offsetTop : number;
		private mPercent : number;
		private mDividerSize : number;
		private mPanel1 : Component;
		private mPanel2 : Component;
		private mDivider : Component;
		private mDividerDragging : Component;
		private mOrientation: SplitOrientation;
		private mPanelOverlay1: JQuery;
		private mPanelOverlay2: JQuery;

		//private mMouseDownProxy: any;
		private mMouseUpProxy: any;
		private mMouseMoveProxy: any;

		/**
		* @param {Component} parent The parent to which this component is attached
		* @param {SplitOrientation} orientation The orientation of the slitter. It can be either SplitOrientation.VERTICAL or SplitOrientation.HORIZONTAL
		* @param {number} ratio The ratio of how far up or down, top or bottom the splitter will be. This is between 0 and 1.
		* @param {number} dividerSize The size of the split divider.
		*/
		constructor( props : ISplitPanelProps ) {
			super( props );

			// this.offsetLeft = 0;
			// this.offsetTop = 0;

			//Private vars
			//this.mPercent = ratio;
			//this.mDividerSize = dividerSize;
			//this.mPanel1 = <Component>this.addChild( "<div class='panel1'></div>" );
            //this.mDivider = <Component>this.addChild( "<div class='split-panel-divider background-dark' style='width:" + this.mDividerSize + "px;'></div>" );
			//this.mDividerDragging = new Component( "<div class='split-panel-divider-dragging' style='width:" + this.mDividerSize + "px;'></div>" );
			//this.mPanel2 = <Component>this.addChild( "<div class='panel2'></div>" );
			//this.addChild( "<div class='fix'></div>" );

			//this.orientation = orientation;

			// this.mPanelOverlay1 = jQuery( "<div class='panel-input'></div>" );
			// this.mPanelOverlay2 = jQuery( "<div class='panel-input'></div>" );

			// Proxies
			this.mMouseUpProxy = this.onStageMouseUp.bind( this );
			this.mMouseMoveProxy = this.onStageMouseMove.bind( this );
			this.state = {
				mPercent: props.ratio,
				dragging: false,
				ratio: props.ratio
			};
		}

		/**
         * Called when the props are updated
         */
        componentWillReceiveProps(nextProps: ISplitPanelProps) {
            this.setState({
                ratio: ( nextProps.ratio !== this.props.ratio ? nextProps.ratio : this.state.ratio )
            });
        }

		/**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element {
			let orientation = this.props.orientation;
			let panel1Style;
			let panel2Style;
			let dividerStyle;
			let dividerSize = this.props.dividerSize;
			let dividerSizeHalf = dividerSize * 0.5;
			let ratio = this.state.ratio;

			// Calculate ratios etc...
			if ( orientation == SplitOrientation.VERTICAL ) {
				panel1Style = {
						width: `calc(${ratio * 100}% - ${dividerSizeHalf}px)`,
						height: '100%'
					};
				dividerStyle = {
						width: dividerSize + 'px',
						height: '100%'
					};
				panel2Style = {
						width: `calc(${( 1 - ratio ) * 100}% - ${dividerSizeHalf}px)`,
						height: '100%'
					};
			}
			else {
				panel1Style = {
						height: `calc(${ratio * 100}% - ${dividerSizeHalf}px)`,
						width: '100%'
					};
				dividerStyle = {
						height: dividerSize + 'px',
						width: '100%'
					};
				panel2Style = {
						height: `calc(${ (1 - ratio) * 100}% - ${dividerSizeHalf}px)`,
						width: '100%'
					};
			}

			return <div className={'split-panel ' + (orientation == SplitOrientation.VERTICAL ? 'vertical' : 'horizontal')} >
				<div className='panel1' style={panel1Style}>
					{ this.state.dragging ? <div className='panel-input'></div> : null }
					{ this.props.left }
				</div>
				<div ref="divider" onMouseDown={(e)=>{ this.onDividerMouseDown(e) }}
					style={dividerStyle}
					className='split-panel-divider background-dark' />
				<div
					ref="scrubber"
					className='split-panel-divider-dragging'
					style={{ display: (!this.state.dragging ? 'none' : '')
				}}/>
				<div className='panel2' style={panel2Style}>
					{ this.state.dragging ? <div className='panel-input'></div> : null }
					{ this.props.right }
				</div>
				<div className='fix'></div>
			</div>
		}

		/**
		 * This function is called when the mouse is down on the divider
		 * @param {React.MouseEvent} e
		 */
		onDividerMouseDown(e: React.MouseEvent) {

			e.preventDefault();
			this.setState({dragging: true});
			let ratio = this.state.ratio;
			let orientation = this.props.orientation;
			let divider = this.refs['divider'] as HTMLElement;
			let scrubber = this.refs['scrubber'] as HTMLElement;
			let dividerSizeHalf = this.props.dividerSize * 0.5;

			scrubber.style.height = ( orientation == SplitOrientation.VERTICAL ? '100%' : this.props.dividerSize + 'px' );
			scrubber.style.width = ( orientation == SplitOrientation.VERTICAL ? this.props.dividerSize + 'px' : '100%' )	;
			scrubber.style.left = ( orientation == SplitOrientation.VERTICAL ? `calc(${ratio * 100}% - ${dividerSizeHalf}px)` : `0` );
			scrubber.style.top = ( orientation == SplitOrientation.VERTICAL ? `0`: `calc(${ratio * 100}% - ${dividerSizeHalf}px)` );

			document.body.addEventListener('mouseup', this.mMouseUpProxy);
			document.body.addEventListener('mousemove', this.mMouseMoveProxy);

			// //reset orientation
			// this.orientation = this.orientation;

			// //Add the dragger and move it to the same place.
			// this.addChild( this.mDividerDragging );
			// this.mDividerDragging.element.css( {
			// 	width: this.mDivider.element.css( "width" ),
			// 	height: this.mDivider.element.css( "height" ),
			// 	left: this.mDivider.element.css( "left" ),
			// 	top: this.mDivider.element.css( "top" )
			// });

			// this.mPanel1.element.prepend( this.mPanelOverlay1 );
			// this.mPanel2.element.prepend( this.mPanelOverlay2 );



			// e.preventDefault();
		}

		/**
		* This function is called when the mouse is up from the body of stage.
		* @param {any} e The jQuery event object
		*/
		onStageMouseUp( e ) : void {

			document.body.removeEventListener('mouseup', this.mMouseUpProxy);
			document.body.removeEventListener('mousemove', this.mMouseMoveProxy);
			this.setState({dragging: false});

			//Remove the dragger.
			// this.removeChild( this.mDividerDragging );
			// //jQuery("body").disableSelection( false );
			let orientation = this.props.orientation;
			let scrubber = this.refs['scrubber'] as HTMLElement;


			//Get the new ratio
			var left = parseFloat( scrubber.style.left.split( "px" )[0] );
			var top = parseFloat( scrubber.style.top.split( "px" )[0] );
			var w = scrubber.parentElement.clientWidth;
			var h = scrubber.parentElement.clientHeight;
			var ratio = 0;

			if ( orientation == SplitOrientation.VERTICAL )
				ratio = left / w;
			else
				ratio = top / h;

			this.setState({ ratio : ratio });

			// var prevOverdlow1 = this.mPanel1.element.css( "overflow" );
			// var prevOverdlow2 = this.mPanel2.element.css( "overflow" );
			// this.mPanel1.element.css( "overflow", "hidden" );
			// this.mPanel2.element.css( "overflow", "hidden" );

			// var children = this.mPanel1.children;
			// for ( var i = 0; i < children.length; i++ )
			// 	children[i].update();

			// var children = this.mPanel2.children;
			// for ( var i = 0; i < children.length; i++ )
			// 	children[i].update();

			// this.mPanel1.element.css( "overflow", prevOverdlow1 );
			// this.mPanel2.element.css( "overflow", prevOverdlow2 );
		}

		// /**
		// * Call this function to update the panel.
		// */
		// update() {
		// 	//Call super
		// 	super.update( false );

		// 	var prevOverdlow1 = this.mPanel1.element.css( "overflow" );
		// 	var prevOverdlow2 = this.mPanel2.element.css( "overflow" );
		// 	this.mPanel1.element.css( "overflow", "hidden" );
		// 	this.mPanel2.element.css( "overflow", "hidden" );

		// 	//Reset orientation
		// 	this.orientation = this.orientation;

		// 	var children = this.mPanel1.children;
		// 	if ( children.length > 0 )
		// 		for ( var i = 0; i < children.length; i++ )
		// 			children[i].update();

		// 	children = this.mPanel2.children;
		// 	if ( children.length > 0 ) {
		// 		for ( var i = 0; i < children.length; i++ )
		// 			children[i].update();
		// 	}

		// 	this.mPanel1.element.css( "overflow", prevOverdlow1 );
		// 	this.mPanel2.element.css( "overflow", prevOverdlow2 );


		// }

		/**
		* This function is called when the mouse is up from the body of stage.
		* @param {any} e The jQuery event object
		*/
		onStageMouseMove( e : MouseEvent ) {
			let orientation = this.props.orientation;
			let scrubber = this.refs['scrubber'] as HTMLElement;

			scrubber.style.left = ( orientation == SplitOrientation.VERTICAL ? `${ e.clientX - scrubber.parentElement.offsetLeft }px` : `0` );
			scrubber.style.top = ( orientation == SplitOrientation.HORIZONTAL ? `${e.clientY - scrubber.parentElement.offsetTop}px` : `0` );

			// var position = this.mDividerDragging.parent.element.offset();

			// //Remove the dragger.
			// if ( this.mOrientation == SplitOrientation.VERTICAL ) {
			// 	var w = this.element.width();
			// 	var dist = e.clientX - position.left;

			// 	if ( dist < this.mDividerSize )
			// 		dist = this.mDividerSize;
			// 	if ( dist > w - this.mDividerSize )
			// 		dist = w - this.mDividerSize;

			// 	this.mDividerDragging.element.css( {
			// 		left: dist + "px"
			// 	});
			// }
			// else {
			// 	var h = this.element.height();
			// 	var dist = e.clientY - position.top;

			// 	if ( dist < this.mDividerSize )
			// 		dist = this.mDividerSize;
			// 	if ( dist > h - this.mDividerSize )
			// 		dist = h - this.mDividerSize;

			// 	this.mDividerDragging.element.css( {
			// 		top: dist + "px"
			// 	});
			// }

			// e.preventDefault();
			// return false;
		}

		/**
		 * Call this function to get the ratio of the panel. Values are from 0 to 1.
		 * @returns {number}
		 */
		get ratio() : number {
			return this.state.mPercent;
		}

		/**
		 * Call this function to set the ratio of the panel. Values are from 0 to 1.
		 * @param {number} val The ratio from 0 to 1 of where the divider should be
		 */
		set ratio( val: number ) {
			if ( val > 1 )
				val = 1;
			else if ( val < 0 )
				val = 0;

			this.setState({ mPercent : val });
		}


		// /**
		// * Use this function to change the split panel from horizontal to vertcal orientation.
		// * @param val The orientation of the split. This can be either SplitPanel.VERTICAL or SplitPanel.HORIZONTAL
		// */
		// set orientation( val: SplitOrientation ) {
		// 	if ( val == SplitOrientation.VERTICAL || val == SplitOrientation.HORIZONTAL ) {
		// 		this.mOrientation = val;

		// 		var w = this.element.width();
		// 		var h = this.element.height();

		// 		if ( val == SplitOrientation.VERTICAL ) {
		// 			this.mPanel1.element.css({
		// 					width: this.mPercent * w - this.mDividerSize * 0.5,
		// 					top: "0px",
		// 					left: "0px",
		// 					height: h + "px"
		// 				});
		// 			this.mDivider.element.css({
		// 					width: this.mDividerSize + "px",
		// 					left: this.mPanel1.element.width() + "px",
		// 					top: "0px",
		// 					height: h + "px"
		// 				});
		// 			this.mPanel2.element.css({
		// 					width: ( 1 - this.mPercent ) * w - ( this.mDividerSize * 0.5 ),
		// 					left: ( ( this.mPercent * w ) + ( this.mDividerSize / 2 ) ) + "px",
		// 					top: "0px",
		// 					height: h + "px"
		// 				});
		// 		}
		// 		else {
		// 			this.mPanel1.element.css({
		// 					height: this.mPercent * h - this.mDividerSize * 0.5,
		// 					left: "0px",
		// 					top: "0px",
		// 					width: w + "px"
		// 				});
		// 			this.mDivider.element.css({
		// 					height: this.mDividerSize + "px",
		// 					top: this.mPanel1.element.height() + "px",
		// 					left: "0px",
		// 					width: w + "px"
		// 				});
		// 			this.mPanel2.element.css({
		// 					height: ( 1 - this.mPercent ) * h - ( this.mDividerSize * 0.5 ),
		// 					top: ( ( this.mPercent * h ) + ( this.mDividerSize / 2 ) ) + "px",
		// 					left: "px",
		// 					width: w + "px"
		// 				});
		// 		}
		// 	}
		// }

		// /**
		// * gets the orientation of this split panel
		// */
		// get orientation(): SplitOrientation {
		// 	return this.mOrientation;
		// }

		/**
		* Gets the top panel.
		*/
		get top() { return this.mPanel1; }

		/**
		* Gets the bottom panel.
		*/
		get bottom() { return this.mPanel2; }

		/**
		* Gets the left panel.
		*/
		get left() { return this.mPanel1; }

		/**
		* Gets the right panel.
		*/
		get right() { return this.mPanel2; }

		// /**
		// * This will cleanup the component.
		// */
		// dispose(): void {
		// 	this.mOrientation = null;
		// 	this.mDivider.element.off( 'mousedown', this.mMouseDownProxy );
		// 	jQuery( "body" ).off( 'mouseup', this.mMouseUpProxy );
		// 	jQuery( "body" ).off( 'mousemove', this.mMouseMoveProxy );
		// 	this.mMouseDownProxy = null;

		// 	//Call super
		// 	super.dispose();
		// }
	}
}