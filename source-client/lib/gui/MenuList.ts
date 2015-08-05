module Animate
{
	export class MenuListEvents extends ENUM
	{
		constructor(v: string) { super(v); }

		static ITEM_CLICKED: MenuListEvents = new MenuListEvents("menu_list_item_clicked");
	}
	
	/**
	* A specially designed type of list
	*/
	export class MenuList extends Component
	{
		private _items: Array<JQuery>;
		private selectedItem: JQuery;

		constructor( parent : Component )
		{
			// Call super-class constructor
			super( "<div class='menu-list'></div>", parent );

			this._items = [];
			this.element.on( "click", jQuery.proxy( this.onClick, this ) );
			this.selectedItem = null;
		}

		/** 
		* Adds an HTML item
		* @returns {JQuery} A jQuery object containing the HTML.
		*/
		addItem( img : string, val : string ) : JQuery
		{
			var toRet = jQuery( "<div class='menu-list-item'>" + ( img ? "<img src='" + img + "' />" : "" ) + "<span class='menu-list-text'>" + val + "</span></div>" );
			this._items.push( toRet );
			this.element.append( toRet );
			return toRet;
		}

		/**
		* Removes an  item from this list
		* @param {JQuery} item The jQuery object we are removing
		*/
		removeItem( item : JQuery )
		{
			if ( item == this.selectedItem )
				this.dispatchEvent( MenuListEvents.ITEM_CLICKED, "" );

			this._items.splice( jQuery.inArray( item, this.items ), 1 );
			item.remove();
		}

		/**
		* Clears all the items added to this list
		*/
		clearItems() : void
		{
			var len = this.items.length;
			for ( var i = 0; i < len; i++ )
			{
				this._items[i].off();
				this._items[i].detach();
			}

			this._items.splice( 0, len );
		}

		/**
		* Checks if we selected an item - if so it closes the context and dispatches the ITEM_CLICKED event.
		* @param {any} e The jQuery event object
		*/
		onClick( e )
		{
			if ( this.selectedItem )
				this.selectedItem.removeClass( "menu-item-selected" );

			this.selectedItem = null;

			var targ = jQuery( e.target );
			if ( targ.is( jQuery( ".menu-list-item" ) ) )
			{
				this.selectedItem = targ;
				this.selectedItem.addClass( "menu-item-selected" );
				this.dispatchEvent( MenuListEvents.ITEM_CLICKED, targ.text() );

				e.preventDefault();
				return;
			}
			else
				this.dispatchEvent( MenuListEvents.ITEM_CLICKED, "" );
		}

		get items(): Array<JQuery> { return this._items; }
	}
}