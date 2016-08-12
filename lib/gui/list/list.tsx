module Animate
{
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
			return <div className='list'> {
				this._items.map( ( item, index ) => {

					let jsx : JSX.Element;
					if (item.prefix)
						jsx = item.prefix;
					else if (item.icon)
						jsx = <img src={item.icon} />

					return <div key={'item-' + index}
						className={'list-item light-hover' + ( this.state.selected == item ? ' selected' : '' )}
						onClick={(e) => { this.onItemSelected(e, item); }}>
						{jsx}
						<span className='list-text'>{item.label}</span>
					</div>
				})
			}</div>;
		}

		/**
		 * Called whenever a list item is selected
		 */
		onItemSelected(e : React.MouseEvent, item : IListItem ) {
			let selected = ( this.state.selected == item ? null : item );

			if (this.props.onSelected)
				this.props.onSelected(selected);

			this.setState({
				selected : selected
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

		/**
		 * Clears all the items added to this list
		 */
		clear() : void {
			this._items.splice( 0, this.items.length );
			this.setState({
				selected: this.state.selected
			});
		}

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