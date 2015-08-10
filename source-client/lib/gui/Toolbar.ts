module Animate
{
	export class Toolbar extends Component
	{
		private static _singleton: Toolbar;

		private _topMenu : Component;
		private _bottomMenu: Component;
		private _tabHomeContainer: Component;
		private _home: Component;

		private _save: Component;
		private _copy: Component;
		private _paste: Component;
		private _cut: Component;
		private _deleteBut: Component;

		private _snapping: Component;
		private _run: Component;
		private _build: Component;
		private _htmlBut: Component;
		private _cssBut: Component;
		private _addBehaviour: Component;

		private _currentContainer: Component;
		private _currentTab: Component;
		private _copyPasteToken: CanvasToken;

		private _privileges: Component;
		private _files: Component;

		constructor( parent? : Component )
		{
			if ( Toolbar._singleton != null )
				throw new Error( "The Toolbar class is a singleton. You need to call the TooltipManager.getSingleton() function." );

			Toolbar._singleton = this;

			super( "<div class='toolbar'></div>", parent );

			this._topMenu = <Component>this.addChild( "<div class='tool-bar-top'></div>" );
			this._bottomMenu = <Component>this.addChild( "<div class='tool-bar-bottom'></div>" );

			//Create the containers
			this._tabHomeContainer = this.createTab( "Animate", true );// bottomMenu.addChild("<div class='tab-container'></div>");

			//Create buttons
			var group = this.createGroup( this._tabHomeContainer );
			this._home = this.createGroupButton( "Home", "media/animate-home.png", group );

			//group = this.createGroup( this.tabHomeContainer );
			this._save = this.createGroupButton( "Save", "media/save.png", group );
			//this.open = this.createGroupButton( "Open", "media/open.png", group );

			group = this.createGroup( this._tabHomeContainer );
			this._copy = this.createGroupButton( "Copy", "media/copy.png", group );
			this._cut = this.createGroupButton( "Cut", "media/cut.png", group );
			this._paste = this.createGroupButton( "Paste", "media/paste.png", group );
			this._deleteBut = this.createGroupButton( "Delete", "media/delete.png", group );

			//Grid related
			group = this.createGroup( this._tabHomeContainer );
			this._snapping = this.createGroupButton( "Snapping", "media/snap.png", group );

			group = this.createGroup( this._tabHomeContainer );
			this._run = this.createGroupButton( "Run", "media/play.png", group );
			this._build = this.createGroupButton( "Settings", "media/build.png", group );
			this._htmlBut = this.createGroupButton( "HTML", "media/html.png", group );
			this._cssBut = this.createGroupButton( "CSS", "media/css.png", group );

			group = this.createGroup( this._tabHomeContainer );
			this._addBehaviour = this.createGroupButton( "New Behaviour", "media/add-behaviour.png", group );

			//Create plugin button
			group = this.createGroup( this._tabHomeContainer );
			this._privileges = this.createGroupButton( "Privileges", "media/privaledges.png", group );

			group = this.createGroup( this._tabHomeContainer );
			this._files = this.createGroupButton( "File Manager", "media/plug-detailed.png", group );


			this._copy.enabled = false;
			this._cut.enabled = false;
			this._paste.enabled = false;
			this._deleteBut.enabled = false;
			this._save.enabled = false;
			this._addBehaviour.enabled = false;
			this._run.enabled = false;
			this._htmlBut.enabled = false;
			this._cssBut.enabled = false;
			this._build.enabled = false;
			this._privileges.enabled = false;
			this._files.enabled = false;

			this._copyPasteToken = null;


			this.element.on( "click", jQuery.proxy( this.onClick, this ) );
			//this.element.disableSelection( true );

			this._currentContainer = this._tabHomeContainer;
			this._currentTab = this._tabHomeContainer.element.data( "tab" ).element.data( "component" );// this.tabHome;
			this._topMenu.element.on( "click", jQuery.proxy( this.onMajorTab, this ) );

			//This plugin does not yet work with 'on' so we have to still use bind
			jQuery( document ).bind( 'keydown', 'Ctrl+s', this.onKeyDown.bind( this ) );
			jQuery( document ).bind( 'keydown', 'Ctrl+c', this.onKeyDown.bind( this ) );
			jQuery( document ).bind( 'keydown', 'Ctrl+x', this.onKeyDown.bind( this ) );
			jQuery( document ).bind( 'keydown', 'Ctrl+v', this.onKeyDown.bind( this ) );

			//this.element.disableSelection( true );
		}

		/**
		* This is called when an item on the canvas has been selected
		* @param {Component} item 
		*/
		itemSelected(item : Component)
		{
			if (this._copyPasteToken)
				this._paste.enabled = true;
			else
				this._paste.enabled = false;

			if (item instanceof Behaviour || item instanceof Link)
			{
				this._copy.enabled = true;
				this._cut.enabled = true;
				this._deleteBut.enabled = true;
			}
			else
			{
				this._copy.enabled = false;
				this._cut.enabled = false;
				this._deleteBut.enabled = false;
			}
		}

		/**
		* This is called when we have loaded and initialized a new project.
		*/
		newProject()
		{
			this._addBehaviour.enabled = true;
			this._save.enabled = true;
			this._run.enabled = true;
			this._files.enabled = true;
			this._htmlBut.enabled = true;
			this._cssBut.enabled = true;
			this._build.enabled = true;
			this._privileges.enabled = true;
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

				this._currentTab.element.removeClass( "tool-tab-selected" );
				jQuery( e.target ).addClass( "tool-tab-selected" );
				this._currentTab = jQuery( e.target ).data( "component" );
			}
		}

		/**
		* Called when the tool bar is clicked.
		* @param {any} e The jQuery event object
		*/
		onClick( e ) : void
		{
			var comp = jQuery( e.target ).data( "component" );

			if ( comp == this._addBehaviour )
				NewBehaviourForm.getSingleton().show();
			//Splash screen
			else if ( comp == this._home )
			{
				Splash.getSingleton().reset();
				Splash.getSingleton().show();
			}
			else if ( comp == this._snapping )
			{
				if ( this._snapping.element.hasClass( "selected" ) )
				{
					this._snapping.element.removeClass( "selected" );
					Canvas.snapping = false;
				}
				else
				{
					this._snapping.element.addClass( "selected" );
					Canvas.snapping = true;
				}
			}
			else if ( comp == this._privileges )
				UserPrivilegesForm.getSingleton().show();
			else if ( comp == this._save )
				User.getSingleton().project.saveAll();
			else if ( comp == this._build )
				BuildOptionsForm.getSingleton().show();
			else if ( comp == this._run )
			{
				//PluginManager.getSingleton().callRun();
				PluginManager.getSingleton().dispatchEvent( new Event( EditorEvents.EDITOR_RUN, null ) );
				ImportExport.getSingleton().run();
			}
			else if ( comp == this._files )
			{
				FileViewerForm.getSingleton().showForm( null, null );
			}
			else if ( comp == this._htmlBut )
				CanvasTab.getSingleton().addSpecialTab("HTML", CanvasTabType.HTML );
			else if ( comp == this._cssBut )
				CanvasTab.getSingleton().addSpecialTab( "CSS", CanvasTabType.CSS );

			//Any of the cut / paste / copy buttons
			if ( CanvasTab.getSingleton().currentCanvas instanceof Canvas )
			{
				var canvas = CanvasTab.getSingleton().currentCanvas;
				if ( this._copyPasteToken && comp == this._paste )
				{
					canvas.openFromDataObject( this._copyPasteToken, false, true );
					canvas.dispatchEvent( new CanvasEvent( CanvasEvents.MODIFIED, canvas ) );
				}
				else if ( Canvas.lastSelectedItem != null && comp == this._copy )
				{
					var toCopy = [];

					var i = canvas.children.length;
					while ( i-- )
						if ( canvas.children[i].selected )
							toCopy.push( canvas.children[i] );

					this._copyPasteToken = canvas.buildDataObject(toCopy);
					canvas.buildDataObject( toCopy ); //[Canvas.lastSelectedItem]
					this._paste.enabled = true;
				}
				else if ( Canvas.lastSelectedItem != null && comp == this._cut )
				{
					var toCopy = [];

					var i = canvas.children.length;
					while ( i-- )
						if ( canvas.children[i].selected )
							toCopy.push( canvas.children[i] );

					this._copyPasteToken = canvas.buildDataObject( toCopy ); //[Canvas.lastSelectedItem]
					Canvas.lastSelectedItem.dispose();

					canvas.dispatchEvent( CanvasEvents.MODIFIED, canvas );

					this._paste.enabled = true;
				}
				else if ( comp == this._deleteBut )
				{
					var i = canvas.children.length;
					while ( i-- )
						if ( canvas.children[i].disposed != null && canvas.children[i].selected )
							canvas.children[i].onDelete();

					canvas.removeItems();
				}
			}

		}

		/**
		* This function is used to create a new group on the toolbar
		* @param {string} text The text of the new tab
		* @param {boolean} text The text of the new tab
		* @returns {Component} Returns the {Component} object representing the tab
		*/
		createTab( text : string, isSelected : boolean = false ) : Component
		{
			var topTab = this._topMenu.addChild( "<div class='tool-tab " + ( isSelected ? "tool-tab-selected" : "" ) + "'>" + text + "</div>" );

			var btmContainer: Component = <Component>this._bottomMenu.addChild( "<div class='tab-container'></div>" );

			if ( !isSelected )
				btmContainer.element.hide();

			topTab.element.data( "container", btmContainer );
			btmContainer.element.data( "tab", topTab );

			return btmContainer;
		}

		/**
		* Called when the key is pushed down
		* @param {any} event 
		*/
		onKeyDown( event : any )
		{
			if ( event.data == 'Ctrl+s' )
				this._save.element.trigger( "click" );
			else if ( event.data == 'Ctrl+c' )
				this._copy.element.trigger( "click" );
			if ( event.data == 'Ctrl+x' )
				this._cut.element.trigger( "click" );
			if ( event.data == 'Ctrl+v' )
				this._paste.element.trigger( "click" );

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
		createGroup(tab: Component): Component { return <Component>tab.addChild( "<div class='tool-bar-group'></div>" ); }

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
		public static getSingleton( parent?: Component): Toolbar
		{
			if ( Toolbar._singleton === undefined )
				Toolbar._singleton = new Toolbar( parent );

			return Toolbar._singleton;
		}

		get save(): Component { return this._save; }
		get copy(): Component { return this._copy; }
		get paste(): Component { return this._paste; }
		get cut(): Component { return this._cut; }
		get deleteBut(): Component { return this._deleteBut; }
		get snapping(): Component { return this._snapping; }
		get run(): Component { return this._run; }
		get build(): Component { return this._build; }
		get htmlBut(): Component { return this._htmlBut; }
		get cssBut(): Component { return this._cssBut; }
		get addBehaviour(): Component { return this._addBehaviour; }
	}
}