module Animate
{
	class ShortCutHelper
	{
		public item: BehaviourShortcut;
		public datum: any;

		constructor( item: BehaviourShortcut, datum: any )
		{
			this.item = item;
			this.datum = datum;
		}
	}

	export class CanvasEvents extends ENUM
	{
		constructor( v: string ) { super( v ); }

		static MODIFIED: CanvasEvents = new CanvasEvents( "canvas_modified" );
	}

	export class CanvasEvent extends Event
	{
		public canvas: Canvas;

		constructor( eventName: CanvasEvents, canvas: Canvas )
		{
			this.canvas = canvas;
			super( eventName, canvas );
		}
	}

	/**
	* The canvas is used to create diagrammatic representations of behaviours and how they interact in the scene.
	*/
	export class Canvas extends Component
	{
		public static lastSelectedItem = null;
		public static snapping: boolean = false;
		private mUpProxy: any;
		private mDownProxy: any;
		private mContextProxy: any;
		private keyProxy: any;
		private mContextNode: Component;
		private mX: number;
		private mY: number;
		public name: string;
		private _behaviourContainer: BehaviourContainer;

		private _containerReferences: { groups: Array<string>; assets: Array<number>; };

		private _proxyMoving: any;
		private _proxyStartDrag: any;
		private _proxyStopDrag: any;

		/**
		* @param {Component} parent The parent component to add this canvas to
		* @param {BehaviourContainer} behaviourContainer Each canvas represents a behaviour.This container is the representation of the canvas as a behaviour.
		*/
		constructor( parent: Component, behaviourContainer: BehaviourContainer ) 
		{
			// Call super-class constructor
			super( "<div class='canvas' tabindex='0'></div>", parent );

			this._proxyMoving = this.onChildMoving.bind( this );
			this._proxyStartDrag = this.onStartingDrag.bind( this );
			this._proxyStopDrag = this.onChildDropped.bind( this );

			this.mDownProxy = this.onMouseDown.bind( this );
			this.mUpProxy = this.onMouseUp.bind( this );
			this.element.on( "mousedown", this.mDownProxy );
			this.element.on( "dblclick", jQuery.proxy( this.onDoubleClick, this ) );
			this.mX = 0;
			this.mY = 0;
			this.name = behaviourContainer.name;
			this._behaviourContainer = behaviourContainer;
			behaviourContainer.canvas = this;

			//Define proxies
			this.mContextProxy = this.onContext.bind( this );
			this.keyProxy = this.onKeyDown.bind( this );
			this.mContextNode = null;

			//Hook listeners

			jQuery( "body" ).on( "keydown", this.keyProxy );
			jQuery( document ).on( "contextmenu", this.mContextProxy );

			BehaviourPicker.getSingleton().addEventListener( BehaviourPickerEvents.BEHAVIOUR_PICKED, this.onBehaviourPicked, this );
			PortalForm.getSingleton().addEventListener( OkCancelFormEvents.CONFIRM, this.OnPortalConfirm, this );

			new BehaviourPortal( this, "Start" );
			PropertyGrid.getSingleton().addEventListener( PropertyGridEvents.PROPERTY_EDITED, this.onPropertyGridEdited, this );
			this.element.droppable( { drop: this.onObjectDropped.bind( this ), accept: ".behaviour-to-canvas" });
			this._containerReferences = { groups: [], assets: [] };

			PluginManager.getSingleton().addEventListener(EditorEvents.ASSET_EDITED, this.onAssetEdited, this );
		}

		//onStartingDrag(response : DragManagerEvents, event: DragEvent )
		onStartingDrag( e, ui )
		{
			var target: Behaviour = <Behaviour>jQuery( e.currentTarget ).data( "component" );

			//Shift key pressed - so lets create a shortcut
			if ( e.shiftKey )
			{
				if ( !( target.canGhost ) )
					return;

				var left = target.element.css( "left" );
				var top = target.element.css( "top" );

				var shortcut: BehaviourShortcut = null;

				// If the target is a short cut, then use the targets origin
				if ( target instanceof BehaviourShortcut )
					shortcut = new BehaviourShortcut( this, ( <BehaviourShortcut>target ).originalNode, ( <BehaviourShortcut>target ).originalNode.alias );
				else
					shortcut = new BehaviourShortcut( this, target, target.alias );

				shortcut.element.css( { left: left, top: top, position: "absolute" });

				( <any>jQuery ).ui.ddmanager.current.helper = shortcut.element;
				( <any>jQuery ).ui.ddmanager.current.cancelHelperRemoval = true;
			}

			( <any>jQuery ).ui.ddmanager.current.options.grid = ( Canvas.snapping ? [10, 10] : undefined );
		}

		/**
		* When an item is finished being dragged
		*/
		onChildDropped( e, ui )
		{
			var target: Behaviour = <Behaviour>ui.helper.data( "component" );
			var left = parseFloat( target.element.css( "left" ).split( "px" )[0] );
			var top = parseFloat( target.element.css( "top" ).split( "px" )[0] );

			if ( Canvas.snapping )
			{
				left = parseInt( left.toString() );
				top = parseInt( top.toString() );

				left = left - left % 10;
				top = top - top % 10;
			}

			if ( left < 0 )
				left = 0;

			if ( top < 0 )
				top = 0;

			target.element.css( { top: top + "px", left: left + "px" });

			//Upadte the links
			for ( var i = 0, l = target.portals.length; i < l; i++ )
				target.portals[i].updateAllLinks();

			//Notify of change
			this.dispatchEvent( new CanvasEvent( CanvasEvents.MODIFIED, this ) );
		}

		/**
		* Called when a draggable object is dropped onto the canvas.
		* @param {any} event The jQuery UI event 
		* @param {any} ui The event object sent from jQuery UI
		*/
		onObjectDropped( event: any, ui: any )
		{
			var comp: Component = jQuery( ui.draggable ).data( "component" );
			if ( comp instanceof TreeNode )
			{
				var p: JQuery = this.parent.element;
				var offset = this.element.offset();
				var scrollX = p.scrollLeft();
				var scrollY = p.scrollTop();
				var mouse = { x: event.pageX - offset.left - scrollX, y: event.pageY - offset.top - scrollY };
				this.mX = mouse.x + scrollX;
				this.mY = mouse.y + scrollY;

				if ( comp instanceof TreeNodeAssetInstance )
					this.addAssetAtLocation( ( <TreeNodeAssetInstance>comp ).asset, this.mX, this.mY );
				else if ( comp instanceof TreeNodePluginBehaviour )
					this.createNode( ( <TreeNodePluginBehaviour>comp ).template, this.mX, this.mY );
				else if ( comp instanceof TreeNodeBehaviour )
					this.createNode( PluginManager.getSingleton().getTemplate( "Instance" ), this.mX, this.mY, ( <TreeNodeBehaviour>comp ).behaviour );
			}
		}

