module Animate
{
	/**
	* This represents a combo property for enums that the user can select from a list.
	*/
	export class PropComboEnum extends PropertyGridEditor
	{		
		constructor( grid: PropertyGrid )
		{
			super( grid );
        }

        /**
        * Checks a property to see if it can edit it
        * @param {Prop<any>} prop The property being edited
        * @returns {boolean}
        */
        canEdit(prop: Prop<any>): boolean
        {
            if (prop instanceof PropEnum)
                return true;
            else
                return false;
        }

		/**
		* Given a property, the grid editor must produce HTML that can be used to edit the property
		* @param {Prop<any>} prop The property being edited
		* @param {Component} container The container acting as this editors parent
		*/
        edit(prop: Prop<any>, container: Component)
        {
            var p = <PropEnum>prop;

			// Create HTML	
            var editor: JQuery = jQuery(`<div class='property-grid-label'>${p.name}</div><div class='property-grid-value'><select class='prop-combo'></select></div><div class='fix'></div>` );
			var selector: JQuery = jQuery( "select", editor );
            
            // Add to DOM
            container.element.append(editor);

            // Enums
            var selectedValue: string = p.getVal();
			var vars = p.choices;
			vars = vars.sort();

			var len: number = vars.length;
			for ( var i: number = 0; i < len; i++ )
                selector.append(`<option value='${vars[i]}' ${( selectedValue == vars[i] ? "selected='selected'" : "" )}>${vars[i]}</option>` );
		
			var that = this;

			// Functions to deal with user interactions with JQuery
            var onSelect = function (e: JQueryEventObject  ) 
			{
                var val = selector.val();
                p.setVal(val);
			};
			
			// Add listeners
			selector.on( "change", onSelect );
		}
	}
}