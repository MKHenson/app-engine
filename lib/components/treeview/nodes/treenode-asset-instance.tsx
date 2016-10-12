namespace Animate {

	/**
	 * Treenode that contains a reference to an asset
	 */
    export class TreeNodeAssetInstance extends TreeViewNodeResource<Resources.Asset> {
        public assetClass: AssetClass;

		/**
		 * Creates an instance of the node
		 */
        constructor( assetClass: AssetClass, asset: Resources.Asset ) {
            super( asset );
            this.assetClass = assetClass;
            this.canDrag = true;
            this.canDrop = false;

            // if (this.resource.properties === null || this.resource.properties.variables.length === 0 )
            //    this.resource.properties = assetClass.buildVariables();
            asset.on<ResourceEvents, IResourceEvent>( 'edited', this.onAssetEdited, this );
        }

		/**
		 * When we click ok on the portal form
		 */
        onAssetEdited( type: string, data: IResourceEvent ) {
            this.resource.saved = false;
        }

		/**
		 * This will cleanup the component.
		 */
        dispose() {
            this.resource.off<ResourceEvents, IResourceEvent>( 'edited', this.onAssetEdited, this );
            super.dispose();
        }
    }
}