		/**
		* Create an asset node at a location
		* @param {Asset} asset 
		* @param {number} x 
		* @param {number} y 
		*/
		addAssetAtLocation( asset: Asset, x: number, y: number )
		{
			var node: BehaviourAsset = <BehaviourAsset>this.createNode( PluginManager.getSingleton().getTemplate( "Asset" ), x, y );
			node.asset = asset;
			node.parameters[0].value = { selected : asset.shallowId, classname : "" };

			//Add a reference to this canvas's scene assets
			if ( asset )
			{
				node.text = asset.name;
				node.alias = asset.name;
			}

			this.buildSceneReferences();
		}

		/**
		* This function is used to cleanup the object before its removed from memory.
		*/
		dispose()
		{
			this.element.droppable("destroy");

			PluginManager.getSingleton().removeEventListener(EditorEvents.ASSET_EDITED, this.onAssetEdited, this);
			BehaviourPicker.getSingleton().removeEventListener( BehaviourPickerEvents.BEHAVIOUR_PICKED, this.onBehaviourPicked, this );
			PortalForm.getSingleton().removeEventListener( OkCancelFormEvents.CONFIRM, this.OnPortalConfirm, this );
			jQuery( "body" ).off( "keydown", this.keyProxy );
			jQuery( document ).off( "contextmenu", this.mContextProxy );
			PropertyGrid.getSingleton().removeEventListener( PropertyGridEvents.PROPERTY_EDITED, this.onPropertyGridEdited, this );

			this.element.off( "mousedown", this.mDownProxy );

			this._proxyMoving = null;
			this._proxyStartDrag = null;
			this._proxyStopDrag = null;
			this.mX = null;
			this.mY = null;
			this.name = null;
			this._behaviourContainer = null;
			this.keyProxy = null;
			this.mContextProxy = null;
			this.mContextNode = null;
			this._containerReferences = null;

			//Call super
			super.dispose();
		}


		/**
		* This function will remove all references of an asset in the behaviour nodes
		* @param {Asset} asset The asset reference
		*/
		removeAsset( asset: Asset )
		{
			var pManager: PluginManager = PluginManager.getSingleton();
			var contEvent: AssetContainerEvent = new AssetContainerEvent( EditorEvents.ASSET_REMOVED_FROM_CONTAINER, null, this._behaviourContainer );
			var project: Project = User.getSingleton().project;

			for ( var i = 0, l = this.children.length; i < l; i++ )
			{
				var item: Behaviour = <Behaviour>this.children[i];

				//If it contains any assests - then we make sure they are removed from this canvas
				if ( item instanceof Behaviour )
				{
					for ( var ii = 0, il = item.parameters.length; ii < il; ii++ )
					{
						var portal: Portal = item.parameters[ii];
						if ( portal.dataType == ParameterType.ASSET && portal.value != null )
						{
							var assetID : number = parseInt( portal.value.selected );
							if ( project.getAssetByShallowId( assetID ) == asset )
							{
								portal.value = { className: portal.value.className, selected : null }

								if ( item instanceof BehaviourAsset )
									( <BehaviourAsset>item ).asset = null;
							}
						}
						else if ( portal.dataType == ParameterType.ASSET_LIST && portal.value != null && portal.value.selectedAssets.length > 0 )
						{
							for ( var a, al = portal.value.selectedAssets.length; a < al; a++ )
							{
								var assetID : number = portal.value.selectedAssets[a];
								if ( project.getAssetByShallowId( assetID ) == asset )
								{
									portal.value = { className: portal.value.className, selected: null };
								}
							}
						}
					}
				}
			}

			this.buildSceneReferences();
		}

		/**
		* Call this to remove an item from the canvas
		* @param {Component} item The component we are removing from the canvas
		* @extends <Canvas>
		*/
		removeItem( item )
		{
			var toRemove = [];
			for ( var i = 0; i < this.children.length; i++ )
				toRemove.push( this.children[i] );

			//Remove any shortcuts first
			for ( var i = 0; i < toRemove.length; i++ )
				if ( typeof ( toRemove[i] ) !== "undefined" )
					if ( toRemove[i] instanceof BehaviourShortcut && toRemove[i].originalNode == item )
						this.removeItem( toRemove[i] );



			for ( var i = 0; i < toRemove.length; i++ )
				if ( typeof ( toRemove[i] ) !== "undefined" )
					if ( toRemove[i] == item )
					{
						//Notify of change
						this.dispatchEvent( new CanvasEvent( CanvasEvents.MODIFIED, this ) );

						//Notify of change
						if ( toRemove[i] instanceof BehaviourPortal )
							PluginManager.getSingleton().dispatchEvent( new PluginPortalEvent( EditorEvents.PORTAL_REMOVED, "", this._behaviourContainer, ( <BehaviourPortal>toRemove[i] ).portals[0], this ) );

						toRemove[i].dispose();

						this.buildSceneReferences();
					}

			toRemove = null;
		}

		/**
		* Removes all selected items
		*/
		removeItems()
		{
			//Remove all selected
			var toRemove: Array<Component> = [];
			var i = this.children.length;
			while ( i-- )
				toRemove.push( <Component>this.children[i] );

			var i = toRemove.length;
			while ( i-- )
				if ( typeof ( toRemove[i] ) !== "undefined" )
					if ( toRemove[i].disposed != null && toRemove[i].selected )
						this.removeItem( toRemove[i] );
		}

		/**
		* Called when the canvas context menu is closed and an item clicked.
		*/
		onContextSelect( e: ContextMenuEvents, event: ContextMenuEvent )
		{
			if ( event.item.text == "Delete" )
			{
				//Delete portal
				if ( this.mContextNode instanceof Portal )
				{
					var behaviour: Behaviour = ( <Portal>this.mContextNode ).behaviour;
					behaviour.removePortal( <Portal>this.mContextNode );

					var toEdit: EditableSet = new EditableSet();
					var i = behaviour.parameters.length;
					while ( i-- )
						if ( behaviour.parameters[i].links.length <= 0 )
							toEdit.addVar( behaviour.parameters[i].name, behaviour.parameters[i].value, ParameterType.fromString( behaviour.parameters[i].dataType.toString() ), behaviour.element.text(), null );

					PropertyGrid.getSingleton().editableObject( toEdit, behaviour.text + " - " + behaviour.id, behaviour.id, null );
					return;
				}
				else
					Toolbar.getSingleton().deleteBut.element.trigger( "click" );
			}
			else if ( event.item.text == "Remove Empty Assets" )
			{
				//Remove all selected
				var toRemove = [];
				var i = this.children.length;
				while ( i-- )
					toRemove.push( this.children[i] );

				var i = toRemove.length;
				while ( i-- )
					if ( typeof ( toRemove[i] ) !== "undefined" )
						if ( toRemove[i] instanceof BehaviourAsset && toRemove[i].parameters[0].value == ":" )
							this.removeItem( toRemove[i] );
			}
			//Edit an existing portal
			else if ( event.item.text == "Edit Portal" )
			{
				PortalForm.getSingleton().showForm( <Portal>this.mContextNode, null, null );
			}
			else if ( event.item.text == "Create Behaviour" )
			{
				var context = Application.getInstance().canvasContext;
				BehaviourPicker.getSingleton().show( Application.getInstance(), context.element.offset().left, context.element.offset().top, false, true );
			}
			//Create a comment
			else if ( event.item.text == "Create Comment" )
			{
				var context = Application.getInstance().canvasContext;
				var comment = new BehaviourComment( this, "Comment" );
				comment.element.addClass( "scale-in-animation" );
				comment.css( { left: this.mX + "px", top: this.mY + "px", width: "100px", height: "60px" });
			}
			else if ( event.item.text == "Create Input" || event.item.text == "Create Output"
				|| event.item.text == "Create Parameter" || event.item.text == "Create Product" )
			{
				//Define the type of portal
				var type: PortalType = PortalType.INPUT;
				if ( event.item.text == "Create Output" )
					type = PortalType.OUTPUT;
				else if ( event.item.text == "Create Parameter" )
					type = PortalType.PARAMETER;
				if ( event.item.text == "Create Product" )
					type = PortalType.PRODUCT;

				if ( this.mContextNode )
					PortalForm.getSingleton().showForm( <Behaviour>this.mContextNode, type, null );
				else
					PortalForm.getSingleton().showForm( this, type, event.item.text );
			}

			this.onContextHide( WindowEvents.HIDDEN, null );
		}

