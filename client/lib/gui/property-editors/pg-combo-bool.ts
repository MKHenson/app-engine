module Animate
{
	/**
	* This represents a combo property for booleans that the user can select from a list.
	*/
    export class PGComboBool extends PropertyGridEditor
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
            if (prop instanceof PropBool)
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
            var p = <PropBool>prop;

			// Create HTML
            var editor: JQuery = jQuery(`<div class='property-grid-label'>${p.name}</div><div class='property-grid-value'><select class='prop-combo'></select></div><div class='fix'></div>`);
			var selector: JQuery = jQuery( "select", editor );

            // Add to DOM
            container.element.append(editor);

            // Boolean
            selector.append(`<option value='true' ${(prop.getVal() ? "selected='selected'" : "")}>True</option>`);
            selector.append(`<option value='false' ${(!prop.getVal() ? "selected='selected'" : "")}>False</option>` );

			var that = this;

			//Functions to deal with user interactions with JQuery
            var onSelect = function (e: JQueryEventObject  )
			{
                var val = selector.val();
                prop.setVal( (val == "true" ? true : false ) );
			};

			// Add listeners
			selector.on( "change", onSelect );

			// Finall return editor as HTML to be added to the page
			return editor;
		}
	}
}