module Animate
{
	export class TabEvents extends ENUM
	{
		constructor(v: string) { super(v); }

		static SELECTED: TabEvents = new TabEvents("tab_selected");
		static REMOVED: TabEvents = new TabEvents("tab_removed");
	}


	

	/**
	* The Tab component will create a series of selectable tabs which open specific tab pages.
	*/
	export class Tab extends Component
    {
        public static contextMenu: ContextMenu;

		private _tabSelectorsDiv: Component;
		private _pagesDiv: Component;
		private _tabPairs: Array<TabPair>;
		private _selectedPair: TabPair;
		private _dropButton: Component;
		
		constructor( parent : Component )
		{
			// Call super-class constructor
			super( "<div class='tab background-view'></div>", parent );

			this._tabSelectorsDiv = new Component( "<div class='tabs-div'></div>", this );
            this._pagesDiv = new Component("<div class='pages-div'></div>", this);
            this._dropButton = new Component("<div class='tabs-drop-button black-tint'>&#x21E3;</div>", null);
			this._pagesDiv.addLayout( new Fill( 0, 0, 0, -25 ) );
			this._tabPairs = [];
			this._selectedPair = null;
			
			if ( !Tab.contextMenu )
				Tab.contextMenu = new ContextMenu();
            
            this.addLayout(new Fill());

            Tab.contextMenu.on(ContextMenuEvents.ITEM_CLICKED, this.onContext.bind(this));
            this.element.on("click", jQuery.proxy(this.onClick, this));

		}

		/**
		* When we click the tab
		* @param {TabPair} tab The tab pair object containing both the label and page <Comonent>s
		*/
		onTabSelected( tab: TabPair )
		{
			var event: TabEvent = new TabEvent( TabEvents.SELECTED, tab );
			this.emit( event );
			if ( event.cancel === false )
				tab.onSelected();
		}

		/**
		* @description When the context menu is clicked.
		*/
		onContext( response: ContextMenuEvents, event : ContextMenuEvent )
		{
			var len = this._tabPairs.length;
			for ( var i = 0; i < len; i++ )
				if ( this._tabPairs[i].name == event.item.text )
				{
					var p = this._tabPairs[i].tabSelector.element.parent();
					this._tabPairs[i].tabSelector.element.detach();
					p.prepend( this._tabPairs[i].tabSelector.element );

					this.selectTab( this._tabPairs[i] );
					return;
				}

		}

		/**
		* Get the tab to select a tab page
		* @param {TabPair} tab 
		*/
		selectTab( tab: TabPair ) : TabPair
		{
			var len = this._tabPairs.length;
			for ( var i = 0; i < len; i++ )
			{
				if ( tab == this._tabPairs[i] || this._tabPairs[i].name == tab.name )
				{
					if ( this._selectedPair != null )
					{
						this._selectedPair.tabSelector.element.removeClass( "tab-selected" );
						this._selectedPair.page.element.detach();
					}

					this._selectedPair = this._tabPairs[i];
					this._selectedPair.tabSelector.element.addClass( "tab-selected" );
					this._pagesDiv.element.append( this._selectedPair.page.element );
					this.onTabSelected( this._selectedPair );
					return this._selectedPair;
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
                var text = jQuery(".content", targ.parent()).text();
				var tabPair = this.getTab( text );
				if ( this.onTabPairClosing( tabPair ) )
					this.removeTab( tabPair, true );

				return;
			}
			else if ( targ.is( jQuery( ".tabs-drop-button" ) ) )
			{
				Tab.contextMenu.clear();

				var len = this._tabPairs.length;
				for ( var i = 0; i < len; i++ )
					Tab.contextMenu.addItem( new ContextMenuItem( this._tabPairs[i].name, null ) );

				e.preventDefault();

				Tab.contextMenu.show( Application.getInstance(), e.pageX, e.pageY, false, true );
				return false;

			}
			else if ( targ.is( jQuery( ".tab-selector" ) ) )
			{
				var len = this._tabPairs.length;
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
					if ( this._tabPairs[i].name == text )
					{
						if ( this._selectedPair != null )
						{
							this._selectedPair.tabSelector.element.removeClass( "tab-selected" );
							this._selectedPair.page.element.detach();
						}

						this._selectedPair = this._tabPairs[i];
						this._selectedPair.tabSelector.element.addClass( "tab-selected" );
						this._pagesDiv.element.append( this._selectedPair.page.element );
						this.onTabSelected( this._selectedPair );
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
			var tabs = this._tabPairs;
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

			if ( this._selectedPair != null )
			{
				this._selectedPair.tabSelector.element.removeClass( "tab-selected" );
				this._selectedPair.page.element.detach();
			}

			var page : Component = new Component( "<div class='tab-page background'></div>", this._pagesDiv );
            var tab: Component = new Component("<div class='tab-selector animate-fast background-dark tab-selected'><div class='text'><span class='content'>" + (val instanceof TabPair ? val.name : val) + "</span></div></div>", this._tabSelectorsDiv );
			if ( canClose )
			{
                new Component( "<div class='tab-close black-tint'>X</div>", tab );
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

            toAdd.tab = this;
			this._selectedPair = toAdd;
			this._tabPairs.push( toAdd );
            this.onTabSelected(this._selectedPair);

            // Only add the drop down if there is more than 1 tab
            if (this._tabPairs.length > 1 && !this.contains(this._dropButton))
                this._tabSelectorsDiv.addChild(this._dropButton);

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
			var i = this._tabPairs.length;
			while ( i-- )
				if ( this._tabPairs[i].name == val )
					return this._tabPairs[i];

			return null;
		}


		/**
		* This will cleanup the component.
		*/
		dispose()
		{
			this._tabSelectorsDiv = null;
			this._pagesDiv = null;

			var len = this._tabPairs.length;
			for ( var i = 0; i < len; i++ )
				this._tabPairs[i].dispose();

			this._pagesDiv = null;
			this._tabPairs = null;
			this._selectedPair = null;

			//Call super
			super.dispose();
		}

		/**
		* Removes all items from the tab. This will call dispose on all components.
		*/
		clear()
		{
			while ( this._tabPairs.length > 0 )
				this.removeTab( this._tabPairs[0], true );
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
			var len = this._tabPairs.length;
			for ( var i = 0; i < len; i++ )
			{
				if ( this._tabPairs[i] == val || this._tabPairs[i].name == val )
				{
					var event: TabEvent = new TabEvent( TabEvents.REMOVED, this._tabPairs[i] );
					this._tabPairs[i].onRemove( event );
					if ( event.cancel )
						return;

					var v = this._tabPairs[i];
                    this._tabPairs.splice(i, 1);
                    v.tab = this;

                    // Remove the drop button when less than 1 tab
                    if (this._tabPairs.length <= 1 && this.contains(this._dropButton))
                        this._tabSelectorsDiv.removeChild(this._dropButton);

					this.onTabPairClosing( v );
					this._tabSelectorsDiv.removeChild( v.tabSelector );
					this._pagesDiv.removeChild( v.page );

					if ( dispose )
						v.dispose();

					//Select another tab
					if ( this._selectedPair == v )
					{
						this._selectedPair = null;
						if ( len > 1 )
							this._tabPairs[0].tabSelector.element.trigger( "click" );
					}
					return v;
				}
			}

			return null;
		}

		get tabs() : Array<TabPair> { return this._tabPairs; }
	}
}