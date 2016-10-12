namespace Animate {
    export interface IListItem {
        label: string;
        icon?: string;
        prefix?: JSX.Element;
    }

    export interface IListProps {
        items: IListItem[] | null;
        onSelected?: ( item: IListItem, index: number ) => void;
        onDSelected?: ( item: IListItem, index: number ) => void;
        selectedIndex?: number;
        canDeselect?: boolean;
    }

    export interface IListState {
        selected?: IListItem | null;
        selectedIndex?: number;
    }

	/**
	 * A list of items, with optional tooltips & icons
	 */
    export class List extends React.Component<IListProps, IListState>  {
        static defaultProps: IListProps = {
            selectedIndex: -1,
            items: null,
            canDeselect: true
        }
        private _prevItems: IListItem[];

		/**
		 * Creates an instance
		 */
        constructor( props: IListProps ) {
            super( props );

            this._prevItems = props.items!;
            this.state = {
                selected: null,
                selectedIndex: props.selectedIndex
            };
        }

		/**
         * Called when the props are updated
         */
        componentWillReceiveProps( nextProps: IListProps ) {

            let selectedIndex = this.state.selectedIndex;

            if ( nextProps.selectedIndex !== undefined && nextProps.selectedIndex !== this.props.selectedIndex ) {
                selectedIndex = nextProps.selectedIndex;

                if ( selectedIndex > this.props.items!.length )
                    throw new Error( 'Selected index out of range' )

                this.setState( {
                    selected: this.props.items![ selectedIndex ],
                    selectedIndex: selectedIndex
                });
            }
            else {
                this.setState( {
                    selected: this.state.selected,
                    selectedIndex: selectedIndex
                });
            }
        }

		/**
         * Creates the component elements
         */
        render(): JSX.Element {
            return <div className="list"> {
                this.props.items!.map(( item, index ) => {

                    let jsx: JSX.Element | undefined;
                    if ( item.prefix )
                        jsx = item.prefix;
                    else if ( item.icon )
                        jsx = <img src={item.icon} />

                    return <div key={'item-' + index}
                        ref={( this.state.selectedIndex === index ? 'selected-item' : '' )}
                        className={'list-item light-hover' + ( this.state.selectedIndex === index ? ' selected' : '' )}
                        onClick={( e ) => { this.onItemSelected( e, item, index, false ); } }
                        onDoubleClick={( e ) => { this.onItemSelected( e, item, index, true ); } }
                        >
                        {jsx}
                        <span className="list-text">{item.label}</span>
                    </div>
                })
            }</div>;
        }

        componentDidUpdate( prevProps: IListProps ) {
            // only scroll into view if the active item changed last render
            if ( this.props.selectedIndex !== prevProps.selectedIndex ) {
                const item = this.refs[ 'selected-item' ] as HTMLElement;
                if ( item ) {
                    const y = item.offsetTop - item.offsetHeight;
                    if ( y < item.parentElement.scrollTop || y > item.parentElement.scrollTop + item.parentElement.offsetHeight )
                        Utils.scrollTo( { x: 0, y: y }, item.parentElement, 250 );
                }
            }
        }

		/**
		 * Called whenever a list item is selected
		 */
        onItemSelected( e: React.MouseEvent, item: IListItem, index: number, doubleClick: boolean ) {

            let selected;

            if ( this.props.canDeselect )
                selected = ( this.state.selected === item ? null : item );
            else
                selected = item;

            this.setState( {
                selected: selected,
                selectedIndex: index
            });

            if ( !doubleClick && this.props.onSelected )
                this.props.onSelected( selected, index );
            else if ( doubleClick && this.props.onDSelected )
                this.props.onDSelected( selected, index );
        }
    }
}