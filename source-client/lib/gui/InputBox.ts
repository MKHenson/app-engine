module Animate
{
	/**
	* A simple {Component} that you can use to get user input by using the text function
	*/
	export class InputBox extends Component
	{
		private _limit: number;
		private _textfield: Component;

		/**
		* @param {Component} parent The parent <Component> to which we add this box
		* @param {string} text The text of the input box
		* @param {boolean} isTextArea True if this is a text area (for larger text)
		* @param {boolean} isPassword True if this needs to be obscured for passwords
		* @param {string} html
		*/
		constructor( parent: Component, text: string, isTextArea: boolean = false, isPassword: boolean = false, html: string = "<div class='input-box'></div>" )
		{
			// Call super-class constructor
			super( html, parent );

			if ( isTextArea )
				this._textfield = <Component>this.addChild( "<textarea></textarea>" );
			else if ( isPassword )
				this._textfield = <Component>this.addChild( "<input type='password' />" );
			else
				this._textfield = <Component>this.addChild( "<input type='text' />" );

			this.text = text;
			return this._limit = null;
		}

		/**
		* Called when the text property is changed. This function will only fire if a limit has been
		* set with the limitCharacters(val) function.
		* @param {any} e
		*/
		onTextChange( e : any )
		{
			var text = this._textfield.element.val();
			if ( text.length > this._limit )
				this._textfield.element.val( text.substring( 0, this._limit ) );
		}

		/**
		* Use this function to set a limit on how many characters can be entered in this input
		* @param {number} val The integer limit of characters
		*/
		set limitCharacters( val: number)
		{
			this._limit = val;
			if ( isNaN( this._limit ) || this._limit == 0 || this._limit == null )
				this._textfield.element.off();
			else
				this._textfield.element.on( "input", jQuery.proxy( this.onTextChange, this ) );
		}

		/**
		* Use this function to get a limit on how many characters can be entered in this input
		* @returns {number} val The integer limit of characters
		*/
		get limitCharacters(): number
		{
			return this._limit;
		}

		/**
		* @param {string} val
		*/
		set text( val : string )
		{
			this._textfield.element.val( val );
		}

		/**
		* @returns {string}
		*/
		get text() : string
		{
			return this._textfield.element.val();
		}

		/**
		* Highlights and focuses the text of this input
		* @param {boolean} focusInView If set to true the input will be scrolled to as well as selected. This is not
		* always desireable because the input  might be off screen on purpose.
		*/
		focus( focusInView : boolean = false ): void
		{
			if ( focusInView )
				this._textfield.element.focus();

			this._textfield.element.select();
			Application.getInstance().focusObj = this;
		}

		/**
		* This will cleanup the component.
		*/
		dispose() : void
		{
			this._textfield = null;

			//Call super
			super.dispose();
		}

		get textfield(): Component { return this._textfield; }
	}
}