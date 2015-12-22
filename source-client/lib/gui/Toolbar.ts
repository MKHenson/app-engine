module Animate
{
    /**
	* The main toolbar that sits at the top of the application
	*/
	export class Toolbar extends Component
	{
		private static _singleton: Toolbar;

        private _mainElm: JQuery;
        private $itemSelected: boolean;
		private _topMenu : Component;
		private _bottomMenu: Component;
		private _tabHomeContainer: Component;
		private _currentContainer: Component;
        private _currentTab: Component;
        private _copyPasteToken: IContainerToken;

		constructor( parent? : Component )
        {
            super("<div class='toolbar'></div>", parent);
			Toolbar._singleton = this;

            this._topMenu = <Component>this.addChild( "<div class='tool-bar-top background-haze'></div>" );
			this._bottomMenu = <Component>this.addChild( "<div class='tool-bar-bottom'></div>" );

			// Create main tab
            this._tabHomeContainer = this.createTab("Animate", true);
            this._mainElm = jQuery("#toolbar-main").remove().clone();
            this._tabHomeContainer.element.append(this._mainElm);
            Compiler.build(this._mainElm, this);

            // Set a few defaults
            this.$itemSelected = false;
			this._copyPasteToken = null;
			this._currentContainer = this._tabHomeContainer;
			this._currentTab = this._tabHomeContainer.element.data( "tab" ).element.data( "component" );
			
            // Set events
			// This plugin does not yet work with 'on' so we have to still use bind
			jQuery( document ).bind( 'keydown', 'Ctrl+s', this.onKeyDown.bind( this ) );
			jQuery( document ).bind( 'keydown', 'Ctrl+c', this.onKeyDown.bind( this ) );
			jQuery( document ).bind( 'keydown', 'Ctrl+x', this.onKeyDown.bind( this ) );
            jQuery(document).bind('keydown', 'Ctrl+v', this.onKeyDown.bind(this));
            this._topMenu.element.on("click", jQuery.proxy(this.onMajorTab, this));
		}

		/**
		* This is called when an item on the canvas has been selected
		* @param {Component} item 
		*/
		itemSelected(item : Component)
        {
            if (item instanceof Behaviour || item instanceof Link)
                this.$itemSelected = true;
			else
                this.$itemSelected = false;

            Compiler.digest(this._mainElm, this);
		}

		/**
		* This is called when we have loaded and initialized a new project.
		*/
        newProject(project: Project)
        {
            this.$itemSelected = false;
            this._copyPasteToken = null;
            Compiler.digest(this._mainElm, this);
		}

		/**
		* Called when we click one of the top toolbar tabs.
		* @param {any} e 
		*/
		onMajorTab( e )
		{
			var container = jQuery( e.target ).data( "container" );
			if ( container != null && container != this._currentContainer )
			{
				this._currentContainer.element.slideUp( "fast", function ()
				{
					jQuery( this ).hide();
					jQuery( this ).css( { left: "0px", top: "0px" });

					var parent = jQuery( this ).parent();
					jQuery( this ).detach();
					parent.append( jQuery( this ) );
				});

				this._currentContainer = container;
				this._currentContainer.element.show();
				this._currentContainer.element.css( { left: "0px", top: "0px" });

                this._currentTab.element.removeClass( "toolbar-tab-selected" );
                jQuery(e.target).addClass( "toolbar-tab-selected" );
				this._currentTab = jQuery( e.target ).data( "component" );
			}
        }
        
        /**
        * Opens the splash window
        */
        onHome()
        {
            Splash.get.reset();
            Splash.get.show();
        }

        /**
        * Opens the user privileges window
        */
        onShowPrivileges()
        {
            Splash.get.reset();
            Splash.get.show();
        }
       
        /**
        * Notifys the app that its about to launch a test run
        */
        onRun()
        {
            PluginManager.getSingleton().emit(new Event(EditorEvents.EDITOR_RUN, null));
            ImportExport.getSingleton().run();
        }

        /**
        * When we click the paste button
        */
        onPaste()
        {
            if (CanvasTab.getSingleton().currentCanvas instanceof Canvas == false)
                return;
            
            if (this._copyPasteToken)
            {
                var canvas = CanvasTab.getSingleton().currentCanvas;
                canvas.deTokenize(this._copyPasteToken, false);
                canvas.emit(new CanvasEvent(CanvasEvents.MODIFIED, canvas));
            }
        }

        /**
        * When we click the copy button
        */
        onDuplicate(cut: boolean = false)
        {
            if (CanvasTab.getSingleton().currentCanvas instanceof Canvas == false)
                return;
            
            if (!Canvas.lastSelectedItem)
                return;

            var canvas = CanvasTab.getSingleton().currentCanvas;
            var toCopy = [];
            var i = canvas.children.length;
            while (i--)
                if (canvas.children[i].selected)
                    toCopy.push(canvas.children[i]);

            this._copyPasteToken = canvas.tokenize(false, toCopy);

            // If a cut operation then remove the selected item
            if (cut)
                Canvas.lastSelectedItem.dispose();

            canvas.emit(CanvasEvents.MODIFIED, canvas);
        }

        /**
        * Shows the rename form - and creates a new behaviour if valid
        */
        newContainer()
        {
            var that = this;

            // Todo: This must be NewBehaviourForm
            RenameForm.get.renameObject({ name: "" }, null, ResourceType.CONTAINER).then(function (token)
            {
                if (token.cancelled)
                    return;
                
                User.get.project.createResource(ResourceType.CONTAINER, { name: token.newName }).then(function(resource)
                {
                    // The container is created - so lets open it up
                    var tabPair = CanvasTab.getSingleton().addSpecialTab(resource.entry.name, CanvasTabType.CANVAS, resource);
                    jQuery(".content", tabPair.tabSelector.element).text(resource.entry.name);
                    tabPair.name = resource.entry.name;

                }).catch(function (err: Error)
                {
                    RenameForm.get.$errorMsg = (err.message.indexOf("urred while creating the resource") == -1 ? err.message : `The name '${token.newName}' is taken, please use another`);
                    that.newContainer();

                });
            });
        }
       
        /**
        * When we click the delete button
        */
        onDelete()
        {
            if (CanvasTab.getSingleton().currentCanvas instanceof Canvas == false)
                return;

            var canvas = CanvasTab.getSingleton().currentCanvas;
            var i = canvas.children.length;
            while (i--)
                if (canvas.children[i].disposed != null && canvas.children[i].selected)
                    canvas.children[i].onDelete();

            canvas.removeItems();
        }

		/**
		* This function is used to create a new group on the toolbar
		* @param {string} text The text of the new tab
		* @param {boolean} text The text of the new tab
		* @returns {Component} Returns the {Component} object representing the tab
		*/
		createTab( text : string, isSelected : boolean = false ) : Component
		{
            var topTab = this._topMenu.addChild("<div class='toolbar-tab " + (isSelected ? "toolbar-tab-selected" : "" ) + "'>" + text + "</div>" );
			var btmContainer: Component = <Component>this._bottomMenu.addChild( "<div class='tab-container'></div>" );

			if ( !isSelected )
				btmContainer.element.hide();

			topTab.element.data( "container", btmContainer );
			btmContainer.element.data( "tab", topTab );

			return btmContainer;
        }

        saveAll()
        {
            Animate.User.get.project.saveAll();
            Animate.CanvasTab.getSingleton().saveAll();
        }

		/**
		* Called when the key is pushed down
		* @param {any} event 
		*/
		onKeyDown( event : any )
		{
            if (event.data == 'Ctrl+s')
                this.saveAll();
            else if (event.data == 'Ctrl+c')
                this.onDuplicate(false);
			if ( event.data == 'Ctrl+x' )
                this.onDuplicate(true);
            if (event.data == 'Ctrl+v')
                this.onPaste();

			return false;
		}

		/**
		* Removes a tab by its name
		* @param {string} text The name of the tab
		*/
		removeTab( text : string ) 
		{
			var children: Array<IComponent> = this._topMenu.children;
			var i = children.length;

			while ( i-- )
				if ( children[i].element.text() == text )
				{
					children[i].element.data( "container" ).dispose();
					children[i].dispose();
					return;
				}
		}

		/**
		* This function is used to create a new group on the toolbar
		* @param {Component} tab The {Component} tab object which represents the parent of this group.
		* @returns {Component} Returns the {Component} object representing the group
		*/
        createGroup(tab: Component): Component { return <Component>tab.addChild( "<div class='tool-bar-group background-view-light'></div>" ); }

		/**
		* Use this function to create a group button for the toolbar
		* @param {string} text The text for the button
		* @param {number} min The minimum limit
		* @param {number} max The maximum limit
		* @param {number} delta The incremental difference when scrolling 
		* @param {Component} group The Component object representing the group
		* @returns {ToolbarNumber}
		*/
		createGroupNumber( text: string, defaultVal : number, min: number = Infinity, max: number = Infinity, delta: number = 0.1, group: Component = null ): ToolbarNumber
		{
			var toRet: ToolbarNumber = new ToolbarNumber( group, text, defaultVal, min, max, delta );
			group.addChild( <IComponent>toRet );
			return toRet;
		}

		/**
		* Use this function to create a group button for the toolbar
		* @param {string} text The text for the button
		* @param {string} image An image URL for the button icon
		* @param {Component} group The Component object representing the group
		* @param {boolean} isPushButton If true, the button will remain selected when clicked.
		* @returns {Component} Returns the Component object representing the button
		*/
		createGroupButton( text: string, image: string = null, group: Component = null, isPushButton: boolean = false ): ToolBarButton
		{
			var toRet: ToolBarButton = new ToolBarButton( text, image, isPushButton, group )
			group.addChild( <IComponent>toRet );
			return toRet;
		}

		/**
		* Use this function to create a group button for the toolbar
		* @param {Component} parent The parent that will contain the drop down
		* @param {Array<ToolbarItem>} items An array of items to list
		* @returns {ToolbarDropDown} Returns the Component object representing the button
		*/
		createDropDownButton( parent: Component, items: Array<ToolbarItem> ): ToolbarDropDown
		{
			var toRet = new ToolbarDropDown( parent, items )
			return toRet;
		}

		/**
		* Use this function to create a group button for the toolbar
		* @param {Component} parent The parent that will contain the drop down
		* @param {string} text The under the button
		* @param {string} color The hex colour as a string
		* @returns {ToolbarColorPicker} Returns the ToolbarColorPicker object representing the button
		*/
		createColorButton( parent: Component, text: string, color: string ): ToolbarColorPicker
		{
			var toRet = new ToolbarColorPicker( parent, text, color );
			return toRet;
		}

		/**
		* Gets the singleton instance
		*/
		public static getSingleton(parent?: Component): Toolbar
		{
			if ( Toolbar._singleton === undefined )
				Toolbar._singleton = new Toolbar( parent );

			return Toolbar._singleton;
		}
	}
}