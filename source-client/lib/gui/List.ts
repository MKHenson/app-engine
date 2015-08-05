module Animate
{
	export class ListEvents extends ENUM
	{
		constructor(v: string) { super(v); }

		static ITEM_SELECTED: ListEvents = new ListEvents("list_item_selected");
	}

	export class ListEvent extends Event
	{
		public item: string;

		constructor(eventName: ListEvents, item:string )
		{
			super(eventName, item);

			this.item = item;
		}
	}

	/**
	* Use this class to create a select list.
	*/
	export class List extends  Component
	{
		public selectBox: Component;

		private selectProxy: any;
		public items: Array<JQuery>;

		/**
		* @param {Component} parent The parent component of this list
		* @param {string} html An optional set of HTML to use. The default is <div class='list-box'></div>
		* @param {string} selectHTML 
		* @param {boolean} isDropDown 
		*/
		constructor( parent : Component, html: string = "<div class='list-box'></div>", selectHTML: string = "<select class='list' size='6'></select>", isDropDown : boolean = false )
		{
			if ( isDropDown )
				selectHTML = "<select></select>";

			// Call super-class constructor
			super( html, parent );

			this.selectBox = <Component>this.addChild( selectHTML );
			this.selectProxy = this.onSelection.bind( this );
			this.selectBox.element.on( "change", this.selectProxy );
			this.items = [];
		}


		/**
		* Called when a selection is made
		* @param <object> val Called when we make a selection
		*/
		onSelection( val )
		{
			this.dispatchEvent(new ListEvent( ListEvents.ITEM_SELECTED, this.selectedItem ) );
		}

		/**
		* Adds an item to the list
		* @param {string} val The text of the item
		* @returns {JQuery} The jQuery object created
		*/
		addItem( val : string ) : JQuery
		{
			var toAdd = jQuery( "<option value='" + this.items.length + "'>" + val + "</option>" );
			this.items.push( toAdd );
			this.selectBox.element.append( toAdd );
			return toAdd;
		}

		/**
		* Sorts  the  list alphabetically
		*/
		sort()
		{
			var items :Array<JQuery> = this.items;
			var i: number = items.length;
			while ( i-- )
				items[i].detach();
		
			
			//jQuery( "option", this.element ).each( function ()
			//{
			//	jQuery( this ).detach();
			//	items.push( jQuery( this ) );
			//});

			//items.sort( function ( a, b )
			//{
			//	var textA = a.text().toUpperCase();
			//	var textB = b.text().toUpperCase();
			//	return ( textA < textB ) ? -1 : ( textA > textB ) ? 1 : 0;
			//});

			this.items = items.sort( function ( a: JQuery, b: JQuery )
			{
				var textA = a.text().toUpperCase();
				var textB = b.text().toUpperCase();
				return ( textA < textB ) ? -1 : ( textA > textB ) ? 1 : 0;
			});

			var len = items.length;
			for ( var i = 0; i < len; i++ )
				this.selectBox.element.append( items[i] );
		}

		/**
		* Removes an item from the list 
		* @param <object> val The text of the item to remove
		* @returns <object> The jQuery object
		*/
		removeItem( val )
		{
			var len = this.items.length;
			for ( var i = 0; i < len; i++ )
			{
				var text = this.items[i].text();
				if ( text == val )
				{
					var item : JQuery = this.items[i];
					this.items.splice( i, 1 );
					item.detach();
					return item;
				}
			}

			return null;
		}

		/**
		* Gets the number of list items
		* @returns {number} The number of items
		*/
		numItems() : number { return this.items.length; }

		/**
		* Sets thee selected item from the list.
		* @param {string} val The text of the item
		*/
		set selectedItem( val: string )
		{
			jQuery( "select option", this.element ).filter( function ()
			{
				//may want to use $.trim in here
				return jQuery( this ).text() == val;
			}).prop( 'selected', true );
		}

		/**
		* Gets thee selected item from the list.
		* @returns {JQuery} The selected jQuery object
		*/
		get selectedItem(): string
		{
			//Return selected list item
			var len = this.items.length;
			for ( var i = 0; i < len; i++ )
				if ( this.items[i].prop( "selected" ) )
					return this.items[i].text();

			return null;
		}


		/**
		* Sets the selected item index from the list by its index.
		* @param {number} val The text of the item
		*/
		set selectedIndex( val : number ) 
		{
			if ( typeof ( val ) !== "undefined" )
			{
				//Remove any previously selected items
				var len = this.items.length;
				for ( var i = 0; i < len; i++ )
					this.items[i].prop( "selected", false );

				this.items[val].prop( "selected", true );
			}
		}

		/**
		* Gets the selected item index from the list by its 
		* index.
		* @returns {number} The selected index or -1 if nothing was found.
		*/
		get selectedIndex(): number
		{
			//Return selected list item by index
			var len : number = this.items.length;
			for ( var i = 0; i < len; i++ )
				if ( this.items[i].prop( "selected" ) === true )
					return i;

			return -1;
		}

		/**
		* Gets item from the list by its value
		* @param {string} val The text of the item
		* @returns {JQuery} The jQuery object
		*/
		getItem( val: string): JQuery
		{
			var len = this.items.length;
			for ( var i = 0; i < len; i++ )
			{
				var v = this.items[i].text();
				if ( v == val )
					return this.items[i];
			}

			return null;
		}

		/**
		* Removes all items
		*/
		clearItems()
		{
			var len = this.items.length;
			for ( var i = 0; i < len; i++ )
				this.items[i].remove();

			this.items.splice( 0, len );

		}

		/**
		* Diposes and cleans up this component and all its child <Component>s
		*/
		dispose()
		{
			this.selectProxy = null;
			this.selectBox.element.off();
			this.items = null;
			this.selectBox = null;

			//Call super
			super.dispose();
		}
	}
}