		/*
		* Recurssively creates a list of assets used in this scene
		*/
		getAssetList( asset: Asset, assetMap: Array<number> )
		{
			if ( !asset )
				return;

			if ( assetMap.indexOf( asset.shallowId ) == -1 )
				assetMap.push( asset.shallowId );

			var project: Project = User.getSingleton().project;
			var properties = asset.properties.variables;

			for ( var i = 0, l = properties.length; i < l; i++ )
				if ( properties[i].type == ParameterType.ASSET )
					this.getAssetList( project.getAssetByShallowId( parseInt( properties[i].value.selected ) ), assetMap );
				else if ( properties[i].type == ParameterType.ASSET_LIST )
					this.getAssetList( project.getAssetByShallowId( parseInt( properties[i].value.selected ) ), assetMap );
		}

		onAssetEdited(e: ENUM, event: AssetEditedEvent, sender? : EventDispatcher)
		{
			// Build the scene references in case some assets were added and not accounted for
			this.buildSceneReferences();
		}

		/*
		* Creates the asset and group arrays associated with this container
		*/
		buildSceneReferences()
		{
			var curAssets : Array<number> = [];
			var curGroups : Array<string> = [];

			var children = this.children;
			var project: Project = User.getSingleton().project;

			for ( var i = 0; i < children.length; i++ )
			{
				if ( children[i] instanceof Behaviour )
				{
					var behaviour = <Behaviour>children[i];
					var portals: Array<Portal> = behaviour.portals;

					//Check all behaviours and their portals
					for ( var ii = 0; ii < portals.length; ii++ )
					{
						//If there is an asset previously and its being removed
						if ( portals[ii].dataType == ParameterType.ASSET && portals[ii].value != null && portals[ii].value.selected )
						{
							var asset: Asset = project.getAssetByShallowId( parseInt( portals[ii].value.selected ) );

							if ( asset )
								this.getAssetList( asset, curAssets );
						}
						else if ( portals[ii].dataType == ParameterType.GROUP && portals[ii].value != null && portals[ii].value != "" )
						{
							var group: TreeNodeGroup = <TreeNodeGroup>TreeViewScene.getSingleton().findNode( "groupID", portals[ii].value )

							if ( group )
								curGroups.push( group.groupID );
						}
						else if ( portals[ii].dataType == ParameterType.ASSET_LIST && portals[ii].value != null && portals[ii].value.selectedAssets.length > 0 )
						{
							for ( var a, al = portals[ii].value.selectedAssets.length; a < al; a++ )
							{
								var asset: Asset = project.getAssetByShallowId( portals[ii].value.selectedAssets[a] );

								if ( asset )
									this.getAssetList( asset, curAssets );
							}
						}
					}
				}
			}

			var pManager: PluginManager = PluginManager.getSingleton();
			var addEvent: AssetContainerEvent = new AssetContainerEvent( EditorEvents.ASSET_ADDED_TO_CONTAINER, null, this._behaviourContainer );
			var removeEvent: AssetContainerEvent = new AssetContainerEvent( EditorEvents.ASSET_REMOVED_FROM_CONTAINER, null, this._behaviourContainer );

			// Notify of asset removals
			for ( var i = 0, l = this._containerReferences.assets.length; i < l; i++ )
				if ( curAssets.indexOf( this._containerReferences.assets[i] ) == -1 )
				{
					removeEvent.asset = project.getAssetByShallowId( this._containerReferences.assets[i] );
					pManager.dispatchEvent( removeEvent );
				}

			// Notify of asset additions			
			for ( var i = 0, l = curAssets.length; i < l; i++ )
				if ( this._containerReferences.assets.indexOf( curAssets[i] ) == -1 )
				{
					addEvent.asset = project.getAssetByShallowId( curAssets[i] );
					pManager.dispatchEvent( addEvent );
				}

			this._containerReferences.assets = curAssets;
			this._containerReferences.groups = curGroups;
		}


		/**
		* Called when the property grid fires an edited event. 
		* @param {PropertyGridEvents} response 
		* @param {PropertyGridEvent} event
		*/
		onPropertyGridEdited( response: PropertyGridEvents, event: PropertyGridEvent )
		{
			for ( var i = 0; i < this.children.length; i++ )
			{
				if ( event.id == this.children[i] )
				{
					if ( this.children[i] instanceof BehaviourComment )
					{
						var comment: BehaviourComment = <BehaviourComment>this.children[i];
						comment.text = event.propertyValue;
					}
					else if ( this.children[i] instanceof Link )
					{
						var link: Link = <Link>this.children[i];
						var num = event.propertyValue.selected;
						num = parseInt( num );
						if ( isNaN( num ) )
							num = 1;

						link.frameDelay = num;
						link.draw();
					}
					else
					{
						var portals: Array<Portal> = ( <Behaviour>this.children[i] ).portals;

						//Check all behaviours and their portals
						for ( var ii = 0; ii < portals.length; ii++ )
						{
							var item: Behaviour = <Behaviour>this.children[i];

							//If the portal name is the same as the one that is being edited
							if ( portals[ii].name == event.propertyName )
							{
								if ( item instanceof BehaviourAsset )
									( <BehaviourAsset>item ).asset = event.propertyValue;

								item.portals[ii].value = event.propertyValue;

								//Notify of change
								this.dispatchEvent( new CanvasEvent( CanvasEvents.MODIFIED, this ) );
								this.buildSceneReferences();
								return;
							}
						}
					}
				}
			}
		}

