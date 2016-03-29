module Animate
{
	/**
	* A small holder div that emulates C# style grids. Use the content variable instead of the group directly
	*/
	export class Group extends Component
	{
		private heading: Label;
		public content: Component;

		constructor( text, parent  )
		{
            super( "<div class='group'><div class='group-header background'></div><div class='group-content'></div></div>", parent );

			this.heading = new Label( text, this );
            this.heading.element.addClass("group-header");
            this.heading.element.addClass("background");
			this.content = <Component>this.addChild( "<div class='group-content'></div>" );
		}


		/**
		* Gets or sets the label text
		* @param {string} val The text for this label
		* @returns {string} The text for this label
		*/
		text( val ) { return this.heading.element.text( val ) }

		/**
		* This will cleanup the <Group>.
		*/
		dispose()
		{
			this.heading = null;
			this.content = null;

			//Call super
			super.dispose();
		}
	}
}