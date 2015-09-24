module Animate
{
	/** 
	* A window to show a blocking window with a message to the user.
	*/
	export class MessageBox extends Window
	{
        private static _singleton: MessageBox;

        private $message: string;
        private $buttons: Array<string>;
        private _handle: JQuery;
		private _callback: ( text : string ) => void;
		private _context: any;

		constructor()
		{
            super(400, 200, true, false, null);

            this.$message = "";
            this.$buttons = [];
            this._handle = Compiler.build(jQuery("#en-message-box").remove(), this);
            this.content.element.append(this._handle);
            this.element.addClass("message-box");
            this.element.css({ "width": "", "height":"" });

			//Hook events
			jQuery( window ).on( 'resize', this.onResize.bind( this ) );
		}

		/**
		* Hide the window when ok is clicked.
		* @param {any} e The jQuery event object
		*/
        onButtonClick(e: MouseEvent, button: string)
		{
			this.hide();
			if ( this._callback )
                this._callback.call(this._context ? this._context : this, button );
		}

		/**
		* When the window resizes we make sure the component is centered
		* @param {any} e The jQuery event object
		*/
		onResize( e )
		{
			if ( this.visible )
                this.center();
		}

		/**
		* Static function to show the message box 
		* @param {string} caption The caption of the window
		* @param {Array<string>} buttons An array of strings which act as the forms buttons
		* @param { ( text : string ) => void} callback A function to call when a button is clicked 
		* @param {any} context The function context (ie the caller object)
		*/
		public static show( caption: string, buttons?: Array<string>, callback?: ( text: string ) => void, context? : any )
		{
            var box: MessageBox = MessageBox.getSingleton();
            
			//box.mCaption.text = caption;
			box._callback = callback;
			box._context = context;

			//If no buttons specified - then add one
			if ( !buttons )
                buttons = ["Ok"];

            box.$message = caption;
            box.$buttons = buttons;
            Compiler.digest(box._handle, box);

            //Center and show the box
            box.show(Application.bodyComponent, NaN, NaN, true);
		}

		/**
		* Gets the message box singleton
		* @returns {MessageBox}
		*/
		static getSingleton() : MessageBox
		{
            if (!MessageBox._singleton)
                MessageBox._singleton = new MessageBox();

			return MessageBox._singleton;
		}
	}
}