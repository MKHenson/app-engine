module Animate {

	export interface IBehaviourPickerProps extends IReactWindowProps {
		onTemplateSelected?: (template: BehaviourDefinition) => void;
    }

	export interface IBehaviourPickerState extends IReactWindowState {
		items?: IListItem[];
		selectedIndex?: number;
		search? : string;
		selectedText?: string;
	}

	/**
	 * A popup form for quick selection of loaded behaviours
	 */
	export class BehaviourPicker extends ReactWindow<IBehaviourPickerProps, IBehaviourPickerState> {

		static defaultProps: IBehaviourPickerProps = {
			className: 'behaviour-picker',
			controlBox: false,
			canResize: false,
			autoCenter: false,
			modal: false
		}

		private _onUpProxy: any;

		/**
		 * Creates an instance of the picker
		 */
		constructor(props: IBehaviourPickerProps) {
			super(props);
			this._onUpProxy = this.onUp.bind(this);
			this.state = {
				items : [],
				selectedIndex: -1,
				search:'',
				selectedText: ''
			};
		}

		/**
		 * Close the window if we click anywhere but the window
		 */
		onUp( e: React.MouseEvent ) {
			const elm = this.refs['window'] as HTMLElement;
			let ref = e.target as HTMLElement;
			let wasWithinWindow = false;

			while ( ref ) {
				if (ref == elm) {
					wasWithinWindow = true;
					break;
				}

				ref = ref.parentElement;
			}

			if ( !wasWithinWindow )
				this.onClose();
		}

		/**
		 * Remove any listeners
		 */
		componentWillUnmount() {
			window.removeEventListener( 'mouseup', this._onUpProxy );
			super.componentWillUnmount();
		}

		/**
		 * Get all behaviour template names
		 */
		componentDidMount() {
			let items : IListItem[];
			let templates = PluginManager.getSingleton().behaviourTemplates.slice();

			templates = templates.sort( function ( a, b ) {
				var textA = a.behaviourName.toUpperCase();
				var textB = b.behaviourName.toUpperCase();
				return ( textA < textB ) ? -1 : ( textA > textB ) ? 1 : 0;
			});

			items = templates.map( function(t) {
				return { label: t.behaviourName, prefix: <i className="fa fa-cube" aria-hidden="true" /> } as IListItem;
			});

			this.setState({ items : items });
			super.componentDidMount();

			window.addEventListener( 'mouseup', this._onUpProxy );
		}

		/**
         * Gets the content JSX for the window. Typically this is the props.children, but can be overriden
         * in derived classes
         */
        getContent() : React.ReactNode {
            return <div className="container">
				<VInput type="text" autoFocus={true} placeholder="Behaviour Name" ref="input"
						hint={this.state.search}
						value={this.state.selectedText}
						onKeyUp={(e) => { this.onKeyUp(e) }}
						onChange={(e, newText) => {
							this.setState({ selectedText : newText  })
						}}
					/>
				<List
					canDeselect={false}
					selectedIndex={this.state.selectedIndex}
					items={this.state.items}
					onDSelected={( item, index ) => {
						if (this.props.onTemplateSelected)
							this.props.onTemplateSelected( PluginManager.getSingleton().getTemplate( item.label ) );

						this.onClose();
					}}
					onSelected={( item, index ) => {
						(ReactDOM.findDOMNode( this.refs['input'] ) as HTMLInputElement).focus();
						this.setState({
							selectedIndex: index,
							search: item.label,
							selectedText : item.label
						});
					}}
				/>
			</div>
        }

		/**
		 * When the input text changes we go through each list item and select the one that is the closest match
		 * @param {React.KeyboardEvent} e
		 */
		onKeyUp( e : React.KeyboardEvent ) {

			// If left or right - do nothing
			if ( e.keyCode == 39 || e.keyCode == 37 )
				return;

			// Check for up and down keys
			if ( e.keyCode == 38 || e.keyCode == 40 ) {
				e.preventDefault();
				e.stopPropagation();

				// Get the selected item and move it up and down
				let selected = this.state.selectedIndex;

				if ( selected != -1 ) {

					let items: number = this.state.items.length;

					// If up
					if ( e.keyCode == 38 ) {
						if ( selected - 1 < 0 )
							this.setState({
								selectedIndex : items - 1,
								search: this.state.items[items - 1].label,
								selectedText : this.state.items[items - 1].label
							});
						else
							this.setState({
								selectedIndex : selected - 1,
								search: this.state.items[selected - 1].label,
								selectedText : this.state.items[selected - 1].label
							});
					}
					// If down
					else {
						if ( selected + 1 < items )
							this.setState({
								selectedIndex : selected + 1,
								search: this.state.items[selected + 1].label,
								selectedText: this.state.items[selected + 1].label
							});
						else
							this.setState({
								selectedIndex : 0,
								search: this.state.items[0].label,
								selectedText: this.state.items[0].label
							});
					}
				}

				return;
			}


			// If enter is pressed we select the current item
			if ( e.keyCode == 13 ) {

				let selectedItem = this.state.items[this.state.selectedIndex];

				if (this.props.onTemplateSelected)
					this.props.onTemplateSelected( selectedItem ? PluginManager.getSingleton().getTemplate( selectedItem.label ) : null );

				this.onClose();
				return;
			}


			let items = this.state.items;
			for ( let i = 0, l = items.length; i < l; i++ ) {

				let v1 = items[i].label.toLowerCase();
				let v2 = (e.target as HTMLInputElement).value.toLowerCase();


				if ( v1.indexOf( v2 ) != -1 ) {
					let selectedItem = this.state.items[i];
					this.setState({
						selectedIndex : i,
						search: selectedItem.label
					});
					return;
				}
			}

			this.setState({
				search: (e.target as HTMLInputElement).value
			});
		}
	}
}