namespace Animate {
    export class CanvasTabType extends ENUM {
        constructor( v: string ) { super( v ); }

        static CANVAS: CanvasTabType = new CanvasTabType( 'canvas' );
        static HTML: CanvasTabType = new CanvasTabType( 'html' );
        static CSS: CanvasTabType = new CanvasTabType( 'css' );
        static SCRIPT: CanvasTabType = new CanvasTabType( 'script' );
        static BLANK: CanvasTabType = new CanvasTabType( 'blank' );
    }

	/**
	* This is an implementation of the tab class that deals with the canvas
	*/
    export class CanvasTab extends Tab {
        private static _singleton: CanvasTab;

        private _currentCanvas: Canvas;
        private welcomeTab: TabPair;
        private closingTabPair: TabPair;
        //private mDocker: Docker;

        constructor( parent: Component ) {

            //Upgrade to TSX
            super( null )//parent );

            // if ( CanvasTab._singleton !== null )
            // 	throw new Error( 'The CanvasTab class is a singleton. You need to call the CanvasTab.getSingleton() function.' );

            // CanvasTab._singleton = this;

            // this.element.css( { width: '100%', height: '100%' });

            // this._currentCanvas = null;

            // this.welcomeTab = null;
            // this.closingTabPair = null;
            // this.mDocker = null;

            // //Add the main tab
            // //BehaviourManager.getSingleton().on( BehaviourManagerEvents.CONTAINER_SAVED, this.removeTabConfirmed, this );
        }

		/**
		* This is called by a controlling ScreenManager class. An image string needs to be returned
		* which will act as a preview of the component that is being viewed or hidden.
		* @return {string}
		*/
        getPreviewImage(): string {
            return 'media/canvas.png';
        }

        // /**
        // * Each IDock item needs to implement this so that we can keep track of where it moves.
        // * @returns {Docker}
        // */
        // getDocker() : Docker { return this.mDocker; }

        // /**
        // * Each IDock item needs to implement this so that we can keep track of where it moves.
        // * @param {Docker} val
        // */
        // setDocker( val : Docker ) { this.mDocker = val; }

		/**
		* This is called by a controlling Docker class when the component needs to be shown.
		*/
        onShow(): void { }

