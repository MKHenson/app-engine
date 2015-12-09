module Animate
{
	/**
	* This node represents a group asset. Goups are collections of objects - think of them as arrays.
	*/
	export class TreeNodeGroup extends TreeNode
	{
		public groupID: string;
		public saved: boolean;
		public json: { assets: Array<{ name: string; id: string; }>; };
		private dropProxy: any;
		public name: string;

		constructor( id: string, name: string, json: { assets: Array<{ name: string; id: string; }>; }, treeview: TreeView )
		{
			// Call super-class constructor
			super( name, "media/array.png", true );

			this.groupID = id;
			this.canDelete = true;
			this.saved = true;
			this.canUpdate = true;
			this.json = null;
			this.treeview = treeview;

			this.element.addClass( "tree-node-group" );
			
			//Add each of the node references
			var project = User.get.project;
			this.json = json;
			
			for ( var i in this.json.assets )
				this.addNode( new TreeNodeGroupInstance( this.json.assets[i].id, this.json.assets[i].name ) );
		
			this.dropProxy = this.onObjectDropped.bind( this );
            this.element.draggable(<JQueryUI.DroppableOptions>{ opacity: 0.7, helper: "clone", appendTo: "body", containment: "body" });
            this.element.droppable(<JQueryUI.DroppableOptions>{ drop: this.dropProxy, accept: ".tree-node-asset,.tree-node-group" });	
		}

		/** 
		* This is called when we update the group with new data from the server.
		*/
		updateGroup( name: string, json: { assets: Array<{ name: string; id: string; }>; } )
		{
			//Remove all current nodes
			while ( this.children.length > 0 )
				this.children[0].dispose();

			var project : Project = User.get.project;

			this.saved = true;
			this.name = name;
			this.json = json;

			for ( var i in this.json.assets )
					this.addNode( new TreeNodeGroupInstance( this.json.assets[i].id, this.json.assets[i].name ) );
		}

		/**
		* This function is called when a child node is removed. We have to update
		* the json object and make its no longer part of the data.
		* @param id The ID of the object we need to remove.
		*/
		removeInstance( id : string )
		{
			for ( var i = 0; i < this.json.assets.length; i++ )
				if ( this.json.assets[i].id == id )
				{
					this.json.assets.splice( i, 1 );
					this.save( false );
					return;
				}
		}

		/** 
		* Notifies if this node is saved or unsaved. 
		*/
		save( val )
		{
            this.saved = val;
            this.modified = !val;
		}

		/**
		* Called when a draggable object is dropped onto the canvas.
		*/
		onObjectDropped( event, ui )
		{
			var comp : TreeNode = jQuery( ui.draggable ).data( "component" );
			if ( comp instanceof TreeNodeAssetInstance || comp instanceof TreeNodeGroup )
			{
				var added = null;
				if ( comp instanceof TreeNodeAssetInstance )
                    added = this.addNode(new TreeNodeGroupInstance((<TreeNodeAssetInstance>comp).asset.entry.shallowId, (<TreeNodeAssetInstance>comp).asset.entry.name ) );
				else
					added = this.addNode( new TreeNodeGroupInstance( ( <TreeNodeGroup>comp).groupID, comp.text ) );

				this.expand();
				this.treeview.selectNode( added );

				this.save( false );

				var identifier = this.json.assets.length;
                this.json.assets[identifier] = { id: added.instanceID, name: (comp instanceof TreeNodeAssetInstance ? (<TreeNodeAssetInstance>comp).asset.entry.name : comp.text ) };
			}
		}

		/**
		* This will cleanup the component.
		*/
		dispose()
		{
			this.element.droppable("destroy");

			//Call super - must be called here in this case
			super.dispose();
			
			this.treeview = null;
			this.dropProxy = null;
			this.groupID = null;
			this.canDelete = null;
			this.saved = null;
			this.canUpdate = null;
			this.json = null;
		}
	}
}