		/**
		* When we click ok on the portal form
		*/
		OnPortalConfirm( response: OkCancelFormEvents, e: OkCancelFormEvent )
		{
			if ( this.element.is( ':visible' ) == false )
				return;

			if ( e.text == "Ok" )
			{
				//If we are editing a portal
				if ( this.mContextNode instanceof Portal )
				{

					var portal: Portal = <Portal>this.mContextNode;
					var oldName: string = portal.name;
					portal.edit(
						PortalForm.getSingleton().name,
						PortalForm.getSingleton().portalType,
						PortalForm.getSingleton().value,
						PortalForm.getSingleton().parameterType );

					var p = portal.parent;
					if ( p instanceof BehaviourPortal )
						( <BehaviourPortal>p ).text = portal.name;

					//Show in prop editor
					var behaviour = portal.behaviour;
					var toEdit: EditableSet = new EditableSet();
					var i = behaviour.parameters.length;
					while ( i-- )
						if ( behaviour.parameters[i].links.length <= 0 )
							toEdit.addVar( behaviour.parameters[i].name, behaviour.parameters[i].value, behaviour.parameters[i].dataType, behaviour.element.text(), null );

					PropertyGrid.getSingleton().editableObject( toEdit, behaviour.text + " - " + behaviour.id, behaviour, "" );

					//Notify of change
					PluginManager.getSingleton().dispatchEvent( new PluginPortalEvent( EditorEvents.PORTAL_EDITED, oldName, this._behaviourContainer, portal, this ) );

					return;
				}
				else if ( this.mContextNode instanceof Behaviour )
				{
					//Create a portal on a Behaviour
					var portal: Portal = ( <Behaviour>this.mContextNode ).addPortal
						(
						PortalForm.getSingleton().portalType,
						PortalForm.getSingleton().name,
						PortalForm.getSingleton().value,
						PortalForm.getSingleton().parameterType, true
						);

					portal.customPortal = true;
				}
				else
				{
					//Create a canvas portal
					var newNode: BehaviourPortal = new BehaviourPortal( this,
						PortalForm.getSingleton().name,
						PortalForm.getSingleton().portalType,
						PortalForm.getSingleton().parameterType,
						PortalForm.getSingleton().value );

					newNode.css( { "left": this.mX + "px", "top": this.mY + "px", "position": "absolute" });

					//Notify of change
					PluginManager.getSingleton().dispatchEvent( new PluginPortalEvent( EditorEvents.PORTAL_ADDED, "", this._behaviourContainer, newNode.portals[0], this ) );
				}

				//Notify of change
				this.dispatchEvent( new CanvasEvent( CanvasEvents.MODIFIED, this ) );
			}
		}

		/**
		* When the context is hidden we remove the event listeners.
		*/
		onContextHide( response: WindowEvents, e: WindowEvent )
		{
			var context = Application.getInstance().canvasContext;
			context.removeEventListener( WindowEvents.HIDDEN, this.onContextHide, this );
			context.removeEventListener( ContextMenuEvents.ITEM_CLICKED, this.onContextSelect, this );
		}

		/**
		* Called when the context menu is about to open
		* @param {any} e The jQuery event object
		*/
		onContext( e )
		{
			if ( this.element.is( ':visible' ) == false )
				return;

			//First get the x and y cords
			var p: JQuery = this.parent.element;
			var offset = this.element.offset();
			var scrollX = p.scrollLeft();
			var scrollY = p.scrollTop();
			var mouse = { x: e.pageX - offset.left - scrollX, y: e.pageY - offset.top - scrollY };
			this.mX = mouse.x + scrollX;
			this.mY = mouse.y + scrollY;

			//Now hook the context events
			var targ = jQuery( e.target );
			var targetComp = targ.data( "component" );
			var context = Application.getInstance().canvasContext;
			this.mContextNode = targ.data( "component" );

			//If the canvas
			if ( targetComp instanceof Canvas )
			{
				this.mContextNode = null;
				e.preventDefault();
				context.showContext( e.pageX, e.pageY, null );
				context.element.css( { "width": "+=20px" });
				context.addEventListener( WindowEvents.HIDDEN, this.onContextHide, this );
				context.addEventListener( ContextMenuEvents.ITEM_CLICKED, this.onContextSelect, this );
			}
			//If a portal
			else if ( targetComp instanceof Portal )
			{
				e.preventDefault();
				context.showContext( e.pageX, e.pageY, this.mContextNode );
				context.element.css( { "width": "+=20px" });
				context.addEventListener( WindowEvents.HIDDEN, this.onContextHide, this );
				context.addEventListener( ContextMenuEvents.ITEM_CLICKED, this.onContextSelect, this );

			}
			//If a link
			else if ( targetComp instanceof Link )
			{
				e.preventDefault();
				var link = targ.data( "component" );
				var hit = link.hitTestPoint( e );
				if ( hit )
				{
					context.showContext( e.pageX, e.pageY, link );
					context.element.css( { "width": "+=20px" });
					context.addEventListener( WindowEvents.HIDDEN, this.onContextHide, this );
					context.addEventListener( ContextMenuEvents.ITEM_CLICKED, this.onContextSelect, this );
				}
			}

			//If a portal node
			else if ( targetComp instanceof BehaviourInstance || targetComp instanceof BehaviourAsset || targetComp instanceof BehaviourPortal )
			{
				e.preventDefault();
				context.showContext( e.pageX, e.pageY, this.mContextNode );
				context.element.css( { "width": "+=20px" });
				context.addEventListener( WindowEvents.HIDDEN, this.onContextHide, this );
				context.addEventListener( ContextMenuEvents.ITEM_CLICKED, this.onContextSelect, this );
			}
			else if ( targetComp instanceof BehaviourComment )
				e.preventDefault();
			//If a behavior node (but not a portal node)
			else if ( targetComp instanceof Behaviour )
			{
				e.preventDefault();
				context.showContext( e.pageX, e.pageY, this.mContextNode );
				context.element.css( { "width": "+=20px" });
				context.addEventListener( WindowEvents.HIDDEN, this.onContextHide, this );
				context.addEventListener( ContextMenuEvents.ITEM_CLICKED, this.onContextSelect, this );

			}
			else
				context.hide();
		}

		/**
		* When we have chosen a behaviour
		*/
		onBehaviourPicked( response: BehaviourPickerEvents, event: BehaviourPickerEvent )
		{
			if ( this.element.is( ':visible' ) == false )
				return;

			//Check if this is the selected Canvas
			if ( this.element.parent().parent().length == 0 )
				return;

			var template = PluginManager.getSingleton().getTemplate( event.behaviourName );

			if ( template )
			{
				this.createNode( template, this.mX, this.mY );
			}
		}

		/**
		* Iteratively goes through each container to check if its pointing to this behaviour
		*/
		private isCyclicDependency( container : BehaviourContainer, ref : string ) : boolean
		{
			var project = User.getSingleton().project;
			var thisContainer = this._behaviourContainer;
			var json: CanvasToken = null;
			var canvas: Canvas = null;

			// If this container is the same as the one we are testing
			// then return true
			if ( container == thisContainer )
				return true;

			// Get the most updated JSON
			canvas = CanvasTab.getSingleton().getTabCanvas( container.id );
			if ( canvas && !canvas._behaviourContainer.saved )
				json = canvas.buildDataObject();
			else
				json = container.json;

			if ( !container.json )
				return false;

			// Go through each of the items to see if got any instance that might refer to this container
			var items = json.items;
			for ( var i = 0, l = items.length; i < l; i++ )
				if ( items[i].type == "BehaviourInstance" )
				{
					var childContainer = project.getBehaviourByShallowId( items[i].containerId );
					if ( childContainer && this.isCyclicDependency( childContainer, ref ) )
					{
						ref = childContainer.name;
						return true;
					}
				}

			return false;
		}

