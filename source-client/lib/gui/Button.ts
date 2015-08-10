module Animate
{
	/**
	* A simple button class
	*/
	export class Button extends Label
	{
		/**
		* @param {string} The button text
		* @param {Component} parent The parent of the button
		* @param {number} width The width of the button (optional)
		* @param {number} height The height of the button (optional) 
		*/
		constructor( text: string, parent: Component, html: string = "<div class='button reg-gradient curve-small'></div>", width: number = 70, height: number = 30 )
		{
			super( text, parent, html);

			var h = this.element.height();
			var th = this.textfield.element.height();
			this.textfield.element.css( "top", h / 2 - th / 2 );
			//this.element.disableSelection( true );
			this.element.css( { width: width + "px", height: height + "px", margin: "3px" });
		}

		/**
		* A shortcut for jQuery's css property. 
		*/
		css( propertyName: any, value?: any ): any
		{
			//Call super
			var toRet = this.element.css( propertyName, value );

			var h = this.element.height();
			var th = this.textHeight;

			this.textfield.element.css( "top", h / 2 - th / 2 );

			return toRet;
		}


		/**This will cleanup the component.*/
		dispose()
		{
			//Call super
			Label.prototype.dispose.call( this );

			this.textfield = null;
		}

		/**
		* Get or Set if the component is selected. When set to true a css class of 'selected' is added to the {Component}
		*/
		get selected(): boolean
		{
			if ( this.element.hasClass( "button-selected" ) )
				return true;
			else
				return false;
		}

		/**
		* Get or Set if the component is selected. When set to true a css class of 'selected' is added to the {Component}
		*/
		set selected( val: boolean )
		{
			if ( val )
				this.element.addClass( "button-selected" );
			else
				this.element.removeClass( "button-selected" );
		}
	}
}