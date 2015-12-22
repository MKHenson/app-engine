module Animate
{
	export class WindowEvents extends ENUM
	{
		constructor(v: string) { super(v); }

		static HIDDEN: WindowEvents = new WindowEvents("window_hidden");
		static SHOWN: WindowEvents = new WindowEvents("window_shown");
	}
    
	/**
	* This class is the base class for all windows in Animate
	*/
	export class Window extends Component
	{
		private _autoCenter: boolean;
		private _controlBox: boolean;
		private _header: Component;
		private _headerText: Component;
		private _headerCloseBut: Component;
		private _content: Component;
		private _modalBackdrop: JQuery;
		private _isVisible: boolean;
		private _externalClickProxy: any;
		private _closeProxy: any;
		private _resizeProxy: any;

		/**
		* @param {number} width The width of the window in pixels
		* @param {number} height The height of the window in pixels
		* @param {boolean} autoCenter Should this window center itself on a resize event
		* @param {boolean} controlBox Does this window have a draggable title bar and close button
		* @param {string} title The text for window heading.Only applicable if we are using a control box.
		*/
		constructor( width: number, height: number, autoCenter: boolean = true, controlBox: boolean = false, title :string = "" )
		{
			// Call super-class constructor
            super(`<div class='window shadow-med background' style='width:${width}px; height:${height}px;'></div>`, null );

			this._autoCenter = autoCenter;
			this._controlBox = controlBox;

			//If we have a control box we add the title and close button
			if ( this._controlBox )
			{
                this._header = <Component>this.addChild( "<div class='window-control-box background-haze'></div>" );
				this._headerText = <Component>this._header.addChild( "<div class='window-header'>" + title + "</div>" );
                this._headerCloseBut = <Component>this._header.addChild( "<div class='close-but black-tint'>X</div>" );
				this.addChild( "<div class='fix'></div>" );
				this._content = <Component>this.addChild( "<div class='window-content'></div>" );
			}
			else
                this._content = <Component>this.addChild( "<div class='window-content no-control'></div>" );

            this._modalBackdrop = jQuery( "<div class='modal-backdrop dark-modal'></div>" );

			//Proxies	
			this._externalClickProxy = this.onStageClick.bind( this );
			this._isVisible = false;

			//Hook the resize event
			if ( this._autoCenter )
			{
				this._resizeProxy = this.onWindowResized.bind( this );
				jQuery( window ).on( 'resize', this._resizeProxy );
			}

			if ( this._controlBox )
			{
				this._closeProxy = this.onCloseClicked.bind( this );
				this._headerCloseBut.element.on( 'click', this._closeProxy );
			}

			this._modalBackdrop.on( 'click', this.onModalClicked.bind( this ) );
		}

		/**
		* When we click on the close button
		* @param {any} e The jQuery event object
		*/
		onCloseClicked( e )
		{
			this.hide();
		}


		/**
		* When the stage move event is called
		* @param {any} e The jQuery event object
		*/
		onStageMove( e )
		{
			this.element.css( { left: ( e.pageX - e.offsetX ) + "px", top: ( e.pageY - e.offsetY ) + "px" });
		}

		/**
		* Removes the window and modal from the DOM.
		*/
		hide()
		{
			if ( this._isVisible == false )
				return;

			this._isVisible = false;
			jQuery( "body" ).off( "click", this._externalClickProxy );
			this._modalBackdrop.detach();
			if ( this.element.parent().length != 0 )
				this.element.parent().data( "component" ).removeChild( this );

			if ( this._controlBox )
				this.element.draggable( "destroy" );

			this.emit( new WindowEvent( WindowEvents.HIDDEN, this ) );
		}

		/**
		* Centers the window into the middle of the screen. This only works if the elements are added to the DOM first
		*/
		center()
		{
			this.element.css( {
				left: ( jQuery( "body" ).width() / 2 - this.element.width() / 2 ),
				top: ( jQuery( "body" ).height() / 2 - this.element.height() / 2 )
			});
		}

		/**
		* Shows the window by adding it to a parent.
		* @param {Component} parent The parent Component we are adding this window to
		* @param {number} x The x coordinate of the window
		* @param {number} y The y coordinate of the window
		* @param {boolean} isModal Does this window block all other user operations?
		* @param {boolean} isPopup If the window is popup it will close whenever anything outside the window is clicked
		*/
		show( parent: Component = null, x: number = NaN, y: number = NaN, isModal: boolean = false, isPopup: boolean = false )
		{
			this._isVisible = true;
			parent = (parent === undefined || parent == null ? Application.getInstance() : parent );

			if ( isModal )
			{
				parent.element.append( this._modalBackdrop );
				var bod = jQuery( "body" );
				this._modalBackdrop.css( { width: bod.width() + "px", height: bod.height() + "px" });
			}

			parent.addChild( this );

			if ( isNaN( x ) || x === undefined )
			{
				this.element.css( {
					left: ( jQuery( "body" ).width() / 2 - this.element.width() / 2 ),
					top: ( jQuery( "body" ).height() / 2 - this.element.height() / 2 )
				});
			}
			else
				this.element.css( { left: x + "px", top: y + "px" });


			

			if ( isPopup )
			{
				jQuery( "body" ).off( "click", this._externalClickProxy );
				jQuery( "body" ).on( "click", this._externalClickProxy );
			}

			

			this.emit( new WindowEvent( WindowEvents.SHOWN, this ) );

			if ( this._controlBox )
				this.element.draggable( { handle: ".window-control-box", containment: "parent" });
		}

		/**
		* When we click the modal window we flash the window
		* @param {object} e The jQuery event object
		*/
		onModalClicked( e )
		{
			var prevParent = this.element.parent();
			this.element.detach();
			this.element.addClass( "anim-shadow-focus" );
			prevParent.append( this.element );
		}

		/**
		* Updates the dimensions if autoCenter is true.
		* @param {object} val 
		*/
		onWindowResized( val )
        {
            // Do not update everything if the event is from JQ UI
            if (val && $(val.target).hasClass('ui-resizable'))
                return;

			var bod = jQuery( "body" );
			if ( this._isVisible )
			{
				this._modalBackdrop.css( { width: bod.width() + "px", height: bod.height() + "px" });

				this.element.css( {
					left: ( jQuery( "body" ).width() / 2 - this.element.width() / 2 ),
					top: ( jQuery( "body" ).height() / 2 - this.element.height() / 2 )
				});
			}

		}

		/**
		* Hides the window if its show property is set to true
		* @param {any} e The jQuery event object
		*/
		onStageClick( e )
		{
			var parent = jQuery( e.target ).parent();

			//Make sure the click off of the window
			while ( typeof ( parent ) !== "undefined" && parent.length != 0 )
			{
				var comp = parent.data( "component" );
				if ( comp == this || jQuery( e.target ).is( this._modalBackdrop ) )
					return;

				parent = parent.parent();
			}

			this.hide();
		}

		/** Gets the content component */
		get content(): Component { return this._content; }
		get visible(): boolean { return this._isVisible; }

		get headerText(): string { return this._headerText.element.text(); }
		set headerText( value: string ) { this._headerText.element.text(value); }
		get modalBackdrop() : JQuery { return this._modalBackdrop; }
		
		/**
		* This will cleanup the component.
		*/
		dispose()
		{
			if ( this._closeProxy )
			{
				this._headerCloseBut.element.off( 'click', this._closeProxy );
				this._closeProxy = null;
				//this.element.draggable("destroy");
			}

			this._externalClickProxy = null;
			jQuery( window ).off( 'resize', this._resizeProxy );
			this._modalBackdrop.off();

			this._modalBackdrop.detach();
			this._resizeProxy = null;
			this._modalBackdrop = null;
			this._headerText = null;
			this._headerCloseBut = null;
			this._header = null;

			//Call super
			super.dispose();
		}
	}
}