		/**
		* This will create a canvas node based on the template given
		* @param {BehaviourDefinition} template The definition of the node
		* @param {number} x The x position of where the node shoule be placed
		* @param {number} y The y position of where the node shoule be placed
		* @param {BehaviourContainer} container This is only applicable if we are dropping a node that represents another behaviour container. This last parameter
		* is the actual behaviour container
		* @returns {Behaviour} 
		*/
		createNode( template: BehaviourDefinition, x: number, y: number, container?: BehaviourContainer ): Behaviour
		{
			var toAdd: Behaviour = null;

			if ( template.behaviourName == "Instance" )
			{
				var nameOfBehaviour: string = "";
				var cyclic: boolean = this.isCyclicDependency( container, nameOfBehaviour ); 
				if ( cyclic )
				{
					MessageBox.show( "You have a cylic dependency with the behaviour '" + nameOfBehaviour + "'", ["Ok"], null, null );
					return null;
				}
				toAdd = new BehaviourInstance( this, container );
			}
			else if ( template.behaviourName == "Asset" )
				toAdd = new BehaviourAsset( this, template.behaviourName );
			else if ( template.behaviourName == "Script" )
				toAdd = new BehaviourScript( this, 0, template.behaviourName );
			else
				toAdd = new Behaviour( this, template.behaviourName );

			if ( template.behaviourName != "Instance" )
				toAdd.text = template.behaviourName;

			var portalTemplates = null;

			if ( template.createPortalsTemplates )
				portalTemplates = template.createPortalsTemplates();

			//Check for name duplicates
			if ( portalTemplates )
			{
				for ( var i = 0; i < portalTemplates.length; i++ )
					for ( var ii = 0; ii < portalTemplates.length; ii++ )
						if ( ii != i && portalTemplates[i].name == portalTemplates[ii].name )
						{
							MessageBox.show( "One of the portals " + portalTemplates[ii].name + " has the same name as another.", Array<string>( "Ok" ), null, null );
							toAdd.dispose();
							toAdd = null;
							return;
						}

				//Create each of the portals
				for ( var i = 0; i < portalTemplates.length; i++ )
				{
					var portal = toAdd.addPortal(
						portalTemplates[i].type,
						portalTemplates[i].name,
						portalTemplates[i].value,
						portalTemplates[i].dataType, false
						);

					if ( toAdd instanceof BehaviourScript == false )
						portal.customPortal = false;
				}
			}

			x = parseInt( x.toString() );
			y = parseInt( y.toString() );

			x = x - x % 10;
			y = y - y % 10;

			toAdd.element.css( { left: x + "px", top: y + "px" });
			toAdd.element.addClass( "scale-in-animation" );

			toAdd.updateDimensions();

			//Notify of change
			this.dispatchEvent( new CanvasEvent( CanvasEvents.MODIFIED, this ) );

			return toAdd;
		}

		/**
		* Called when a behaviour is renamed
		*/
		onBehaviourRename( e: RenameFormEvents, event: RenameFormEvent )
		{
			RenameForm.getSingleton().removeEventListener( RenameFormEvents.OBJECT_RENAMED, this.onBehaviourRename, this );

			var toEdit: Behaviour = null;
			if ( event.object instanceof BehaviourShortcut )
				toEdit = event.object.originalNode;
			else
				toEdit = event.object;

			toEdit.text = event.name;
			toEdit.alias = event.name;

			//Check if there are any shortcuts and make sure they are renamed
			var i = this.children.length;
			while ( i-- )
				if ( this.children[i] instanceof BehaviourShortcut && ( <BehaviourShortcut>this.children[i] ).originalNode == toEdit )
				{
					( <BehaviourShortcut>this.children[i] ).text = event.name;
					( <BehaviourShortcut>this.children[i] ).alias = event.name;
				}
		}

		/**
		* Catch the key down events.
		* @param {any} e The jQuery event object
		*/
		onKeyDown( e: any )
		{
			if ( this.element.is( ':visible' ) == false )
				return;

			if ( jQuery( e.target ).is( "input" ) )
				return;

			var focusObj = Application.getInstance().focusObj;

			if ( Application.getInstance().focusObj != null )
			{
				//If F2 pressed
				if ( e.keyCode == 113 )
				{
					if ( focusObj instanceof BehaviourComment )
					{
						( <BehaviourComment>focusObj ).enterText();
						return;
					}
					else if ( focusObj instanceof BehaviourPortal )
						return;
					else if ( Application.getInstance().focusObj instanceof Behaviour )
					{
						RenameForm.getSingleton().addEventListener( RenameFormEvents.OBJECT_RENAMED, this.onBehaviourRename, this );
						RenameForm.getSingleton().showForm( Application.getInstance().focusObj, Application.getInstance().focusObj.element.text() );
						return;
					}
				}
				//If C
				else if ( e.keyCode == 67 )
				{
					if ( e.ctrlKey )
						return;

					//If a shortcut go to the original
					if ( focusObj instanceof BehaviourShortcut )
					{
						this.selectItem( null );
						( <BehaviourShortcut>focusObj ).selected = false;
						this.selectItem( ( <BehaviourShortcut>focusObj ).originalNode );
						this.element.parent().scrollTo( '#' + ( <BehaviourShortcut>focusObj ).originalNode.id, 500 );
						return;
					}
				}
				//If delete pressed
				else if ( e.keyCode == 46 )
				{
					//Remove all selected
					Toolbar.getSingleton().deleteBut.element.trigger( "click" );
				}
			}
		}


		/**
		* When we double click the canvas we show the behaviour picker. 
		* @param {any} e The jQuery event object
		*/
		onDoubleClick( e: any )
		{
			if ( jQuery( e.target ).is( "textarea" ) )
				return;

			var comp = jQuery( e.target ).data( "component" );

			//If a comment edit it
			if ( comp instanceof BehaviourComment )
			{
				comp.enterText();
				return;
			}
			//If an instance, then open it
			else if ( comp instanceof BehaviourInstance )
			{
				var tree: TreeViewScene = TreeViewScene.getSingleton();
				var node: TreeNode = tree.findNode( "behaviour", comp._behaviourContainer );
				tree.selectNode( node );
				( <TreeViewScene>tree ).onDblClick( null );
				return;
			}
			//If an script node, then open it
			else if ( comp instanceof BehaviourScript )
			{
				comp.edit();
				return;
			}

			var p: JQuery = this.parent.element;

			var offset = this.element.offset();
			var scrollX = p.scrollLeft();
			var scrollY = p.scrollTop();

			var mouse = { x: e.pageX - offset.left - scrollX, y: e.pageY - offset.top - scrollY };

			this.mX = mouse.x + scrollX;
			this.mY = mouse.y + scrollY;
			BehaviourPicker.getSingleton().show( Application.getInstance(), e.pageX, e.pageY, false, true );
			e.preventDefault();
		}

