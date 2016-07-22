module Animate
{
	/**
	* A simple label wrapper. This creates a div that has a textfield sub div. the
	* subdiv is the DOM element that actually contains the text.
	*/
	export class Label extends Component
	{
		private _text: string;
		public textfield: Component;

		constructor( text: string, parent: Component, html: string = "<div class='label'></div>" )
		{
			super( html, parent );
			this._text = text;
			this.textfield = <Component>this.addChild( "<div class='textfield'>" + text + "</div>" );
		}

		/**
		* Gets the text of the label
		*/
		get text(): string { return this._text; }

		/**
		* Sets the text of the label
		*/
		set text( val: string ) { this._text = val; this.textfield.element.html( val ); }

		/**
		* This will cleanup the {Label}
		*/
		dispose() : void
		{
			this.textfield = null;

			//Call super
			super.dispose();
		}

		/**
		* Returns the text height, in pixels, of this label. Use this function sparingly as it adds a clone
		* of the element to the body, measures the text then removes the clone. This is so that we get the text even if
		* the <Component> is not on the DOM
		* @extends <Label>
		* @returns <number>
		*/
		get textHeight() : number
		{
			var clone : JQuery = this.textfield.element.clone();
			clone.css( { width: this.element.width() });
			jQuery( "body" ).append( clone );
			var h : number = clone.height();
			clone.remove();
			return h;
		}
	}
}