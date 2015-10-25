module Animate
{
	export class TabEvents extends ENUM
	{
		constructor(v: string) { super(v); }

		static SELECTED: TabEvents = new TabEvents("tab_selected");
		static REMOVED: TabEvents = new TabEvents("tab_removed");
	}


	export class TabEvent extends Event
	{
		private _pair: TabPair;
		public cancel: boolean;

		constructor( eventName: any, pair: TabPair )
		{
			super( eventName, pair );
			this.cancel = false;
			this._pair = pair;
		}

		get pair(): TabPair { return this._pair; }
	}

	/**
	* The Tab component will create a series of selectable tabs which open specific tab pages.
	*/
	export class Tab extends Component
	{
		private _tabsDiv: Component;
		private pagesDiv: Component;
		private _tabs: Array<TabPair>;
		private selectedTab: TabPair;
		private dropButton: Component;
		public static contextMenu: ContextMenu;

		constructor( parent : Component )
		{
			// Call super-class constructor
			super( "<div class='tab background-view'></div>", parent );

			this._tabsDiv = new Component( "<div class='tabs-div'></div>", this );
			this.pagesDiv = new Component( "<div class='pages-div'></div>", this );
			this.pagesDiv.addLayout( new Fill( 0, 0, 0, -25 ) );

			this._tabs = [];
			this.selectedTab = null;
			this.element.on( "click", jQuery.proxy( this.onClick, this ) );

			this.dropButton = new Component( "<div class='tabs-drop-button'>&#x21E3;</div>", this._tabsDiv );

			if ( !Tab.contextMenu )
				Tab.contextMenu = new ContextMenu( 100 );

			//this.element.disableSelection( true );
			Tab.contextMenu.on( ContextMenuEvents.ITEM_CLICKED, this.onContext.bind( this ) );

			this.addLayout( new Fill() );
		}

		/**
		* When we click the tab
		* @param {TabPair} tab The tab pair object containing both the label and page <Comonent>s
		*/
		onTabSelected( tab: TabPair )
		{
			var event: TabEvent = new TabEvent( TabEvents.SELECTED, tab );
			this.dispatchEvent( event );
			if ( event.cancel === false )
				tab.onSelected();
		}

		/**
		* @description When the context menu is clicked.
		*/
		onContext( response: ContextMenuEvents, event : ContextMenuEvent )
		{
			var len = this._tabs.length;
			for ( var i = 0; i < len; i++ )
				if ( this._tabs[i].name == event.item.text )
				{
					var p = this._tabs[i].tabSelector.element.parent();
					this._tabs[i].tabSelector.element.detach();
					p.prepend( this._tabs[i].tabSelector.element );

					this.selectTab( this._tabs[i] );
					return;
				}

		}

		/**
		* Get the tab to select a tab page
		* @param {TabPair} tab 
		*/
		selectTab( tab: TabPair ) : TabPair
		{
			var len = this._tabs.length;
			for ( var i = 0; i < len; i++ )
			{
				if ( tab == this._tabs[i] || this._tabs[i].name == tab.name )
				{
					if ( this.selectedTab != null )
					{
						this.selectedTab.tabSelector.element.removeClass( "tab-selected" );
						this.selectedTab.page.element.detach();
					}

					this.selectedTab = this._tabs[i];
					this.selectedTab.tabSelector.element.addClass( "tab-selected" );
					this.pagesDiv.element.append( this.selectedTab.page.element );
					this.onTabSelected( this.selectedTab );
					return this.selectedTab;
				}
			}

			return null;
		}

		/**
		* Called just before a tab is closed. If you return false it will cancel the operation.
		* @param {TabPair} tabPair 
		* @returns {boolean}
		*/
		onTabPairClosing( tabPair: TabPair ) { return true; }

		/**
		* When we click the tab
		* @param {any} e 
		*/
		onClick( e )
		{
			var targ = jQuery( e.target );
			if ( targ.is( jQuery( ".tab-close" ) ) )
			{
				var text = targ.parent().text();
				text = text.substring( 0, text.length - 1 );

				var tabPair = this.getTab( text );
				if ( this.onTabPairClosing( tabPair ) )
					this.removeTab( tabPair, true );

				return;
			}
			else if ( targ.is( jQuery( ".tabs-drop-button" ) ) )
			{
				Tab.contextMenu.clear();

				var len = this._tabs.length;
				for ( var i = 0; i < len; i++ )
					Tab.contextMenu.addItem( new ContextMenuItem( this._tabs[i].name, null ) );

				e.preventDefault();

				Tab.contextMenu.show( Application.getInstance(), e.pageX, e.pageY, false, true );
				return false;

			}
			else if ( targ.is( jQuery( ".tab-selector" ) ) )
			{
				var len = this._tabs.length;
				for ( var i = 0; i < len; i++ )
				{
					var text = "";
					if ( targ.data( "canClose" ) )
					{
						text = targ.text();
						text = text.substring( 0, text.length - 1 );
					}
					else
						text = targ.text();

					//text = text.substring(0, text.length - 1);
					if ( this._tabs[i].name == text )
					{
						if ( this.selectedTab != null )
						{
							this.selectedTab.tabSelector.element.removeClass( "tab-selected" );
							this.selectedTab.page.element.detach();
						}

						this.selectedTab = this._tabs[i];
						this.selectedTab.tabSelector.element.addClass( "tab-selected" );
						this.pagesDiv.element.append( this.selectedTab.page.element );
						this.onTabSelected( this.selectedTab );
						return;
					}
				}
			}
		}


		/**
		* When we update the tab - we move the dop button to the right of its extremities.
		*/
		update()
		{
			this.element.css( "overflow", "hidden" );
			Component.prototype.update.call( this );

			this.dropButton.element.css( {
				left:
				( this.dropButton.element.parent().width() - this.dropButton.element.width() ) + "px", top: "0px"
			});

			var tabs = this._tabs;
			var len = tabs.length;
			for ( var i = 0; i < len; i++ )
				tabs[i].onResize();
		}

		/**
		* Adds an item to the tab
		* @param {string} val The label text of the tab or a {TabPair} object
		* @param {boolean} canClose 
		* @returns {TabPair} The tab pair containing both the label and page <Component>s
		*/
		addTab( val: string, canClose: boolean ): TabPair
		addTab( val: TabPair, canClose: boolean ): TabPair
		addTab( val: any, canClose: boolean ) : TabPair
		{
			canClose = ( canClose === undefined ? true : canClose );

			if ( this.selectedTab != null )
			{
				this.selectedTab.tabSelector.element.removeClass( "tab-selected" );
				this.selectedTab.page.element.detach();
			}

			var page : Component = new Component( "<div class='tab-page background'></div>", this.pagesDiv );
            var tab: Component = new Component( "<div class='tab-selector background-dark tab-selected'><span class='text'>" + ( val instanceof TabPair ? val.name : val ) + "</span></div>", this._tabsDiv );
			if ( canClose )
			{
				new Component( "<div class='tab-close'>X</div>", tab );
				tab.element.data( "canClose", true );
			}

			var toAdd : TabPair = null;
			if ( val instanceof TabPair )
			{
				toAdd = val;
				toAdd.tabSelector = tab;
				toAdd.page = page;
			}
			else
				toAdd = new TabPair( tab, page, val );

			this.selectedTab = toAdd;
			this._tabs.push( toAdd );
			this.onTabSelected( this.selectedTab );

			tab.element.trigger( "click" );

			toAdd.onAdded();

			return toAdd;
		}

		/**
		* Gets a tab pair by name.
		* @param {string} val The label text of the tab
		* @returns {TabPair} The tab pair containing both the label and page {Component}s
		*/
		getTab( val: string ): TabPair
		{
			var i = this._tabs.length;
			while ( i-- )
				if ( this._tabs[i].name == val )
					return this._tabs[i];

			return null;
		}


		/**
		* This will cleanup the component.
		*/
		dispose()
		{
			this._tabsDiv = null;
			this.pagesDiv = null;

			var len = this._tabs.length;
			for ( var i = 0; i < len; i++ )
				this._tabs[i].dispose();

			this.pagesDiv = null;
			this._tabs = null;
			this.selectedTab = null;

			//Call super
			super.dispose();
		}

		/**
		* Removes all items from the tab. This will call dispose on all components.
		*/
		clear()
		{
			while ( this._tabs.length > 0 )
				this.removeTab( this._tabs[0], true );
		}

		/**
		* Removes an item from the tab
		* @param val The label text of the tab
		* @param {boolean} dispose Set this to true to clean up the tab
		* @returns {TabPair} The tab pair containing both the label and page <Component>s
		*/
		removeTab( val: string, dispose: boolean )
		removeTab( val: TabPair, dispose: boolean )
		removeTab( val:any, dispose:boolean )
		{
			dispose = ( dispose === undefined ? true : dispose );
			var len = this._tabs.length;
			for ( var i = 0; i < len; i++ )
			{
				if ( this._tabs[i] == val || this._tabs[i].name == val )
				{
					var event: TabEvent = new TabEvent( TabEvents.REMOVED, this._tabs[i] );
					this._tabs[i].onRemove( event );
					if ( event.cancel )
						return;

					var v = this._tabs[i];
					this._tabs.splice( i, 1 );

					this.onTabPairClosing( v );
					this._tabsDiv.removeChild( v.tabSelector );
					this.pagesDiv.removeChild( v.page );

					if ( dispose )
						v.dispose();

					//Select another tab
					if ( this.selectedTab == v )
					{
						this.selectedTab = null;
						if ( len > 1 )
							this._tabs[0].tabSelector.element.trigger( "click" );
					}
					return v;
				}
			}

			return null;
		}

		get tabs() : Array<TabPair> { return this._tabs; }
	}
}