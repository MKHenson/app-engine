module Animate
{
	/**
	* This represents a combo property for assets that the user can select from a list.
	*/
	export class PropComboAsset extends PropertyGridEditor
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
			if (  objectType != ParameterType.ASSET  )
				return null;

			//Create HTML	
			var editor: JQuery =
				this.createEditorJQuery( propertyName, "<select class='prop-combo' style = 'width:90%;'></select><div class='eye-picker'><img src='media/eye.png'/></div>", propertyValue );

			var selector: JQuery = jQuery( "select", editor );
			var eye: JQuery = jQuery( ".eye-picker", editor );

			var selectedID: number = parseInt( propertyValue.selected );
			var className: string = propertyValue.className;
			var classNames: Array<string> = propertyValue.classNames ? propertyValue.classNames : [];

			if (className && className != "")
				classNames.push(className);

			if (classNames.length == 0)
				classNames.push(null);

			var nodes: Array<TreeNodeAssetInstance> = TreeViewScene.getSingleton().getAssets( classNames );

			//Create the blank options and select it if nothing else is chosen
			selector.append( "<option value='' " + ( selectedID == 0 || isNaN( selectedID )  ? "selected='selected'" : "" ) + "></option>" );

			//Sort alphabetically
			nodes = nodes.sort( function ( a: TreeNodeAssetInstance, b: TreeNodeAssetInstance )
			{
				var textA = a.asset.name.toUpperCase();
				var textB = b.asset.name.toUpperCase();
				return ( textA < textB ) ? -1 : ( textA > textB ) ? 1 : 0;
			});

			var len: number = nodes.length;
			for ( var i = 0; i < len; i++ )
				selector.append( "<option title='" + nodes[i].asset.shallowId + " : " + nodes[i].asset.className + "' value='" + nodes[i].asset.shallowId + "' " + ( selectedID == nodes[i].asset.shallowId ? "selected='selected'" : "" ) + ">" + nodes[i].asset.name + "</option>" );
			
			var that = this;

			//Functions to deal with user interactions with JQuery
            var onSelect = function (e: JQueryEventObject  ) 
			{
				var val = selector.val();
				that.notify(propertyName, { classNames: classNames, selected: val }, objectType );
			};
            var onEye = function (e: JQueryEventObject  ) 
			{
				var val = parseInt( selector.val() );
				
				var asset: Asset = User.get.project.getAssetByShallowId( val );

				if ( asset )
					TreeViewScene.getSingleton().selectNode( TreeViewScene.getSingleton().findNode( "asset", asset ), true );
				else
					TreeViewScene.getSingleton().selectNode(TreeViewScene.getSingleton().findNode("className", classNames[0] ), true );
			};

			//Add listeners
			eye.on( "mouseup", onEye );
			selector.on( "change", onSelect );

			//Finall return editor as HTML to be added to the page
			return editor;
		}
	}
}