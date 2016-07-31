module Animate {
	/**
	* This represents a property for choosing a list of assets
	*/
	export class PGAssetList extends PropertyGridEditor {
		constructor( grid: PropertyGrid ) {
			super( grid );
        }

        /**
		* Checks a property to see if it can edit it
		* @param {Prop<any>} prop The property being edited
        * @returns {boolean}
		*/
        canEdit(prop: Prop<any>): boolean {
            if (prop instanceof PropAssetList)
                return true;
            else
                return false;
        }

		/**
		* Given a property, the grid editor must produce HTML that can be used to edit the property
		* @param {Prop<any>} prop The property being edited
		* @param {Component} container The container acting as this editors parent
		*/
        edit(prop: Prop<any>, container: Component) {
            var p = <PropAssetList>prop;

			// Create HTML
            var editor: JQuery = jQuery(`<div class='property-grid-label'>${p.name}</div><div class='property-grid-value'><select class='prop-combo' style= 'width:90%;' ></select><div class='eye-picker'><img src='media/eye.png'/></div><div class='asset- list'><select class='asset-list-select' size='4'></select><div class='add'>Add</div><div class='remove'>Remove</div></div></div><div class='fix'></div>`);
			var selector: JQuery = jQuery( "select.prop-combo", editor );
			var eye: JQuery = jQuery( ".eye-picker", editor );
			var items: JQuery = jQuery( "select.asset-list-select", editor );
			var add: JQuery = jQuery( ".add", editor );
			var remove: JQuery = jQuery( ".remove", editor );
            var that = this;
			var assetId: number;
            var asset: Asset;
            var assets = p.getVal();
			var classNames = p.classNames;
			var nodes: Array<TreeNodeAssetInstance> = TreeViewScene.getSingleton().getAssets( classNames );

			// Sort alphabetically
			nodes = nodes.sort( function ( a: TreeNodeAssetInstance, b: TreeNodeAssetInstance ) {
                var textA = a.resource.entry.name.toUpperCase();
                var textB = b.resource.entry.name.toUpperCase();
				return ( textA < textB ) ? -1 : ( textA > textB ) ? 1 : 0;
			});


            // Fill the select with assets
            for (var i = 0, l: number = nodes.length; i < l; i++) {
				if ( i == 0 ) {
                    assetId = nodes[i].resource.entry.shallowId;
                    asset = nodes[i].resource;
				}

                selector.append(`<option title='${nodes[i].resource.entry.shallowId} : ${nodes[i].resource.entry.className}' value='${nodes[i].resource.entry.shallowId}' ${(i == 0 ? "selected='selected'" : "")}>${nodes[i].resource.entry.name}</option>`);
			}

            // Fill the already selected items
            for (var i = 0, l: number = assets.length; i < l; i++) {
                var selectedAsset = User.get.project.getResourceByShallowID<Asset>(assets[i].entry.shallowId, ResourceType.ASSET);
				if ( selectedAsset )
                    items.append(`<option title='${assets[i] + " : " + selectedAsset.entry.className}' value='${selectedAsset.entry.shallowId}'>${selectedAsset.entry.name}</option>`);
			}

			// When we select an asset
            var onSelect = function (e: JQueryEventObject  ) {
                assetId = parseInt(selector.val());
                asset = User.get.project.getResourceByShallowID<Asset>(assetId, ResourceType.ASSET);
			};


			// When we select an asset in the list, select that in the drop down
            var onItemSelect = function (e: JQueryEventObject ) {
				selector.val( items.val() );
			};

            // When we click on the eye selector
            var onEye = function (e: JQueryEventObject ) {
                var val = parseInt(selector.val());
                asset = User.get.project.getResourceByShallowID<Asset>(val, ResourceType.ASSET);

				if ( asset )
					TreeViewScene.getSingleton().selectNode( TreeViewScene.getSingleton().findNode( "resource", asset ), true );
                else
                    TreeViewScene.getSingleton().selectNode(TreeViewScene.getSingleton().findNode("className", asset.class.name), true);
			};

			// When we click on add button
            var onAdd = function (e: JQueryEventObject  ) {
                if (asset && assets.indexOf(asset) == -1 ) {
                    assets.push(asset);
                    items.append(`<option title='${assetId + " : " + asset.entry.className}' value='${asset.entry.shallowId}'>${asset.entry.name}</option>`);
                    p.setVal(assets);
				}
			}

			// When we click on remove button
            var onRemove = function (e: JQueryEventObject ) {
                var toRemove: number = parseInt(items.val());
                asset = User.get.project.getResourceByShallowID<Asset>(toRemove, ResourceType.ASSET);

                if (assets.indexOf(asset) != -1 ) {
                    assets.splice(assets.indexOf(asset ), 1 );
                    jQuery('option:selected', items).remove();
                    p.setVal(assets);
				}
			}

			// Add listeners
			eye.on( "mouseup", onEye );
			selector.on( "change", onSelect );
			items.on( "change", onItemSelect );
			add.on( "mouseup", onAdd );
			remove.on( "mouseup", onRemove );
		}
	}
}