		/**
		* This is called to set the selected canvas item.
		* @param {Component} comp The component to select
		*/
		selectItem( comp: Component )
		{
			if ( comp == null )
			{
				//Remove all glows
				var children = this.children;

				for ( var i = 0, l = children.length; i < l; i++ )
				{
					children[i].element.removeClass( "green-glow-strong" );
					if ( children[i].selected )
						children[i].selected = false;
				}

				//Set the selected item
				Canvas.lastSelectedItem = null;
				PropertyGrid.getSingleton().editableObject( null, "", null, "" );
				Toolbar.getSingleton().itemSelected( null );
				return;
			}

			if ( comp.selected )
			{
				comp.element.removeClass( "green-glow-strong" );
				comp.selected = false;
				Canvas.lastSelectedItem = null;
				PropertyGrid.getSingleton().editableObject( null, "", null, "" );
				Toolbar.getSingleton().itemSelected( null );
				return;
			}

			comp.selected = true;

			//Set the selected item
			Canvas.lastSelectedItem = comp;

			if ( comp instanceof Behaviour )
			{
				comp.element.removeClass( "scale-in-animation" );

				var toEdit: EditableSet = new EditableSet();

				//Hand the item to the editor
				if ( comp instanceof BehaviourComment )
				{
					toEdit.addVar( "text", ( <BehaviourComment>comp ).text, ParameterType.STRING, null, null )
					PropertyGrid.getSingleton().editableObject( toEdit, "Comment", comp, "" );
				}
				else if ( comp instanceof BehaviourShortcut == false )
				{
					var len = ( <BehaviourShortcut>comp ).parameters.length;
					for ( var i = 0; i < len; i++ )
						if ( ( <BehaviourShortcut>comp ).parameters[i].links.length <= 0 )
							toEdit.addVar( ( <BehaviourShortcut>comp ).parameters[i].name, ( <BehaviourShortcut>comp ).parameters[i].value, ( <BehaviourShortcut>comp ).parameters[i].dataType, ( <BehaviourShortcut>comp ).element.text(), null );

					PropertyGrid.getSingleton().editableObject( toEdit, ( <BehaviourShortcut>comp ).text + " - " + comp.id, comp, "" );
				}

				//Highlight all shortcuts
				var children = this.children;
				var i = children.length;
				while ( i-- )
					if ( typeof ( children[i] ) !== "undefined" )
						if ( children[i] instanceof BehaviourShortcut && ( <BehaviourShortcut>children[i] ).originalNode == comp )
							children[i].element.addClass( "green-glow-strong" );
						else
							children[i].element.removeClass( "green-glow-strong" );
			}
			else if ( comp instanceof Link && ( <Link>comp ).startPortal.type == PortalType.OUTPUT )
			{
				var toEdit: EditableSet = new EditableSet();
				toEdit.addVar( "Frame delay", ( <Link>comp ).frameDelay, ParameterType.NUMBER, "Link Properties", null );
				PropertyGrid.getSingleton().editableObject( toEdit, "Link - " + ( <Link>comp ).id, comp, "" );
			}

			Toolbar.getSingleton().itemSelected( comp );
		}

		/**
		* Called when we click down on the canvas
		* @param {any} e The jQuery event object
		*/
		onMouseDown( e: any )
		{
			// Stops the text select when we drag
			e.preventDefault();


			// If we click the canvas - it counts as a deselect
			var comp = jQuery( e.currentTarget ).data( "component" );
			if ( comp instanceof Canvas && !e.ctrlKey )
			{
				this.selectItem( null );
				return;
			}
		}

		/**
		* Called when we click up on the canvas
		* @param {any} e The jQuery event object
		*/
		onMouseUp( e: any )
		{
			//if ( e.which != 1 )
			//	return;
			var comp = jQuery( e.currentTarget ).data( "component" );

			//Unselect all other items
			if ( !e.ctrlKey )
				for ( var i = 0; i < this.children.length; i++ )
					this.children[i].selected = false;

			if ( comp instanceof Behaviour )
			{
				comp.element.removeClass( "scale-in-animation" );
				this.selectItem( comp );
				return;
			}

			//Not a behaviour so lets see if its a link	
			//Make sure we actually hit a link
			var len = this.children.length;
			for ( var i = 0; i < len; i++ )
			{
				comp = this.children[i];
				if ( comp instanceof Link )
				{
					var hit = comp.hitTestPoint( e );
					if ( hit )
					{
						this.selectItem( comp );
						return;
					}
				}
			}
		}


		/**
		* This is called externally when the canvas has been selected. We use this
		* function to remove any animated elements
		*/
		onSelected()
		{
			var len = this.children.length;
			for ( var i = 0; i < len; i++ )
				this.children[i].element.removeClass( "scale-in-animation" );
		}

		/**
		* Use this function to add a child to this component. This has the same effect of adding some HTML as a child of another piece of HTML.
		* It uses the jQuery append function to achieve this functionality.
		* @param {any} child The child to add. Valid parameters are valid HTML code or other Components.
		* @returns {Component} The child as a Component.
		*/
		addChild( child ): Component
		{
			//call super
			var toRet: Component = Component.prototype.addChild.call( this, child );

			//if ( toRet )
			//	DragManager.getSingleton().setDraggable( toRet, true, this, null );

			if ( toRet instanceof Behaviour )
				toRet.element.draggable( { drag: this._proxyMoving, start: this._proxyStartDrag, stop: this._proxyStopDrag, cancel: ".portal", scroll: true, scrollSensitivity: 10 });

			toRet.element.on( "mouseup", this.mUpProxy );

			return toRet;
		}

		/**
		* Use this function to remove a child from this component. It uses the jQuery detach function to achieve this functionality.
		* @param {Component} child The child to remove. Valid parameters are valid Components.
		* @returns {Component} The child as a Component.
		*/
		removeChild( child ): Component
		{
			//call super
			var toRet: Component = Component.prototype.removeChild.call( this, child );

			if ( toRet )
				toRet.element.off( "mouseup", this.mUpProxy );

			return toRet;
		}



		/**
		* Called when an item is moving
		*/
		onChildMoving( e, ui )
		{
			//var canvasParent : JQuery = this.element;
			var target: Component = jQuery( e.target ).data( "component" );

			//Upadte the links
			var i = ( <Behaviour>target ).portals.length;
			while ( i-- )
				( <Behaviour>target ).portals[i].updateAllLinks();

			this.checkDimensions();
		}

		/**
		* This function is called when animate is reading in saved data from the server.
		* @param {any} data 
		*/
		open( data: any )
		{

		}


