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
		//private _curProj: Project;
		private _shortcutProxy: any;
        //private _resourceCreated: any;

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
			//this._curProj = null;

			jQuery( "body" ).on( "keydown", this.onKeyDown.bind( this ) );
			this.element.on( "dblclick", this.onDblClick.bind( this ) );
			this.element.on( "mousemove", this.onMouseMove.bind( this ) );

			this._quickAdd.element.detach();
            this._quickCopy.element.detach();
            //this._resourceCreated = this.onResourceCreated.bind(this);
            RenameForm.get.on("renaming", this.onRenameCheck, this );
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
        projectReady(project: Project)
        {
            project.on("resource-created", this.onResourceCreated, this);

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

			//this._curProj = User.get.project;
			//this._curProj.on( ProjectEvents.BEHAVIOUR_SAVED, this.onBehaviourResponse, this );
			//this._curProj.on( ProjectEvents.ASSET_SAVED, this.onAssetResponse, this );
			//this._curProj.on( ProjectEvents.ASSET_UPDATED, this.onAssetResponse, this );
			//this._curProj.on( ProjectEvents.BEHAVIOUR_DELETING, this.onProjectResponse, this );
			//this._curProj.on( ProjectEvents.ASSET_DELETING, this.onAssetResponse, this );
			//this._curProj.on( ProjectEvents.GROUP_CREATED, this.onGroupResponse, this );
			//this._curProj.on( ProjectEvents.GROUP_UPDATED, this.onGroupResponse, this );
			//this._curProj.on( ProjectEvents.GROUP_SAVED, this.onGroupResponse, this );
			//this._curProj.on( ProjectEvents.GROUP_DELETING, this.onGroupResponse, this );
            //RenameForm.get.on("renamed", this.onObjectRenamed, this);

        }

        /**
        * TODO: This is currently hooked on when a resource is created using the createResource call in project. Ideally this should be called whenever 
        * any form of resource is created. I.e. try to get rid of addAssetInstance
        * Called whenever a project resource is created
        */
        onResourceCreated(type: string, event: ProjectEvent)
        {
            var r = event.resouce;
            if (r instanceof Asset)
                this.addAssetInstance(r, false);
            else if (r instanceof Container)
                this._sceneNode.addNode(new TreeNodeBehaviour(r));
            else if (r instanceof GroupArray)
                this._groupsNode.addNode(new TreeNodeGroup(r));

            // Todo: Add script nodes + files?
        }

		/**
		* Called when the project is reset by either creating a new one or opening an older one.
		*/
        projectReset(project: Project)
        {
            project.off("resource-created", this.onResourceCreated, this);

			//if ( this._curProj )
			//{
				//this._curProj.off( ProjectEvents.BEHAVIOUR_SAVED, this.onBehaviourResponse, this );
				//this._curProj.off( ProjectEvents.ASSET_SAVED, this.onAssetResponse, this );
				//this._curProj.off( ProjectEvents.ASSET_UPDATED, this.onAssetResponse, this );
				//this._curProj.off( ProjectEvents.BEHAVIOUR_DELETING, this.onProjectResponse, this );
				//this._curProj.off( ProjectEvents.ASSET_DELETING, this.onAssetResponse, this );
				//this._curProj.off( ProjectEvents.GROUP_CREATED, this.onGroupResponse, this );
				//this._curProj.off( ProjectEvents.GROUP_UPDATED, this.onGroupResponse, this );
				//this._curProj.off( ProjectEvents.GROUP_SAVED, this.onGroupResponse, this );
				//this._curProj.off( ProjectEvents.GROUP_DELETING, this.onGroupResponse, this );
                //RenameForm.get.off("renamed", this.onObjectRenamed, this);
			//}

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
				//If F2 pressed
				if ( jQuery( e.target ).is( "input" ) == false && e.keyCode == 113 )
                {
                    var promise: Promise<IRenameToken>;
                    var node = this.selectedNode;

					//Unselect all other items
                    if (node != null)
                    {
                        if (node instanceof TreeNodeGroup)
                            promise = RenameForm.get.renameObject(node.resource.entry, node.resource.entry._id, ResourceType.GROUP);
                        else if (node instanceof TreeNodeBehaviour)
                            promise = RenameForm.get.renameObject(node.resource.entry, node.resource.entry._id, ResourceType.CONTAINER);
                        else if (node instanceof TreeNodeAssetInstance)
                            promise = RenameForm.get.renameObject(node.resource.entry, node.resource.entry._id, ResourceType.ASSET);

                        if (promise)
                        {
                            node.loading = true;

                            promise.then(function(token)
                            {
                                if (token.cancelled)
                                    return;

                                node.loading = false;
                                node.text = token.newName;

                                if (node instanceof TreeNodeAssetInstance)
                                    PluginManager.getSingleton().emit(new AssetRenamedEvent(node.resource, token.oldName));
                            });
                        }
                    }
				}
			}
		}

		/**
		* Creates an asset node for the tree
		* @param {Asset} asset The asset to associate with the node
		*/
		addAssetInstance( asset : Asset, collapse : boolean = true )
		{
			// Add all the asset nodes 
            var classNode: TreeNodeAssetClass = <TreeNodeAssetClass>this.findNode("className", asset.entry.className )

			if ( classNode != null )
			{
				var instanceNode: TreeNodeAssetInstance = new TreeNodeAssetInstance( classNode.assetClass, asset );
				classNode.addNode( instanceNode, collapse );

				instanceNode.element.draggable( { opacity: 0.7, helper: "clone", appendTo: "body", containment: "body" });

				return true;
			}

			return false;
		}

		///**
		//* Update the asset node so that its saved. 
		//* @param {Asset} asset The asset to associate with the node
		//*/
		//updateAssetInstance( asset: Asset )
		//{
		//	var node: TreeNodeAssetInstance = <TreeNodeAssetInstance>this.findNode( "asset", asset );
		//	if ( node != null )
		//		node.save();
		//}

		///**
		//* Update the behaviour node so that its saved and if any tabs are open they need to re-loaded.
		//* @param {Container} container The hehaviour object we need to update
		//*/
		//updateBehaviour( container : Container )
		//{
		//	var node: TreeNodeBehaviour = <TreeNodeBehaviour>this.findNode( "behaviour", container );
		//	node.behaviour = container;
		//	if ( node != null )
		//	{
		//		//First we try and get the tab
  //              var tabPair: TabPair = CanvasTab.getSingleton().getTab(container.entry.name );

		//		//Tab was not found - check if its because its unsaved
		//		if ( tabPair == null )
  //                  tabPair = CanvasTab.getSingleton().getTab("*" + container.entry.name );

		//		//If we have a tab then rename it to the same as the node
		//		if ( tabPair )
		//		{
		//			tabPair.tabSelector.element.trigger( "click" );
		//			var canvas : Canvas = (<CanvasTabPair>tabPair).canvas;
		//			canvas.container = container;
		//			CanvasTab.getSingleton().selectTab( tabPair );
		//			canvas.openFromDataObject();
		//			canvas.checkDimensions();
		//		}

		//		node.save( true );
		//	}
		//}


		/**
		* Called when we select a menu item. 
		*/
		onContextSelect( response: ContextMenuEvents, event: ContextMenuEvent, sender? : EventDispatcher ) 
        {
            var promise: Promise<any>;
            var project = User.get.project;
            var context = this._contextNode;
            var selection = event.item.text;

            // Get the selected nodes
            var selectedNodes: Array<TreeNode> = [];
            var i = this.selectedNodes.length;
            while (i--)
                selectedNodes.push(this.selectedNodes[i]);

            if (!context)
                return;

            // Hide the loading on complete
            var resolveRequest = function (promise: Promise<any>, node: TreeNode)
            {
                promise.then(function ()
                {
                    node.loading = false;

                }).catch(function (err: Error)
                {
                    node.loading = false;
                    Logger.logMessage(err.message, null, LogType.ERROR)
                });
            };

            switch (selection)
            {
                case "Delete":
                    this._quickAdd.element.off("click", this._shortcutProxy);
                    this._quickCopy.element.off("click", this._shortcutProxy);
                    this._quickAdd.element.detach();
                    this._quickCopy.element.detach();

                    selectedNodes.forEach(function (val, index)
                    {
                        val.loading = true;
                        if (val instanceof TreeNodeResource)
                            resolveRequest(project.deleteResources([(<ProjectResource<Engine.IResource>>val.resource).entry._id]), val);
                        else
                            val.dispose();
                    });

                    break;
                case "Copy":
                    if (context instanceof TreeNodeAssetInstance)
                        project.copyAsset(context.resource.entry._id);

                    break;
                case "Add Instance":
                    if ( context instanceof TreeNodeAssetClass)
                        project.createResource<Engine.IAsset>(ResourceType.ASSET, { name: "New " + context.assetClass.name, className: context.assetClass.name });

                    break;
                case "Save":
                    selectedNodes.forEach(function (val, index)
                    {
                        val.loading = true;
                        if (val instanceof TreeNodeResource)
                            resolveRequest(project.saveResource((<ProjectResource<Engine.IResource>>val.resource).entry._id), val);
                    });	

                    break;
                case "Add Group":
                    context.loading = true;
                    promise = project.createResource<Engine.IGroup>(ResourceType.GROUP, { name: "New Group" }).then(function ()
                    {
                        context.loading = false;

                    }).catch(function (err: Error)
                    {
                        context.loading = false;
                        Logger.logMessage(err.message, null, LogType.ERROR);
                        })

                    break;
                case "Update":

                    if (context == this._sceneNode || context == this._groupsNode)
                    {
                        context.loading = true;
                        var type: ResourceType = (context == this._sceneNode ? ResourceType.CONTAINER : ResourceType.GROUP);
                        var message = false;
                        for (var i = 0, l = context.nodes.length; i < l; i++)
                            if (context.nodes[i].modified)
                            {
                                message = true;
                                MessageBox.show("You have unsaved work are you sure you want to refresh?", ["Yes", "No"], function (text)
                                {
                                    if (text == "Yes")
                                        resolveRequest( project.loadResources(ResourceType.CONTAINER), context);
                                    else
                                        context.loading = true;
                                });
                                break;
                            }

                        if (!message)
                            resolveRequest(project.loadResources(ResourceType.CONTAINER), context);
                    }
                    else if (context instanceof TreeNodeAssetClass)
                    {
                        // TODO: Make sure this works
                        var nodes = <Array<TreeNodeResource<ProjectResource<Engine.IResource>>>>context.getAllNodes(context.constructor);
                        nodes.forEach(function (node, index)
                        {
                            node.loading = true;
                            resolveRequest(project.refreshResource(nodes[i].resource.entry._id), node);
                        });
                    }
                    else if (context instanceof TreeNodeResource)
                    {
                        context.loading = true;
                        if (context.modified)
                        {
                            MessageBox.show("You have unsaved work are you sure you want to refresh?", ["Yes", "No"], function (text)
                            {
                                if (text == "Yes")
                                    resolveRequest(project.refreshResource((<ProjectResource<Engine.IResource>>context.resource).entry._id), context);
                                else
                                    context.loading = false;
                            });
                            break;
                        }
                        else
                            resolveRequest(project.refreshResource((<ProjectResource<Engine.IResource>>context.resource).entry._id), context);
                    }

                    break;
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
                    var tabPair: TabPair = CanvasTab.getSingleton().addSpecialTab(this.selectedNode.text, CanvasTabType.CANVAS, (<TreeNodeBehaviour>this.selectedNode).resource );
					var canvas : Canvas = (<CanvasTabPair>tabPair).canvas;
					canvas.openFromDataObject();
					canvas.checkDimensions();
					CanvasTab.getSingleton().selectTab( tabPair );
				}
			}
		}

		///**
		//* Use this function to get an array of the groups in the scene.
		//* @returns {Array<TreeNodeGroup>} The array of group nodes
		//*/
		//getGroups() : Array<TreeNodeGroup>
		//{
		//	var toRet = [];

		//	for ( var i = 0; i < this._groupsNode.children.length; i++ )
		//		toRet.push( this._groupsNode.children[i] );

		//	return toRet;
		//}

		///**
		//* Use this function to get a group by its ID
		//* @param {string} id The ID of the group
		//* @returns {TreeNodeGroup}
		//*/
		//getGroupByID(id: string): TreeNodeGroup
		//{
		//	for ( var i = 0; i < this._groupsNode.children.length; i++ )
		//		if ( id == (<TreeNodeGroup>this._groupsNode.children[i]).groupID )
		//			return (<TreeNodeGroup>this._groupsNode.children[i]);

		//	return null;
		//}

		/**
		* When the database returns from its command.
		* @param {ProjectEvents} response The loader response
		* @param {ProjectEvent} data The data sent from the server
		*/
		//onGroupResponse(response: ProjectEvents, event: ProjectEvent )
		//{
		//	var data = event.tag;
			
            //if (response == ProjectEvents.GROUP_CREATED)
            //{
            //    this._groupsNode.addNode(new TreeNodeGroup(data.id, data.name, data.json, this));
            //}
			//else if ( response == ProjectEvents.GROUP_UPDATED )
			//{
			//	var node: TreeNodeGroup = <TreeNodeGroup>this._groupsNode.findNode( "groupID", data._id );
			//	if ( node )
			//		node.updateGroup( data.name, data.json );
			//}
			//else if ( response == ProjectEvents.GROUP_SAVED )
			//{
				//var node: TreeNodeGroup = <TreeNodeGroup>this._groupsNode.findNode( "groupID", data );
				//if ( node )
				//	node.save( true );
			//}
			//else if (response == ProjectEvents.GROUP_DELETING )
			//{
			//	var node: TreeNodeGroup = <TreeNodeGroup>this._groupsNode.findNode( "groupID", data );
			//	if ( node )
			//		node.dispose();
			//}
		//}


		/** When the rename form is about to proceed. We can cancel it by externally checking
		* if against the data.object and data.name variables.
		*/
		onRenameCheck(response: string, event: RenameFormEvent, sender?: EventDispatcher )
		{
			//if (event.tag.object.type == "project" )
			//	return;
			var project = User.get.project;
            var len = project.containers.length;
            if (event.resourceType == ResourceType.CONTAINER)
				for ( var i = 0; i < len; i++ )
                    if (project.containers[i].entry.name == event.name )
                    {
                        event.reason = "A behaviour with the name '" + event.name + "' already exists, please choose another.";
						return;
					}

			event.cancel = false;
		}

		///**
		//* When the database returns from its command to rename an object.
		//* @param {string} type The event type
		//* @param {RenameFormEvent} event The event from the rename form
		//*/
  //      onObjectRenamed(type: string, event: RenameFormEvent)
		//{
		//	var data = event.tag;
            
  //          if (data.object != null)
  //          {
  //              var prevName = data.object.name;
  //              data.object.name = data.name;

  //              var node: TreeNode = null;
  //              if (data.object instanceof Container)
  //                  node = this._sceneNode.findNode("behaviour", data.object);
  //              else if (data.object instanceof Asset)
  //                  node = this._assetsNode.findNode("asset", data.object);
  //              else if (data.object instanceof TreeNodeGroup)
  //                  node = data.object;

  //              if (node != null)
  //              {
  //                  node.text = data.name;

  //                  if (data.object instanceof Asset)
  //                      PluginManager.getSingleton().emit(new AssetRenamedEvent(data.object, prevName));
  //              }
  //          }
		//}

		///**
		//* When the database returns from its command.
		//* @param {ProjectEvents} response The loader response
		//* @param {Event} data The data sent from the server
		//*/
		//onBehaviourResponse(response: ProjectEvents, event: ProjectEvent )
		//{
		//	var proj = User.get.project;
		//	//SAVE
		//	if (response == ProjectEvents.BEHAVIOUR_SAVED )
		//	{
		//		//If we have the behaviour
		//		if ( event.tag )
		//		{
		//			var node: TreeNodeBehaviour = <TreeNodeBehaviour>this.findNode("behaviour", event.tag );
		//			node.save( true );
		//		}
		//	}
		//}


		///**
		//* When the database returns from its command.
		//* @param {ProjectEvents} response The type of event
		//* @param {AssetEvent} event The data sent from the server
		//*/
		//onAssetResponse(response: ProjectEvents, event: AssetEvent  )
		//{
		//	var data : Asset = event.asset;
		//	var proj: Project = User.get.project;

			//if (response == ProjectEvents.ASSET_DELETING )
			//{
			//	CanvasTab.getSingleton().removeAsset( data );

			//	var selectedNodes = [];
			//	var i = this.selectedNodes.length;
			//	while ( i-- )
			//		selectedNodes.push( this.selectedNodes[i] );

			//	i = selectedNodes.length;
			//	while ( i-- )
			//	{
   //                 if (selectedNodes[i].asset.id == data.entry._id )
			//			selectedNodes[i].dispose();
			//	}
			//	this._contextNode = null;
			//}
			////SAVE
			//else if (response == ProjectEvents.ASSET_SAVED )
			//{
			//	//If we have the asset
			//	if ( data )
			//	{
			//		var node: TreeNodeAssetInstance = <TreeNodeAssetInstance>this.findNode( "asset", data );
			//		if ( node )
			//			node.save();
			//	}
			//}
			////UPDATE
			//else if (response == ProjectEvents.ASSET_UPDATED )
			//{
			//	//If we have the asset
			//	if ( data )
			//	{
			//		var node: TreeNodeAssetInstance = <TreeNodeAssetInstance>this.findNode( "asset", data );
			//		if ( node && node.selected )
			//		{
			//			node.save();
			//			node.onSelect();
			//		}
			//	}
			//}
		//}


		///**
		//* When the database returns from its command.
		//* @param {ProjectEvents} response The loader response
		//* @param {Event} data The data sent from the server
		//*/
		//onProjectResponse(response: ProjectEvents, event: ProjectEvent )
		//{
		//	if (response == ProjectEvents.BEHAVIOUR_DELETING )
		//	{
		//		var selectedNodes : Array<TreeNode> = [];

		//		var i = this.selectedNodes.length;
		//		while ( i-- )
		//			selectedNodes.push( this.selectedNodes[i] );

		//		i = selectedNodes.length;
		//		while ( i-- )
		//		{
  //                  if (selectedNodes[i] instanceof TreeNodeBehaviour && (<TreeNodeBehaviour>selectedNodes[i]).resource == event.tag)
		//			{
		//				var tabPair : TabPair = CanvasTab.getSingleton().getTab( selectedNodes[i].text );
		//				if ( tabPair )
		//					CanvasTab.getSingleton().removeTab(tabPair, true );
		//				else
		//				{
		//					tabPair = CanvasTab.getSingleton().getTab( "*" + selectedNodes[i].text );
		//					if ( tabPair )
		//						CanvasTab.getSingleton().removeTab( tabPair, true );
		//				}

		//				//this.selectedNodes[i].parent().data("component").removeNode( this.selectedNodes[i] );
		//				selectedNodes[i].dispose();

		//				if ( this._contextNode == selectedNodes[i] )
		//					this._contextNode = null;

		//			}
		//		}
		//	}
		//}

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

            var component: Component = targ.data("component");

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
                if (component.modified)
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
                
				this._contextNode = component;
				e.preventDefault();
				this._contextMenu.show( Application.getInstance(), e.pageX, e.pageY, false, true );
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
				PluginManager.getSingleton().emit( new AssetEvent( EditorEvents.ASSET_SELECTED, null ) );
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


		///**
		//* This will add a node to the treeview to represent the containers.
		//* @param {Container} behaviour The behaviour we are associating with the node
		//* @returns {TreeNodeBehaviour} 
		//*/
		//addContainer(behaviour: Container): TreeNodeBehaviour
		//{
		//	var toRet: TreeNodeBehaviour = new TreeNodeBehaviour( behaviour );
		//	this._sceneNode.addNode( toRet );

		//	return toRet;
		//}

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