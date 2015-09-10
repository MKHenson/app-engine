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
		* Called when a property grid is editing an object. The property name, value and type are passed.
		* If this editor can edit the property it returns a valid JQuery object which is responsible for editing
		* the object. The property grid makes no effort to maintain this. It is up to the Editor to watch the JQuery through
		* events to see when its been interacted with. Once its been edited, the editor must notify the grid - to do this
		* call the notify method.
		* @param {string} propertyName The name of the property we are creating an HTML element for
		* @param {any} propertyValue The current value of that property
		* @param {ParameterType} objectType The type of property we need to create
		* @param {any} options Any options associated with the parameter
		* @returns {JQuery} A valid jQuery object or null if this editor does not support this property.
		*/
		edit( propertyName: string, propertyValue: any, objectType: ParameterType, options: any ): JQuery
		{
			if (  objectType != ParameterType.ENUM  )
				return null;

			//Create HTML	
			var editor: JQuery =
				this.createEditorJQuery( propertyName, "<select class='prop-combo'></select>", propertyValue );

			var selector: JQuery = jQuery( "select", editor );

			//Enums
			var selectedValue: string = propertyValue.selected;
			var vars: Array<string> = propertyValue.choices;
			vars = vars.sort();

			var len: number = vars.length;
			for ( var i: number = 0; i < len; i++ )
				selector.append( "<option value='" + vars[i] + "' " + ( selectedValue == vars[i] ? "selected='selected'" : "" ) + ">" + vars[i] + "</option>" );
		

			var that = this;

			//Functions to deal with user interactions with JQuery
            var onSelect = function (e: JQueryEventObject  ) 
			{
				var val = selector.val();
				that.notify( propertyName, { choices: vars, selected : val }, objectType );
			};
			
			//Add listeners
			selector.on( "change", onSelect );

			//Finall return editor as HTML to be added to the page
			return editor;
		}
	}
}