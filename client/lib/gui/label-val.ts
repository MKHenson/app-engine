module Animate
{
	/**
	* A small component that represents a text - value pair
	*/
	export class LabelVal extends Component
	{
		private label: Label;
		private _val: Component;

		/**
		* @param {Component} parent The parent component
		* @param {string} text The label text
		* @param {Component} val The component we are pairing with the label
		* @param {any} css An optional css object to apply to the val component
		*/
		constructor( parent: Component, text: string, val : Component, css : any = null )
		{
			// Call super-class constructor
			super( "<div class='label-val'></div>", parent );

			this.label = new Label( text, this );
			this._val = val;
			this.element.append( this._val.element );
			this.element.append( "<div class='fix'></div>" );

			if ( css )
				this._val.element.css( css );
		}

		/**This will cleanup the component.*/
		dispose()
		{
			this.label.dispose();
			this.val.dispose();

			this.label = null;
			this._val = null;

			//Call super
			super.dispose();
		}

		get val(): Component { return this._val; }

		/**Gets the label text*/
		get text(): string { return this.label.text; }
	}
}