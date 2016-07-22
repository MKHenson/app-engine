module Animate
{
	/**
	*  Use this tool bar button to pick a colour.
	*/
	export class ToolbarColorPicker extends Component
	{
		private numberInput : Component;
		private picker : any;

		constructor( parent: Component, text: string, color: string )
		{
            super( "<div class='toolbar-button tooltip'></div>", parent );

			this.numberInput = <Component>this.addChild( "<input class='toolbar-color' value='#ff0000'></input>" );
            this.addChild( "<div class='tooltip-text tooltip-text-bg'>" + text + "</div>" );

			this.picker = new jscolor.color( document.getElementById( this.numberInput.id ) )
			this.picker.fromString( color );
		}

		/**
		* Gets or sets the colour of the toolbar button
		*/
		get color() : number
		{
			return parseInt( this.numberInput.element.val(), 16 );
		}

		/**
		* Gets or sets the colour of the toolbar button
		*/
		set color( color : number )
		{
			this.picker.fromString( color );
		}

		/**
		* Disposes of and cleans up this button
		*/
		dispose() : void
		{
			this.picker = null;
			this.numberInput = null;
		}
	}
}