		/**
		* This function is called when animate is writing data to the database.
		* @param {any} items The items we need to build
		* @returns {CanvasToken}
		*/
		buildDataObject( items: Array<IComponent> = null ): CanvasToken
		{
			var data: CanvasToken = new CanvasToken( this.behaviourContainer.shallowId );
			data.name = this._behaviourContainer.name;
			data.properties = this._behaviourContainer.properties.tokenize();

			if ( items == null )
				items = this.children;

			//Let the plugins save their data			
			PluginManager.getSingleton().dispatchEvent( new ContainerDataEvent( EditorEvents.CONTAINER_SAVING, this._behaviourContainer, data.plugins, this._containerReferences ) );


			//Create a multidimension array and pass each of the project dependencies
			var len = items.length;
			for ( var i = 0; i < len; i++ )
			{
				//First export all the standard item data
				data.items[i] = new CanvasTokenItem();
				data.items[i].id = items[i].id;
				data.items[i].type = ( <any>items[i] ).constructor.name;
				data.items[i].left = items[i].element.css( "left" );
				data.items[i].top = items[i].element.css( "top" );
				data.items[i].zIndex = items[i].element.css( "z-index" );
				data.items[i].position = items[i].element.css( "position" );

				//Now do all portals if its a behaviour
				if ( items[i] instanceof Behaviour )
				{
					if ( items[i] instanceof BehaviourComment )
						data.items[i].text = ( <BehaviourComment>items[i] ).text;
					else
					{
						data.items[i].name = ( <Behaviour>items[i] ).originalName;
						data.items[i].alias = ( ( <Behaviour>items[i] ).alias ? ( <Behaviour>items[i] ).alias : "" );
					}

					if ( items[i] instanceof BehaviourAsset )
						data.items[i].assetID = ( ( <BehaviourAsset>items[i] ).asset ? ( <BehaviourAsset>items[i] ).asset.shallowId : 0 );
					else if ( items[i] instanceof BehaviourScript )
					{
						//First initialize the script node to make sure we have a DB entry
						( <BehaviourScript>items[i] ).initializeDB();
						if ( ( <BehaviourScript>items[i] ).shallowId === 0 ) continue;
						data.items[i].shallowId = ( <BehaviourScript>items[i] ).shallowId;
					}
					else if ( items[i] instanceof BehaviourShortcut )
					{
						data.items[i].behaviourID = ( ( <BehaviourShortcut>items[i] ).originalNode ? ( <BehaviourShortcut>items[i] ).originalNode.id : "" );
					}
					else if ( items[i] instanceof BehaviourInstance )
						data.items[i].containerId = ( ( <BehaviourInstance>items[i] ).behaviourContainer ? ( <BehaviourInstance>items[i] ).behaviourContainer.shallowId : 0 );

					if ( items[i] instanceof BehaviourPortal )
					{
						data.items[i].portalType = ( <BehaviourPortal>items[i] ).portaltype;
						data.items[i].dataType = ( <BehaviourPortal>items[i] ).dataType;
						data.items[i].value = ( <BehaviourPortal>items[i] ).value;
					}
					else
					{
						data.items[i].portals = new Array();
						var portalsArr: Array<CanvasTokenPortal> = data.items[i].portals;

						var len2 = ( <Behaviour>items[i] ).portals.length;
						for ( var ii = 0; ii < len2; ii++ )
						{
							portalsArr[ii] = new CanvasTokenPortal();

							portalsArr[ii].name = ( <Behaviour>items[i] ).portals[ii].name;
							portalsArr[ii].value = ( <Behaviour>items[i] ).portals[ii].value;
							portalsArr[ii].type = ( <Behaviour>items[i] ).portals[ii].type;
							portalsArr[ii].dataType = ( <Behaviour>items[i] ).portals[ii].dataType;
							portalsArr[ii].customPortal = ( <Behaviour>items[i] ).portals[ii].customPortal;
						}
					}

				}
				//If its a link we store a few more bits of information.
				else if ( items[i] instanceof Link )
				{
					var sbehaviour: Behaviour = <Behaviour>( <Link>items[i] ).startPortal.parent;
					var ebehaviour: Behaviour = <Behaviour>( <Link>items[i] ).endPortal.parent;

					data.items[i].frameDelay = ( <Link>items[i] ).frameDelay;
					data.items[i].startPortal = ( <Link>items[i] ).startPortal.name;
					data.items[i].endPortal = ( <Link>items[i] ).endPortal.name;
					data.items[i].startBehaviour = sbehaviour.id;
					data.items[i].endBehaviour = ebehaviour.id;

					//Create additional data for shortcuts
					data.items[i].targetStartBehaviour = ( sbehaviour instanceof BehaviourShortcut ? ( <BehaviourShortcut>sbehaviour ).originalNode.id : sbehaviour.id );
					data.items[i].targetEndBehaviour = ( ebehaviour instanceof BehaviourShortcut ? ( <BehaviourShortcut>ebehaviour ).originalNode.id : ebehaviour.id );
				}
			}

			return data;
		}

