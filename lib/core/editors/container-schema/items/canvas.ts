namespace Animate {

    export class CanvasEvents extends ENUM {
        constructor( v: string ) { super( v ); }

        static MODIFIED: CanvasEvents = new CanvasEvents( 'canvas_modified' );
    }

	/**
	* The canvas is used to create diagrammatic representations of behaviours and how they interact in the scene.
	*/
    export class Canvas { // extends Component {
        public static lastSelectedItem = null;
        public static snapping: boolean = false;
        public name: string;
        // private _upProxy: any;
        // private _downProxy: any;
        // private _contextProxy: any;
        // private _keyProxy: any;
        // private _contextNode: Component;
        // private _x: number;
        // private _y: number;
        private _container: Resources.Container;
        private _containerReferences: { groups: Array<number>; assets: Array<number>; };
        // private _proxyMoving: any;
        // private _proxyStartDrag: any;
        // private _proxyStopDrag: any;
        // private _loadingScene: boolean;

		/**
		* @param {Component} parent The parent component to add this canvas to
		* @param {Container} cntainer Each canvas represents a behaviour.This container is the representation of the canvas as a behaviour.
		*/
        constructor( parent: Component, container: Resources.Container ) {
            parent; // Supresses unused param error
            container;

            // Call super-class constructor
            //super( '<div class=\'canvas\' tabindex=\'0\'></div>', parent );

            // this._proxyMoving = this.onChildMoving.bind( this );
            // this._proxyStartDrag = this.onStartingDrag.bind( this );
            // this._proxyStopDrag = this.onChildDropped.bind( this );
            // this._downProxy = this.onMouseDown.bind( this );
            // this._upProxy = this.onMouseUp.bind( this );
            // this._x = 0;
            // this._y = 0;
            // this.name = container.entry.name;
            // this._container = container;
            // this._loadingScene = false;
            // container.canvas = this;

            // // Define proxies
            // this._contextProxy = this.onContext.bind( this );
            // this._keyProxy = this.onKeyDown.bind( this );
            // this._contextNode = null;
            // this._containerReferences = { groups: [], assets: [] };

            // // Create the default portal
            // new BehaviourPortal(this, new PropBool('Start', false), PortalType.INPUT);

            // // Hook listeners
            // this.element.on('mousedown', this._downProxy);
            // this.element.on('dblclick', jQuery.proxy(this.onDoubleClick, this));
            // jQuery('body').on('keydown', this._keyProxy);
            // jQuery(document).on('contextmenu', this._contextProxy);

            // this.element.droppable(<JQueryUI.DroppableOptions>{ drop: this.onObjectDropped.bind(this), accept: '.behaviour-to-canvas' });
            // BehaviourPicker.getSingleton().on(BehaviourPickerEvents.BEHAVIOUR_PICKED, this.onBehaviourPicked, this);
            // PortalForm.getSingleton().on(OkCancelFormEvents.CONFIRM, this.OnPortalConfirm, this);
            // PluginManager.getSingleton().on(EditorEvents.ASSET_EDITED, this.onAssetEdited, this );
        }

        // 		/**
        // 		 * Event fired when we start dragging a behaviour
        // 		 * @param e
        // 		 * @param ui
        // 		 */
        //         onStartingDrag(e: JQueryEventObject, ui: JQueryUI.DraggableEvent) {
        // 			var target: Behaviour = <Behaviour>jQuery( e.currentTarget ).data( 'component' );

        // 			// Shift key pressed - so lets create a shortcut
        // 			if ( e.shiftKey ) {
        // 				if ( !( target.canGhost ) )
        // 					return;

        // 				var left = target.element.css( 'left' );
        // 				var top = target.element.css( 'top' );

        // 				var shortcut: BehaviourShortcut = null;

        // 				// If the target is a short cut, then use the targets origin
        // 				if ( target instanceof BehaviourShortcut )
        // 					shortcut = new BehaviourShortcut( this, ( <BehaviourShortcut>target ).originalNode, ( <BehaviourShortcut>target ).originalNode.alias );
        // 				else
        // 					shortcut = new BehaviourShortcut( this, target, target.alias );

        // 				shortcut.element.css( { left: left, top: top, position: 'absolute' });

        // 				( <any>jQuery ).ui.ddmanager.current.helper = shortcut.element;
        // 				( <any>jQuery ).ui.ddmanager.current.cancelHelperRemoval = true;
        // 			}

        // 			( <any>jQuery ).ui.ddmanager.current.options.grid = ( Canvas.snapping ? [10, 10] : undefined );
        // 		}

        // 		/**
        // 		* When an item is finished being dragged
        // 		*/
        // 		onChildDropped( e, ui ) {
        // 			var target: Behaviour = <Behaviour>ui.helper.data( 'component' );
        // 			var left = parseFloat( target.element.css( 'left' ).split( 'px' )[0] );
        // 			var top = parseFloat( target.element.css( 'top' ).split( 'px' )[0] );

        // 			if ( Canvas.snapping ) {
        // 				left = parseInt( left.toString() );
        // 				top = parseInt( top.toString() );

        // 				left = left - left % 10;
        // 				top = top - top % 10;
        // 			}

        // 			if ( left < 0 )
        // 				left = 0;

        // 			if ( top < 0 )
        // 				top = 0;

        // 			target.element.css( { top: top + 'px', left: left + 'px' });

        // 			// Update the links
        // 			for ( var i = 0, l = target.portals.length; i < l; i++ )
        // 				target.portals[i].updateAllLinks();

        // 			// Notify of change
        // 			this.emit( new CanvasEvent( CanvasEvents.MODIFIED, this ) );
        // 		}

        // 		/**
        // 		* Called when a draggable object is dropped onto the canvas.
        // 		* @param {any} event The jQuery UI event
        // 		* @param {any} ui The event object sent from jQuery UI
        // 		*/
        // 		onObjectDropped( event: any, ui: any ) {

        // 			// TODO: This needs to be updated with TSX. It also needs to use the new IDragDropToken instead of the JQuery one. see
        // 			// the tree node models on how to use it

        // 			// var comp: Component = jQuery( ui.draggable ).data( 'component' );
        // 			// if ( comp instanceof TreeNode ) {
        // 			// 	var p: JQuery = this.parent.element;
        // 			// 	var offset = this.element.offset();
        // 			// 	var scrollX = p.scrollLeft();
        // 			// 	var scrollY = p.scrollTop();
        // 			// 	var mouse = { x: event.pageX - offset.left - scrollX, y: event.pageY - offset.top - scrollY };
        // 			// 	this._x = mouse.x + scrollX;
        // 			// 	this._y = mouse.y + scrollY;

        //             //     if (comp instanceof TreeNodeAssetInstance)
        //             //         this.addAssetAtLocation((comp as TreeNodeAssetInstance).resource, this._x, this._y);
        // 			// 	else if ( comp instanceof TreeNodePluginBehaviour )
        // 			// 		this.createNode( ( <TreeNodePluginBehaviour>comp ).template, this._x, this._y );
        //             //     else if (comp instanceof TreeNodeBehaviour)
        //             //         this.createNode(PluginManager.getSingleton().getTemplate('Instance'), this._x, this._y, (<TreeNodeBehaviour>comp).resource);
        // 			// }
        // 		}

        // 		/**
        // 		* Create an asset node at a location
        // 		* @param {Asset} asset
        // 		* @param {number} x
        // 		* @param {number} y
        // 		*/
        // 		addAssetAtLocation( asset: Asset, x: number, y: number ) {
        // 			var node: BehaviourAsset = <BehaviourAsset>this.createNode( PluginManager.getSingleton().getTemplate( 'Asset' ), x, y );
        //             node.asset = asset;
        //             node.parameters[0].property.setVal( asset );

        // 			// Add a reference to this canvas's scene assets
        // 			if ( asset ) {
        //                 node.text = asset.entry.name;
        //                 node.alias = asset.entry.name;
        // 			}

        // 			this.buildSceneReferences();
        // 		}

        // 		/**
        // 		* This function is used to cleanup the object before its removed from memory.
        // 		*/
        // 		dispose() {
        // 			this.element.droppable('destroy');

        // 			PluginManager.getSingleton().off(EditorEvents.ASSET_EDITED, this.onAssetEdited, this);
        // 			BehaviourPicker.getSingleton().off( BehaviourPickerEvents.BEHAVIOUR_PICKED, this.onBehaviourPicked, this );
        // 			PortalForm.getSingleton().off( OkCancelFormEvents.CONFIRM, this.OnPortalConfirm, this );
        // 			jQuery( 'body' ).off( 'keydown', this._keyProxy );
        // 			jQuery( document ).off( 'contextmenu', this._contextProxy );

        // 			this.element.off( 'mousedown', this._downProxy );

        // 			this._proxyMoving = null;
        // 			this._proxyStartDrag = null;
        // 			this._proxyStopDrag = null;
        // 			this._x = null;
        // 			this._y = null;
        // 			this.name = null;
        // 			this._container = null;
        // 			this._keyProxy = null;
        // 			this._contextProxy = null;
        // 			this._contextNode = null;
        // 			this._containerReferences = null;

        // 			// Call super
        // 			super.dispose();
        // 		}


        // 		/**
        // 		* This function will remove all references of an asset in the behaviour nodes
        // 		* @param {Asset} asset The asset reference
        // 		*/
        // 		removeAsset( asset: Asset ) {
        // 			var pManager: PluginManager = PluginManager.getSingleton();
        // 			var contEvent: AssetContainerEvent = new AssetContainerEvent( EditorEvents.ASSET_REMOVED_FROM_CONTAINER, null, this._container );
        //             var project: Project = User.get.project;

        // 			for ( var i = 0, l = this.children.length; i < l; i++ ) {
        //                 var item = <Component>this.children[i];

        // 				// If it contains any assests - then we make sure they are removed from this canvas
        //                 if (item instanceof Behaviour === false)
        //                     continue;

        //                 var behaviour = <Behaviour>item;

        //                 for (var ii = 0, il = behaviour.parameters.length; ii < il; ii++) {
        //                     var portal: Portal = behaviour.parameters[ii];

        //                     if (portal.property.type !== PropertyType.ASSET && portal.property.type !== PropertyType.ASSET_LIST)
        //                         continue;

        //                     if (portal.property.getVal() === null)
        //                         continue;

        //                     var a = portal.property.getVal();

        //                     if (a instanceof Asset) {
        //                         if (a === asset) {
        //                             portal.property.setVal(null);

        //                             if (behaviour instanceof BehaviourAsset)
        //                                 behaviour.asset = null;
        //                         }
        //                     }
        //                     else if ((<Array<Asset>>a).length > 0) {
        //                         var arrList = (<Array<Asset>>a);
        //                         for (var a, al = arrList.length; a < al; a++) {
        //                             if (arrList[a] === asset)
        //                                 portal.property.setVal(null);
        //                         }
        //                     }
        //                 }
        // 			}

        // 			this.buildSceneReferences();
        // 		}

        // 		/**
        // 		* Call this to remove an item from the canvas
        // 		* @param {Component} item The component we are removing from the canvas
        // 		*/
        //         removeItem(item: Component) {
        // 			var toRemove = [];
        // 			for ( var i = 0; i < this.children.length; i++ )
        // 				toRemove.push( this.children[i] );

        // 			// Remove any shortcuts first
        // 			for ( var i = 0; i < toRemove.length; i++ )
        //                 if (toRemove[i] instanceof BehaviourShortcut && (<BehaviourShortcut>toRemove[i]).originalNode === item )
        // 					this.removeItem( toRemove[i] );

        // 			for ( var i = 0; i < toRemove.length; i++ )
        // 				if ( toRemove[i] === item ) {
        // 					// Notify of change
        // 					this.emit( new CanvasEvent( CanvasEvents.MODIFIED, this ) );

        // 					// Notify of change
        //                     if (toRemove[i] instanceof BehaviourPortal)
        //                         this.emit(new PortalEvent(EventTypes.PORTAL_REMOVED, '', this._container, (<BehaviourPortal>toRemove[i]).portals[0]));

        // 					toRemove[i].dispose();
        // 					this.buildSceneReferences();
        // 				}

        // 			toRemove = null;
        // 		}

        // 		/**
        // 		* Removes all selected items
        // 		*/
        // 		removeItems() {
        // 			// Remove all selected
        // 			var toRemove: Array<Component> = [];
        // 			var i = this.children.length;
        // 			while ( i-- )
        // 				toRemove.push( <Component>this.children[i] );

        // 			var i = toRemove.length;
        // 			while ( i-- )
        // 				if ( typeof ( toRemove[i] ) !== 'undefined' )
        // 					if ( toRemove[i].disposed !== null && toRemove[i].selected )
        // 						this.removeItem( toRemove[i] );
        // 		}

        // 		/**
        // 		* Called when the canvas context menu is closed and an item clicked.
        // 		*/
        // 		onContextSelect( e: ContextMenuEvents, event: ContextMenuEvent ) {
        //             var context: Component = this._contextNode;
        //             var that = this;

        // 			if ( event.item.text === 'Delete' ) {
        // 				// Delete portal
        //                 if (context instanceof Portal) {
        //                     var behaviour: Behaviour = context.behaviour;
        //                     behaviour.removePortal(context);

        //                     //var toEdit: EditableSet = new EditableSet(behaviour);
        //                     //for (var i = 0, l = behaviour.parameters.length; i < l; i++)
        //                     //    if (behaviour.parameters[i].links.length <= 0)
        //                     //        toEdit.addVar(behaviour.parameters[i].name, behaviour.parameters[i].value, PropertyType.fromString(behaviour.parameters[i].dataType.toString()), behaviour.element.text(), null);

        //                     PropertyGrid.getSingleton().editableObject(behaviour.properties, behaviour.text + ' - ' + behaviour.id, null);
        //                     return;
        //                 }
        //                 else
        //                     Toolbar.getSingleton().onDelete();
        // 			}
        // 			else if ( event.item.text === 'Remove Empty Assets' ) {
        // 				// Remove all selected
        // 				var toRemove = [];
        //                 for (var i = 0, l = this.children.length; i < l; i++)
        // 					toRemove.push( this.children[i] );

        //                 for (var i = 0, l = toRemove.length; i < l; i++)
        // 					if ( typeof ( toRemove[i] ) !== 'undefined' )
        // 						if ( toRemove[i] instanceof BehaviourAsset && toRemove[i].parameters[0].value === ':' )
        // 							this.removeItem( toRemove[i] );
        // 			}
        //             // Edit an existing portal
        //             else if (event.item.text === 'Edit Portal' && context instanceof Portal) {
        //                 PortalForm.getSingleton().editPortal(context.property, context.type, function (name): boolean {
        //                     // Make sure there are no duplicates
        //                     for (var i = 0, portals = context.behaviour.portals, l = portals.length; i < l; i++)
        //                         if (portals[i].property.name === name)
        //                             return false;

        //                     return true;

        //                 }).then(function (data) {
        //                     if (data.cancel)
        //                         return;

        //                     context.edit(data.prop);
        //                 });
        // 			}
        // 			else if ( event.item.text === 'Create Behaviour' ) {
        // 				var c = Application.getInstance().canvasContext;
        // 				BehaviourPicker.getSingleton().show( null, c.element.offset().left, c.element.offset().top, false, true );

        // 				var throwError = true;
        // 				if (throwError)
        // 					throw new Error('Not implemented');
        // 			}
        // 			// Create a comment
        // 			else if ( event.item.text === 'Create Comment' ) {
        // 				var comment = new BehaviourComment( this, 'Comment' );
        // 				comment.element.addClass( 'scale-in-animation' );
        // 				comment.css( { left: this._x + 'px', top: this._y + 'px', width: '100px', height: '60px' });
        // 			}
        // 			else if ( event.item.text === 'Create Input' || event.item.text === 'Create Output'
        // 				|| event.item.text === 'Create Parameter' || event.item.text === 'Create Product' ) {
        // 				// Define the type of portal
        // 				var type: PortalType = PortalType.INPUT;
        // 				if ( event.item.text === 'Create Output' )
        // 					type = PortalType.OUTPUT;
        // 				else if ( event.item.text === 'Create Parameter' )
        // 					type = PortalType.PARAMETER;
        // 				if ( event.item.text === 'Create Product' )
        // 					type = PortalType.PRODUCT;

        //                 //if (context)
        //                     //PortalForm.getSingleton().showForm(<Behaviour>context, type, null);
        //                 //else
        //                     //PortalForm.getSingleton().showForm(this, type, event.item.text);


        //                 PortalForm.getSingleton().editPortal(null, type, function (name): boolean {
        //                     // Make sure there are no duplicates
        //                     if (context instanceof Behaviour) {
        //                         for (var i = 0, portals = context.portals, l = portals.length; i < l; i++)
        //                             if (portals[i].property.name === name)
        //                                 return false;
        //                     }
        //                     else
        //                         for (var i = 0, children = that.children, l = children.length; i < l; i++)
        //                             if (children[i] instanceof BehaviourPortal)
        //                                 if ((<BehaviourPortal>children[i]).property.name === name)
        //                                     return false;

        //                     return true;

        //                 }).then(function (data) {
        //                     if (data.cancel)
        //                         return;

        //                     if (context instanceof Behaviour)
        //                         context.addPortal(type, data.prop, true, true);
        //                     else  {
        //                         var newNode: BehaviourPortal = new BehaviourPortal(that, data.prop, type);
        //                         newNode.css({ 'left': that._x + 'px', 'top': that._y + 'px', 'position': 'absolute' });

        //                         // Notify of change
        //                         that.emit(new PortalEvent(EventTypes.PORTAL_ADDED, '', that._container, newNode.portals[0]));
        //                     }

        //                     // Notify of change
        //                     that.emit(new CanvasEvent(CanvasEvents.MODIFIED, this));
        //                 });
        // 			}

        // 			this.onContextHide( WindowEvents.HIDDEN, null );
        // 		}

        // 		/*
        // 		* Recurssively creates a list of assets used in this scene
        // 		*/
        // 		getAssetList( asset: Asset, assetMap: Array<number> ) {
        // 			if ( !asset )
        // 				return;

        //             if (assetMap.indexOf(asset.entry.shallowId ) === -1 )
        //                 assetMap.push(asset.entry.shallowId );

        //             var project: Project = User.get.project;
        // 			var properties = asset.properties.variables;

        //             for (var i = 0, l = properties.length; i < l; i++)
        //                 if (properties[i].type === PropertyType.ASSET)
        //                     this.getAssetList(properties[i].getVal(), assetMap);
        //                 else if (properties[i].type === PropertyType.ASSET_LIST) {
        //                     var aList = <Array<Asset>>properties[i].getVal();
        //                     for (var a = 0, al = aList.length; a < al; a++)
        //                         this.getAssetList(aList[a], assetMap);
        //                 }
        // 		}

        //         // TODO: We need to actually figure out how to respond to asset edits - this is not currently called
        // 		onAssetEdited(e: ENUM, event: Event, sender? : EventDispatcher) {
        // 			// Build the scene references in case some assets were added and not accounted for
        // 			this.buildSceneReferences();
        // 		}

        // 		/*
        // 		* Creates the asset and group arrays associated with this container
        // 		*/
        // 		buildSceneReferences() {
        //             var curAssets: Array<number> = [];
        //             var curGroups: Array<number> = [];

        // 			var children = this.children;
        //             var project: Project = User.get.project;

        // 			for ( var i = 0; i < children.length; i++ ) {
        // 				if ( children[i] instanceof Behaviour ) {
        // 					var behaviour = <Behaviour>children[i];
        // 					var portals: Array<Portal> = behaviour.portals;

        // 					// Check all behaviours and their portals
        // 					for ( var ii = 0; ii < portals.length; ii++ ) {
        //                         var val = portals[ii].property.getVal();

        //                         if (!val)
        //                             continue;

        //                         // If there is an asset previously and its being removed
        //                         if (val instanceof Asset)
        //                             this.getAssetList(val, curAssets );
        //                         else if (val instanceof GroupArray)
        //                             curGroups.push(val.entry._id);
        //                         else if (val.constructor === Array ) {
        //                             var aArray = <Array<Asset>>val;
        //                             for (var a, al = aArray.length; a < al; a++ )
        //                                 this.getAssetList(aArray[a], curAssets );
        // 						}
        // 					}
        // 				}
        // 			}

        // 			var pManager: PluginManager = PluginManager.getSingleton();
        // 			var addEvent: AssetContainerEvent = new AssetContainerEvent( EditorEvents.ASSET_ADDED_TO_CONTAINER, null, this._container );
        // 			var removeEvent: AssetContainerEvent = new AssetContainerEvent( EditorEvents.ASSET_REMOVED_FROM_CONTAINER, null, this._container );

        // 			// Notify of asset removals
        // 			for ( var i = 0, l = this._containerReferences.assets.length; i < l; i++ )
        // 				if ( curAssets.indexOf( this._containerReferences.assets[i] ) === -1 ) {
        //                     removeEvent.asset = project.getResourceByShallowID<Asset>(this._containerReferences.assets[i], ResourceType.ASSET);
        // 					pManager.emit( removeEvent );
        // 				}

        // 			// Notify of asset additions
        // 			for ( var i = 0, l = curAssets.length; i < l; i++ )
        // 				if ( this._containerReferences.assets.indexOf( curAssets[i] ) === -1 ) {
        //                     addEvent.asset = project.getResourceByShallowID<Asset>(curAssets[i], ResourceType.ASSET);
        // 					pManager.emit( addEvent );
        // 				}

        // 			this._containerReferences.assets = curAssets;
        // 			this._containerReferences.groups = curGroups;
        // 		}

        //         /**
        //         * Whenever an item is edited
        //         */
        //         onItemEdited(type: string, event: EditEvent, sender?: EventDispatcher) {
        //             if (this._loadingScene)
        //                 return;

        //             this.emit(new CanvasEvent(CanvasEvents.MODIFIED, this));
        //             this.buildSceneReferences();
        //         }

        // 		///**
        // 		//* Called when the property grid fires an edited event.
        // 		//* @param {string} type
        // 		//* @param {PropertyGridEvent} event
        // 		//*/
        // 		//onPropertyGridEdited( type: string, event: PropertyGridEvent )
        // 		//{
        // 		//	for ( var i = 0; i < this.children.length; i++ )
        // 		//	{
        // 		//		if ( event.id === this.children[i] )
        // 		//		{
        // 					//if ( this.children[i] instanceof BehaviourComment )
        // 					//{
        //      //                   var comment: BehaviourComment = <BehaviourComment>this.children[i];
        //      //                   comment.text = event.prop.getVal();
        // 					//}
        // 					//else if ( this.children[i] instanceof Link )
        // 					//{
        // 					//	var link: Link = <Link>this.children[i];
        // 					//	var num = event.propertyValue.selected;
        // 					//	num = parseInt( num );
        // 					//	if ( isNaN( num ) )
        // 					//		num = 1;

        // 					//	link.frameDelay = num;
        // 					//	link.draw();
        // 					//}
        // 					//else
        // 					//{
        // 					//	var portals: Array<Portal> = ( <Behaviour>this.children[i] ).portals;

        // 					//	//Check all behaviours and their portals
        // 					//	for ( var ii = 0; ii < portals.length; ii++ )
        // 					//	{
        // 					//		var item: Behaviour = <Behaviour>this.children[i];

        //      //                       //If the portal name is the same as the one that is being edited
        //      //                       if (portals[ii].name === event.prop.name)
        // 					//		{
        //      //                           if (item instanceof BehaviourAsset)
        //      //                               (<BehaviourAsset>item).asset = event.prop.getVal();

        //      //                           item.portals[ii].value = event.prop.getVal();

        // 					//			//Notify of change
        // 					//			this.emit( new CanvasEvent( CanvasEvents.MODIFIED, this ) );
        // 					//			this.buildSceneReferences();
        // 					//			return;
        // 					//		}
        // 					//	}
        // 					//}
        // 		//		}
        // 		//	}
        // 		//}

        // 		/**
        // 		* When we click ok on the portal form
        // 		*/
        // 		OnPortalConfirm( response: OkCancelFormEvents, e: OkCancelFormEvent ) {
        // 			if ( this.element.is( ':visible' ) === false )
        // 				return;

        // 			if ( e.text === 'Ok' ) {
        //                 var comp: Component = this._contextNode;

        // 				// If we are editing a portal
        //                 if (comp instanceof Portal ) {

        // 					var portal: Portal = comp;
        // 					var oldName: string = portal.property.name;
        //                     portal.edit(PortalForm.getSingleton().getProperty());
        // 						//PortalForm.getSingleton().name,
        // 						//PortalForm.getSingleton().portalType,
        // 						//PortalForm.getSingleton().value,
        // 						//PortalForm.getSingleton().parameterType );

        // 					var p = portal.parent;
        //                     if (p instanceof BehaviourPortal)
        //                         p.text = portal.property.name;

        // 					// Show in prop editor
        // 					var behaviour = portal.behaviour;
        //                     //var toEdit: EditableSet = new EditableSet(behaviour);

        //                     //for (var i = 0, params = behaviour.parameters, l = params.length; i < l; i++ )
        //                     //    if (params[i].links.length <= 0 )
        //                     //       toEdit.addVar(params[i].name, params[i].value, params[i].dataType, behaviour.element.text(), null );

        //                     PropertyGrid.getSingleton().editableObject(behaviour.properties, behaviour.text + ' - ' + behaviour.id, '' );

        //                     // Notify of change
        //                     this.emit(new PortalEvent(EventTypes.PORTAL_EDITED, oldName, this._container, portal));

        // 					return;
        // 				}
        // 				else if ( comp instanceof Behaviour ) {
        // 					// Create a portal on a Behaviour
        //                     var portal: Portal = comp.addPortal(PortalForm.getSingleton().portalType,
        //                         PortalForm.getSingleton().getProperty(), true, true);
        // 						//PortalForm.getSingleton().name,
        // 						//PortalForm.getSingleton().value,
        // 						//PortalForm.getSingleton().parameterType, true
        // 						//);
        // 				}
        // 				else {
        // 					// Create a canvas portal
        //                     var newNode: BehaviourPortal = new BehaviourPortal(this, PortalForm.getSingleton().getProperty(), PortalForm.getSingleton().portalType);
        // 						//PortalForm.getSingleton().name,
        // 						//PortalForm.getSingleton().portalType,
        // 						//PortalForm.getSingleton().parameterType,
        // 						//PortalForm.getSingleton().value );

        // 					newNode.css( { 'left': this._x + 'px', 'top': this._y + 'px', 'position': 'absolute' });

        // 					// Notify of change
        //                     this.emit(new PortalEvent(EventTypes.PORTAL_ADDED, '', this._container, newNode.portals[0]));
        // 				}

        // 				// Notify of change
        // 				this.emit( new CanvasEvent( CanvasEvents.MODIFIED, this ) );
        // 			}
        // 		}

        // 		/**
        // 		* When the context is hidden we remove the event listeners.
        // 		*/
        // 		onContextHide( response: WindowEvents, e: WindowEvent ) {
        // 			var context = Application.getInstance().canvasContext;
        // 			context.off( WindowEvents.HIDDEN, this.onContextHide, this );
        // 			context.off( ContextMenuEvents.ITEM_CLICKED, this.onContextSelect, this );
        // 		}

        // 		/**
        // 		* Called when the context menu is about to open
        // 		* @param {any} e The jQuery event object
        // 		*/
        // 		onContext( e ) {
        // 			if ( this.element.is( ':visible' ) === false )
        // 				return;

        // 			// First get the x and y cords
        // 			var p: JQuery = this.parent.element;
        // 			var offset = this.element.offset();
        // 			var scrollX = p.scrollLeft();
        // 			var scrollY = p.scrollTop();
        // 			var mouse = { x: e.pageX - offset.left - scrollX, y: e.pageY - offset.top - scrollY };
        // 			this._x = mouse.x + scrollX;
        // 			this._y = mouse.y + scrollY;

        // 			// Now hook the context events
        // 			var targ = jQuery( e.target );
        // 			var targetComp = targ.data( 'component' );
        // 			var context = Application.getInstance().canvasContext;
        // 			this._contextNode = targ.data( 'component' );

        // 			// If the canvas
        // 			if ( targetComp instanceof Canvas ) {
        // 				this._contextNode = null;
        // 				e.preventDefault();
        // 				context.showContext( e.pageX, e.pageY, null );
        // 				context.on( WindowEvents.HIDDEN, this.onContextHide, this );
        // 				context.on( ContextMenuEvents.ITEM_CLICKED, this.onContextSelect, this );
        // 			}
        // 			// If a portal
        // 			else if ( targetComp instanceof Portal ) {
        // 				e.preventDefault();
        // 				context.showContext( e.pageX, e.pageY, this._contextNode );
        // 				context.on( WindowEvents.HIDDEN, this.onContextHide, this );
        // 				context.on( ContextMenuEvents.ITEM_CLICKED, this.onContextSelect, this );

        // 			}
        // 			// If a link
        // 			else if ( targetComp instanceof Link ) {
        // 				e.preventDefault();
        // 				var link = targ.data( 'component' );
        // 				var hit = link.hitTestPoint( e );
        // 				if ( hit ) {
        // 					context.showContext( e.pageX, e.pageY, link );
        // 					context.on( WindowEvents.HIDDEN, this.onContextHide, this );
        // 					context.on( ContextMenuEvents.ITEM_CLICKED, this.onContextSelect, this );
        // 				}
        // 			}

        // 			// If a portal node
        // 			else if ( targetComp instanceof BehaviourInstance || targetComp instanceof BehaviourAsset || targetComp instanceof BehaviourPortal ) {
        // 				e.preventDefault();
        // 				context.showContext( e.pageX, e.pageY, this._contextNode );
        // 				context.on( WindowEvents.HIDDEN, this.onContextHide, this );
        // 				context.on( ContextMenuEvents.ITEM_CLICKED, this.onContextSelect, this );
        // 			}
        // 			else if ( targetComp instanceof BehaviourComment )
        // 				e.preventDefault();
        // 			// If a behavior node (but not a portal node)
        // 			else if ( targetComp instanceof Behaviour ) {
        // 				e.preventDefault();
        // 				context.showContext( e.pageX, e.pageY, this._contextNode );
        // 				context.on( WindowEvents.HIDDEN, this.onContextHide, this );
        // 				context.on( ContextMenuEvents.ITEM_CLICKED, this.onContextSelect, this );

        // 			}
        // 			else
        // 				context.hide();
        // 		}

        // 		/**
        // 		* When we have chosen a behaviour
        // 		*/
        // 		onBehaviourPicked( response: BehaviourPickerEvents, event: BehaviourPickerEvent ) {
        // 			if ( this.element.is( ':visible' ) === false )
        // 				return;

        // 			//Check if this is the selected Canvas
        // 			if ( this.element.parent().parent().length === 0 )
        // 				return;

        // 			var template = PluginManager.getSingleton().getTemplate( event.behaviourName );
        //             var that = this;

        // 			if ( template ) {
        //                 if (template.behaviourName === 'Script') {
        // 					ReactWindow.show( RenameForm, { name: 'Script',
        // 						onOk: (newName) => { that.createNode(template, that._x, that._y, null, newName); } } as IRenameFormProps);
        //                 }
        //                 else
        //                     that.createNode(template, that._x, that._y );
        // 			}
        // 		}

        // 		/**
        // 		* Iteratively goes through each container to check if its pointing to this behaviour
        // 		*/
        // 		private isCyclicDependency( container : Container, ref : string ) : boolean {
        //             var project = User.get.project;
        //             var thisContainer = this._container;
        //             var json: IContainerToken = null;
        // 			var canvas: Canvas = null;

        // 			// If this container is the same as the one we are testing
        // 			// then return true
        // 			if ( container === thisContainer )
        // 				return true;

        // 			// Get the most updated JSON
        //             canvas = CanvasTab.getSingleton().getTabCanvas(container.entry._id );
        //             if (canvas && !canvas._container.saved)
        //                 json = canvas.tokenize(false);
        // 			else
        //                 json = container.entry.json;

        //             if (!container.entry.json )
        // 				return false;

        // 			// Go through each of the items to see if got any instance that might refer to this container
        // 			var items = json.items;
        //             for (var i = 0, l = items.length; i < l; i++)
        //                 if (items[i].type === CanvasItemType.BehaviourInstance) {
        //                     var childContainer = project.getResourceByShallowID<Container>(items[i].shallowId, ResourceType.CONTAINER);
        // 					if ( childContainer && this.isCyclicDependency( childContainer, ref ) ) {
        //                         ref = childContainer.entry.name;
        // 						return true;
        // 					}
        // 				}

        // 			return false;
        // 		}

        // 		/**
        // 		* This will create a canvas node based on the template given
        // 		* @param {BehaviourDefinition} template The definition of the node
        // 		* @param {number} x The x position of where the node shoule be placed
        // 		* @param {number} y The y position of where the node shoule be placed
        // 		* @param {Container} container This is only applicable if we are dropping a node that represents another behaviour container. This last parameter
        // 		* is the actual behaviour container
        //         * @param {string} name The name of the node
        // 		* @returns {Behaviour}
        // 		*/
        // 		createNode( template: BehaviourDefinition, x: number, y: number, container?: Container, name ?: string ): Behaviour {
        // 			var toAdd: Behaviour = null;

        // 			if ( template.behaviourName === 'Instance' ) {
        // 				var nameOfBehaviour: string = '';
        // 				var cyclic: boolean = this.isCyclicDependency( container, nameOfBehaviour );
        // 				if ( cyclic ) {
        // 					ReactWindow.show(MessageBox, { message : `You have a cylic dependency with the behaviour '${nameOfBehaviour}'` } as IMessageBoxProps);
        // 					return null;
        // 				}
        // 				toAdd = new BehaviourInstance( this, container );
        // 			}
        // 			else if ( template.behaviourName === 'Asset' )
        // 				toAdd = new BehaviourAsset( this, template.behaviourName );
        //             else if (template.behaviourName === 'Script')
        //                 toAdd = new BehaviourScript(this, null, name );
        // 			else
        // 				toAdd = new Behaviour( this, template.behaviourName );

        //             if (template.behaviourName !== 'Instance' && template.behaviourName !== 'Script' )
        // 				toAdd.text = template.behaviourName;

        // 			var portalTemplates = template.portalsTemplates();

        // 			// Check for name duplicates
        // 			if ( portalTemplates ) {
        // 				// Create each of the portals
        // 				for ( var i = 0; i < portalTemplates.length; i++ ) {
        //                     var portal = toAdd.addPortal( portalTemplates[i].type, portalTemplates[i].property.clone(), false );
        // 					if ( toAdd instanceof BehaviourScript === false )
        // 						portal.customPortal = false;
        // 				}
        // 			}

        // 			x = parseInt( x.toString() );
        // 			y = parseInt( y.toString() );

        // 			x = x - x % 10;
        // 			y = y - y % 10;

        // 			toAdd.element.css( { left: x + 'px', top: y + 'px' });
        // 			toAdd.element.addClass( 'scale-in-animation' );
        // 			toAdd.updateDimensions();

        // 			//Notify of change
        // 			this.emit( new CanvasEvent( CanvasEvents.MODIFIED, this ) );

        // 			return toAdd;
        //         }

        // 		/**
        // 		* Catch the key down events.
        // 		* @param {any} e The jQuery event object
        // 		*/
        // 		onKeyDown( e: any ) {
        // 			if ( this.element.is( ':visible' ) === false )
        // 				return;

        // 			if ( jQuery( e.target ).is( 'input' ) )
        // 				return;

        // 			var focusObj = Application.getInstance().focusObj;
        //             var that = this;

        //             if (focusObj !== null ) {
        // 				//If F2 pressed
        // 				if ( e.keyCode === 113 ) {
        // 					if ( focusObj instanceof BehaviourPortal )
        //                         return;
        //                     else if (focusObj instanceof BehaviourComment)
        //                         return focusObj.enterText();
        //                     else if (focusObj instanceof Behaviour ) {

        // 						// Attempt to rename the behaviour
        // 						ReactWindow.show( RenameForm, { name: 'Script', onOk: (newName) => {

        // 							var toEdit: Behaviour = null;
        //                             if (focusObj instanceof BehaviourShortcut)
        //                                 toEdit = focusObj.originalNode;
        //                             else
        //                                 toEdit = focusObj;

        //                             toEdit.text = newName;
        //                             toEdit.alias = newName;

        //                             // Check if there are any shortcuts and make sure they are renamed
        //                             for (let child of this.children) {
        //                                 let shortcut = <BehaviourShortcut>child;
        //                                 if (shortcut instanceof BehaviourShortcut && shortcut.originalNode === toEdit) {
        //                                     shortcut.text = newName;
        //                                     shortcut.alias = newName;
        //                                 }
        //                             }

        // 						}} as IRenameFormProps);
        // 						return;
        // 					}
        // 				}
        // 				//If C
        // 				else if ( e.keyCode === 67 ) {
        // 					if ( e.ctrlKey )
        // 						return;

        // 					//If a shortcut go to the original
        // 					if ( focusObj instanceof BehaviourShortcut ) {
        // 						this.selectItem( null );
        // 						focusObj.selected = false;
        // 						this.selectItem( focusObj.originalNode );
        // 						this.element.parent().scrollTo( '#' + focusObj.originalNode.id, 500 );
        // 						return;
        // 					}
        // 				}
        // 				//If delete pressed
        // 				else if ( e.keyCode === 46 ) {
        //                     //Remove all selected
        //                     Toolbar.getSingleton().onDelete();
        // 				}
        // 			}
        // 		}


        // 		/**
        // 		* When we double click the canvas we show the behaviour picker.
        // 		* @param {any} e The jQuery event object
        // 		*/
        // 		onDoubleClick( e: any ) {
        // 			if ( jQuery( e.target ).is( 'textarea' ) )
        // 				return;

        // 			var comp = jQuery( e.target ).data( 'component' );

        // 			//If a comment edit it
        // 			if ( comp instanceof BehaviourComment ) {
        // 				comp.enterText();
        // 				return;
        // 			}
        // 			//If an instance, then open it
        // 			else if ( comp instanceof BehaviourInstance ) {
        //                 var tree: TreeViewScene = TreeViewScene.getSingleton();
        //                 var node = tree.findNode('resource', (<BehaviourInstance>comp).container);
        // 				tree.selectNode( node );
        // 				( <TreeViewScene>tree ).onDblClick( null );
        // 				return;
        // 			}
        // 			//If an script node, then open it
        // 			else if ( comp instanceof BehaviourScript ) {
        // 				comp.edit();
        // 				return;
        // 			}

        // 			var p: JQuery = this.parent.element;

        // 			var offset = this.element.offset();
        // 			var scrollX = p.scrollLeft();
        // 			var scrollY = p.scrollTop();

        // 			var mouse = { x: e.pageX - offset.left - scrollX, y: e.pageY - offset.top - scrollY };

        // 			this._x = mouse.x + scrollX;
        // 			this._y = mouse.y + scrollY;
        // 			BehaviourPicker.getSingleton().show( null, e.pageX, e.pageY, false, true );
        // 			e.preventDefault();
        // 		}

        // 		/**
        // 		* This is called to set the selected canvas item.
        // 		* @param {Component} comp The component to select
        // 		*/
        // 		selectItem( comp: Component ) {
        // 			if ( comp === null ) {
        // 				// Remove all glows
        // 				var children = this.children;

        // 				for ( var i = 0, l = children.length; i < l; i++ ) {
        //                     children[i].element.removeClass('green-glow-strong').removeClass('short-active');
        // 					if ( children[i].selected )
        // 						children[i].selected = false;
        // 				}

        // 				// Set the selected item
        // 				Canvas.lastSelectedItem = null;
        // 				PropertyGrid.getSingleton().editableObject( null, '', '' );
        // 				Toolbar.getSingleton().itemSelected( null );
        // 				return;
        // 			}

        // 			if ( comp.selected ) {
        // 				comp.element.removeClass( 'green-glow-strong' );
        // 				comp.selected = false;
        // 				Canvas.lastSelectedItem = null;
        // 				PropertyGrid.getSingleton().editableObject( null, '', '' );
        // 				Toolbar.getSingleton().itemSelected( null );
        // 				return;
        // 			}

        // 			comp.selected = true;

        // 			// Set the selected item
        // 			Canvas.lastSelectedItem = comp;

        // 			if ( comp instanceof Behaviour ) {
        // 				comp.element.removeClass( 'scale-in-animation' );

        // 				// Hand the item to the editor
        // 				if ( comp instanceof BehaviourComment )
        //                     PropertyGrid.getSingleton().editableObject(comp.properties, 'Comment', '');
        // 				else if ( comp instanceof BehaviourShortcut === false )
        //                     PropertyGrid.getSingleton().editableObject(comp.properties, comp.text + ' - ' + comp.id, '');

        // 				// Highlight all shortcuts
        // 				var children = this.children;
        // 				var i = children.length;
        // 				while ( i-- )
        // 					if ( typeof ( children[i] ) !== 'undefined' )
        // 						if ( children[i] instanceof BehaviourShortcut && ( <BehaviourShortcut>children[i] ).originalNode === comp )
        //                             children[i].element.addClass( 'short-active' );
        // 						else
        //                             children[i].element.removeClass( 'short-active' );
        // 			}
        // 			else if ( comp instanceof Link && ( <Link>comp ).startPortal.type === PortalType.OUTPUT )
        //                 PropertyGrid.getSingleton().editableObject(comp.properties, 'Link - ' + (<Link>comp).id, '');

        // 			Toolbar.getSingleton().itemSelected( comp );
        // 		}

        // 		/**
        // 		* Called when we click down on the canvas
        // 		* @param {any} e The jQuery event object
        // 		*/
        // 		onMouseDown( e: any ) {
        // 			// Stops the text select when we drag
        // 			e.preventDefault();


        // 			// If we click the canvas - it counts as a deselect
        // 			var comp = jQuery( e.currentTarget ).data( 'component' );
        // 			if ( comp instanceof Canvas && !e.ctrlKey ) {
        // 				this.selectItem( null );
        // 				return;
        // 			}
        // 		}

        // 		/**
        // 		* Called when we click up on the canvas
        // 		* @param {any} e The jQuery event object
        // 		*/
        // 		onMouseUp( e: any ) {
        // 			var comp = jQuery( e.currentTarget ).data( 'component' );

        // 			// Unselect all other items
        // 			if ( !e.ctrlKey )
        // 				for ( var i = 0; i < this.children.length; i++ )
        // 					this.children[i].selected = false;

        // 			if ( comp instanceof Behaviour ) {
        // 				comp.element.removeClass( 'scale-in-animation' );
        // 				this.selectItem( comp );
        // 				return;
        // 			}

        // 			// Not a behaviour so lets see if its a link
        // 			// Make sure we actually hit a link
        // 			var len = this.children.length;
        // 			for ( var i = 0; i < len; i++ ) {
        // 				comp = this.children[i];
        // 				if ( comp instanceof Link ) {
        // 					var hit = comp.hitTestPoint( e );
        // 					if ( hit ) {
        // 						this.selectItem( comp );
        // 						return;
        // 					}
        // 				}
        // 			}
        // 		}


        // 		/**
        // 		* This is called externally when the canvas has been selected. We use this
        // 		* function to remove any animated elements
        // 		*/
        // 		onSelected() {
        // 			var len = this.children.length;
        // 			for ( var i = 0; i < len; i++ )
        // 				this.children[i].element.removeClass( 'scale-in-animation' );
        // 		}

        // 		/**
        // 		* Use this function to add a child to this component. This has the same effect of adding some HTML as a child of another piece of HTML.
        // 		* It uses the jQuery append function to achieve this functionality.
        // 		* @param {IComponent} child The child to add. Valid parameters are valid HTML code or other Components.
        // 		* @returns {IComponent} The child as a Component.
        // 		*/
        //         addChild(child: IComponent): IComponent {
        //             // Call super
        //             var toRet = <Component>super.addChild(child);
        //             if (toRet instanceof Behaviour)
        //                 toRet.element.draggable(<JQueryUI.DraggableOptions>{ drag: this._proxyMoving, start: this._proxyStartDrag, stop: this._proxyStopDrag, cancel: '.portal', scroll: true, scrollSensitivity: 10 });

        //             if (toRet instanceof Behaviour || toRet instanceof Link)
        //                 toRet.on('edited', this.onItemEdited, this);

        // 			toRet.element.on( 'mouseup', this._upProxy );

        // 			return toRet;
        // 		}

        // 		/**
        // 		* Use this function to remove a child from this component. It uses the jQuery detach function to achieve this functionality.
        // 		* @param {IComponent} child The child to remove. Valid parameters are valid Components.
        // 		* @returns {IComponent} The child as a Component.
        // 		*/
        //         removeChild(child: IComponent): IComponent {
        //             if (toRet instanceof Behaviour || toRet instanceof Link)
        //                 toRet.off('edited', this.onItemEdited, this);

        // 			// Call super
        //             var toRet = <Component>super.removeChild( child );

        // 			if ( toRet )
        // 				toRet.element.off( 'mouseup', this._upProxy );

        // 			return toRet;
        // 		}



        // 		/**
        // 		* Called when an item is moving
        // 		*/
        // 		onChildMoving( e, ui ) {
        //             var target: Behaviour = jQuery( e.target ).data( 'component' );

        // 			// Update the links
        // 			var i = ( <Behaviour>target ).portals.length;
        //             for (var i = 0, l = target.portals.length; i < l; i++ )
        // 				target.portals[i].updateAllLinks();

        // 			this.checkDimensions();
        // 		}

        // 		/**
        // 		* This function is called when animate is reading in saved data from the server.
        // 		* @param {any} data
        // 		*/
        // 		open( data: any ) {

        //         }

        //         /**
        //         * Tokenizes the canvas and all its items into a JSON object that can be serialized into a DB
        //         * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage
        //         * @param {Array<CanvasItem>} items The items
        //         * @returns {IContainerToken}
        //         */
        //         tokenize(slim: boolean, items?: Array<CanvasItem>): IContainerToken {
        //             var children = items || <Array<CanvasItem>>this.children;
        //             var toRet: IContainerToken = {
        //                 items: [],
        //                 properties: this._container.properties.tokenize(slim)
        //             };

        //             for (var i = 0, l = children.length; i < l; i++)
        //                 toRet.items.push(children[i].tokenize(slim));

        //             return toRet;
        //         }

        //         /**
        //         * De-serializes token data and adds them to the canvas
        //         * @param {boolean} Data
        //         * @param {Array<CanvasItem>} items The items
        //         * @returns {IContainerToken}
        //         */
        //         deTokenize(data?: IContainerToken, clearItems: boolean = true) {
        //             data = data || this._container.entry.json;

        //             if (clearItems && data)
        //                 this._loadingScene = true;

        //             var children = <Array<CanvasItem>>this.children;
        //             if ( clearItems )
        //                 while (children.length > 0 )
        //                     children[0].dispose();

        //             var linkToken: LinkMap = <LinkMap>{};
        //             var oldIds: Array<number> = [];

        //             // Attempt to create and initialize each of the items
        //             for (var i = 0, l = data.items.length; i < l; i++) {
        //                 var item = Utils.createItem(this, data.items[i]);
        //                 if (!item) {
        //                     Logger.logMessage(`Could not create canvas item`, null, LogType.ERROR);
        //                     continue;
        //                 }

        //                 item.deTokenize(data.items[i]);
        //                 oldIds.push(data.items[i].shallowId);
        //                 linkToken[data.items[i].shallowId] = { item: item, token: data.items[i] };
        //             }

        //             // All items are created - so lets call link to make sure they are hooked up correctly
        //             for (var i = 0, l = oldIds.length; i < l; i++)
        //                 (<CanvasItem>linkToken[oldIds[i]].item).link(oldIds[i], linkToken);

        //             this.checkDimensions();
        //             this.buildSceneReferences();

        //             this._loadingScene = false;
        //         }


        // 		///**
        // 		//* This function is called when animate is writing data to the database.
        // 		//* @param {any} items The items we need to build
        // 		//* @returns {CanvasToken}
        // 		//*/
        // 		//buildDataObject( items: Array<IComponent> = null ): CanvasToken
        // 		//{
        //   //          var data: CanvasToken = new CanvasToken(this.container.entry.shallowId );
        //   //          data.name = this._container.entry.name;
        // 		//	data.properties = this._container.properties.tokenize();

        // 		//	if ( items === null )
        // 		//		items = this.children;

        // 		//	// Let the plugins save their data
        // 		//	PluginManager.getSingleton().emit( new ContainerDataEvent( EditorEvents.CONTAINER_SAVING, this._container, data.plugins, this._containerReferences ) );


        // 		//	// Create a multidimension array and pass each of the project dependencies
        // 		//	var len = items.length;
        // 		//	for ( var i = 0; i < len; i++ )
        //   //          {
        //   //              var comp = <Component>items[i];
        //   //              var canvasToken = new CanvasTokenItem();
        //   //              data.items[i] = canvasToken;

        // 		//		//First export all the standard item data
        //   //              canvasToken.id = comp.id;
        //   //              canvasToken.type = (<any>comp ).constructor.name;
        //   //              canvasToken.left = comp.element.css( 'left' );
        //   //              canvasToken.top = comp.element.css( 'top' );
        //   //              canvasToken.zIndex = comp.element.css( 'z-index' );
        //   //              canvasToken.position = comp.element.css( 'position' );

        // 		//		// Now do all portals if its a behaviour
        //   //              if (comp instanceof Behaviour )
        // 		//		{
        //   //                  if (comp instanceof BehaviourComment )
        //   //                      canvasToken.text = comp.text;
        //   //                  else if (comp instanceof Behaviour)
        // 		//			{
        //   //                      canvasToken.name = comp.originalName;
        //   //                      canvasToken.alias = (comp.alias ? comp.alias : '' );
        // 		//			}

        //   //                  if (comp instanceof BehaviourAsset )
        //   //                      canvasToken.assetID = (comp.asset ? comp.asset.entry.shallowId : 0 );
        //   //                  else if (comp instanceof BehaviourScript )
        //   //                      canvasToken.scriptId = comp.scriptId;
        //   //                  else if ( comp instanceof BehaviourShortcut )
        //   //                      canvasToken.behaviourID = (comp.originalNode ? comp.originalNode.id : '' );
        //   //                  else if (comp instanceof BehaviourInstance )
        //   //                      canvasToken.containerId = (comp.container ? comp.container.entry.shallowId : 0 );

        //   //                  if (comp instanceof BehaviourPortal )
        // 		//			{
        //   //                      canvasToken.portalType = comp.portaltype;
        //   //                      canvasToken.dataType = comp.dataType;
        //   //                      canvasToken.value = comp.value;
        // 		//			}
        // 		//			else
        // 		//			{
        // 		//				canvasToken.portals = new Array();
        // 		//				var portalsArr: Array<CanvasTokenPortal> = canvasToken.portals;

        // 		//				var len2 = ( <Behaviour>items[i] ).portals.length;
        // 		//				for ( var ii = 0; ii < len2; ii++ )
        // 		//				{
        // 		//					portalsArr[ii] = new CanvasTokenPortal();

        //   //                          portalsArr[ii].name = (<Behaviour>items[i]).portals[ii].property.name;
        // 		//					portalsArr[ii].value = ( <Behaviour>items[i] ).portals[ii].value;
        // 		//					portalsArr[ii].type = ( <Behaviour>items[i] ).portals[ii].type;
        // 		//					portalsArr[ii].dataType = ( <Behaviour>items[i] ).portals[ii].dataType;
        // 		//					portalsArr[ii].customPortal = ( <Behaviour>items[i] ).portals[ii].customPortal;
        // 		//				}
        // 		//			}

        // 		//		}
        // 		//		// If its a link we store a few more bits of information.
        //   //              else if (comp instanceof Link )
        // 		//		{
        //   //                  var sbehaviour: Behaviour = <Behaviour>comp.startPortal.parent;
        //   //                  var ebehaviour: Behaviour = <Behaviour>comp.endPortal.parent;

        //   //                  canvasToken.frameDelay = <number>comp.properties.getVar('Frame Delay').getVal();
        //   //                  canvasToken.startPortal = comp.startPortal.property.name;
        //   //                  canvasToken.endPortal = comp.endPortal.property.name;
        // 		//			canvasToken.startBehaviour = sbehaviour.id;
        // 		//			canvasToken.endBehaviour = ebehaviour.id;

        // 		//			// Create additional data for shortcuts
        //   //                  canvasToken.targetStartBehaviour = (sbehaviour instanceof BehaviourShortcut ? sbehaviour.originalNode.id : sbehaviour.id );
        //   //                  canvasToken.targetEndBehaviour = (ebehaviour instanceof BehaviourShortcut ? ebehaviour.originalNode.id : ebehaviour.id );
        // 		//		}
        // 		//	}

        // 		//	return data;
        // 		//}

        // 		///**
        // 		//* This function is called when a behaviour is double clicked,
        // 		//* a canvas is created and we try and load the behavious contents.
        // 		//* @param {IContainerToken} dataToken You can optionally pass in an data token object. These objects must contain information on each of the items we are adding to the canvas.
        // 		//* @param {boolean} clearItems If this is set to true the function will clear all items already on the Canvas.
        // 		//* @returns {any}
        // 		//*/
        //   //      openFromDataObject(dataToken?: IContainerToken, clearItems: boolean = true, addSceneAssets: boolean = false )
        // 		//{
        //   //          // Create the data object from the JSON
        //   //          var jsonObj: IContainerToken = null;
        // 		//	var pManager: PluginManager = PluginManager.getSingleton();


        // 		//	if ( dataToken )
        //   //              jsonObj = dataToken || this._container.entry.json || {};

        // 		//	// Cleanup the existing items
        // 		//	if ( clearItems )
        // 		//		while ( this.children.length > 0 )
        // 		//			this.children[0].dispose();

        // 		//	var links = [];
        // 		//	var shortcuts: Array<ShortCutHelper> = [];

        // 		//	if ( jsonObj && jsonObj.items )
        // 		//	{
        // 		//		for ( var i in jsonObj.items )
        // 		//		{
        // 		//			var item: Component = null;

        // 		//			// Create the GUI element
        // 		//			if ( jsonObj.items[i].type === 'BehaviourPortal' )
        // 		//			{
        // 		//				// Check if there is already a portal with that name. if it does then it
        // 		//				// is ignored.
        // 		//				var nameInUse = false;
        // 		//				var len = this.children.length;
        // 		//				for ( var ii = 0; ii < len; ii++ )
        // 		//					if ( this.children[ii] instanceof BehaviourPortal &&
        // 		//						this.children[ii].element.text() === jsonObj.items[i].name )
        // 		//					{
        // 		//						nameInUse = true;
        // 		//						Logger.logMessage(
        // 		//							'A portal with the name '' + jsonObj.items[i].name +
        // 		//							'' already exists on the Canvas.', null, LogType.ERROR );
        // 		//						break;
        // 		//					}

        // 		//				if ( nameInUse === false )
        // 		//				{
        // 		//					item = new BehaviourPortal( this, jsonObj.items[i].name,
        // 		//						jsonObj.items[i].portalType,
        // 		//						jsonObj.items[i].dataType,
        // 		//						jsonObj.items[i].value
        // 		//						);

        // 		//					( <BehaviourPortal>item ).requiresUpdated = true;
        // 		//				}
        // 		//			}
        // 		//			else if ( jsonObj.items[i].type === 'BehaviourAsset' )
        // 		//				item = new BehaviourAsset( this, jsonObj.items[i].name );
        // 		//			else if ( jsonObj.items[i].type === 'BehaviourScript' )
        //   //                      item = new BehaviourScript(this, jsonObj.items[i].scriptId, jsonObj.items[i].name, !clearItems );
        // 		//			else if ( jsonObj.items[i].type === 'BehaviourInstance' )
        // 		//			{
        //   //                      var project = User.get.project;
        //   //                      var container = project.getResourceByShallowID<Container>(jsonObj.items[i].containerId, ResourceType.CONTAINER);
        // 		//				if ( !container )
        // 		//					continue;

        // 		//				item = new BehaviourInstance( this, container, false );
        // 		//			}
        // 		//			else if ( jsonObj.items[i].type === 'BehaviourShortcut' )
        // 		//			{
        // 		//				item = new BehaviourShortcut( this, null, jsonObj.items[i].name );
        // 		//				shortcuts.push( new ShortCutHelper( <BehaviourShortcut>item, jsonObj.items[i] ) );
        // 		//			}
        // 		//			else if ( jsonObj.items[i].type === 'BehaviourComment' )
        // 		//				item = new BehaviourComment( this, jsonObj.items[i].text );
        // 		//			else if ( jsonObj.items[i].type === 'Behaviour' )
        // 		//				item = new Behaviour( this, jsonObj.items[i].name );
        // 		//			else if ( jsonObj.items[i].type === 'Link' )
        // 		//			{
        // 		//				var l: Link = new Link( this );
        //   //                      item = l;

        // 		//				// Links we treat differerntly. They need all the behaviours
        // 		//				// loaded first. So we do that, and keep each link in an array
        // 		//				// to load after the behaviours
        //   //                      links.push(l);
        //   //                      l.properties.getVar('Frame Delay').setVal( (jsonObj.items[i].frameDelay !== undefined ? jsonObj.items[i].frameDelay : 1) );

        // 		//				// Store some temp data on the tag
        // 		//				l.tag = {};
        // 		//				l.tag.startPortalName = jsonObj.items[i].startPortal;
        // 		//				l.tag.endPortalName = jsonObj.items[i].endPortal;
        // 		//				l.tag.startBehaviourID = jsonObj.items[i].startBehaviour;
        // 		//				l.tag.endBehaviourID = jsonObj.items[i].endBehaviour;
        // 		//				l.tag.startBehaviour = null;
        // 		//				l.tag.endBehaviour = null;
        // 		//			}



        // 		//			// Check if it was created ok
        // 		//			if ( item !== null )
        // 		//			{
        // 		//				item.savedID = jsonObj.items[i].id;

        // 		//				// Set the positioning etc...
        // 		//				item.element.css( {
        // 		//					'left': jsonObj.items[i].left,
        // 		//					'top': jsonObj.items[i].top,
        // 		//					'z-index': jsonObj.items[i].zIndex,
        // 		//					'position': jsonObj.items[i].position
        // 		//				});

        // 		//				// Add the portals if they exist
        // 		//				if ( jsonObj.items[i].portals )
        // 		//				{
        // 		//					for ( var iii = 0; iii < jsonObj.items[i].portals.length; iii++ )
        // 		//					{
        // 		//						var portal = ( <Behaviour>item ).addPortal( jsonObj.items[i].portals[iii].type,
        // 		//							jsonObj.items[i].portals[iii].name,
        // 		//							jsonObj.items[i].portals[iii].value,
        // 		//							jsonObj.items[i].portals[iii].dataType, false
        // 		//							);

        // 		//						portal.customPortal = jsonObj.items[i].portals[iii].customPortal;
        // 		//						if ( portal.customPortal === undefined || portal.customPortal === null )
        // 		//							portal.customPortal = false;
        // 		//					}

        // 		//					// Set the alias text if it exists
        // 		//					if ( jsonObj.items[i].alias && jsonObj.items[i].alias !== '' && jsonObj.items[i].alias !== null )
        // 		//					{
        // 		//						( <Behaviour>item ).text = jsonObj.items[i].alias;
        // 		//						( <Behaviour>item ).alias = jsonObj.items[i].alias;
        // 		//					}
        // 		//				}

        // 		//				if ( item instanceof Behaviour )
        // 		//					( <Behaviour>item ).updateDimensions();
        // 		//			}
        // 		//		}
        // 		//	}

        // 		//	// Link any shortcut nodes
        // 		//	for ( var li = 0, lil = this.children.length; li < lil; li++ )
        // 		//	{
        // 		//		for ( var ii = 0, lii = shortcuts.length; ii < lii; ii++ )
        // 		//			if ( this.children[li].savedID === shortcuts[ii].datum.behaviourID )
        // 		//			{
        // 		//				shortcuts[ii].item.setOriginalNode( <Behaviour>this.children[li], false );
        // 		//			}
        // 		//	}

        // 		//	// Now do each of the links
        // 		//	for ( var li = 0, llen = links.length; li < llen; li++ )
        // 		//	{
        //   //              var link: Link = links[li];

        // 		//		// We need to find the nodes first
        // 		//		var len = this.children.length;
        // 		//		for ( var ii = 0; ii < len; ii++ )
        // 		//		{
        // 		//			if ( link.tag.startBehaviourID === ( <Behaviour>this.children[ii] ).savedID )
        // 		//			{
        // 		//				var behaviour: Behaviour = ( <Behaviour>this.children[ii] );
        // 		//				link.tag.startBehaviour = behaviour;

        // 		//				// Now that the nodes have been set - we have to set the portals
        // 		//				for ( var iii = 0; iii < behaviour.portals.length; iii++ )
        // 		//				{
        // 		//					var portal: Portal = behaviour.portals[iii];
        // 		//					if ( link.tag.startPortalName === portal.name )
        // 		//					{
        // 		//						link.startPortal = portal;
        // 		//						link.tag.startBehaviour = null;
        // 		//						portal.addLink( link );

        // 		//						break;
        // 		//					}
        // 		//				}
        // 		//			}


        // 		//			if ( link.tag.endBehaviourID === this.children[ii].savedID )
        // 		//			{
        // 		//				var behaviour: Behaviour = ( <Behaviour>this.children[ii] );
        // 		//				link.tag.endBehaviour = behaviour;

        // 		//				// Now that the nodes have been set - we have to set the portals
        // 		//				for ( var iii = 0; iii < behaviour.portals.length; iii++ )
        // 		//				{
        // 		//					var portal = behaviour.portals[iii];
        // 		//					if ( link.tag.endPortalName === portal.name )
        // 		//					{
        // 		//						link.endPortal = portal;
        // 		//						link.tag.endBehaviour = null;
        // 		//						portal.addLink( link );
        // 		//						break;
        // 		//					}
        // 		//				}
        // 		//			}
        // 		//		}

        // 		//		if ( link.startPortal === null )
        // 		//			link.dispose();
        // 		//		else
        // 		//		{
        // 		//			if ( !link.endPortal || !link.startPortal || typeof link.startPortal === 'string' || typeof link.endPortal === 'string' || !link.endPortal.behaviour || !link.startPortal.behaviour )
        // 		//			{
        // 		//				link.dispose();
        // 		//			}
        // 		//			else
        // 		//			{
        // 		//				link.updatePoints();
        // 		//				link.element.css( 'pointer-events', '' );
        // 		//			}
        // 		//		}

        // 		//		// Clear the temp tag
        // 		//		link.tag = null;
        // 		//	}

        // 		//	for ( var c = 0, cl = this.children.length; c < cl; c++ )
        // 		//		this.children[c].savedID = null;

        // 		//	// Let the plugins open their data
        // 		//	if ( jsonObj && jsonObj.plugins )
        // 		//		pManager.emit( new ContainerDataEvent( EditorEvents.CONTAINER_OPENING, this._container, jsonObj.plugins ) );

        // 		//	this.checkDimensions();
        // 		//	this.buildSceneReferences();
        // 		//}

        // 		/**
        // 		* This function is called to make sure the canvas min width and min height variables are set
        // 		*/
        // 		checkDimensions() {
        // 			// Make sure that the canvas is sized correctly
        // 			var w = 0;
        // 			var h = 0;
        // 			var i = this.children.length;
        // 			var child: Component = null;
        // 			while ( i-- ) {
        // 				child = <Component>this.children[i];

        // 				var w2 = child.element.css( 'left' );
        // 				var w2a = w2.split( 'px' );
        // 				var w2n = parseFloat( w2a[0] ) + child.element.width() + 5;

        // 				var h2 = child.element.css( 'top' );
        // 				var h2a = h2.split( 'px' );
        // 				var h2n = parseFloat( h2a[0] ) + child.element.height() + 5;

        // 				if ( w2n > w )
        // 					w = w2n;
        // 				if ( h2n > h )
        // 					h = h2n;
        // 			}

        // 			var minW = this.element.css( 'min-width' );
        // 			var minT = minW.split( 'px' );
        // 			var minWi = parseFloat( minT[0] );

        // 			var minH = this.element.css( 'min-height' );
        // 			var minHT = minH.split( 'px' );
        // 			var minHi = parseFloat( minHT[0] );

        // 			this.element.css( {
        // 				'min-width': ( w > minWi ? w : minWi ).toString() + 'px',
        // 				'min-height': ( h > minHi ? h : minHi ).toString() + 'px'
        // 			});
        // 		}


        get container(): Resources.Container { return this._container; }
        get containerReferences(): { groups: Array<number>; assets: Array<number> } { return this._containerReferences; }
    }
}