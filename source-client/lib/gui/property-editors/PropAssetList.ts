module Animate
{
	/**
	* This represents a property for choosing a list of assets
	*/
	export class PropAssetList extends PropertyGridEditor
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
			if (  objectType != ParameterType.ASSET_LIST  )
				return null;

			//Create HTML	
			var editor: JQuery =
				this.createEditorJQuery( propertyName, "<select class='prop-combo' style='width:90%;'></select><div class='eye-picker'><img src='media/eye.png'/></div><div class='asset-list'><select class='asset-list-select' size='4'></select><div class='add'>Add</div><div class='remove'>Remove</div></div>", propertyValue );

			var selector: JQuery = jQuery( "select.prop-combo", editor );
			var eye: JQuery = jQuery( ".eye-picker", editor );
			var items: JQuery = jQuery( "select.asset-list-select", editor );
			var add: JQuery = jQuery( ".add", editor );
			var remove: JQuery = jQuery( ".remove", editor );
			var that = this;
			var assetId: number;
			var asset: Asset;

			var selectedIDs: Array<number> = propertyValue.selectedAssets || [];
			var className: string = propertyValue.className;
			var nodes: Array<TreeNodeAssetInstance> = TreeViewScene.getSingleton().getAssets( className );
			
			//Sort alphabetically
			nodes = nodes.sort( function ( a: TreeNodeAssetInstance, b: TreeNodeAssetInstance )
			{
                var textA = a.asset.entry.name.toUpperCase();
                var textB = b.asset.entry.name.toUpperCase();
				return ( textA < textB ) ? -1 : ( textA > textB ) ? 1 : 0;
			});


			// Fill the select with assets
			for ( var i = 0, l = nodes.length; i < l; i++ )
			{
				if ( i == 0 )
				{
                    assetId = nodes[i].asset.entry.shallowId;
					asset = nodes[i].asset;
				}

                selector.append("<option title='" + nodes[i].asset.entry.shallowId + " : " + nodes[i].asset.entry.className + "' value='" + nodes[i].asset.entry.shallowId + "' " + (i == 0 ? "selected='selected'" : "") + ">" + nodes[i].asset.entry.name + "</option>" );
			}

			// Fill the already selected items 
			for ( var i = 0, l = selectedIDs.length; i < l; i++ )
			{
				var selectedAsset = User.get.project.getAssetByShallowId( selectedIDs[i] );
				if ( selectedAsset )
                    items.append("<option title='" + selectedIDs[i] + " : " + selectedAsset.entry.className + "' value='" + selectedAsset.entry.shallowId + "'>" + selectedAsset.entry.name + "</option>" );
			}

			// When we select an asset
            var onSelect = function (e: JQueryEventObject  ) 
			{
				assetId = parseInt( selector.val() );
				asset = User.get.project.getAssetByShallowId( assetId );
			};


			// When we select an asset in the list, select that in the drop down
            var onItemSelect = function (e: JQueryEventObject ) 
			{
				selector.val( items.val() );
			};

            // When we click on the eye selector
            var onEye = function (e: JQueryEventObject ) 
			{
				var val = parseInt( selector.val() );
				asset = User.get.project.getAssetByShallowId( val );

				if ( asset )
					TreeViewScene.getSingleton().selectNode( TreeViewScene.getSingleton().findNode( "asset", asset ), true );
				else
					TreeViewScene.getSingleton().selectNode( TreeViewScene.getSingleton().findNode( "className", propertyValue.className ), true );
			};

			// When we click on add button
            var onAdd = function (e: JQueryEventObject  ) 
			{
				if ( asset && selectedIDs.indexOf( assetId ) == -1 )
				{
					selectedIDs.push( assetId );

                    items.append("<option title='" + assetId + " : " + asset.entry.className + "' value='" + asset.entry.shallowId + "'>" + asset.entry.name + "</option>");

					that.notify( propertyName, { className: propertyValue.className, selectedAssets: selectedIDs }, objectType );
				}
			}

			// When we click on remove button
            var onRemove = function (e: JQueryEventObject ) 
			{
				var toRemove: number = parseInt( items.val() );
				if ( selectedIDs.indexOf( toRemove ) != -1 )
				{
					selectedIDs.splice( selectedIDs.indexOf( toRemove ), 1 );

					jQuery( 'option:selected', items ).remove();

					that.notify( propertyName, { className: propertyValue.className, selectedAssets: selectedIDs }, objectType );
				}
			}

			//Add listeners
			eye.on( "mouseup", onEye );
			selector.on( "change", onSelect );
			items.on( "change", onItemSelect );
			add.on( "mouseup", onAdd );
			remove.on( "mouseup", onRemove );

			//Finall return editor as HTML to be added to the page
			return editor;
		}
	}
}