		/**
		* This function is called when a behaviour is double clicked, 
		* a canvas is created and we try and load the behavious contents.
		* @param {CanvasToken} dataToken You can optionally pass in an data token object. These objects must contain information on each of the items we are adding to the canvas.
		* @param {boolean} clearItems If this is set to true the function will clear all items already on the Canvas.
		* @returns {any} 
		*/
		openFromDataObject( dataToken?: CanvasToken, clearItems: boolean = true, addSceneAssets: boolean = false )
		{
			//Create the data object from the JSON
			var jsonObj: CanvasToken = null;
			var pManager: PluginManager = PluginManager.getSingleton();


			if ( dataToken )
				jsonObj = dataToken;
			else if ( this._behaviourContainer.json !== null )
				jsonObj = this._behaviourContainer.json;

			//Cleanup the 
			if ( clearItems )
				while ( this.children.length > 0 )
					this.children[0].dispose();

			var links = [];
			var shortcuts: Array<ShortCutHelper> = [];

			if ( jsonObj && jsonObj.items )
			{
				for ( var i in jsonObj.items )
				{
					var item: Component = null;

					//Create the GUI element
					if ( jsonObj.items[i].type == "BehaviourPortal" )
					{
						//Check if there is already a portal with that name. if it does then it
						//is ignored.
						var nameInUse = false;
						var len = this.children.length;
						for ( var ii = 0; ii < len; ii++ )
							if ( this.children[ii] instanceof BehaviourPortal &&
								this.children[ii].element.text() == jsonObj.items[i].name )
							{
								nameInUse = true;
								Logger.getSingleton().logMessage(
									"A portal with the name '" + jsonObj.items[i].name +
									"' already exists on the Canvas.", null, LogType.ERROR );
								break;
							}

						if ( nameInUse == false )
						{
							item = new BehaviourPortal( this, jsonObj.items[i].name,
								jsonObj.items[i].portalType,
								jsonObj.items[i].dataType,
								jsonObj.items[i].value
								);

							( <BehaviourPortal>item ).requiresUpdated = true;
						}
					}
					else if ( jsonObj.items[i].type == "BehaviourAsset" )
						item = new BehaviourAsset( this, jsonObj.items[i].name );
					else if ( jsonObj.items[i].type == "BehaviourScript" )
						item = new BehaviourScript( this, jsonObj.items[i].shallowId, jsonObj.items[i].name, !clearItems );
					else if ( jsonObj.items[i].type == "BehaviourInstance" )
					{
						var project = User.getSingleton().project;
						var container = project.getBehaviourByShallowId( jsonObj.items[i].containerId );
						if ( !container )
							continue;

						item = new BehaviourInstance( this, container, false );
					}
					else if ( jsonObj.items[i].type == "BehaviourShortcut" )
					{
						item = new BehaviourShortcut( this, null, jsonObj.items[i].name );
						shortcuts.push( new ShortCutHelper( <BehaviourShortcut>item, jsonObj.items[i] ) );
					}
					else if ( jsonObj.items[i].type == "BehaviourComment" )
						item = new BehaviourComment( this, jsonObj.items[i].text );
					else if ( jsonObj.items[i].type == "Behaviour" )
						item = new Behaviour( this, jsonObj.items[i].name );
					else if ( jsonObj.items[i].type == "Link" )
					{
						var l: Link = new Link( this );
						item = l;
						//Links we treat differerntly. They need all the behaviours 
						//loaded first. So we do that, and keep each link in an array
						//to load after the behaviours
						links.push( l );
						l.frameDelay = ( jsonObj.items[i].frameDelay !== undefined ? jsonObj.items[i].frameDelay : 1 );

						//Store some temp data on the tag
						l.tag = {};
						l.tag.startPortalName = jsonObj.items[i].startPortal;
						l.tag.endPortalName = jsonObj.items[i].endPortal;
						l.tag.startBehaviourID = jsonObj.items[i].startBehaviour;
						l.tag.endBehaviourID = jsonObj.items[i].endBehaviour;
						l.tag.startBehaviour = null;
						l.tag.endBehaviour = null;
					}



					//Check if it was created ok
					if ( item != null )
					{
						item.savedID = jsonObj.items[i].id;

						//Set the positioning etc...
						item.element.css( {
							"left": jsonObj.items[i].left,
							"top": jsonObj.items[i].top,
							"z-index": jsonObj.items[i].zIndex,
							"position": jsonObj.items[i].position
						});

						//Add the portals if they exist
						if ( jsonObj.items[i].portals )
						{
							for ( var iii = 0; iii < jsonObj.items[i].portals.length; iii++ )
							{
								var portal = ( <Behaviour>item ).addPortal( jsonObj.items[i].portals[iii].type,
									jsonObj.items[i].portals[iii].name,
									jsonObj.items[i].portals[iii].value,
									jsonObj.items[i].portals[iii].dataType, false
									);

								portal.customPortal = jsonObj.items[i].portals[iii].customPortal;
								if ( portal.customPortal === undefined || portal.customPortal == null )
									portal.customPortal = false;
							}

							//Set the alias text if it exists
							if ( jsonObj.items[i].alias && jsonObj.items[i].alias != "" && jsonObj.items[i].alias != null )
							{
								( <Behaviour>item ).text = jsonObj.items[i].alias;
								( <Behaviour>item ).alias = jsonObj.items[i].alias;
							}
						}

						if ( item instanceof Behaviour )
							( <Behaviour>item ).updateDimensions();
					}
				}
			}

			//Link any shortcut nodes
			for ( var li = 0, lil = this.children.length; li < lil; li++ )
			{
				for ( var ii = 0, lii = shortcuts.length; ii < lii; ii++ )
					if ( this.children[li].savedID == shortcuts[ii].datum.behaviourID )
					{
						shortcuts[ii].item.setOriginalNode( <Behaviour>this.children[li], false );
					}
			}

			//Now do each of the links
			for ( var li = 0, llen = links.length; li < llen; li++ )
			{
				var link: Link = links[li];
				//We need to find the nodes first
				var len = this.children.length;
				for ( var ii = 0; ii < len; ii++ )
				{
					if ( link.tag.startBehaviourID == ( <Behaviour>this.children[ii] ).savedID )
					{
						var behaviour: Behaviour = ( <Behaviour>this.children[ii] );
						link.tag.startBehaviour = behaviour;

						//Now that the nodes have been set - we have to set the portals
						for ( var iii = 0; iii < behaviour.portals.length; iii++ )
						{
							var portal: Portal = behaviour.portals[iii];
							if ( link.tag.startPortalName == portal.name )
							{
								link.startPortal = portal;
								link.tag.startBehaviour = null;
								portal.addLink( link );

								break;
							}
						}
					}


					if ( link.tag.endBehaviourID == this.children[ii].savedID )
					{
						var behaviour: Behaviour = ( <Behaviour>this.children[ii] );
						link.tag.endBehaviour = behaviour;

						//Now that the nodes have been set - we have to set the portals
						for ( var iii = 0; iii < behaviour.portals.length; iii++ )
						{
							var portal = behaviour.portals[iii];
							if ( link.tag.endPortalName == portal.name )
							{
								link.endPortal = portal;
								link.tag.endBehaviour = null;
								portal.addLink( link );
								break;
							}
						}
					}
				}

				if ( link.startPortal == null )
					link.dispose();
				else
				{
					if ( !link.endPortal || !link.startPortal || typeof link.startPortal == "string" || typeof link.endPortal == "string" || !link.endPortal.behaviour || !link.startPortal.behaviour )
					{
						link.dispose();
					}
					else
					{
						link.updatePoints();
						link.element.css( "pointer-events", "" );
					}
				}

				//Clear the temp tag
				link.tag = null;
			}

			for ( var c = 0, cl = this.children.length; c < cl; c++ )
				this.children[c].savedID = null;

			//Let the plugins open their data
			if ( jsonObj && jsonObj.plugins )				
				pManager.dispatchEvent( new ContainerDataEvent( EditorEvents.CONTAINER_OPENING, this._behaviourContainer, jsonObj.plugins ) );

			this.checkDimensions();
			this.buildSceneReferences();
		}

		/**
		* This function is called to make sure the canvas min width and min height variables are set
		*/
		checkDimensions()
		{
			//Make sure that the canvas is sized correctly
			var w = 0;
			var h = 0;
			var i = this.children.length;
			var child: Component = null;
			while ( i-- )
			{
				child = <Component>this.children[i];

				var w2 = child.element.css( "left" );
				var w2a = w2.split( "px" );
				var w2n = parseFloat( w2a[0] ) + child.element.width() + 5;

				var h2 = child.element.css( "top" );
				var h2a = h2.split( "px" );
				var h2n = parseFloat( h2a[0] ) + child.element.height() + 5;

				if ( w2n > w )
					w = w2n;
				if ( h2n > h )
					h = h2n;
			}

			var minW = this.element.css( "min-width" );
			var minT = minW.split( "px" );
			var minWi = parseFloat( minT[0] );

			var minH = this.element.css( "min-height" );
			var minHT = minH.split( "px" );
			var minHi = parseFloat( minHT[0] );

			this.element.css( {
				"min-width": ( w > minWi ? w : minWi ).toString() + "px",
				"min-height": ( h > minHi ? h : minHi ).toString() + "px"
			});
		}


		

		get behaviourContainer(): BehaviourContainer { return this._behaviourContainer; }
		get containerReferences(): { groups: Array<string>; assets: Array<number> } { return this._containerReferences; }
	}
}