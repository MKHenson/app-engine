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
        * Checks a property to see if it can edit it
        * @param {Prop<any>} prop The property being edited
        * @returns {boolean}
        */
        canEdit(prop: Prop<any>): boolean
        {
            if (prop instanceof PropResource )
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
            var p = <PropResource>prop;

			// Create HTML	
            var editor: JQuery = jQuery(`<div class='property-grid-label'>${p.name}</div><div class='property-grid-value'><select class='prop-combo' style = 'width:90%;'></select><div class='eye-picker'><img src='media/eye.png' /></div></div><div class='fix'></div>`);
			var selector: JQuery = jQuery( "select", editor );
			var eye: JQuery = jQuery( ".eye-picker", editor );

            // Add to DOM
            container.element.append(editor);

            var resource = p.getVal();
            var selectedID = (resource ? resource.entry._id : null);
			var classNames = p.classNames;
			var nodes = TreeViewScene.getSingleton().getAssets( classNames );

			// Create the blank options and select it if nothing else is chosen
            selector.append(`<option value='' ${(!selectedID ? "selected='selected'" : "" )}></option>` );

			// Sort alphabetically
			nodes = nodes.sort( function ( a: TreeNodeAssetInstance, b: TreeNodeAssetInstance )
			{
                var textA = a.resource.entry.name.toUpperCase();
                var textB = b.resource.entry.name.toUpperCase();
				return ( textA < textB ) ? -1 : ( textA > textB ) ? 1 : 0;
			});

			var len: number = nodes.length;
			for ( var i = 0; i < len; i++ )
                selector.append(`<option title='${nodes[i].resource.entry.shallowId + " : " + nodes[i].resource.entry.className}' value='${nodes[i].resource.entry.shallowId}' ${(selectedID == nodes[i].resource.entry.shallowId ? "selected='selected'" : "")}>${nodes[i].resource.entry.name}</option>` );
			
			var that = this;

			// When we select a new asset
            var onSelect = function (e: JQueryEventObject  ) 
			{
                var val = parseFloat(selector.val());
                var asset: Asset = User.get.project.getResourceByShallowID<Asset>(val, ResourceType.ASSET);
                p.setVal(asset);
            };

            // When we click on the target
            var onEye = function (e: JQueryEventObject) 
			{
				var val = parseInt( selector.val() );
                var asset: Asset = User.get.project.getResourceByShallowID<Asset>(val, ResourceType.ASSET);
				if ( asset )
                    TreeViewScene.getSingleton().selectNode(TreeViewScene.getSingleton().findNode( "resource", asset ), true );
				else
					TreeViewScene.getSingleton().selectNode(TreeViewScene.getSingleton().findNode("className", classNames[0] ), true );
			};

			// Add listeners
			eye.on( "mouseup", onEye );
			selector.on( "change", onSelect );
		}
	}
}