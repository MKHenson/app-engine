module Animate
{
	/**
	* Treenodes are added to the treeview class. This treenode contains a reference to the
	* AssetClass object defined by plugins.
	*/
    export class TreeNodeAssetInstance extends TreeNodeResource<Asset>
	{
		public assetClass: AssetClass;

		/**
		* @param {AssetClass} assetClass The name of the asset's template
		* @param {Asset} asset The asset itself
		*/
		constructor( assetClass: AssetClass, asset : Asset )
		{
			// Call super-class constructor
            super(asset, (jQuery.trim(asset.entry.name) == "" ? "New " + assetClass.name : asset.entry.name ), "media/variable.png", false );

            this.canCopy = true;
			this.canUpdate = true;
			this.assetClass = assetClass;
			this.element.addClass( "behaviour-to-canvas" );
			this.element.addClass( "tree-node-asset" );

            //if (this.resource.properties == null || this.resource.properties.variables.length == 0 )
            //    this.resource.properties = assetClass.buildVariables();

            asset.on("edited", this.onAssetEdited, this );
		}

		/**
		* Called when the node is selected
		*/
		onSelect()
        {
            PropertyGrid.getSingleton().editableObject(this.resource.properties, this.text + "  [" + this.resource.entry.shallowId + "]", "media/variable.png");
            PluginManager.getSingleton().emit(new AssetEvent(EditorEvents.ASSET_SELECTED, this.resource ) );
		}

		/**
		* When we click ok on the portal form
		* @param {string} type
		* @param {EditEvent} data
		*/
        onAssetEdited(type: string, data: EditEvent, sender?: EventDispatcher)
		{
            this.resource.saved = false;
            //var oldValue = this.resource.properties.getVar( data.propertyName ).value;
            //this.resource.properties.updateValue( data.propertyName, data.propertyValue );
		}

		/**
		* This will cleanup the component.
		*/
		dispose()
        {
            this.resource.off("edited", this.onAssetEdited, this);
			this.assetClass = null;

			//Call super
			super.dispose();
		}
	}
}