module Animate
{
	/**
	* This represents a combo property for assets that the user can select from a list.
	*/
	export class PropComboGroup extends PropertyGridEditor
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
			if (  objectType != ParameterType.GROUP  )
				return null;

			//Create HTML	
			var editor: JQuery =
				this.createEditorJQuery( propertyName, "<select class='prop-combo' style = 'width:90%;'></select><div class='eye-picker'><img src='media/eye.png'/></div>", propertyValue );

			var selector: JQuery = jQuery( "select", editor );
			var eye: JQuery = jQuery( ".eye-picker", editor );
            //var parts: Array<string> = propertyValue.split(":") ;
            var project = User.get.project;
            var groups = project.groups.slice(0, project.groups.length);

            //Sort alphabetically
            groups = groups.sort(function (a: GroupArray, b: GroupArray)
            {
                var textA = a.entry.name;
                var textB = b.entry.name;
				return ( textA < textB ) ? -1 : ( textA > textB ) ? 1 : 0;
			});

			//Create the blank
			selector.append( "<option value='' " + ( propertyValue == "" ? "selected='selected'" : "" ) + "></option>" );

            for (var i = 0; i < groups.length; i++)
                selector.append("<option title='" + groups[i].entry.shallowId + "' value='" + groups[i].entry.shallowId + "' " + (propertyValue == groups[i].entry.shallowId ? "selected='selected'" : "") + ">" + groups[i].entry.name + "</option>");


			var that = this;

			//Functions to deal with user interactions with JQuery
            var onSelect = function (e: JQueryEventObject  ) 
			{
				var val = selector.val();
				that.notify(propertyName, val, objectType );
			};
            var onEye = function (e: JQueryEventObject ) 
			{
				var val = selector.val();
				TreeViewScene.getSingleton().selectNode( TreeViewScene.getSingleton().findNode( "groupID", val ), true );
			};

			//Add listeners
			eye.on( "mouseup", onEye );
			selector.on( "change", onSelect );

			//Finall return editor as HTML to be added to the page
			return editor;
		}
	}
}