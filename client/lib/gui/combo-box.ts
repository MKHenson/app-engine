module Animate
{
	/**
	* Use this class to create a drop down box of items.
	*/
	export class ComboBox extends List
	{
		constructor( parent : Component = null )
		{
			super( parent, "<div class='combo-box'></div>", "<select class='combo'></select>" );
		}
	}
}