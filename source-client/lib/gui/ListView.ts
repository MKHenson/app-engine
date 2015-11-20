module Animate
{
	export class ListViewEvents extends ENUM
	{
		constructor(v: string) { super(v); }

		static ITEM_CLICKED: ListViewEvents = new ListViewEvents("list_view_item_clicked");
		static ITEM_DOUBLE_CLICKED: ListViewEvents = new ListViewEvents("list_view_item_double_clicked");
	}

	export class ColumnItem
	{
		public text: string;
		public image: string;

		constructor(text : string, image:string = "")
		{
			this.text = text;
			this.image = image;
		}
	}

	export class ListViewType
	{
		public value: string;
		constructor(v: string) { this.value = v; }
		toString() { return this.value; }

		static DETAILS: ListViewType = new ListViewType("details");
		static IMAGES: ListViewType = new ListViewType("images");
	}

	export class ListViewEvent extends Event
	{
		public item: ListViewItem;

		constructor(eventType: ListViewEvents, item : ListViewItem)
		{
			super( eventType );
			this.item = item;
		}
	}

	/**
	* The ListView class is used to display a series of {ListViewItem}s. Each item can 
	* organised by a series of columns
	*/
	export class ListView extends Component
	{
		private _mode: ListViewType;
		private _selectedItem: ListViewItem;
		private _lists: Array<Component>;
		private _items: Array<ListViewItem>;
		private _columns: Array<ColumnItem>;

		private _sortableColumn: number;
		private _imgSize: number;
		private _multiSelect: boolean;
		private _fix: Component;
		private _divider: Component;
		private _selectedColumn: JQuery;

		private _dClickProxy: any;
		private _clickProxy: any;
		private _downProxy: any;
		private _upProxy: any;
		private _moveProxy: any;

		constructor(parent: Component)
		{
			// Call super-class constructor
			super("<div class='list-view'></div>", parent);
            
			this._mode = ListViewType.DETAILS;

			this._selectedItem = null;
			this._lists = [];
			this._items = [];
			this._columns = [];

			this._sortableColumn = 0;

			this._multiSelect = false;

			this._fix = <Component>this.addChild("<div class='fix'></div>");

			this._divider = <Component>this.addChild("<div class='divider'></div>");
			this._divider.element.detach();

			this._selectedColumn = null;
			this._imgSize = 100;

			//Events
			this._dClickProxy = this.onDoubleClick.bind( this);
			this._clickProxy = this.onClick.bind( this);
			this._downProxy = this.onDown.bind( this);
			this._upProxy = this.onUp.bind( this);
			this._moveProxy = this.onMove.bind( this);


			this.element.on( "dblclick", this._dClickProxy);
			this.element.on( "click", this._clickProxy);
			this.element.on( "mousedown", this._downProxy);
		}


		/**
		* Toggle between the different modes
		* @param {ListViewType} mode Either DETAILS or IMAGES mode
		*/
		set displayMode(mode: ListViewType)
		{
			if (mode === undefined)
				return;

			for (var i = 0; i < this._items.length; i++)
			{
				for (var ii = 0; ii < this._items[i].components.length; ii++)
					this._items[i].components[ii].dispose();

				this._items[i].components.splice(0, this._items[i].components.length);
			}

			this._mode = mode;
			this.updateItems();
			return;
		}

		/**
		* @returns {ListViewType} Either ListViewType.DETAILS or ListViewType.IMAGES
		*/
		get displayMode(): ListViewType
		{
			return this._mode;
		}

		/**
		* Called when we hold down on this component
		* @param {any} e The jQuery event object
		*/
		onDown(e : any)
		{
			var target : JQuery = jQuery(e.target);
			if (target.hasClass("dragger"))
			{
				this._selectedColumn = target.parent().parent();

				if (this._selectedColumn.length > 0)
				{
					e.preventDefault();
					this.element.append(this._divider.element);
					jQuery( document ).on( "mousemove", this._moveProxy);
					jQuery( document ).on( "mouseup", this._upProxy);

					this._divider.element.css({
						left: (target.position().left + (target.width() / 2)) + "px"
					});

					return false;
				}
			}
		}


		/**
		* Called when we move over this componeny
		* @param {any} e The jQuery event object
		*/
		onMove(e)
		{
			var position = this.element.offset();
			var dividerSize = 5;

			var w = this.element.width();
			var dist = e.clientX - position.left;

			if (dist < dividerSize)
				dist = 0;
			if (dist > w - dividerSize)
				dist = w - dividerSize;

			this._divider.element.css({
				left: dist + "px"
			});
		}

		/**
		* Called when the mouse up event is fired
		* @param {any} e The jQuery event object
		*/
		onUp(e)
		{
			var position = this._selectedColumn.offset();
			//var dividerSize = 5;
			var dist = e.clientX - position.left;

			this._selectedColumn.css({ width: dist + "px" });

			var newWidth = 0;
			var i = this._lists.length;
			while (i--)
				newWidth += this._lists[i].element.outerWidth();

			this.element.css({ "min-width": newWidth + "px" });

			this._divider.element.detach();
			jQuery( document ).off( "mousemove", this._moveProxy);
			jQuery( document ).off( "mouseup", this._upProxy);
		}

		onDoubleClick(e)
		{
			var listViewItem = jQuery(e.target).data("item");
			if (listViewItem)
			{
				//Select all components of the item we clicked on
				var i = listViewItem.components.length;
				while (i--)
				{
					var comp = listViewItem.components[i];
					comp.element.removeClass("selected");
				}

				i = listViewItem.components.length;
				while (i--)
				{
					var comp = listViewItem.components[i];
					comp.element.addClass("selected");
				}

				this.emit( new ListViewEvent( ListViewEvents.ITEM_DOUBLE_CLICKED, listViewItem ) );
			}

			e.preventDefault();
			return false;
		}

		/**
		* Called when we click this component
		* @param {any} e The jQuery event object
		*/
		onClick(e)
		{
			var comp : Component = jQuery(e.target).data("component");

			//Check if we clicked a header
			if (comp instanceof ListViewHeader)
			{
				var i = this._lists.length;
				while (i--)
					if (this._lists[i].children[0] == comp)
					{
						this._sortableColumn = i;
						this.updateItems();
						return;
					}
			}
			else
			{
				//Check if we selected an item. If we did we need to make all the items on that row selected.
				var listViewItem : ListViewItem = jQuery(e.target).data("item");
				if (listViewItem)
				{
					if (!e.ctrlKey && jQuery(e.target).hasClass("selected"))
					{
						//Select all components of the item we clicked on
						i = listViewItem.components.length;
						while (i--)
						{
							var comp = listViewItem.components[i];
							comp.element.removeClass("selected");
						}

						this.emit(new ListViewEvent(ListViewEvents.ITEM_CLICKED, null));
						return;
					}

					//Remove previous selection
					if (this._multiSelect == false || !e.ctrlKey)
					{
						var selectedItems = jQuery(".selected", this.element);
						selectedItems.each(function ()
						{
							jQuery(this).removeClass("selected");
						});
					}

					//If the item is already selected, then unselect it
					if (jQuery(e.target).hasClass("selected"))
					{
						//Select all components of the item we clicked on
						i = listViewItem.components.length;
						while (i--)
						{
							var comp = listViewItem.components[i];
							comp.element.removeClass("selected");
							this.emit (new ListViewEvent(ListViewEvents.ITEM_CLICKED, null) );
						}
					}
					else
					{
						//Select all components of the item we clicked on
						i = listViewItem.components.length;
						while (i--)
						{
							var comp = listViewItem.components[i];
							comp.element.addClass("selected");
						}

						this.emit(new ListViewEvent(ListViewEvents.ITEM_CLICKED, listViewItem));
					}
				}
			}
		}

		/**
		* Gets all the items that are selected
		* @returns {Array<ListViewItem>} 
		*/
		getSelectedItems(): Array<ListViewItem>
		{
			var items: Array<ListViewItem>= [];
			var selectedItems = jQuery(".selected", this.element);
			selectedItems.each(function ()
			{
				var listViewItem = jQuery(this).data("item");
				if (items.indexOf(listViewItem) == -1)
					items.push(listViewItem);
			});

			return items;
		}

		/**
		* Sets which items must be selected. If you specify null then no items will be selected.
		*/
		setSelectedItems(items)
		{
			if (items == null)
			{
				var selectedItems = jQuery(".selected", this.element);
				selectedItems.each(function ()
				{
					jQuery(this).removeClass("selected");
				});
			}
		}

		/**
		* This function is used to clean up the list
		*/
		dispose()
		{
			this._selectedColumn = null;

			var i = this._lists.length;
			while (i--)
				this._lists[i].dispose();

			i = this._items.length;
			while (i--)
				this._items[i].dispose();
			
			this.element.off("dblclick", this._dClickProxy);
			this.element.off("click", this._clickProxy);
			jQuery(document).off("mousemove", this._moveProxy);
			jQuery(document).off("mouseup", this._upProxy);

			this._selectedItem = null;
			this._items = null;
			this._columns = null;
			this._lists = null;
			this._dClickProxy = null;
		}

		/**
		* Redraws the list with the items correctly synced with the column names
		* @returns {any} 
		*/
		updateItems()
		{
			this._fix.element.detach();
			var widths = [];

			//Clean up the fields
			i = this._items.length;
			while (i--)
				this._items[i].clearComponents();

			for (var i = 0; i < this._lists.length; i++)
			{
				widths.push(this._lists[i].element.width());
				this._lists[i].dispose();
			}



			this._lists = [];

			if ( this._mode == ListViewType.DETAILS)
			{
				var sortableColumn = this._sortableColumn;
				var totalW = 0;

				for (var i = 0; i < this._columns.length; i++)
				{
					var list: Component = <Component>this.addChild("<div class='list' " + (widths.length > 0 ? "style='width:" + widths[i] + "px;'" : "") + "></div>")
					this._lists.push(list);

					////Add closing border
					//if (i == this._columns.length - 1)
					//	list.element.css({ "border-right": "1px solid #ccc" });

					var header = new ListViewHeader(this._columns[i].text + (i == sortableColumn ? "   ▼" : ""), this._columns[i].image);
					list.addChild(header);

					var w = 0;
					//If the list is not on the DOM we need to add to get its real width
					var clone = header.element.clone();
					clone.css({ "float": "left" });
					jQuery("body").append(clone);
					w = clone.width() + 10;
					clone.remove();

					if (widths.length > 0 && widths[i] > w)
						w = widths[i];

					totalW += w;
					list.element.css({ "min-width": (w) + "px", "width": (w) + "px" });
				}

				this.element.append(this._fix.element);
				this.element.css({ "min-width": (totalW) + "px" });

				//Sort the items based on the sortable column

				this._items.sort(function (a, b)
				{
					if (sortableColumn < a.fields.length && sortableColumn < a.fields.length)
					{
						var fieldA = a.fields[sortableColumn].toString().toLowerCase();
						var fieldB = b.fields[sortableColumn].toString().toLowerCase();

						if (fieldA < fieldB)
							return -1;
						else if (fieldB < fieldA)
							return 1;
						else
							return 0;
					}
					else
						return 1;
				});

				//Now do each of the items
				for (var i = 0; i < this._items.length; i++)
					for (var ii = 0; ii < this._items[i].fields.length; ii++)
						if (ii < this._lists.length)
						{
							var comp = this._items[i].field(this._items[i].fields[ii]);

							this._lists[ii].addChild(comp);
						}
			}
			else
			{
				this.element.css({ "min-width": "" });

				//Now do each of the items
				for (var i = 0; i < this._items.length; i++)
				{
					var comp = this._items[i].preview(this._items[i].fields[1], this._imgSize);
					this.addChild(comp);
				}
			}
		}

		/**
		* Adds a column
		* @param {string} name The name of the new column
		* @param {string} image The image of the column
		*/
		addColumn(name : string, image : string = "")
		{
			this._columns.push( new ColumnItem( name, image ));
			this.updateItems();
		}

		/**
		* Removes a column
		* @param {string} name The name of the column to remove
		*/
		removeColumn(name)
		{
			if (this._columns.indexOf(name) != -1)
				this._columns.splice(this._columns.indexOf(name, 1));

			this.updateItems();
		}

		/**
		* Adds a {ListViewItem} to this list 
		* @param {ListViewItem} item The item we are adding to the list
		* @returns {ListViewItem} 
		*/
		addItem(item)
		{
			var toRet = item;
			this._items.push(toRet);
			item.rowNum = this._items.length;

			if ( this._mode == ListViewType.DETAILS)
			{
				for (var i = 0; i < item.fields.length; i++)
					if (i < this._lists.length)
					{
						var comp = item.field(item.fields[i]);
						this._lists[i].addChild(comp);
					}
			}
			else
			{
				var comp = item.preview(item.fields[1], this._imgSize);
				this.addChild(comp);
			}

			return toRet;
		}

		/**
		* Sets the length of a column by its index
		* @param <int> columnIndex The index of the column
		* @param {string} width A CSS width property. This can be either % or px
		* @returns {ListViewItem} 
		*/
		setColumnWidth(columnIndex, width)
		{
			if (this._lists.length > columnIndex)
				this._lists[columnIndex].element.css("width", width);

			this.updateItems();
		}

		/**
		* Removes a {ListViewItem} from this list 
		* @param {ListViewItem} item The {ListViewItem} to remove. 
		* @param {boolean} dispose If set to true the item will be disposed
		* @returns {ListViewItem} 
		*/
		removeItem(item: ListViewItem, dispose : boolean = true)
		{
			this._items.splice(this._items.indexOf(item), 1);
			if (dispose)
				item.dispose();

			return item;
		}

		/**
		* This function is used to remove all items from the list.
		* @param {boolean} dispose If set to true the item will be disposed
		*/
		clearItems(dispose : boolean = true)
		{
			var i = this._items.length;
			while (i--)
				if (dispose)
					this._items[i].dispose();

			this._items.splice(0, this._items.length);
		}

		get items(): Array<ListViewItem> { return this._items; }
		get lists(): Array<Component> { return this._lists; }
	}
}