module Animate
{
	/** 
	* The interface for all layout objects.
	*/
	export class ToolbarItem extends Component
	{
		public text: String;
		public img: String;

		/**
		* @param {string} img The image path.
		* @param {string} text The text to use in the item.
		*/
		constructor( img: string, text: string, parent?: Component )
		{
			super( "<div class='toolbar-button'><div><img src='" + img + "' /></div><div class='tool-bar-text'>" + text + "</div></div>", parent );
			this.img = img;
			this.text = text;
		}
	}

	
	export class ToolbarDropDownEvents extends ENUM
	{
		constructor( v: string ) { super( v ); }

		static ITEM_CLICKED: ToolbarDropDownEvents = new ToolbarDropDownEvents( "toolbar_dropdown_item_clicked" );
	}

	export class ToolbarDropDownEvent extends Event
	{
		public item: ToolbarItem;

		constructor( item: ToolbarItem, e: ToolbarDropDownEvents )
		{
			this.item = item;
			super( e, null );
		}

		dispose()
		{
			this.item = null;
		}
	}

	/**
	*  A toolbar button for selection a list of options
	*/
	export class ToolbarDropDown extends Component
	{
		public items: Array<ToolbarItem>;
		private popupContainer: Component;
		private selectedItem: ToolbarItem;
		private clickProxy: any;
		private stageDownProxy: any;

		/**
		* @param {Component} parent The parent of this toolbar
		* @param {Array<ToolbarItem>} items An array of items to list e.g. [{img:"./img1.png", text:"option 1"}, {img:"./img2.png", text:"option 2"}]
		*/
		constructor( parent: Component, items: Array<ToolbarItem> )
		{
			super( "<div class='toolbar-button-drop-down'></div>", parent );

			this.items = items;
			this.popupContainer = new Component( "<div class='tool-bar-dropdown shadow-med'></div>" );

			var i = items.length;
			while ( i-- )
			{
				//var comp: Component = <ToolbarItem>this.popupContainer.addChild( "<div class='toolbar-button'><div><img src='" + items[i].img + "' /></div><div class='tool-bar-text'>" + items[i].text + "</div></div>" );
				//comp.element.data( "item", items[i] );
				//items[i].comp = comp;
				this.popupContainer.addChild( items[i] );
			}


			if ( items.length > 0 )
				this.selectedItem = <ToolbarItem>this.addChild( items[0] );
			else
				this.selectedItem = null;

	
			this.stageDownProxy = this.onStageUp.bind( this );
			this.clickProxy = this.onClick.bind( this );

			this.element.on( "click", this.clickProxy );
		}

		/**
		* Adds an item the drop down. The item must be an object with both img and text vars. eg: { img:"", text:"" }
		* @param {ToolbarItem} item The item to add.
		* @returns {Component}
		*/
		addItem( item: ToolbarItem )
		{
			var comp = this.popupContainer.addChild( item );
			//comp.element.data( "item", item );
			//item.comp = comp;

			this.items.push( item );
			return comp;
		}

		/**
		* Adds an item the drop down. The item must be an object with both img and text vars. eg: { img:"", text:"" }
		* @param {any} val This can be either the item object itself, its text or its component.
		* @param {boolean} dispose Set this to true if you want delete the item
		* @returns {Component} Returns the removed item component or null
		*/
		removeItem( val : any, dispose : boolean = true )
		{
			var i = this.items.length;
			var items : Array<any> = this.items;
			while ( i-- )
				if ( items[i] == val || items[i].text == val || items[i].comp == val )
				{
					if ( dispose )
						items[i].dispose()
					else
						items[i].element.detach();

					items.splice( i, 1 );
					return items[i];
				}

			return null;
		}

		/**
		* Clears all the items
		* @param {boolean} dispose Set this to true if you want to delete all the items from memory
		*/
		clear( dispose : boolean = true ) : void
		{
			var i = this.items.length;
			var items : Array<any> = this.items;
			while ( i-- )		
			{
				if ( dispose )
					items[i].dispose()
				else
					items[i].element.detach();
			}

			this.selectedItem = null;
			items.splice( 0, items.length );
		}

		/**
		* Sets the selected item
		* @param {any} item 
		*/
		setItem( item : ToolbarItem )
		{
			if ( this.selectedItem === item )
				return;

			if ( this.selectedItem )
			{
				//this.selectedItem.element.detach();
				this.popupContainer.addChild( this.selectedItem );
			}

			this.addChild( item );
			//this.element.html( "<div><img src='" + item.img + "' /></div><div class='tool-bar-text'>" + item.text + "</div>" );
			var e: ToolbarDropDownEvent = new ToolbarDropDownEvent( item, ToolbarDropDownEvents.ITEM_CLICKED );
			this.dispatchEvent( e );
			e.dispose();
			this.selectedItem = item;
			return;
		}

		/**
		* Called when the mouse is down on the DOM
		* @param {any} e The jQuery event
		*/
		onStageUp = function ( e: any )
		{
			var body = jQuery( "body" );
			body.off( "mousedown", this.stageDownProxy );

			var comp : Component = jQuery( e.target ).data( "component" );
			this.popupContainer.element.detach();

			if ( comp )
			{
				var i = this.items.length;
				while ( i-- )
				{
					if ( comp == this.items[i] )
					{
						this.setItem( comp );
						return;
					}
				}
			}
		}

		/**
		* When we click the main button
		* @param {any} e The jQuery event oject
		*/
		onClick( e : any )
		{
			//var comp = jQuery( e.target ).data( "component" );
			var offset = this.element.offset();

			var body = jQuery( "body" );
			body.off( "mousedown", this.stageDownProxy );
			body.on( "mousedown", this.stageDownProxy );

			this.popupContainer.element.css( { top: offset.top + this.element.height(), left: offset.left });
			body.append( this.popupContainer.element );
		}

		/**
		* Cleans up the component
		*/
		dispose() : void
		{
			var i = this.items.length;
			while ( i-- )
				this.items[i].dispose();

			this.popupContainer.dispose();
			this.element.off( "click", this.clickProxy );
			this.clickProxy = null;
			this.items = null;
			this.popupContainer = null;
			this.selectedItem = null;

			//Call super
			super.dispose();
		}
	}
}