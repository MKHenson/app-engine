module Animate
{
	export class MessageBoxEvents extends ENUM
	{
		constructor(v: string) { super(v); }

		static BUTTON_CLICKED: MessageBoxEvents = new MessageBoxEvents("message_box_button_clicked");
	}

	/** 
	* A window to show a blocking window with a message to the user.
	*/
	export class MessageBox extends Window
	{
		private static _singleton: MessageBox;

		private mCaption: Label;
		private buttonsDiv: Component;
		private mButtons: Array<string>;
		private mButtonComps: Array<Component>;
		private mCallback: ( text : string ) => void;
		private mContext: any;

		constructor()
		{
			super( 400, 200, true, false, null );

			if ( MessageBox._singleton != null )
				throw new Error( "The MessageBox class is a singleton. You need to call the MessageBox.getSingleton() function." );

			MessageBox._singleton = this;

			this.element.addClass( "message-box" );

			this.element.css( { height: "" });
			this.mCaption = <Label>this.addChild( new Label("", null) );
			this.element.append( "<div class='fix'></div>" );
			this.buttonsDiv = new Component( "<div class='buttons'></div>", this );

			this.mButtons = null;
			this.mButtonComps = [];
			this.mCallback = null;
			this.mContext = null;

			//Hook events
			jQuery( window ).on( 'resize', this.onResize.bind( this ) );
		}

		/**
		* Hide the window when ok is clicked.
		* @param {any} e The jQuery event object
		*/
		onButtonClick( e )
		{
			this.hide();
			this.dispatchEvent( MessageBoxEvents.BUTTON_CLICKED, jQuery( e.target ).data( "component" ).text );
			if ( this.mCallback )
				this.mCallback.call(this.mContext ? this.mContext : this, jQuery( e.target ).data( "component" ).text );
		}

		/**
		* When the window resizes we make sure the component is centered
		* @param {any} e The jQuery event object
		*/
		onResize( e )
		{
			if ( this.visible )
			{
				this.element.css( {
					left: ( jQuery( "body" ).width() / 2 - this.element.width() / 2 ),
					top: ( jQuery( "body" ).height() / 2 - this.element.height() / 2 )
				});
			}
		}


		/**
		* Static function to show the message box 
		* @param {string} caption The caption of the window
		* @param {Array<string>} buttons An array of strings which act as the forms buttons
		* @param { ( text : string ) => void} callback A function to call when a button is clicked 
		* @param {any} context The function context (ie the caller object)
		*/
		public static show( caption: string, buttons: Array<string>, callback: ( text: string ) => void, context : any )
		{
			var box : MessageBox = MessageBox.getSingleton();
			box.mCaption.text = caption;
			box.mCallback = callback;
			box.mContext = context;

			//Remove previous buttons	
			for ( var i = 0; i < box.mButtonComps.length; i++ )
				box.mButtonComps[i].dispose();

			box.mButtonComps.splice( 0, box.mButtonComps.length );
			box.buttonsDiv.element.empty();

			//If no buttons specified - then add one
			if ( !buttons )
			{
				buttons = new Array();
				buttons.push( "Ok" );
			}

			box.mButtons = buttons;

			//Create all the buttons
			for ( var i = 0; i < box.mButtons.length; i++ )
			{
				var button = new Button( box.mButtons[i], box.buttonsDiv );
				button.element.css( { width: "80px", height: "30px", margin: "5px 5px 5px 0", "float": "left" });
				button.textfield.element.css( { top: "6px" });
				button.element.on( 'click', jQuery.proxy( box.onButtonClick, box ) );
				box.mButtonComps.push( button );
			}

			box.buttonsDiv.element.css( { "width": ( box.mButtons.length * 90 ) + "px", "margin": "0 auto" });


			//Center and show the box
			box.show( Application.getInstance(),
				( jQuery( "body" ).width() / 2 - box.element.width() / 2 ),
				( jQuery( "body" ).height() / 2 - box.element.height() / 2 ), true );
		}

		/**
		* Gets the message box singleton
		* @returns {MessageBox}
		*/
		static getSingleton() : MessageBox
		{
			if ( !MessageBox._singleton )
				new MessageBox();

			return MessageBox._singleton;
		}
	}
}