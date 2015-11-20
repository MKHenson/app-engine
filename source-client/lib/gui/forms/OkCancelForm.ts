module Animate
{
	export class OkCancelFormEvents extends ENUM
	{
		constructor(v: string) { super(v); }

		static CONFIRM: OkCancelFormEvents = new OkCancelFormEvents("ok_cancel_confirm");
	}

	export class OkCancelFormEvent extends Event
	{
		public text: string;
		public cancel: boolean;

		constructor(eventName: OkCancelFormEvents, text: string )
		{
			super(eventName, text);
			this.text = text;
			this.cancel = false;
		}
	}

	/**
	* A simple form which holds a heading, content and OK / Cancel buttons.
	*/
	export class OkCancelForm extends Window
	{
		public okCancelContent: Component;
		private mButtonContainer: Component;
		private mOk: Button;
		private mCancel: Button;
		private keyProxy: any;

		/**
		* @param {number} width The width of the form
		* @param {number} height The height of the form
		* @param {boolean} autoCenter Should this window center itself on a resize event
		* @param {boolean} controlBox Does this window have a draggable title bar and close button
		* @param {string} title The text for window heading. Only applicable if we are using a control box.
		*/
		constructor( width: number = 400, height : number = 400, autoCenter : boolean = true, controlBox : boolean = false, title : string = "", hideCancel : boolean = false )
		{
			// Call super-class constructor
			super( width, height, autoCenter, controlBox, title );
			this.element.addClass( "curve-med" );

			this.element.css( "height", "" );

			//this.heading = new Label( this.content, "OkCancelForm" );
			this.okCancelContent = new Component( "<div class='content'></div>", this.content );
			this.mButtonContainer = new Component( "<div class='button-container'></div>", this.content );
			this.mOk = new Button( "Ok", this.mButtonContainer );
			this.mCancel = new Button( "Cancel", this.mButtonContainer );

			//Set button height and width
			this.mOk.css( { width: "70px", height: "30px", "margin-right": "3px" });
			this.mCancel.css( { width: "70px", height: "30px" });

			if ( hideCancel )
				this.mCancel.element.hide();

			this.mOk.element.on( "click", this.OnButtonClick.bind( this ) );
			this.mCancel.element.on( "click", this.OnButtonClick.bind( this ) );

			this.keyProxy = this.onKeyDown.bind( this );
		}

		/**
		* When we click on the close button
		* @param {any} e The jQuery event object
		*/
		onCloseClicked( e )
		{
			var event: OkCancelFormEvent = new OkCancelFormEvent( OkCancelFormEvents.CONFIRM, "Cancel" );
			this.emit( event );
			if ( event.cancel === false )
				this.hide();
		}

		/**
		* Called when we click one of the buttons. This will dispatch the event OkCancelForm.CONFIRM
		* and pass the text either for the ok or cancel buttons.
		* @param {any} e The jQuery event
		*/
		OnButtonClick( e )
		{
			var event: OkCancelFormEvent = new OkCancelFormEvent( OkCancelFormEvents.CONFIRM, jQuery( e.target ).text() )
			this.emit( event );
			if ( event.cancel === false )
				this.hide();
		}

		/**
		* Hides the window
		*/
		hide()
		{
			super.hide();

			jQuery( "body" ).off( "keydown", this.keyProxy );
		}

		/**
		* This function is used to cleanup the object before its removed from memory.
		*/
		dispose()
		{
			this.mOk.element.off();
			this.mCancel.element.off();
			jQuery( "body" ).off( "keydown", this.keyProxy );

			this.content = null;
			this.mButtonContainer = null;
			this.mOk = null;
			this.mCancel = null;
			this.keyProxy = null;
			this.okCancelContent = null;

			//Call super
			super.dispose();
		}

		/**
		* Shows the window by adding it to a parent.
		* @param {Component} parent The parent Component we are adding this window to
		* @param {number} x The x coordinate of the window
		* @param {number} y The y coordinate of the window
		* @param {boolean} isModal Does this window block all other user operations?
		* @param {boolean} isPopup If the window is popup it will close whenever anything outside the window is clicked
		*/
		show( parent: Component = null, x: number = NaN, y: number = NaN, isModal = true, isPopup = false )
		{
			//var x = jQuery( "body" ).width() / 2 - this.element.width() / 2;
			//var y = jQuery( "body" ).height() / 2 - this.element.height() / 2;

			//if ( y + this.element.height() > jQuery( "body" ).height() )
			//	y = jQuery( "body" ).height() - this.element.height();
			//if ( x + this.element.width() > jQuery( "body" ).width() )
			//	x = jQuery( "body" ).width() - this.element.width();

			super.show( null, x, y, true, false );

			jQuery( "body" ).on( "keydown", this.keyProxy );

			this.onWindowResized( null );
		}

		/**
		* Catch the key down events.
		* @param {any} e The jQuery event object
		*/
		onKeyDown( e )
		{
			//If delete pressed
			if ( e.keyCode == 13 )
				this.mOk.element.trigger( "click" );
		}
	}
}