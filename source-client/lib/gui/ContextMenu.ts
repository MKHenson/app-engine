module Animate
{
	export class ContextMenuItem extends Component
	{
		private _text: string;
		private _imgURL: string;

		/** 
		* Creates an instance of the item
		* @param {string} text The text of the item
		* @param {string} imgURL An optional image URL
		*/
		constructor( text : string, imgURL : string, parent?: Component )
		{
            super( "<div class='context-item reg-gradient'>" + ( imgURL && imgURL != "" ? "<img src='"+ imgURL +"'/>" : "" ) + "<div class='text'></div></div>", parent );
			this.text = text;
			this.imageURL = imgURL;
		}

		/** Gets the text of the item */
		get text(): string { return this._text; }
		/** Sets the text of the item */
		set text( val: string )
		{
			this._text = val;
			jQuery( ".text", this.element ).text( val );
		}

		/** Gets the image src of the item */
		get imageURL(): string { return this._imgURL; }
		/** Sets the image src of the item */
		set imageURL( val: string )
		{
			this._imgURL = val;
			jQuery( "img", this.element ).attr( "src", val );
		}
	}

	export class ContextMenuEvents extends ENUM
	{
		constructor( v: string ) { super( v ); }

		static ITEM_CLICKED: ContextMenuEvents = new ContextMenuEvents( "context_munu_item_clicked" );
	}

	export class ContextMenuEvent extends Event
	{
		public item: ContextMenuItem;


		constructor( item: ContextMenuItem, eventName: any )
		{
			super( eventName, item );

			this.item = item;
		}
	}

	/**
	* A ContextMenu is a popup window which displays a list of items that can be selected.
	*/
	export class ContextMenu extends Window
	{
		public static currentContext: ContextMenu;

		private items: Array<ContextMenuItem>;
		private selectedItem;
		
		/**
		*/
		constructor()
		{
			// Call super-class constructor
			super( 100, 100 );

           
			this.element.addClass( "context-menu" );
			this.element.css( "height", "" );
			this.items = [];
			this.selectedItem = null;

            this.content.element.css({ width: "", height: "" });
            this.element.css({ width: "initial", height: "initial" })
		}

		/**
		* Cleans up the context menu
		*/
		dispose()
		{
			this.items = null;
			this.selectedItem = null;
			Window.prototype.dispose.call( this );
		}

		/**
		* Shows the window by adding it to a parent.
		* @param {Component} parent The parent Component we are adding this window to
		* @param {number} x The x coordinate of the window
		* @param {number} y The y coordinate of the window
		* @param {boolean} isModal Does this window block all other user operations?
		* @param {boolean} isPopup If the window is popup it will close whenever anything outside the window is clicked
		*/
		show( parent: Component = null, x: number = NaN, y: number = NaN, isModal: boolean = false, isPopup: boolean = false )
		{
			var height = jQuery( window ).height();
			var width = jQuery( window ).width();

			if ( ContextMenu.currentContext )
				ContextMenu.currentContext.hide();

			ContextMenu.currentContext = this;
			Window.prototype.show.call( this, parent, x, y, isModal, isPopup );

			if ( x + this.element.width() > width )
				this.element.css( "left", width - this.element.width() );
			if ( y + this.element.height() > width )
				this.element.css( "top", height - this.element.height() );
            			
			//Check if nothing is visible - if so then hide it.
			var somethingVisible = false;
			var i = this.items.length;
			while ( i-- )
			{
				if ( this.items[i].element.is( ":visible" ) )
				{
					somethingVisible = true;
					break;
				}
			}


			if ( !somethingVisible )
				this.hide();
		}

		/**
		* Adds an item to the ContextMenu
		* @param {ContextMenuItem} val The item we are adding
		* @returns {ContextMenuItem} 
		*/
		addItem( val: ContextMenuItem ): ContextMenuItem
		{
			this.items.push( val );
			this.content.addChild( val );
			return val;
		}


		/**
		* Removes an item from the ContextMenu
		* @param {ContextMenuItem} val The item we are removing
		* @returns {ContextMenuItem} 
		*/
		removeItem( val: ContextMenuItem ): ContextMenuItem
		{
			var len = this.items.length;
			for ( var i = 0; i < len; i++ )
			{
				var v = this.items[i];
				if ( v == val )
				{
					v = this.items[i];
					this.items.splice( i, 1 );
					this.content.removeChild( val );
					return v;
				}
			}

			return null;
		}


		/** 
		* Checks if we selected an item - if so it closes the context and dispatches the ITEM_CLICKED event.
		*/
		onStageClick( e )
		{
			var targ = jQuery( e.target );
			if ( targ.is( jQuery( ".context-item" ) ) )
			{
				var item: ContextMenuItem = <ContextMenuItem>targ.data( "component" );
				this.onItemClicked( item, targ );
				this.dispatchEvent( new ContextMenuEvent( item, ContextMenuEvents.ITEM_CLICKED ) );
				this.hide();
				e.preventDefault();
				return;
			}

			super.onStageClick( e );
		}

		/**
		* @description Called when we click an item
		* @param {ContextMenuItem} item The selected item
		* @param {JQuery} jqueryItem The jquery item
		*/
		onItemClicked( item : ContextMenuItem, jqueryItem : JQuery )
		{

		}


		/**
		* Gets the number of items
		* @returns {number}
		*/
		get numItems() : number { return this.items.length; }

		/**
		* Gets an item from the menu
		* @param {string} val The text of the item we need to get
		* @returns {ContextMenuItem}
		*/
		getItem( val: string ): ContextMenuItem
		{
			var len = this.items.length;
			for ( var i = 0; i < len; i++ )
			{
				var v : string = this.items[i].text;
				if ( v == val )
					return this.items[i];
			}

			return null;
		}

		/**
		* Removes all items
		*/
		clear()
		{
			while ( this.content.children.length > 0 )
				this.content.children[0].dispose();

			this.items.splice( 0, this.items.length );
		}
	}
}