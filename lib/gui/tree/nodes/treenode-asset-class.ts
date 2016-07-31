module Animate {
	/**
	* Treenodes are added to the treeview class. This treenode contains a reference to the
	* AssetClass object defined by plugins.
	*/
	export class TreeNodeAssetClass extends TreeNode {
		public assetClass: AssetClass;
		public className: string;

		/**
		* @param {AssetClas} assetClass The asset class this node represents
		* @param {TreeView} treeview The treeview to which this is added
		*/
		constructor( assetClass : AssetClass, treeview : TreeView ) {
			// Call super-class constructor
			super( assetClass.name, assetClass.imgURL, true );

			this.canDelete = false;
			this.assetClass = assetClass;
			this.treeview = treeview;
			this.className = assetClass.name;
			this.canUpdate = true;

			//Add the sub - class nodes
			for ( var ii = 0; ii < assetClass.classes.length; ii++ ) {
				var c = assetClass.classes[ii];
				var toRet = new TreeNodeAssetClass( c, treeview );
				this.addNode( toRet );
			}
		}

		/**
		* This will get all TreeNodeAssetInstance nodes of a particular class name
		* @param {string|Array<string>} classNames The class name of the asset, or an array of class names
		* @returns Array<TreeNodeAssetInstance>
		*/
		getInstances(classNames: string|Array<string> ): Array<TreeNodeAssetInstance> {
			var toRet: Array<TreeNodeAssetInstance> = null;
			var children: Array<IComponent> = this.children;

			var names: Array<string>;

			if (!classNames)
				names = [null];
			else if (typeof (classNames) == "string")
				names = [<string>classNames];
			else
				names = <Array<string>>classNames;

			toRet = [];

			for (var i = 0, l = names.length; i < l; i++) {
				if (names[i] == null || names[i] == this.assetClass.name || names[i] == "") {
					//Add the sub - class nodes
					var len = children.length;
					for (var i = 0; i < len; i++) {
						if (children[i] instanceof TreeNodeAssetInstance)
							toRet.push(<TreeNodeAssetInstance>children[i]);
						else if (children[i] instanceof TreeNodeAssetClass) {
							var instances: Array<TreeNodeAssetInstance> = (<TreeNodeAssetClass>children[i]).getInstances(null);
							if (instances != null) {
								for (var ii = 0; ii < instances.length; ii++)
									toRet.push(instances[ii]);
							}
						}
					}
				}
				else
				{
					//Add the sub - class nodes
					var len: number = children.length;
					for (var ii = 0; ii < len; ii++) {
						if (children[ii] instanceof TreeNodeAssetClass) {
							var instances: Array<TreeNodeAssetInstance> = (<TreeNodeAssetClass>children[ii]).getInstances(names);
							if (instances != null)
								for (var iii = 0, liii = instances.length; iii < liii; iii++)
									if (toRet.indexOf(instances[iii]) == -1)
										toRet.push(instances[iii]);
						}
					}
				}
			}

			return toRet;
		}

		/**
		* This will get all sub TreeNodeAssetClass nodes
		* @returns Array<AssetClass>
		*/
		getClasses(): Array<AssetClass> {
			var toRet: Array<AssetClass> = [];
			var children: Array<IComponent> = this.children;

			//Add the sub - class nodes
			var len : number = this.children.length;
			for ( var i = 0; i < len; i++ ) {
				if ( children[i] instanceof TreeNodeAssetClass ) {
					toRet.push( ( (<TreeNodeAssetClass>children[i]).assetClass ) );

					var instances: Array<AssetClass> = ( <TreeNodeAssetClass>children[i] ).getClasses();
					if ( instances != null )
						for ( var ii = 0; ii < instances.length; ii++ )
							toRet.push( instances[ii] );
				}
			}

			return toRet;
		}

		/**
		* This will cleanup the component.
		*/
		dispose() {
			this.canDelete = null;
			this.assetClass = null;
			this.treeview = null;
			this.className = null;

			//Call super
			super.dispose();
		}
	}
}