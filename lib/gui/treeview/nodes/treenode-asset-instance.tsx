module Animate {

	/**
	 * Treenode that contains a reference to an asset
	 */
	export class TreeNodeAssetInstance extends TreeViewNodeResource<Resources.Asset> {
		public assetClass: AssetClass;

		/**
		 * Creates an instance of the node
		 */
		constructor(assetClass: AssetClass, asset: Resources.Asset) {
			super(asset);
			this.assetClass = assetClass;
			this.canDrag = true;
			this.canDrop = false;

			//if (this.resource.properties == null || this.resource.properties.variables.length == 0 )
			//    this.resource.properties = assetClass.buildVariables();
			asset.on("edited", this.onAssetEdited, this);
		}

		/**
		 * When we click ok on the portal form
		 * @param {string} type
		 * @param {EditEvent} data
		 */
		onAssetEdited(type: string, data: EditEvent, sender?: EventDispatcher) {
			this.resource.saved = false;
		}

		/**
		 * This will cleanup the component.
		 */
		dispose() {
			this.resource.off("edited", this.onAssetEdited, this);
			this.assetClass = null;

			//Call super
			super.dispose();
		}
	}
}