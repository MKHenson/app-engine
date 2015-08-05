module Animate
{
	export class CanvasTabType extends ENUM
	{
		constructor(v: string) { super(v); }

		static CANVAS: CanvasTabType = new CanvasTabType("canvas");
		static HTML: CanvasTabType = new CanvasTabType("html");
		static CSS: CanvasTabType = new CanvasTabType("css");
		static SCRIPT: CanvasTabType = new CanvasTabType("script");
		static BLANK: CanvasTabType = new CanvasTabType("blank");
	}

	/**
	* This is an implementation of the tab class that deals with the canvas
	*/
	export class CanvasTab extends Tab
	{
		private static _singleton: CanvasTab;

		private _currentCanvas: Canvas;
		private welcomeTab: TabPair;
		private closingTabPair: TabPair;
		private mDocker: Docker;

		constructor( parent : Component )
		{
			super( parent );

			if ( CanvasTab._singleton != null )
				throw new Error( "The CanvasTab class is a singleton. You need to call the CanvasTab.getSingleton() function." );

			CanvasTab._singleton = this;

			this.element.css( { width: "100%", height: "100%" });

			this._currentCanvas = null;

			this.welcomeTab = null;
			this.closingTabPair = null;
			this.mDocker = null;

			//Add the main tab
			BehaviourManager.getSingleton().addEventListener( BehaviourManagerEvents.CONTAINER_SAVED, this.removeTabConfirmed, this );
		}

		/**
		* This is called by a controlling ScreenManager class. An image string needs to be returned
		* which will act as a preview of the component that is being viewed or hidden.
		* @return {string}
		*/
		getPreviewImage() : string
		{
			return "media/canvas.png";
		}

		/**
		* Each IDock item needs to implement this so that we can keep track of where it moves.
		* @returns {Docker}
		*/
		getDocker() : Docker { return this.mDocker; }

		/**
		* Each IDock item needs to implement this so that we can keep track of where it moves.
		* @param {Docker} val 
		*/
		setDocker( val : Docker ) { this.mDocker = val; }

		/**
		* This is called by a controlling Docker class when the component needs to be shown.
		*/
		onShow() : void { }

		/**
		* Called when sall all is returned from the DB
		*/
		saveAll()
		{
			var i : number = this.tabs.length;
			while ( i-- )
				this.tabs[i].onSaveAll();
		}

		/**
		* This is called by a controlling Docker class when the component needs to be hidden.
		*/
		onHide(): void { }

		/**
		* Called just before a tab is closed. If you return false it will cancel the operation.
		* @param {TabPair} tabPair An object that contains both the page and label of the tab
		* @returns {boolean} Returns false if the tab needs to be saved. Otherwise true.
		*/
		onTabPairClosing( tabPair : TabPair ) :boolean
		{
			var canvas : Canvas = <Canvas>tabPair.page.children[0];
			if ( canvas instanceof Canvas )
			{
				var node: TreeNodeBehaviour = <TreeNodeBehaviour>TreeViewScene.getSingleton().sceneNode.findNode( "behaviour", canvas.behaviourContainer );

				//Set the context node to be this node
				TreeViewScene.getSingleton().contextNode = node;

				if ( node && node.saved == false && !canvas.behaviourContainer.disposed )
				{
					this.closingTabPair = tabPair;
					MessageBox.show( "Do you want to save this node before you close it?", ["Yes", "No"], this.onMessage, this );
					return false;
				}
				else
				{
					//We tell the plugins we've selected a behaviour container
					//PluginManager.getSingleton().containerSelected( null );
					PluginManager.getSingleton().dispatchEvent( new ContainerEvent( EditorEvents.CONTAINER_SELECTED, null ) );
				}
			}

			return true;
		}

		/**
		*  The response of the message box.
		* @param {string} choice The choice of the message box. It can be either Yes or No
		*/
		onMessage( choice : string )
		{
			var canvas: Canvas = ( <CanvasTabPair>this.closingTabPair ).canvas;

			//Save the canvas
			if ( choice == "Yes" )
			{
				//We need to build an array of the canvas objects we are trying to save.
				var saveDataObj: CanvasToken = canvas.buildDataObject();

				//Now get the project to save it.
				User.getSingleton().project.addEventListener( ProjectEvents.BEHAVIOUR_SAVED, this.onBehaviourSaved, this );
				User.getSingleton().project.saveBehaviours( [canvas.behaviourContainer.id] );
			}
			else
			{
				var node : TreeNodeBehaviour = <TreeNodeBehaviour>TreeViewScene.getSingleton().sceneNode.findNode( "behaviour", canvas.behaviourContainer );
				node.save( true );
				this.removeTab( this.closingTabPair, true );
				this.closingTabPair = null;

			}
		}

		/**
		* We use this function to remove any assets from the tabs
		* @param {Asset} asset The asset we are removing
		*/
		removeAsset( asset : Asset )
		{
			var i = this.tabs.length;
			while ( i-- )
				if ( this.tabs[i].page.children.length > 0 )
				{
					var canvas: Canvas = <Canvas>this.tabs[i].page.children[0];
					if ( canvas instanceof Canvas )
						canvas.removeAsset(asset);
				}
		}

		/**
		* When the behaviour was saved on request of the message box - we close the tab that represents it.
		* @param <string> response 
		* @param <object> behaviour 
		*/
		onBehaviourSaved( response : ProjectEvents, event: ProjectEvent, sender? : EventDispatcher )
		{
			User.getSingleton().project.removeEventListener( ProjectEvents.BEHAVIOUR_SAVED, this.onBehaviourSaved, this );
			if ( response == ProjectEvents.BEHAVIOUR_SAVED )
			{
				var canvas : Canvas = (<CanvasTabPair>this.closingTabPair).canvas;
				if ( canvas.behaviourContainer == event.tag )
				{
					var node: TreeNodeBehaviour = <TreeNodeBehaviour>TreeViewScene.getSingleton().sceneNode.findNode( "behaviour", canvas.behaviourContainer );
					if ( node )
						node.save( true );

					this.removeTab( this.closingTabPair, true );
					this.closingTabPair = null;
				}
			}
		}

		/**
		* You can use this function to fetch a tab's canvas by a behaviour local ID
		* @param {number} behaviourID The local id of the container
		* @returns {Canvas} The returned tab's canvas or null
		*/
		getTabCanvas( behaviourID : string ) : Canvas
		{
			var tabs : Array<TabPair> = this.tabs;
			for ( var i = 0, l = tabs.length; i < l; i++ )
				if ( tabs[i].page.children.length > 0 && tabs[i].page.children[0] instanceof Canvas && ( <Canvas>tabs[i].page.children[0]).behaviourContainer.id == behaviourID )
				{
					var canvas: Canvas = <Canvas>tabs[i].page.children[0];
					return canvas;
				}
			

			return null;
		}

		/**
		* When we click the tab
		* @param {TabPair} tab The tab pair object which contains both the label and page components
		*/
		onTabSelected( tab : TabPair )
		{
			var pManager: PluginManager = PluginManager.getSingleton();
			var project = User.getSingleton().project;

			//Remove prev we need to notify the plugins of added or removed assets
			if ( this._currentCanvas && !this._currentCanvas.disposed )
			{	
				var contEvent: AssetContainerEvent = new AssetContainerEvent( EditorEvents.ASSET_REMOVED_FROM_CONTAINER, null, this._currentCanvas.behaviourContainer );

				//Tell the plugins to remove the current assets
				var references = this._currentCanvas.containerReferences;
				for ( var i = 0, l = references.assets.length; i < l; i++ )
				{
					var asset: Asset = project.getAssetByShallowId( references.assets[i] );
					contEvent.asset = asset;
					pManager.dispatchEvent( contEvent );
				}
			}

			if ( tab.page.children[0] instanceof Canvas )
				this._currentCanvas = <Canvas>tab.page.children[0];
			else
				this._currentCanvas = null;

			if ( this._currentCanvas != null && this._currentCanvas.element.data( "component" ) instanceof Canvas )
			{
				var canvas: Canvas = <Canvas>this._currentCanvas.element.data( "component" );
				canvas.onSelected();

				var node : TreeNode = TreeViewScene.getSingleton().sceneNode.findNode( "behaviour", canvas.behaviourContainer );
				if ( node )
					TreeViewScene.getSingleton().selectNode( node );

				//Now we need to notify the plugins of added assets
				var contEvent: AssetContainerEvent = new AssetContainerEvent( EditorEvents.ASSET_ADDED_TO_CONTAINER, null, this._currentCanvas.behaviourContainer );

				//Tell the plugins to remove the current assets
				var references = canvas.containerReferences;
				for ( var i = 0, l = references.assets.length; i < l; i++ )
				{
					var asset: Asset = project.getAssetByShallowId( references.assets[i] );
					contEvent.asset = asset;
					pManager.dispatchEvent( contEvent );
				}

				//We tell the plugins we've selected a behaviour container
				pManager.dispatchEvent( new ContainerEvent( EditorEvents.CONTAINER_SELECTED, canvas.behaviourContainer ) );
			}
			else
				//We tell the plugins we've selected a behaviour container
				pManager.dispatchEvent( new ContainerEvent( EditorEvents.CONTAINER_SELECTED, null ) );

			Tab.prototype.onTabSelected.call( this, tab );
		}

		/**
		* @type public mfunc projectReady
		* When we start a new project we load the welcome page.
		* @extends <CanvasTab>
		*/
		projectReady()
		{
			var loader = new AnimateLoader();
			loader.addEventListener( LoaderEvents.COMPLETE, this.onNewsLoaded, this );
			loader.addEventListener( LoaderEvents.FAILED, this.onNewsLoaded, this );
			loader.load( "/misc/get-news-tab", {} );
		}

		/**
		* @type public mfunc projectReset
		* Called when the project is reset by either creating a new one or opening an older one.
		* @extends <CanvasTab>
		*/
		projectReset()
		{
			this._currentCanvas = null;
			this.welcomeTab = null;
			this.clear();
		}

		/**
		* @type public mfunc onNewsLoaded
		* When the news has been loaded from webinate.
		*/
		onNewsLoaded( response: LoaderEvents, event : AnimateLoaderEvent, sender? : EventDispatcher )
		{
			if ( response == LoaderEvents.COMPLETE )
			{
				if ( event.return_type == AnimateLoaderResponses.SUCCESS )
				{
					if ( this.welcomeTab )
						this.removeTab( this.welcomeTab.name, true );

					this.welcomeTab = this.addSpecialTab( "Welcome to Animate!", CanvasTabType.BLANK );

					var comp = new Component( event.tag.html, this.welcomeTab.page );
					comp.element.css( { width:"100%", height:"100%" });
					comp.addLayout( new Fill() );
				}
			}
		}

		/**
		* Gets the singleton instance.
		* @param {Component} parent The parent component of this tab
		* @returns {CanvasTab}
		*/
		static getSingleton( parent? : Component ) : CanvasTab
		{
			if ( !CanvasTab._singleton )
				new CanvasTab( parent );

			return CanvasTab._singleton;
		}

		/**
		* Renames a tab and its container
		* @param {string} oldName The old name of the tab
		* @param {string} newName The new name of the tab
		* @returns {TabPair} Returns the tab pair
		*/
		renameTab( oldName :string, newName : string ) : TabPair
		{
			var toRet : TabPair = this.getTab( oldName );
			toRet.tabSelector.element.text( newName );
			(<CanvasTabPair>toRet).canvas.name = newName;
			return toRet;
		}

		
		/**
		* Removes an item from the tab
		* @param val The label text of the tab
		* @param {boolean} dispose Set this to true to clean up the tab
		* @returns {TabPair} The tab pair containing both the label and page <Component>s
		*/
		removeTab( val: string, dispose: boolean ): TabPair
		removeTab( val: TabPair, dispose: boolean ): TabPair
		removeTab( val: any, dispose: boolean ): TabPair
		{
			var canvas: Canvas = null;
			if ( val instanceof CanvasTabPair )
				canvas = ( <CanvasTabPair>val ).canvas;
			//else
				//canvas = this.getTabCanvas( val );

			if ( canvas )
			{
				var pManager: PluginManager = PluginManager.getSingleton();
				var contEvent: AssetContainerEvent = new AssetContainerEvent( EditorEvents.ASSET_REMOVED_FROM_CONTAINER, null, canvas.behaviourContainer );

				//Remove prev we need to notify the plugins of added or removed assets		
				var project = User.getSingleton().project;

				//Tell the plugins to remove the current assets
				var references = canvas.containerReferences;

				for ( var i = 0, l = references.assets.length; i < l; i++ )
				{
					var asset = project.getAssetByShallowId( references.assets[i] );					
					contEvent.asset = asset;
					pManager.dispatchEvent( contEvent );
				}

				canvas.behaviourContainer.canvas = null;
				canvas.removeEventListener(CanvasEvents.MODIFIED, this.onCanvasModified, this );
			}

			return super.removeTab( val, dispose );
		}

		/**
		* When a canvas is modified we change the tab name, canvas name and un-save its tree node.
		*/
		onCanvasModified( response : CanvasEvents, event : CanvasEvent, sender? : EventDispatcher )
		{
			var node: TreeNodeBehaviour = <TreeNodeBehaviour>TreeViewScene.getSingleton().sceneNode.findNode( "behaviour", event.canvas.behaviourContainer );

			if ( node )
				node.save( false );
		}

		/**
		* Removes an item from the tab
		*/
		removeTabConfirmed(response: BehaviourManagerEvents, event: BehaviourManagerEvent ) : void
		{
			//Add the main tab
			if ( event.tag.result == BehaviourManagerEvents.SUCCESS )
			{
				super.removeTab(event.name, true );
			}
		}


		/**
		* Adds an item to the tab
		* @param {string} text The text of the new tab
		* @param {CanvasTabType} type The type of tab to create
		* @param {any} tabContent Data associated with the tab
		* @returns {TabPair} The tab pair object
		*/
		addSpecialTab(text: string, type: CanvasTabType = CanvasTabType.CANVAS, tabContent : any = null ) : TabPair
		{
			var pManager: PluginManager = PluginManager.getSingleton();
			var toRet: TabPair = null;
			if ( type == CanvasTabType.CANVAS )
			{
				toRet = super.addTab( new CanvasTabPair( new Canvas( null, tabContent ), text ), true );
				var canvas: Canvas = (<CanvasTabPair>toRet).canvas;
				tabContent.canvas = canvas;
				toRet.page.addChild( canvas );

				canvas.addEventListener(CanvasEvents.MODIFIED, this.onCanvasModified, this );

				this._currentCanvas = canvas;
				(<Behaviour>canvas.children[0]).updateDimensions();

				//PluginManager.getSingleton().containerCreated( tabContent );
				pManager.dispatchEvent( new ContainerEvent( EditorEvents.CONTAINER_CREATED, tabContent ) );

				//PluginManager.getSingleton().containerSelected( tabContent );
				PluginManager.getSingleton().dispatchEvent( new ContainerEvent( EditorEvents.CONTAINER_SELECTED, tabContent ) );
				return toRet;
			}
			else if ( type == CanvasTabType.BLANK )
			{
				toRet = super.addTab( text, true );
				return toRet;
			}
			else 
			{
				if ( type == CanvasTabType.HTML )
				{
					if ( !HTMLTab.singleton )
						toRet = super.addTab( new HTMLTab( "HTML" ), true );
					else
						toRet = this.selectTab( HTMLTab.singleton );
				}
				else if ( type == CanvasTabType.CSS )
				{
					if ( !CSSTab.singleton )
						toRet = super.addTab( new CSSTab( "CSS" ), true );
					else
						toRet = this.selectTab( CSSTab.singleton );
				}
				else if ( type == CanvasTabType.SCRIPT )
				{
					toRet = Tab.prototype.addTab.call( this, new ScriptTab( tabContent ) );
				}
				return toRet;
			}
		}

		get currentCanvas(): Canvas { return this._currentCanvas; }
	}
}