		/**
		* Called when sall all is returned from the DB
		*/
        saveAll() {
            // TODO: This no longer makes sense in TSX
            //=========================================
            // var i : number = this.tabs.length;
            // while ( i-- )
            // 	this.tabs[i].onSaveAll();
            // =========================================
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
        onTabPairClosing( tabPair: TabPair ): boolean {
            if ( tabPair instanceof CanvasTabPair ) {
                const canvas = tabPair.canvas;
                if ( !tabPair.forceClose && tabPair.modified && !canvas.container.disposed ) {
                    this.closingTabPair = tabPair;

                    ReactWindow.show( MessageBox, {
                        message: 'Do you want to save this node before you close it?',
                        buttons: [ 'Yes', 'No' ],
                        onChange: ( button ) => { this.onMessage( button ) }
                    } as IMessageBoxProps );
                    return false;
                }
                else
                    PluginManager.getSingleton().emit( new ContainerEvent( EventTypes.CONTAINER_SELECTED, null ) );

            }

            return true;
        }

		/**
		* After being asked if we want to save changes to a container
		* @param {string} choice The choice of the message box. It can be either Yes or No
		*/
        onMessage( choice: string ) {
            const canvas: Canvas = ( <CanvasTabPair>this.closingTabPair ).canvas;
            const that = this;

            // Save the canvas
            if ( choice === 'Yes' ) {
                User.get.project.saveResource( canvas.container.entry._id, ResourceType.CONTAINER ).then( function () {
                    // TODO: Commented out due to update to TSX
                    // that.removeTab(this.closingTabPair, true);
                    that.closingTabPair = null;

                }).catch( function ( err: Error ) {
                    LoggerStore.error( err.message );
                });

                //Now get the project to save it.
                //User.get.project.on( ProjectEvents.BEHAVIOUR_SAVED, this.onBehaviourSaved, this );
                //            User.get.project.saveBehaviours([canvas.container.entry._id] );
            }
            else {
                ( <CanvasTabPair>that.closingTabPair ).forceClose = true;
                //that._currentCanvas.container.saved = true;

                // TODO: Commented out due to update to TSX
                // that.removeTab(that.closingTabPair, true );
                that.closingTabPair = null;
            }
        }

		/**
		* We use this function to remove any assets from the tabs
		* @param {Resources.Asset} asset The asset we are removing
		*/
        removeAsset( asset: Resources.Asset ) {

            // TODO: This no longer makes sense in TSX
            //=========================================

            // var i = this.tabs.length;
            // while ( i-- )
            // 	if ( this.tabs[i].page.children.length > 0 ) {
            //         var canvas: Canvas = <Canvas><Component>this.tabs[i].page.children[0];
            // 		if ( canvas instanceof Canvas )
            // 			canvas.removeAsset(asset);
            // 	}

            // =======================================
        }

        ///**
        //* When the behaviour was saved on request of the message box - we close the tab that represents it.
        //* @param <string> response
        //* @param <object> behaviour
        //*/
        //onBehaviourSaved( response : ProjectEvents, event: ProjectEvent, sender? : EventDispatcher )
        //{
        //	User.get.project.off( ProjectEvents.BEHAVIOUR_SAVED, this.onBehaviourSaved, this );
        //	if ( response === ProjectEvents.BEHAVIOUR_SAVED )
        //	{
        //		var canvas : Canvas = (<CanvasTabPair>this.closingTabPair).canvas;
        //		if ( canvas.container === event.tag )
        //		{
        //			var node: TreeNodeBehaviour = <TreeNodeBehaviour>TreeViewScene.getSingleton().sceneNode.findNode( 'behaviour', canvas.container );
        //                  if (node)
        //                  {
        //                      this._currentCanvas.container.saved = true;
        //                      node.modified = false;
        //                  }

        //			this.removeTab( this.closingTabPair, true );
        //			this.closingTabPair = null;
        //		}
        //	}
        //}

		/**
		* You can use this function to fetch a tab's canvas by a behaviour local ID
		* @param {number} behaviourID The local id of the container
		* @returns {Canvas} The returned tab's canvas or null
		*/
        getTabCanvas( behaviourID: string ): Canvas {

            // TODO: This no longer makes sense in TSX
            //=========================================

            // var tabs : Array<TabPair> = this.tabs;
            // for (var i = 0, l = tabs.length; i < l; i++) {
            //     var t = tabs[i];
            //     if (t instanceof CanvasTabPair)
            //         if (t.canvas.container.entry._id === behaviourID)
            //             return t.canvas;
            // }

            // ==================================

            return null;
        }

		/**
		 * When we select a tab
		 * @param {number} index The index of the selected tab
		 * @param {ITabPaneProps} props props of the selected tab
		 */
        onTabSelected( index: number, props: ITabPaneProps ) {

            // TODO: Needs refactoring from TSX upgrade

            // var pManager: PluginManager = PluginManager.getSingleton();
            // var project = User.get.project;

            // //Remove prev we need to notify the plugins of added or removed assets
            // if ( this._currentCanvas && !this._currentCanvas.disposed )	{
            // 	var contEvent: AssetContainerEvent = new AssetContainerEvent( EditorEvents.ASSET_REMOVED_FROM_CONTAINER, null, this._currentCanvas.container );

            // 	//Tell the plugins to remove the current assets
            // 	var references = this._currentCanvas.containerReferences;
            // 	for ( var i = 0, l = references.assets.length; i < l; i++ ) {
            //         var asset: Asset = project.getResourceByShallowID<Asset>(references.assets[i], ResourceType.ASSET);
            // 		contEvent.asset = asset;
            // 		pManager.emit( contEvent );
            // 	}
            // }

            // if (tab.page.children[0] instanceof Canvas)
            //     this._currentCanvas = <Canvas><Component>tab.page.children[0];
            // else
            // 	this._currentCanvas = null;

            // if ( this._currentCanvas !== null && this._currentCanvas.element.data( 'component' ) instanceof Canvas ) {
            // 	var canvas: Canvas = <Canvas>this._currentCanvas.element.data( 'component' );
            // 	canvas.onSelected();

            // 	var node : TreeNode = TreeViewScene.getSingleton().sceneNode.findNode( 'resource', canvas.container );
            // 	if ( node )
            // 		TreeViewScene.getSingleton().selectNode( node );

            // 	// Now we need to notify the plugins of added assets
            // 	var contEvent: AssetContainerEvent = new AssetContainerEvent( EditorEvents.ASSET_ADDED_TO_CONTAINER, null, this._currentCanvas.container );

            // 	// Tell the plugins to remove the current assets
            // 	var references = canvas.containerReferences;
            // 	for ( var i = 0, l = references.assets.length; i < l; i++ ) {
            //         var asset: Asset = project.getResourceByShallowID<Asset>(references.assets[i], ResourceType.ASSET);
            // 		contEvent.asset = asset;
            // 		pManager.emit( contEvent );
            // 	}

            // 	// We tell the plugins we've selected a behaviour container
            //     pManager.emit(new ContainerEvent(EventTypes.CONTAINER_SELECTED, canvas.container ) );
            // }
            // else
            // 	// We tell the plugins we've selected a behaviour container
            //     pManager.emit(new ContainerEvent(EventTypes.CONTAINER_SELECTED, null ) );

            // Tab.prototype.onTabSelected.call( this, tab );

            super.onTabSelected( index, props );
        }

		/**
		* When we start a new project we load the welcome page.
        * @param {Project} project
		*/
        projectReady( project: Project ) {
            const loader = new AnimateLoader();
            loader.on( LoaderEvents.COMPLETE, this.onNewsLoaded, this );
            loader.on( LoaderEvents.FAILED, this.onNewsLoaded, this );
            loader.load( '/misc/get-news-tab', {});
        }

		/**
		* Called when the project is reset by either creating a new one or opening an older one.
		*/
        projectReset() {
            this._currentCanvas = null;
            this.welcomeTab = null;
            this.clear();
        }

		/**
		* When the news has been loaded from webinate.
		*/
        onNewsLoaded( response: LoaderEvents, event: AnimateLoaderEvent, sender?: EventDispatcher ) {
            if ( response === LoaderEvents.COMPLETE ) {
                if ( event.return_type === AnimateLoaderResponses.SUCCESS ) {

                    // TODO: Commented out due to update to TSX
                    // if ( this.welcomeTab )
                    // 	this.removeTab( this.welcomeTab.name, true );

                    this.welcomeTab = this.addSpecialTab( 'Welcome to Animate!', CanvasTabType.BLANK );

                    const comp = new Component( event.tag.html, this.welcomeTab.page );
                    comp.element.css( { width: '100%', height: '100%' });
                    comp.addLayout( new Fill() );
                }
            }
        }

		/**
		* Gets the singleton instance.
		* @param {Component} parent The parent component of this tab
		* @returns {CanvasTab}
		*/
        static getSingleton( parent?: Component ): CanvasTab {
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
        renameTab( oldName: string, newName: string ): TabPair {

            // TODO: Update required from upgrade to TSX
            // =========================================
            // var toRet : TabPair = this.getTab( oldName );
            // toRet.tabSelector.element.text( newName );
            // (<CanvasTabPair>toRet).canvas.name = newName;
            // return toRet;
            // ===========================================
            return null;
        }


        // /**
        // * Removes an item from the tab
        // * @param val The label text of the tab
        // * @param {boolean} dispose Set this to true to clean up the tab
        // * @returns {TabPair} The tab pair containing both the label and page <Component>s
        // */
        // removeTab( val: string, dispose: boolean ): TabPair
        // removeTab( val: TabPair, dispose: boolean ): TabPair
        // removeTab( val: any, dispose: boolean ): TabPair {
        removeTab( index: number, prop: ITabPaneProps ) {

            // TODO: Updated since change to TSX
            // if (val instanceof CanvasTabPair) {
            // 	var canvas = ( <CanvasTabPair>val ).canvas;
            // 	var pManager: PluginManager = PluginManager.getSingleton();
            // 	var contEvent: AssetContainerEvent = new AssetContainerEvent( EditorEvents.ASSET_REMOVED_FROM_CONTAINER, null, canvas.container );

            // 	//Remove prev we need to notify the plugins of added or removed assets
            //     var project = User.get.project;

            // 	//Tell the plugins to remove the current assets
            // 	var references = canvas.containerReferences;

            // 	for ( var i = 0, l = references.assets.length; i < l; i++ ) {
            //         var asset = project.getResourceByShallowID<Asset>(references.assets[i], ResourceType.ASSET);
            // 		contEvent.asset = asset;
            // 		pManager.emit( contEvent );
            // 	}

            // 	canvas.container.canvas = null;
            // 	canvas.off(CanvasEvents.MODIFIED, this.onCanvasModified, this );
            // }

            // return super.removeTab( val, dispose );
        }

		/**
		* When a canvas is modified we change the tab name, canvas name and un-save its tree node.
		*/
        onCanvasModified( response: CanvasEvents, event: CanvasEvent, sender?: EventDispatcher ) {
            this._currentCanvas.container.saved = false;
        }

        ///**
        //* Removes an item from the tab
        //*/
        //removeTabConfirmed(response: BehaviourManagerEvents, event: BehaviourManagerEvent ) : void
        //{
        //	//Add the main tab
        //	if ( event.tag.result === BehaviourManagerEvents.SUCCESS )
        //	{
        //		super.removeTab(event.name, true );
        //	}
        //}


		/**
		* Adds an item to the tab
		* @param {string} text The text of the new tab
		* @param {CanvasTabType} type The type of tab to create
		* @param {any} tabContent Data associated with the tab
		* @returns {TabPair} The tab pair object
		*/
        addSpecialTab( text: string, type: CanvasTabType = CanvasTabType.CANVAS, tabContent: any = null ): TabPair {
            // TODO: Update required from upgrade to TSX

            // var pManager: PluginManager = PluginManager.getSingleton();
            // var toRet: TabPair = null;
            // if ( type === CanvasTabType.CANVAS ) {
            // 	toRet = super.addTab( new CanvasTabPair( new Canvas( null, tabContent ), text ), true );
            // 	var canvas: Canvas = (<CanvasTabPair>toRet).canvas;
            //     tabContent.canvas = canvas;
            //     toRet.page.addChild(<Component>canvas);

            //     canvas.on(CanvasEvents.MODIFIED, this.onCanvasModified, this);

            //     // Check if its saved or not
            //     toRet.modified = !canvas.container.saved;

            // 	this._currentCanvas = canvas;
            // 	(<Behaviour>canvas.children[0]).updateDimensions();

            //     pManager.emit(new ContainerEvent(EventTypes.CONTAINER_CREATED, tabContent ) );
            //     pManager.emit(new ContainerEvent(EventTypes.CONTAINER_SELECTED, tabContent ) );
            // }
            // else if ( type === CanvasTabType.BLANK )	{
            // 	toRet = super.addTab( text, true );
            // }
            // else {
            // 	if ( type === CanvasTabType.HTML ) {
            // 		if ( !HTMLTab.singleton )
            // 			toRet = super.addTab( new HTMLTab( 'HTML' ), true );
            // 		else
            // 			toRet = this.selectTab( HTMLTab.singleton );
            // 	}
            // 	else if ( type === CanvasTabType.CSS ) {
            // 		if ( !CSSTab.singleton )
            // 			toRet = super.addTab( new CSSTab( 'CSS' ), true );
            // 		else
            // 			toRet = this.selectTab( CSSTab.singleton );
            // 	}
            // 	else if ( type === CanvasTabType.SCRIPT ) {
            // 		toRet = Tab.prototype.addTab.call( this, new ScriptTab( tabContent ) );
            // 	}
            // }

            // return toRet;

            return null;
        }

        get currentCanvas(): Canvas { return this._currentCanvas; }
    }
}