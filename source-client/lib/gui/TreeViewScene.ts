module Animate
{
	/**
	* An implementation of the tree view for the scene.
	*/
	export class TreeViewScene extends TreeView
	{
		private static _singleton: TreeViewScene;

		private _sceneNode: TreeNode;
		private _assetsNode: TreeNode;
		private _groupsNode: TreeNode;
		private _pluginBehaviours: TreeNode;
		private _contextMenu: ContextMenu;
		private _contextCopy: ContextMenuItem;
		private _contextDel: ContextMenuItem;
		private _contextAddInstance: ContextMenuItem;
		private _contextSave: ContextMenuItem;
		private _contextRefresh: ContextMenuItem;
		private _contextAddGroup: ContextMenuItem;
		private _quickCopy: Component;
		private _quickAdd: Component;
		private _contextNode: TreeNode;
		private _curProj: Project;
		private _shortcutProxy: any;


		constructor( parent? : Component )
		{
			super( parent );

			if ( TreeViewScene._singleton != null )
				throw new Error( "The TreeViewScene class is a singleton. You need to call the TreeViewScene.getSingleton() function." );

			TreeViewScene._singleton = this;

			this.element.addClass( "treeview-scene" );

			this._sceneNode = this.addNode( new TreeNode( "Scene", "media/world_16.png" ) );
			this._assetsNode = this.addNode( new TreeNode( "Assets", "media/wrench.png" ) );
			this._groupsNode = this.addNode( new TreeNode( "Groups", "media/array.png" ) );
			this._pluginBehaviours = this.addNode( new TreeNode( "Behaviours", "media/behavior_20.png" ) );

			this._sceneNode.canUpdate = true;
			this._groupsNode.canUpdate = true;

			//Create the context menu
			this._contextMenu = new ContextMenu();
			this._contextCopy = this._contextMenu.addItem( new ContextMenuItem( "Copy", "media/copy-small.png" ) );
			this._contextDel = this._contextMenu.addItem( new ContextMenuItem( "Delete", "media/cross.png" ) );
			this._contextAddInstance = this._contextMenu.addItem( new ContextMenuItem( "Add Instance", "media/portal.png" ) );
			this._contextSave = this._contextMenu.addItem( new ContextMenuItem( "Save", "media/save-20.png" ) );
			this._contextRefresh = this._contextMenu.addItem( new ContextMenuItem( "Update", "media/refresh.png" ) );
			this._contextAddGroup = this._contextMenu.addItem( new ContextMenuItem( "Add Group", 'media/array.png' ) );

			this._contextMenu.on( ContextMenuEvents.ITEM_CLICKED, this.onContextSelect, this );


			jQuery( document ).on( "contextmenu", this.onContext.bind( this ) );
			jQuery( ".selectable .text", this._sceneNode.element ).addClass( "top-node" );
			jQuery( ".selectable .text", this._assetsNode.element ).addClass( "top-node" );
			jQuery( ".selectable .text", this._groupsNode.element ).addClass( "top-node" );
			jQuery( ".selectable .text", this._pluginBehaviours.element ).addClass( "top-node" );

			this._quickAdd = new Component( "<div class='quick-button'><img src='media/portal.png'/></div>", this );
			this._quickCopy = new Component( "<div class='quick-button'><img src='media/copy-small.png'/></div>", this );

			this._quickAdd.tooltip = "Add new instance";
			this._quickCopy.tooltip = "Copy instance";

			this._contextNode = null;
			this._shortcutProxy = this.onShortcutClick.bind( this );
			this._curProj = null;

			jQuery( "body" ).on( "keydown", this.onKeyDown.bind( this ) );
			this.element.on( "dblclick", this.onDblClick.bind( this ) );
			this.element.on( "mousemove", this.onMouseMove.bind( this ) );

			this._quickAdd.element.detach();
			this._quickCopy.element.detach();

			RenameForm.getSingleton().on( RenameFormEvents.OBJECT_RENAMING, this.onRenameCheck, this );
		}

		onShortcutClick( e )
		{
			var comp = jQuery( e.currentTarget ).data( "component" );

			var node : TreeNode = comp.element.parent().parent().parent().data( "component" );
			this.selectedNode = node;
			this._contextNode = node;

			if ( comp == this._quickAdd )
				this.onContextSelect( ContextMenuEvents.ITEM_CLICKED, new ContextMenuEvent( this._contextAddInstance, ContextMenuEvents.ITEM_CLICKED ) );
			else
				this.onContextSelect( ContextMenuEvents.ITEM_CLICKED, new ContextMenuEvent( this._contextCopy, ContextMenuEvents.ITEM_CLICKED ) );
		}

		onMouseMove( e )
		{
			if ( jQuery( e.target ).hasClass( "quick-button" ) )
				return;

			var node: Component = jQuery( e.target ).parent().data( "component" );

			this._quickAdd.element.off( "click", this._shortcutProxy );
			this._quickCopy.element.off( "click", this._shortcutProxy );

			this._quickAdd.element.detach();
			this._quickCopy.element.detach();

			if ( node && node instanceof TreeNode )
			{
				if ( node instanceof TreeNodeAssetInstance )
				{
					jQuery( ".text:first", node.element ).append( this._quickCopy.element );
					this._quickCopy.element.on( "click", this._shortcutProxy );
				}
				else if ( node instanceof TreeNodeAssetClass && !( <TreeNodeAssetClass>node ).assetClass.abstractClass )
				{
					jQuery( ".text:first", node.element ).append( this._quickAdd.element );
					this._quickAdd.element.on( "click", this._shortcutProxy );
				}
			}
		}

		/**
		* Called when the project is loaded and ready.
		*/
		projectReady()
		{
			//Add all the asset nodes 
			var assetTemplates = PluginManager.getSingleton().assetTemplates;
			var assetClass: AssetClass;

			var len = assetTemplates.length;
			for ( var i = 0; i < len; i++ )
				for ( var ii = 0; ii < assetTemplates[i].classes.length; ii++ )
				{
					assetClass = assetTemplates[i].classes[ii];
					var toRet = new TreeNodeAssetClass( assetClass, this );
					this._assetsNode.addNode( toRet );
				}

			this._curProj = User.get.project;
			this._curProj.on( ProjectEvents.BEHAVIOUR_SAVED, this.onBehaviourResponse, this );
			this._curProj.on( ProjectEvents.ASSET_SAVED, this.onAssetResponse, this );
			this._curProj.on( ProjectEvents.ASSET_UPDATED, this.onAssetResponse, this );
			this._curProj.on( ProjectEvents.BEHAVIOUR_DELETING, this.onProjectResponse, this );
			this._curProj.on( ProjectEvents.ASSET_DELETING, this.onAssetResponse, this );
			this._curProj.on( ProjectEvents.GROUP_CREATED, this.onGroupResponse, this );
			this._curProj.on( ProjectEvents.GROUP_UPDATED, this.onGroupResponse, this );
			this._curProj.on( ProjectEvents.GROUP_SAVED, this.onGroupResponse, this );
			this._curProj.on( ProjectEvents.GROUP_DELETING, this.onGroupResponse, this );
			this._curProj.on( ProjectEvents.OBJECT_RENAMED, this.onObjectRenamed, this );
		}

		/**
		* Called when the project is reset by either creating a new one or opening an older one.
		*/
		projectReset()
		{
			if ( this._curProj )
			{
				this._curProj.off( ProjectEvents.BEHAVIOUR_SAVED, this.onBehaviourResponse, this );
				this._curProj.off( ProjectEvents.ASSET_SAVED, this.onAssetResponse, this );
				this._curProj.off( ProjectEvents.ASSET_UPDATED, this.onAssetResponse, this );
				this._curProj.off( ProjectEvents.BEHAVIOUR_DELETING, this.onProjectResponse, this );
				this._curProj.off( ProjectEvents.ASSET_DELETING, this.onAssetResponse, this );
				this._curProj.off( ProjectEvents.GROUP_CREATED, this.onGroupResponse, this );
				this._curProj.off( ProjectEvents.GROUP_UPDATED, this.onGroupResponse, this );
				this._curProj.off( ProjectEvents.GROUP_SAVED, this.onGroupResponse, this );
				this._curProj.off( ProjectEvents.GROUP_DELETING, this.onGroupResponse, this );
				this._curProj.off( ProjectEvents.OBJECT_RENAMED, this.onObjectRenamed, this );
			}

			this.children[0].clear();
			this.children[1].clear();
			this._groupsNode.clear();
		}

		/**
		* Catch the key down events.
		* @param e The event passed by jQuery
		*/
		onKeyDown( e )
		{
			if ( Application.getInstance().focusObj != null && Application.getInstance().focusObj instanceof TreeNode )
			{
				//If f2 pressed
				if ( jQuery( e.target ).is( "input" ) == false && e.keyCode == 113 )
				{
					//Unselect all other items
					if ( this.selectedNode != null )
						if ( this.selectedNode instanceof TreeNodeGroup )
							RenameForm.getSingleton().showForm( this.selectedNode, this.selectedNode.text );
						else if ( this.selectedNode instanceof TreeNodeBehaviour )
							RenameForm.getSingleton().showForm( (<TreeNodeBehaviour>this.selectedNode).behaviour, this.selectedNode.text );
						else if ( this.selectedNode instanceof TreeNodeAssetInstance )
							RenameForm.getSingleton().showForm( (<TreeNodeAssetInstance>this.selectedNode).asset, this.selectedNode.text );
				}
			}
		}

		/**
		* Creates an asset node for the tree
		* @param {Asset} asset The asset to associate with the node
		*/
		addAssetInstance( asset : Asset, collapse : boolean = true )
		{
			//Add all the asset nodes 
			var classNode: TreeNodeAssetClass = <TreeNodeAssetClass>this.findNode( "className", asset.className )

			if ( classNode != null )
			{
				var instanceNode: TreeNodeAssetInstance = new TreeNodeAssetInstance( classNode.assetClass, asset );
				classNode.addNode( instanceNode, collapse );

				instanceNode.element.draggable( { opacity: 0.7, helper: "clone", appendTo: "body", containment: "body" });

				return true;
			}

			return false;
		}

		/**
		* Update the asset node so that its saved. 
		* @param {Asset} asset The asset to associate with the node
		*/
		updateAssetInstance( asset: Asset )
		{
			var node: TreeNodeAssetInstance = <TreeNodeAssetInstance>this.findNode( "asset", asset );
			if ( node != null )
				node.save();
		}

		/**
		* Update the behaviour node so that its saved and if any tabs are open they need to re-loaded.
		* @param {BehaviourContainer} behaviour The hehaviour object we need to update
		*/
		updateBehaviour( behaviour : BehaviourContainer )
		{
			var node: TreeNodeBehaviour = <TreeNodeBehaviour>this.findNode( "behaviour", behaviour );
			node.behaviour = behaviour;
			if ( node != null )
			{
				//First we try and get the tab
				var tabPair : TabPair = CanvasTab.getSingleton().getTab( behaviour.name );

				//Tab was not found - check if its because its unsaved
				if ( tabPair == null )
					tabPair = CanvasTab.getSingleton().getTab( "*" + behaviour.name );

				//If we have a tab then rename it to the same as the node
				if ( tabPair )
				{
					tabPair.tabSelector.element.trigger( "click" );
					var canvas : Canvas = (<CanvasTabPair>tabPair).canvas;
					canvas.behaviourContainer = behaviour;
					CanvasTab.getSingleton().selectTab( tabPair );
					canvas.openFromDataObject();
					canvas.checkDimensions();
				}

				node.save( true );
			}
		}


		/**
		* Called when we select a menu item. 
		*/
		onContextSelect( response: ContextMenuEvents, event: ContextMenuEvent, sender? : EventDispatcher ) 
		{
			//DELETE
			if ( this._contextNode && event.item.text == "Delete" )
			{
				this._quickAdd.element.off( "click", this._shortcutProxy );
				this._quickCopy.element.off( "click", this._shortcutProxy );

				this._quickAdd.element.detach();
				this._quickCopy.element.detach();

				if ( this._contextNode instanceof TreeNodeBehaviour )
				{
					var selectedNodes = [];
					var i = this.selectedNodes.length;
					while ( i-- )
						selectedNodes.push( this.selectedNodes[i] );


					var behaviours = [];
					i = selectedNodes.length;
					while ( i-- )
						behaviours.push( selectedNodes[i].behaviour.id );

					User.get.project.deleteBehaviours( behaviours );
				}
				else if ( this._contextNode instanceof TreeNodeAssetInstance )
				{
					var selectedNodes = [];
					var i = this.selectedNodes.length;
					while ( i-- )
						selectedNodes.push( this.selectedNodes[i] );



					var assets = [];
					i = selectedNodes.length;
					while ( i-- )
						assets.push( selectedNodes[i].asset.id );

					User.get.project.deleteAssets( assets );
				}
				else if ( this._contextNode instanceof TreeNodeGroup )
				{
					var selectedNodes = [];
					var i = this.selectedNodes.length;
					while ( i-- )
						selectedNodes.push( this.selectedNodes[i] );

					var groups = [];
					i = selectedNodes.length;
					while ( i-- )
						groups.push( selectedNodes[i].groupID );

					User.get.project.deleteGroups( groups );
				}
				else if ( this._contextNode instanceof TreeNodeGroupInstance )
					this._contextNode.dispose();
			}
			//COPY
			if ( this._contextNode && event.item == this._contextCopy )
			{
				if ( this._contextNode instanceof TreeNodeAssetInstance )
					User.get.project.copyAsset((<TreeNodeAssetInstance>this._contextNode).asset.id );
			}
			//ADD INSTANCE
			else if ( this._contextNode && event.item == this._contextAddInstance )
				User.get.project.createAsset("New " + (<TreeNodeAssetClass>this._contextNode).assetClass.name, (<TreeNodeAssetClass>this._contextNode).assetClass.name );
			//SAVE
			else if ( this._contextNode && event.item.text == "Save" )
			{
				if ( this._contextNode instanceof TreeNodeAssetInstance )
					User.get.project.saveAssets( [(<TreeNodeAssetInstance>this._contextNode).asset.id] );
				if ( this._contextNode instanceof TreeNodeGroup )
					User.get.project.saveGroups([ (<TreeNodeGroup>this._contextNode).groupID ] );
				else if ( this._contextNode instanceof TreeNodeBehaviour )
					User.get.project.saveBehaviours( [ (<TreeNodeBehaviour>this._contextNode).behaviour.id] );				
			}
			//ADD GROUP NODE
			else if ( this._contextNode && event.item.text == "Add Group" )
				User.get.project.createGroup( "New Group");
			//UPDATE
			else if ( this._contextNode && event.item.text == "Update" )
			{
				if ( this._contextNode instanceof TreeNodeAssetInstance )
				{
					User.get.project.updateAssets( [(<TreeNodeAssetInstance>this._contextNode).asset.id]);
				}
				//Update all groups
				else if ( this._contextNode == this._groupsNode )
				{
					while ( this._groupsNode.children.length > 0 )
						this._groupsNode.children[0].dispose();

					User.get.project.loadGroups();
				}
				//Update the scene
				else if ( this._contextNode == this._sceneNode )
				{
					while ( this._sceneNode.children.length > 0 )
						this._sceneNode.children[0].dispose();
					User.get.project.loadBehaviours();
				}
				else if ( this._contextNode instanceof TreeNodeGroup )
				{
					User.get.project.updateGroups( [( <TreeNodeGroup>this._contextNode ).groupID ] );
				}
				else if ( this._contextNode instanceof TreeNodeAssetClass )
				{
					var nodes = this._contextNode.getAllNodes( TreeNodeAssetInstance );
					var ids = [];
					for ( var i = 0, l = nodes.length; i < l; i++ )
						if ( nodes[i] instanceof TreeNodeAssetInstance )
							ids.push( ( <TreeNodeAssetInstance>nodes[i] ).asset.id );

					User.get.project.updateAssets( ids );
				}
				else if ( this._contextNode instanceof TreeNodeBehaviour )
				{
					User.get.project.updateBehaviours([(<TreeNodeBehaviour>this._contextNode).behaviour.id] );
				}
			}
		}


		/**
		* When we double click the tree
		* @param <object> e The jQuery event object
		*/
		onDblClick( e )
		{
			if ( this.selectedNode instanceof TreeNodeBehaviour )
			{
				var tabPair = CanvasTab.getSingleton().getTab( this.selectedNode.text );

				if ( tabPair == null )
					tabPair = CanvasTab.getSingleton().getTab( "*" + this.selectedNode.text );

				if ( tabPair )
					CanvasTab.getSingleton().selectTab( tabPair );
				else
				{
					var tabPair: TabPair = CanvasTab.getSingleton().addSpecialTab(this.selectedNode.text, CanvasTabType.CANVAS, (<TreeNodeBehaviour>this.selectedNode).behaviour );
					var canvas : Canvas = (<CanvasTabPair>tabPair).canvas;
					canvas.openFromDataObject();
					canvas.checkDimensions();
					CanvasTab.getSingleton().selectTab( tabPair );
				}
			}
		}

		/**
		* Use this function to get an array of the groups in the scene.
		* @returns {Array<TreeNodeGroup>} The array of group nodes
		*/
		getGroups() : Array<TreeNodeGroup>
		{
			var toRet = [];

			for ( var i = 0; i < this._groupsNode.children.length; i++ )
				toRet.push( this._groupsNode.children[i] );

			return toRet;
		}

		/**
		* Use this function to get a group by its ID
		* @param {string} id The ID of the group
		* @returns {TreeNodeGroup}
		*/
		getGroupByID(id: string): TreeNodeGroup
		{
			for ( var i = 0; i < this._groupsNode.children.length; i++ )
				if ( id == (<TreeNodeGroup>this._groupsNode.children[i]).groupID )
					return (<TreeNodeGroup>this._groupsNode.children[i]);

			return null;
		}

		/**
		* When the database returns from its command.
		* @param {ProjectEvents} response The loader response
		* @param {ProjectEvent} data The data sent from the server
		*/
		onGroupResponse(response: ProjectEvents, event: ProjectEvent )
		{
			var data = event.tag;
			
			if (response == ProjectEvents.GROUP_CREATED )
				this._groupsNode.addNode( new TreeNodeGroup( data.id, data.name, data.json, this ) );
			else if ( response == ProjectEvents.GROUP_UPDATED )
			{
				var node: TreeNodeGroup = <TreeNodeGroup>this._groupsNode.findNode( "groupID", data._id );
				if ( node )
					node.updateGroup( data.name, data.json );
			}
			else if ( response == ProjectEvents.GROUP_SAVED )
			{
				var node: TreeNodeGroup = <TreeNodeGroup>this._groupsNode.findNode( "groupID", data );
				if ( node )
					node.save( true );
			}
			else if (response == ProjectEvents.GROUP_DELETING )
			{
				var node: TreeNodeGroup = <TreeNodeGroup>this._groupsNode.findNode( "groupID", data );
				if ( node )
					node.dispose();
			}
		}


		/** When the rename form is about to proceed. We can cancel it by externally checking
		* if against the data.object and data.name variables.
		*/
		onRenameCheck(response: RenameFormEvents, event: RenameFormEvent, sender?: EventDispatcher )
		{
			//if (event.tag.object.type == "project" )
			//	return;
			var project = User.get.project;
			var len = project.behaviours.length;
			if (event.object instanceof BehaviourContainer )
				for ( var i = 0; i < len; i++ )
					if (project.behaviours[i].name == event.name )
					{
						(<Label>RenameForm.getSingleton().name.val).textfield.element.addClass( "red-border" );
						RenameForm.getSingleton().warning.textfield.element.css( "color", "#FF0000" );
						RenameForm.getSingleton().warning.text = "A behaviour with the name '" + event.name + "' already exists, please choose another.";
						event.cancel = true;
						return;
					}

			event.cancel = false;
		}

		/**
		* When the database returns from its command to rename an object.
		* @param {ProjectEvents} response The loader response
		* @param {ProjectEvent} data The data sent from the server
		*/
		onObjectRenamed(response: ProjectEvents, event: ProjectEvent )
		{
			var data = event.tag;

			if ( response == ProjectEvents.OBJECT_RENAMED )
			{
				if ( data.object != null )
				{
					var prevName = data.object.name;
					data.object.name = data.name;

					var node : TreeNode = null;
					if ( data.object instanceof BehaviourContainer )
						node = this._sceneNode.findNode( "behaviour", data.object );
					else if ( data.object instanceof Asset )
						node = this._assetsNode.findNode( "asset", data.object );
					else if ( data.object instanceof TreeNodeGroup )
						node = data.object;

					if ( node != null )
					{
						node.text = data.name;

						if ( data.object instanceof Asset )
							//PluginManager.getSingleton().assetRenamed( data.object, prevName );
							PluginManager.getSingleton().dispatchEvent( new AssetRenamedEvent( data.object, prevName ) );
					}
				}
			}
		}

		/**
		* When the database returns from its command.
		* @param {ProjectEvents} response The loader response
		* @param {Event} data The data sent from the server
		*/
		onBehaviourResponse(response: ProjectEvents, event: ProjectEvent )
		{
			var proj = User.get.project;
			//SAVE
			if (response == ProjectEvents.BEHAVIOUR_SAVED )
			{
				//If we have the behaviour
				if ( event.tag )
				{
					var node: TreeNodeBehaviour = <TreeNodeBehaviour>this.findNode("behaviour", event.tag );
					node.save( true );
				}
			}
		}


		/**
		* When the database returns from its command.
		* @param {ProjectEvents} response The type of event
		* @param {AssetEvent} event The data sent from the server
		*/
		onAssetResponse(response: ProjectEvents, event: AssetEvent  )
		{
			var data : Asset = event.asset;
			var proj: Project = User.get.project;

			if (response == ProjectEvents.ASSET_DELETING )
			{
				CanvasTab.getSingleton().removeAsset( data );

				var selectedNodes = [];
				var i = this.selectedNodes.length;
				while ( i-- )
					selectedNodes.push( this.selectedNodes[i] );

				i = selectedNodes.length;
				while ( i-- )
				{
					if ( selectedNodes[i].asset.id == data.id )
						selectedNodes[i].dispose();
				}
				this._contextNode = null;
			}
			//SAVE
			else if (response == ProjectEvents.ASSET_SAVED )
			{
				//If we have the asset
				if ( data )
				{
					var node: TreeNodeAssetInstance = <TreeNodeAssetInstance>this.findNode( "asset", data );
					if ( node )
						node.save();
				}
			}
			//UPDATE
			else if (response == ProjectEvents.ASSET_UPDATED )
			{
				//If we have the asset
				if ( data )
				{
					var node: TreeNodeAssetInstance = <TreeNodeAssetInstance>this.findNode( "asset", data );
					if ( node && node.selected )
					{
						node.save();
						node.onSelect();
					}
				}
			}
		}


		/**
		* When the database returns from its command.
		* @param {ProjectEvents} response The loader response
		* @param {Event} data The data sent from the server
		*/
		onProjectResponse(response: ProjectEvents, event: ProjectEvent )
		{
			if (response == ProjectEvents.BEHAVIOUR_DELETING )
			{
				var selectedNodes : Array<TreeNode> = [];

				var i = this.selectedNodes.length;
				while ( i-- )
					selectedNodes.push( this.selectedNodes[i] );

				i = selectedNodes.length;
				while ( i-- )
				{
					if (selectedNodes[i] instanceof TreeNodeBehaviour &&
							(<TreeNodeBehaviour>selectedNodes[i]).behaviour == event.tag)
					{
						var tabPair : TabPair = CanvasTab.getSingleton().getTab( selectedNodes[i].text );
						if ( tabPair )
							CanvasTab.getSingleton().removeTab(tabPair, true );
						else
						{
							tabPair = CanvasTab.getSingleton().getTab( "*" + selectedNodes[i].text );
							if ( tabPair )
								CanvasTab.getSingleton().removeTab( tabPair, true );
						}

						//this.selectedNodes[i].parent().data("component").removeNode( this.selectedNodes[i] );
						selectedNodes[i].dispose();

						if ( this._contextNode == selectedNodes[i] )
							this._contextNode = null;

					}
				}
			}
		}

		/**
		* This function will get a list of asset instances based on their class name.
		* @param {string|Array<string>} classNames The class name of the asset, or an array of class names
		* @returns Array<TreeNodeAssetInstance>
		*/
		getAssets(classNames: string|Array<string>): Array<TreeNodeAssetInstance>
		{
			var i = this._assetsNode.children.length;
			var toRet: Array<TreeNodeAssetInstance> = new Array();
			while ( i-- )
			{
				if ( this._assetsNode.children[i] instanceof TreeNodeAssetClass )
				{
					var nodes: Array<TreeNodeAssetInstance> = (<TreeNodeAssetClass>this._assetsNode.children[i]).getInstances(classNames );
					if ( nodes != null )
					{
						for ( var ii = 0; ii < nodes.length; ii++ )
							toRet.push( nodes[ii] );
					}
				}
			}

			return toRet;
		}
		
		/**
		* This function will get a list of asset classes.
		* returns {Array<TreeNodeAssetClass>}
		*/
		getAssetClasses(): Array<AssetClass>
		{
			var len = this._assetsNode.children.length;
			var toRet: Array<AssetClass> = new Array();
			for ( var i = 0; i < len; i++ )
			{
				if ( this._assetsNode.children[i] instanceof TreeNodeAssetClass )
				{
					toRet.push( (<TreeNodeAssetClass>this._assetsNode.children[i]).assetClass );

					var classes: Array<AssetClass> = ( <TreeNodeAssetClass>this._assetsNode.children[i] ).getClasses();
					if ( classes != null )
					{
						for ( var ii = 0; ii < classes.length; ii++ )
							toRet.push( classes[ii] );
					}
				}
			}

			return toRet;
		}

		/**
		* Called when the context menu is about to open.
		* @param <jQuery> e The jQuery event object
		*/
		onContext( e )
		{
			//Now hook the context events
			var targ = jQuery( e.target ).parent();
			if ( targ == null )
				return;

			var component = targ.data( "component" );

			//If the canvas
			if ( component instanceof TreeNode )
			{

				//Show / hide delete context item
				if ( component.canDelete )
					this._contextDel.element.show();
				else
					this._contextDel.element.hide();

				//Show / hide the copy context 
				if ( component.canCopy && this.selectedNodes.length == 1 )
					this._contextCopy.element.show();
				else
					this._contextCopy.element.hide();


				//Show / hide the update option
				if ( component.canUpdate )
					this._contextRefresh.element.show();
				else
					this._contextRefresh.element.hide();

				//Show / hide the save option
				if ( typeof ( component.saved ) !== "undefined" && !component.saved && this.selectedNodes.length == 1 )
					this._contextSave.element.show();
				else
					this._contextSave.element.hide();

				//Check if the groups node
				if ( component == this._groupsNode )
					this._contextAddGroup.element.show();
				else
					this._contextAddGroup.element.hide();



				//Show / hide add instance context item
				if ( component instanceof TreeNodeAssetClass && component.assetClass.abstractClass == false )
					this._contextAddInstance.element.show();
				else
					this._contextAddInstance.element.hide();

				//this.selectNode( component );

				this._contextNode = component;
				e.preventDefault();
				this._contextMenu.show( Application.getInstance(), e.pageX, e.pageY, false, true );
				this._contextMenu.element.css( { "width": "+=20px" });
			}
		}

		/**
		* Selects a node.
		* @param {TreeNode} node The node to select
		* @param {boolean} expandToNode A bool to say if we need to traverse the tree down until we get to the node
		* and expand all parent nodes
		* @param {boolean} multiSelect Do we allow nodes to be multiply selected
		*/
		selectNode( node: TreeNode, expandToNode: boolean = false, multiSelect: boolean = false )
		{
			if ( !this.enabled )
				return;

			var multipleNodesSelected = false;
			if ( multiSelect )
			{
				var selectedNodes = [];
				var i = this.selectedNodes.length;
				while ( i-- )
					selectedNodes.push( this.selectedNodes[i] );
				selectedNodes.push( node );

				i = selectedNodes.length;
				while ( i-- )
				{
					var ii = selectedNodes.length;
					while ( ii-- )
					{
						if ( selectedNodes[i].constructor.name != selectedNodes[ii].constructor.name && selectedNodes[i] != selectedNodes[ii] )
						{
							multipleNodesSelected = true;
							break;
						}
					}

					if ( multipleNodesSelected )
						break;
				}

				if ( multipleNodesSelected )
					multiSelect = false;
			}

			super.selectNode( node, expandToNode, multiSelect );

			if ( node == null )
				PluginManager.getSingleton().dispatchEvent( new AssetEvent( EditorEvents.ASSET_SELECTED, null ) );
				//PluginManager.getSingleton().assetSelected( null );
		}

		/**
		* Gets the singleton instance.
		* @returns <TreeViewScene> The singleton instance
		*/
		static getSingleton() : TreeViewScene
		{
			if ( !TreeViewScene._singleton )
				new TreeViewScene();

			return TreeViewScene._singleton;
		}


		/**
		* This will add a node to the treeview to represent the containers.
		* @param {BehaviourContainer} behaviour The behaviour we are associating with the node
		* @returns {TreeNodeBehaviour} 
		*/
		addContainer(behaviour: BehaviourContainer): TreeNodeBehaviour
		{
			var toRet: TreeNodeBehaviour = new TreeNodeBehaviour( behaviour );
			this._sceneNode.addNode( toRet );

			return toRet;
		}

		/**
		* This will add a node to the treeview to represent the behaviours available to developers
		* @param {BehaviourDefinition} template 
		* @returns {TreeNodePluginBehaviour}
		*/
		addPluginBehaviour(template: BehaviourDefinition): TreeNodePluginBehaviour
		{
			var toRet = new TreeNodePluginBehaviour( template );
			this._pluginBehaviours.addNode( toRet );
			return toRet;
		}

		/**
		* This will remove a node from the treeview that represents the behaviours available to developers.
		* @param  {string} name The name if the plugin behaviour
		* @returns {TreeNode}
		*/
		removePluginBehaviour( name : string, dispose : boolean = true ) : TreeNode
		{
			var node : TreeNode = this._pluginBehaviours.findNode( "mText", name );
			if ( node != null )
			{
				this._pluginBehaviours.removeNode( node );

				if ( dispose )
					node.dispose();
			}

			return node;
		}

		get sceneNode(): TreeNode { return this._sceneNode; }
		get assetsNode(): TreeNode { return this._assetsNode; }
		get groupsNode(): TreeNode { return this._groupsNode; }
		get pluginBehaviours(): TreeNode { return this._pluginBehaviours; }

		get contextNode(): TreeNode { return this._contextNode; }
		set contextNode( val: TreeNode) { this._contextNode = val; }
	}
}