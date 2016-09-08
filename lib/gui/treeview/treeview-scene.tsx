namespace Animate {

	/**
	* An implementation of the tree view for the scene.
	*/
    export class TreeViewScene extends TreeNodeStore {
        private static _singleton: TreeViewScene;

        // private _contextMenu: ContextMenu;
        // private _contextCopy: ContextMenuItem;
        // private _contextDel: ContextMenuItem;
        // private _contextAddInstance: ContextMenuItem;
        // private _contextSave: ContextMenuItem;
        // private _contextRefresh: ContextMenuItem;
        // private _contextAddGroup: ContextMenuItem;
        private _quickCopy: Component;
        private _quickAdd: Component;
        private _shortcutProxy: any;

        // private _context : IReactContextMenuItem[];

        constructor() {
            super();

            this.addNode( new TreeViewNodeContainers() );
            this.addNode( new TreeViewNodeAssets() );
            this.addNode( new TreeViewNodeGroups() );
            this.addNode( new TreeViewNodeBehaviours() );


            TreeViewScene._singleton = this;

            // this._context = [
            //     { label: 'Delete', prefix: <i className='fa fa-times' aria-hidden='true'></i>, onSelect: (e) => this.onDelete() }
            // ];

            // this._groupsNode.canUpdate = true;

            // //Create the context menu
            // this._contextMenu = new ContextMenu();
            // this._contextCopy = this._contextMenu.addItem( new ContextMenuItem( 'Copy', 'media/copy-small.png' ) );
            // this._contextDel = this._contextMenu.addItem( new ContextMenuItem( 'Delete', 'media/cross.png' ) );
            // this._contextAddInstance = this._contextMenu.addItem( new ContextMenuItem( 'Add Instance', 'media/portal.png' ) );
            // this._contextSave = this._contextMenu.addItem( new ContextMenuItem( 'Save', 'media/save-20.png' ) );
            // this._contextRefresh = this._contextMenu.addItem( new ContextMenuItem( 'Update', 'media/refresh.png' ) );
            // this._contextAddGroup = this._contextMenu.addItem( new ContextMenuItem( 'Add Group', 'media/array.png' ) );

            // this._contextMenu.on( ContextMenuEvents.ITEM_CLICKED, this.onContextSelect, this );


            // jQuery( document ).on( 'contextmenu', this.onContext2.bind( this ) );

            // this._quickAdd = new Component( '<div class='quick-button'><img src='media/portal.png'/></div>', this );
            // this._quickCopy = new Component( '<div class='quick-button'><img src='media/copy-small.png'/></div>', this );

            // this._quickAdd.tooltip = 'Add new instance';
            // this._quickCopy.tooltip = 'Copy instance';

            // this._contextNode = null;
            // this._shortcutProxy = this.onShortcutClick.bind( this );
            // //this._curProj = null;

            // jQuery( 'body' ).on( 'keydown', this.onKeyDown.bind( this ) );
            // this.element.on( 'dblclick', this.onDblClick.bind( this ) );
            // this.element.on( 'mousemove', this.onMouseMove.bind( this ) );

            // this._quickAdd.element.detach();
            // this._quickCopy.element.detach();
            // //this._resourceCreated = this.onResourceCreated.bind(this);
            // RenameForm.get.on('renaming', this.onRenameCheck, this );
        }

        // onContext(e: React.MouseEvent, n: TreeNodeModel) {
        // 	e.preventDefault();
        // 	ReactContextMenu.show({ x: e.pageX, y : e.pageY, items : this._context });
        // }


        onShortcutClick( e ) {
            // var comp = jQuery( e.currentTarget ).data( 'component' );

            // var node : TreeNode = comp.element.parent().parent().parent().data( 'component' );
            // this.selectedNode = node;
            // this._contextNode = node;

            // if ( comp === this._quickAdd )
            // 	this.onContextSelect( ContextMenuEvents.ITEM_CLICKED, new ContextMenuEvent( this._contextAddInstance, ContextMenuEvents.ITEM_CLICKED ) );
            // else
            // 	this.onContextSelect( ContextMenuEvents.ITEM_CLICKED, new ContextMenuEvent( this._contextCopy, ContextMenuEvents.ITEM_CLICKED ) );
        }

        onMouseMove( e ) {
            // if ( jQuery( e.target ).hasClass( 'quick-button' ) )
            // 	return;

            // var node: Component = jQuery( e.target ).parent().data( 'component' );

            // this._quickAdd.element.off( 'click', this._shortcutProxy );
            // this._quickCopy.element.off( 'click', this._shortcutProxy );

            // this._quickAdd.element.detach();
            // this._quickCopy.element.detach();

            // if ( node && node instanceof TreeNode ) {
            // 	if ( node instanceof TreeNodeAssetInstance ) {
            // 		jQuery( '.text:first', node.element ).append( this._quickCopy.element );
            // 		this._quickCopy.element.on( 'click', this._shortcutProxy );
            // 	}
            // 	else if ( node instanceof TreeNodeAssetClass && !( node as TreeNodeAssetClass ).assetClass.abstractClass ) {
            // 		jQuery( '.text:first', node.element ).append( this._quickAdd.element );
            // 		this._quickAdd.element.on( 'click', this._shortcutProxy );
            // 	}
            // }
        }

		/**
		* Called when the project is loaded and ready.
		*/
        projectReady( project: Project ) {
            project.on( 'resource-created', this.onResourceCreated, this );


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
            //RenameForm.get.on('renamed', this.onObjectRenamed, this);

        }

        /**
        * TODO: This is currently hooked on when a resource is created using the createResource call in project. Ideally this should be called whenever
        * any form of resource is created. I.e. try to get rid of addAssetInstance
        * Called whenever a project resource is created
        */
        onResourceCreated( type: string, event: ProjectEvent<ProjectResource<Engine.IResource>> ) {
            // Todo: Add script nodes + files?
        }

		/**
		* Called when the project is reset by either creating a new one or opening an older one.
		*/
        projectReset( project: Project ) {
            // project.off('resource-created', this.onResourceCreated, this);

            // //if ( this._curProj )
            // //{
            // 	//this._curProj.off( ProjectEvents.BEHAVIOUR_SAVED, this.onBehaviourResponse, this );
            // 	//this._curProj.off( ProjectEvents.ASSET_SAVED, this.onAssetResponse, this );
            // 	//this._curProj.off( ProjectEvents.ASSET_UPDATED, this.onAssetResponse, this );
            // 	//this._curProj.off( ProjectEvents.BEHAVIOUR_DELETING, this.onProjectResponse, this );
            // 	//this._curProj.off( ProjectEvents.ASSET_DELETING, this.onAssetResponse, this );
            // 	//this._curProj.off( ProjectEvents.GROUP_CREATED, this.onGroupResponse, this );
            // 	//this._curProj.off( ProjectEvents.GROUP_UPDATED, this.onGroupResponse, this );
            // 	//this._curProj.off( ProjectEvents.GROUP_SAVED, this.onGroupResponse, this );
            // 	//this._curProj.off( ProjectEvents.GROUP_DELETING, this.onGroupResponse, this );
            //     //RenameForm.get.off('renamed', this.onObjectRenamed, this);
            // //}

            // this.children[0].clear();
            // this.children[1].clear();
            // this._groupsNode.clear();
        }

		/**
		* Catch the key down events.
		* @param e The event passed by jQuery
		*/
        onKeyDown( e ) {
            // if ( Application.getInstance().focusObj !== null && Application.getInstance().focusObj instanceof TreeNode ) {
            // 	//If F2 pressed
            // 	if ( jQuery( e.target ).is( 'input' ) === false && e.keyCode === 113 ) {
            //         var promise: Promise<IRenameToken>;
            //         var node = this.selectedNode;

            // 		//Unselect all other items
            //         if (node !== null) {
            //             if (node instanceof TreeNodeGroup)
            //                 promise = RenameForm.get.renameObject(node.resource.entry, node.resource.entry._id, ResourceType.GROUP);
            //             else if (node instanceof TreeNodeBehaviour)
            //                 promise = RenameForm.get.renameObject(node.resource.entry, node.resource.entry._id, ResourceType.CONTAINER);
            //             else if (node instanceof TreeNodeAssetInstance)
            //                 promise = RenameForm.get.renameObject(node.resource.entry, node.resource.entry._id, ResourceType.ASSET);

            //             if (promise) {
            //                 node.loading = true;

            //                 promise.then(function(token) {
            //                     if (token.cancelled)
            //                         return;

            //                     node.loading = false;
            //                     node.text = token.newName;

            //                     if (node instanceof TreeNodeAssetInstance)
            //                         PluginManager.getSingleton().emit(new AssetRenamedEvent(node.resource, token.oldName));
            //                 });
            //             }
            //         }
            // 	}
            // }
        }

        ///**
        //* Update the asset node so that its saved.
        //* @param {Asset} asset The asset to associate with the node
        //*/
        //updateAssetInstance( asset: Asset )
        //{
        //	var node: TreeNodeAssetInstance = <TreeNodeAssetInstance>this.findNode( 'asset', asset );
        //	if ( node !== null )
        //		node.save();
        //}

        ///**
        //* Update the behaviour node so that its saved and if any tabs are open they need to re-loaded.
        //* @param {Container} container The hehaviour object we need to update
        //*/
        //updateBehaviour( container : Container )
        //{
        //	var node: TreeNodeBehaviour = <TreeNodeBehaviour>this.findNode( 'behaviour', container );
        //	node.behaviour = container;
        //	if ( node !== null )
        //	{
        //		//First we try and get the tab
        //              var tabPair: TabPair = CanvasTab.getSingleton().getTab(container.entry.name );

        //		//Tab was not found - check if its because its unsaved
        //		if ( tabPair === null )
        //                  tabPair = CanvasTab.getSingleton().getTab('*' + container.entry.name );

        //		//If we have a tab then rename it to the same as the node
        //		if ( tabPair )
        //		{
        //			tabPair.tabSelector.element.trigger( 'click' );
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
        onContextSelect( response: Event, event: Event, sender?: EventDispatcher ) {
            // var promise: Promise<any>;
            // var project = User.get.project;
            // var context = this._contextNode;
            // var selection = event.item.text;

            // // Get the selected nodes
            // var selectedNodes: Array<TreeNode> = [];
            // var i = this.selectedNodes.length;
            // while (i--)
            //     selectedNodes.push(this.selectedNodes[i]);

            // if (!context)
            //     return;

            // // Hide the loading on complete
            // var resolveRequest = function (promise: Promise<any>, node: TreeNode) {
            //     promise.then(function () {
            //         node.loading = false;

            //     }).catch(function (err: Error) {
            //         node.loading = false;
            //         Logger.logMessage(err.message, null, LogType.ERROR)
            //     });
            // };

            // switch (selection) {
            //     case 'Delete':
            //         this._quickAdd.element.off('click', this._shortcutProxy);
            //         this._quickCopy.element.off('click', this._shortcutProxy);
            //         this._quickAdd.element.detach();
            //         this._quickCopy.element.detach();

            //         selectedNodes.forEach(function (val, index) {
            //             val.loading = true;
            //             if (val instanceof TreeNodeResource)
            //                 resolveRequest(project.deleteResources([(val.resource as ProjectResource<Engine.IResource>).entry._id]), val);
            //             else
            //                 val.dispose();
            //         });

            //         break;
            //     case 'Copy':
            //         if (context instanceof TreeNodeAssetInstance) {
            //             context.loading = true;
            //             resolveRequest(project.copyResource(context.resource.entry._id, ResourceType.ASSET), context);
            //         }
            //         break;
            //     case 'Add Instance':
            //         if ( context instanceof TreeNodeAssetClass)
            //             project.createResource<Engine.IAsset>(ResourceType.ASSET, { name: 'New ' + context.assetClass.name, className: context.assetClass.name });

            //         break;
            //     case 'Save':
            //         selectedNodes.forEach(function (val, index) {
            //             val.loading = true;
            //             if (val instanceof TreeNodeResource)
            //                 resolveRequest(project.saveResource((val.resource as ProjectResource<Engine.IResource>).entry._id), val);
            //         });

            //         break;
            //     case 'Add Group':
            //         context.loading = true;
            //         promise = project.createResource<Engine.IGroup>(ResourceType.GROUP, { name: 'New Group' }).then(function () {
            //             context.loading = false;

            //         }).catch(function (err: Error) {
            //             context.loading = false;
            //             Logger.logMessage(err.message, null, LogType.ERROR);
            //             })

            //         break;
            //     case 'Update':

            //         if (context === this._sceneNode || context === this._groupsNode) {
            //             context.loading = true;
            //             var type: ResourceType = (context === this._sceneNode ? ResourceType.CONTAINER : ResourceType.GROUP);
            //             var message = false;
            //             for (var i = 0, l = context.nodes.length; i < l; i++)
            //                 if (context.nodes[i].modified) {
            //                     message = true;
            // 					ReactWindow.show(MessageBox, {
            // 						message :'You have unsaved work are you sure you want to refresh?',
            // 						buttons: ['Yes', 'No'],
            // 						onChange: function(button) {
            // 							if (button === 'Yes')
            // 								resolveRequest( project.loadResources(ResourceType.CONTAINER), context);
            // 							else
            // 								context.loading = true;
            // 						}
            // 					} as IMessageBoxProps);
            //                     break;
            //                 }

            //             if (!message)
            //                 resolveRequest(project.loadResources(ResourceType.CONTAINER), context);
            //         }
            //         else if (context instanceof TreeNodeAssetClass) {
            //             // TODO: Make sure this works
            //             var nodes = context.getAllNodes(context.constructor) as Array<TreeNodeResource<ProjectResource<Engine.IResource>>>;
            //             nodes.forEach(function (node, index) {
            //                 node.loading = true;
            //                 resolveRequest(project.refreshResource(nodes[i].resource.entry._id), node);
            //             });
            //         }
            //         else if (context instanceof TreeNodeResource) {
            //             context.loading = true;
            //             if (context.modified)  {
            // 				ReactWindow.show(MessageBox, {
            // 						message :'You have unsaved work are you sure you want to refresh?',
            // 						buttons: ['Yes', 'No'],
            // 						onChange: function(button) {
            // 							if (button === 'Yes')
            // 								resolveRequest(project.refreshResource((context.resource as ProjectResource<Engine.IResource>).entry._id), context);
            // 							else
            // 								context.loading = false;
            // 						}
            // 					} as IMessageBoxProps);
            //                 break;
            //             }
            //             else
            //                 resolveRequest(project.refreshResource((context.resource as ProjectResource<Engine.IResource>).entry._id), context);
            //         }

            //         break;
            // }
        }


		/**
		* When we double click the tree
		* @param <object> e The jQuery event object
		*/
        onDblClick( e ) {
            // if ( this.selectedNode instanceof TreeNodeBehaviour ) {
            // 	var tabPair = CanvasTab.getSingleton().getPaneByLabel( this.selectedNode.text );

            // 	if ( tabPair === null )
            // 		tabPair = CanvasTab.getSingleton().getPaneByLabel( '*' + this.selectedNode.text );

            // 	// TODO: Update required from upgrade to TSX
            // 	// =========================================

            // 	// if ( tabPair )
            // 	// 	CanvasTab.getSingleton().selectTab( tabPair );
            // 	// else {
            //     //     var tabPair: TabPair = CanvasTab.getSingleton().addSpecialTab(this.selectedNode.text, CanvasTabType.CANVAS, (<TreeNodeBehaviour>this.selectedNode).resource );
            // 	// 	var canvas : Canvas = (<CanvasTabPair>tabPair).canvas;
            //     //     canvas.deTokenize();
            // 	// 	canvas.checkDimensions();
            // 	// 	CanvasTab.getSingleton().selectTab( tabPair );
            // 	// }

            // 	// =========================================
            // }
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
        //		if ( id === (<TreeNodeGroup>this._groupsNode.children[i]).groupID )
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

        //if (response === ProjectEvents.GROUP_CREATED)
        //{
        //    this._groupsNode.addNode(new TreeNodeGroup(data.id, data.name, data.json, this));
        //}
        //else if ( response === ProjectEvents.GROUP_UPDATED )
        //{
        //	var node: TreeNodeGroup = <TreeNodeGroup>this._groupsNode.findNode( 'groupID', data._id );
        //	if ( node )
        //		node.updateGroup( data.name, data.json );
        //}
        //else if ( response === ProjectEvents.GROUP_SAVED )
        //{
        //var node: TreeNodeGroup = <TreeNodeGroup>this._groupsNode.findNode( 'groupID', data );
        //if ( node )
        //	node.save( true );
        //}
        //else if (response === ProjectEvents.GROUP_DELETING )
        //{
        //	var node: TreeNodeGroup = <TreeNodeGroup>this._groupsNode.findNode( 'groupID', data );
        //	if ( node )
        //		node.dispose();
        //}
        //}

        ///**
        //* When the database returns from its command to rename an object.
        //* @param {string} type The event type
        //* @param {RenameFormEvent} event The event from the rename form
        //*/
        //      onObjectRenamed(type: string, event: RenameFormEvent)
        //{
        //	var data = event.tag;

        //          if (data.object !== null)
        //          {
        //              var prevName = data.object.name;
        //              data.object.name = data.name;

        //              var node: TreeNode = null;
        //              if (data.object instanceof Container)
        //                  node = this._sceneNode.findNode('behaviour', data.object);
        //              else if (data.object instanceof Asset)
        //                  node = this._assetsNode.findNode('asset', data.object);
        //              else if (data.object instanceof TreeNodeGroup)
        //                  node = data.object;

        //              if (node !== null)
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
        //	if (response === ProjectEvents.BEHAVIOUR_SAVED )
        //	{
        //		//If we have the behaviour
        //		if ( event.tag )
        //		{
        //			var node: TreeNodeBehaviour = <TreeNodeBehaviour>this.findNode('behaviour', event.tag );
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

        //if (response === ProjectEvents.ASSET_DELETING )
        //{
        //	CanvasTab.getSingleton().removeAsset( data );

        //	var selectedNodes = [];
        //	var i = this.selectedNodes.length;
        //	while ( i-- )
        //		selectedNodes.push( this.selectedNodes[i] );

        //	i = selectedNodes.length;
        //	while ( i-- )
        //	{
        //                 if (selectedNodes[i].asset.id === data.entry._id )
        //			selectedNodes[i].dispose();
        //	}
        //	this._contextNode = null;
        //}
        ////SAVE
        //else if (response === ProjectEvents.ASSET_SAVED )
        //{
        //	//If we have the asset
        //	if ( data )
        //	{
        //		var node: TreeNodeAssetInstance = <TreeNodeAssetInstance>this.findNode( 'asset', data );
        //		if ( node )
        //			node.save();
        //	}
        //}
        ////UPDATE
        //else if (response === ProjectEvents.ASSET_UPDATED )
        //{
        //	//If we have the asset
        //	if ( data )
        //	{
        //		var node: TreeNodeAssetInstance = <TreeNodeAssetInstance>this.findNode( 'asset', data );
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
        //	if (response === ProjectEvents.BEHAVIOUR_DELETING )
        //	{
        //		var selectedNodes : Array<TreeNode> = [];

        //		var i = this.selectedNodes.length;
        //		while ( i-- )
        //			selectedNodes.push( this.selectedNodes[i] );

        //		i = selectedNodes.length;
        //		while ( i-- )
        //		{
        //                  if (selectedNodes[i] instanceof TreeNodeBehaviour && (<TreeNodeBehaviour>selectedNodes[i]).resource === event.tag)
        //			{
        //				var tabPair : TabPair = CanvasTab.getSingleton().getTab( selectedNodes[i].text );
        //				if ( tabPair )
        //					CanvasTab.getSingleton().removeTab(tabPair, true );
        //				else
        //				{
        //					tabPair = CanvasTab.getSingleton().getTab( '*' + selectedNodes[i].text );
        //					if ( tabPair )
        //						CanvasTab.getSingleton().removeTab( tabPair, true );
        //				}

        //				//this.selectedNodes[i].parent().data('component').removeNode( this.selectedNodes[i] );
        //				selectedNodes[i].dispose();

        //				if ( this._contextNode === selectedNodes[i] )
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
        getAssets( classNames: string | Array<string> ): Array<TreeNodeAssetInstance> {
            // var i = this._assetsNode.children.length;
            // var toRet: Array<TreeNodeAssetInstance> = new Array();
            // while ( i-- ) {
            // 	if ( this._assetsNode.children[i] instanceof TreeNodeAssetClass ) {
            // 		var nodes: Array<TreeNodeAssetInstance> = (this._assetsNode.children[i] as TreeNodeAssetClass).getInstances(classNames);
            // 		if ( nodes !== null ) {
            // 			for ( var ii = 0; ii < nodes.length; ii++ )
            // 				toRet.push( nodes[ii] );
            // 		}
            // 	}
            // }

            // return toRet;
            return null;
        }

		/**
		* This function will get a list of asset classes.
		* returns {Array<TreeNodeAssetClass>}
		*/
        getAssetClasses(): Array<AssetClass> {
            // var len = this._assetsNode.children.length;
            // var toRet: Array<AssetClass> = new Array();
            // for ( var i = 0; i < len; i++ ) {
            // 	if ( this._assetsNode.children[i] instanceof TreeNodeAssetClass ) {
            // 		toRet.push( (this._assetsNode.children[i] as TreeNodeAssetClass).assetClass );

            // 		var classes: Array<AssetClass> = ( this._assetsNode.children[i] as TreeNodeAssetClass ).getClasses();
            // 		if ( classes !== null ) {
            // 			for ( var ii = 0; ii < classes.length; ii++ )
            // 				toRet.push( classes[ii] );
            // 		}
            // 	}
            // }

            // return toRet;
            return null;
        }

		/**
		* Called when the context menu is about to open.
		* @param <jQuery> e The jQuery event object
		*/
        onContext2( e ) {
            // //Now hook the context events
            // var targ = jQuery( e.target ).parent();
            // if ( targ === null )
            // 	return;

            // var component: Component = targ.data('component');

            // //If the canvas
            // if ( component instanceof TreeNode ) {
            // 	//Show / hide delete context item
            // 	if ( component.canDelete )
            // 		this._contextDel.element.show();
            // 	else
            // 		this._contextDel.element.hide();

            // 	//Show / hide the copy context
            // 	if ( component.canCopy && this.selectedNodes.length === 1 )
            // 		this._contextCopy.element.show();
            // 	else
            // 		this._contextCopy.element.hide();

            // 	//Show / hide the update option
            // 	if ( component.canUpdate )
            // 		this._contextRefresh.element.show();
            // 	else
            // 		this._contextRefresh.element.hide();

            //     //Show / hide the save option
            //     if (component.modified)
            // 		this._contextSave.element.show();
            // 	else
            // 		this._contextSave.element.hide();

            // 	//Check if the groups node
            // 	if ( component === this._groupsNode )
            // 		this._contextAddGroup.element.show();
            // 	else
            // 		this._contextAddGroup.element.hide();

            // 	//Show / hide add instance context item
            // 	if ( component instanceof TreeNodeAssetClass && component.assetClass.abstractClass === false )
            // 		this._contextAddInstance.element.show();
            // 	else
            // 		this._contextAddInstance.element.hide();

            // 	this._contextNode = component;
            // 	e.preventDefault();
            // 	this._contextMenu.show( null, e.pageX, e.pageY, false, true );

            // 	var throwError = true;
            // 	if (throwError)
            // 		throw new Error('Not implemented');
            // }
        }

		/**
		 * Called whenever the selection has changed
		 * @param {TreeNodeModel[]} selection
		 */
        onSelectionChange( selection: TreeNodeModel[] ) {
            if ( selection.length === 0 )
                PluginManager.getSingleton().emit( new AssetEvent( EditorEvents.ASSET_SELECTED, null ) );
            else {
                let lastSelectedNode = selection[ selection.length - 1 ];
                if ( lastSelectedNode instanceof TreeViewNodeResource ) {

                    let resource = lastSelectedNode.resource;
                    PropertyGrid.getSingleton().editableObject( resource.properties, `${resource.entry.name} [${resource.entry.shallowId}]`, 'media/variable.png' );
                    // TODO: This should probably be RESOURCE_SELECTED
                    PluginManager.getSingleton().emit( new AssetEvent( EditorEvents.ASSET_SELECTED, resource ) );
                }
            }
        }

		/**
		* Gets the singleton instance.
		* @returns <TreeViewScene> The singleton instance
		*/
        static getSingleton(): TreeViewScene {
            return TreeViewScene._singleton;
        }
    }
}