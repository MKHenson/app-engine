module Animate
{
	// export class MenuListEvents extends ENUM {
	// 	constructor(v: string) { super(v); }

	// 	static ITEM_CLICKED: MenuListEvents = new MenuListEvents("menu_list_item_clicked");
	// }

	export interface IListItem {
		label: string;
		icon?: string;
		prefix?: JSX.Element;
	}

	export interface IListProps {
		items?: IListItem[];
		onSelected?: (item : IListItem) => void;
	}

	export interface IListState {
		selected: IListItem;
	}

	/**
	 * A list of items, with optional tooltips & icons
	 */
	export class List extends React.Component<IListProps, IListState>  {
		private _items: IListItem[];
		private _prevItems : IListItem[];

		/**
		 * Creates an instance
		 */
		constructor( props : IListProps ) {
			super(props);

			this._prevItems = props.items;
			this._items = props.items || [];
			this.state = {
				selected : null
			};
		}

		/**
         * Called when the props are updated
         */
        componentWillReceiveProps(nextProps: IListProps) {
			this._items = (nextProps.items !== this._prevItems ? ( nextProps.items || [] ) : this._items );
            this.setState({
                selected: null
            });
        }

		/**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element {
			return <div className='menu-list'> {
				this._items.map( ( item, index ) => {

					let jsx : JSX.Element;
					if (item.prefix)
						jsx = item.prefix;
					else if (item.icon)
						jsx = <img src={item.icon} />

					return <div key={'item-' + index}
						className={'menu-list-item light-hover' + ( this.state.selected == item ? ' selected' : '' )}
						onClick={(e) => { this.onItemSelected(e, item); }}>
						{jsx}
						<span className='menu-list-text'>{item.label}</span>
					</div>
				})
			}</div>;
		}

		/**
		 * Called whenever a list item is selected
		 */
		onItemSelected(e : React.MouseEvent, item : IListItem ) {
			if (this.props.onSelected)
				this.props.onSelected(item);

			this.setState({
				selected : item
			});
		}

		/**
		 * Add an item to the list
		 * @param {IListItem} item
		 * @returns {IListItem}
		 */
		addItem( item : IListItem ) : IListItem {
			this._items.push(item);
			this.setState({
				selected: this.state.selected
			});
			return item;
		}

		/**
		 * Removes an item from the list
		 * @param {IListItem} item
		 * @param {IListItem}
		 */
		removeItem( item : IListItem ) : IListItem {
			let selected = this.state.selected;

			if (this._items.indexOf(item) != -1) {
				this._items.splice(this._items.indexOf(item), 1);
				if (item == this.state.selected)
					selected = null;
			}

			this.setState({
				selected: selected
			});

			return item;
		}

		// /**
		// * Adds an HTML item
		// * @returns {string} img The URL of the image
        // * @returns {string} val The text of the item
        // * @returns {boolean} prepend True if you want to prepend as opposed to append
		// */
        // addItem(img: string, val: string, prepend?: boolean): JQuery  {
        //     var toRet = jQuery( "<div class='menu-list-item light-hover'>" + ( img ? "<img src='" + img + "' />" : "" ) + "<span class='menu-list-text'>" + val + "</span></div>" );
        //     this._items.push(toRet);
        //     if (!prepend)
        //         this.element.append(toRet);
        //     else
        //         this.element.prepend(toRet);
		// 	return toRet;
		// }

		// /**
		// * Removes an  item from this list
		// * @param {JQuery} item The jQuery object we are removing
		// */
		// removeItem( item : JQuery ) {
		// 	if ( item == this.selectedItem )
		// 		this.emit( MenuListEvents.ITEM_CLICKED, "" );

		// 	this._items.splice( jQuery.inArray( item, this.items ), 1 );
		// 	item.remove();
		// }

		/**
		 * Clears all the items added to this list
		 */
		clear() : void {
			this._items.splice( 0, this.items.length );
			this.setState({
				selected: this.state.selected
			});
		}

		// /**
		// * Checks if we selected an item - if so it closes the context and dispatches the ITEM_CLICKED event.
		// * @param {any} e The jQuery event object
		// */
		// onClick( e ) {
		// 	if ( this.selectedItem )
		// 		this.selectedItem.removeClass( "selected" );

		// 	this.selectedItem = null;

		// 	var targ = jQuery( e.target );
		// 	if ( targ.is( jQuery( ".menu-list-item" ) ) ) {
		// 		this.selectedItem = targ;
		// 		this.selectedItem.addClass( "selected" );
		// 		this.emit( MenuListEvents.ITEM_CLICKED, targ.text() );

		// 		e.preventDefault();
		// 		return;
		// 	}
		// 	else
		// 		this.emit( MenuListEvents.ITEM_CLICKED, "" );
		// }

		/**
		 * Gets the list items
		 * @returns {IListItem[]}
		 */
		get items(): IListItem[]
		{
			return this._items;
		}
	}
}