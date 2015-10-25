module Animate
{
	/**
	* Treenodes are added to the treeview class. This treenode contains a reference to the 
	* AssetClass object defined by plugins.
	*/
	export class TreeNodeAssetInstance extends TreeNode
	{
		public assetClass: AssetClass;
		public asset: Asset;
		public canCopy: boolean;
		public saved: boolean;

		/**
		* @param {AssetClass} assetClass The name of the asset's template  
		* @param {Asset} asset The asset itself
		*/
		constructor( assetClass: AssetClass, asset : Asset )
		{
			// Call super-class constructor
			super( ( jQuery.trim( asset.name ) == "" ? "New " + assetClass.name : asset.name ), "media/variable.png", false );

			this.asset = asset;
			this.canDelete = true;
			this.canCopy = true;
			this.saved = true;
			this.canUpdate = true;
			this.assetClass = assetClass;

			this.element.draggable( { opacity: 0.7, helper: "clone", appendTo: "body", containment: "body" });
			this.element.addClass( "behaviour-to-canvas" );
			this.element.addClass( "tree-node-asset" );

			if ( this.asset.properties == null || this.asset.properties.variables.length == 0 )
				this.asset.properties = assetClass.buildVariables();
	
			PropertyGrid.getSingleton().on( PropertyGridEvents.PROPERTY_EDITED, this.onPropertyGridEdited, this );
		}

		/**
		* Called when the node is selected
		*/
		onSelect()
		{
			PropertyGrid.getSingleton().editableObject( this.asset.properties, this.text + "  [" + this.asset.shallowId + "]", this, "media/variable.png" );
			PluginManager.getSingleton().dispatchEvent( new AssetEvent( EditorEvents.ASSET_SELECTED, this.asset ) );
		}

		/**
		* When we click ok on the portal form
		* @param <object> response 
		* @param <object> data 
		*/
		onPropertyGridEdited( response : PropertyGridEvents, data : PropertyGridEvent, sender? : EventDispatcher )
		{
			if ( data.id == this )
			{
				this.asset.saved = false;
				this.saved = this.asset.saved;

				var oldValue = this.asset.properties.getVar( data.propertyName ).value;
				this.asset.properties.updateValue( data.propertyName, data.propertyValue );

				PluginManager.getSingleton().assetEdited( this.asset, data.propertyName, data.propertyValue, oldValue, data.propertyType );

				this.text = this.text;
			}
		}

		/**
		* Sets the text of the node
		* @param {string} val The text to set
		*/
		set text( val: string )
		{
			this.originalText = val;
			jQuery( ".text:first", this.element ).text( ( this.asset.saved ? "" : "*" ) + this.originalText );
		}

		/**
		* Gets the text of the node
		* @returns {string} The text of the node
		*/
		get text(): string
		{
			return this.originalText;
		}

		
		/**
		* When we click ok on the portal form
		*/
		save( val : boolean = true )
		{
			if ( !val )
			{
				this.saved = val;
				this.asset.saved = val;
				this.text = this.text;
				return;
			}

			if ( this.saved )
				return;

			this.asset.saved = true;
			this.saved = this.asset.saved;

			this.text = this.text;

			if ( this.asset.properties == null )
				this.asset.properties = this.assetClass.buildVariables();
		}


		/**
		* This will cleanup the component.
		*/
		dispose()
		{
			this.element.draggable( "destroy" );
			PropertyGrid.getSingleton().off( PropertyGridEvents.PROPERTY_EDITED, this.onPropertyGridEdited, this );

			this.asset = null;
			this.saved = null;
			this.assetClass = null;

			//Call super
			super.dispose();
		}
	}
}