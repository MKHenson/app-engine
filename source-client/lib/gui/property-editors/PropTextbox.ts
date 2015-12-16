module Animate
{
	/**
	* A property editor which edits objects and strings
	*/
	export class PropTextbox extends PropertyGridEditor
	{		
		constructor( grid: PropertyGrid )
		{
			super( grid );
		}

		/**
		* Given a property, the grid editor must produce HTML that can be used to edit the property
		* @param {Prop<any>} prop The property being edited
		* @param {Component} container The container acting as this editors parent
		*/
        edit(prop: Prop<any>, container: Component)
        {
            if (prop instanceof PropText == false)
                return null;

            var p = <PropText>prop;

            // Create HTML
            var editor: JQuery = jQuery(`<div class='property-grid-label'>${p.name}</div><div class='property-grid-value'><input type='text' class='PropTextbox' value = '${p.getVal().toString()}' /></div><div class='fix'></div>`);
            var that = this;

            // Add to DOM
            container.element.append(editor);

			//Function to deal with user interactions with JQuery
            var valueEdited = function (e: JQueryEventObject ) 
            {
                p.setVal( jQuery("input", editor).val() );
			};

            // Add listeners
            jQuery("input", editor).val(p.getVal());
            jQuery("input", editor).on("keyup", valueEdited);
		}
	}
}