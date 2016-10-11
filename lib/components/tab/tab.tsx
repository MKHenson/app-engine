namespace Animate {

    export interface ITabProps {
        panes?: React.ReactElement<ITabPaneProps>[];
        className?: string;
    }

    export interface ITabState {
        selectedIndex: number;
    }

	/**
	 * A Tab Component for organising pages of content into separate labelled tabs/components
	 */
    export class Tab<T extends ITabProps, Y extends ITabState> extends React.Component<T, Y> {

        private _panes: React.ReactElement<ITabPaneProps>[];
        private _disposed: boolean;
        private _waitingOnPromise: boolean;

		/**
		 * Creates a new instance of the tab
		 */
        constructor( props: T ) {
            super( props );
            this._panes = props.panes || [];
            this._disposed = false;
            this._waitingOnPromise = false;
            this.state = {
                selectedIndex: props.panes.length > 0 ? 0 : -1
            } as Y;
        }

        /**
         * When the props are reset we remove all the existing panes and create the new ones
         */
        componentWillReceiveProps( nextProps: ITabProps ) {
            if ( this._panes !== nextProps.panes ) {

                // Cancel any existing promises
                if ( this._waitingOnPromise )
                    this._waitingOnPromise = false;

                this.clear();
                this._panes = nextProps.panes || [];
                this.setState( { selectedIndex: ( this.state.selectedIndex < this._panes.length ? this.state.selectedIndex : 0 ) } as Y );
            }
        }

        /**
         * Check if we need to notify the onSelect event
         */
        componentDidMount() {
            if ( this.state.selectedIndex == 0 && this._panes[ this.state.selectedIndex ].props.onSelect )
                this._panes[ this.state.selectedIndex ].props.onSelect( this.state.selectedIndex );
        }

        componentWillUnmount() {
            this._disposed = true;
        }

        /**
         * Check if the index changes so we can notify the onSelect event
         */
        componentDidUpdate( prevProps: T, prevState: Y ) {
            if ( prevState.selectedIndex !== this.state.selectedIndex )
                if ( this._panes[ this.state.selectedIndex ].props.onSelect )
                    this._panes[ this.state.selectedIndex ].props.onSelect( this.state.selectedIndex );
        }

		/**
		 * Removes a pane from from the tab
		 * @param index The index of the selected tab
		 * @param props props of the selected tab
		 */
        private removePane( index: number, prop: ITabPaneProps ) {

            let canClose: Promise<boolean> | boolean;
            if ( prop.canClose ) {
                canClose = prop.canClose( index, prop );
            }
            else
                canClose = true;

            if ( typeof ( canClose ) === 'boolean' ) {
                if ( canClose )
                    this.disposePane( index, prop );
            }
            else {
                this._waitingOnPromise = true;
                ( canClose as Promise<boolean> ).then(( result ) => {

                    // Its possible the wait was cancelled externally while waiting (props could have been reset).
                    // In that case we just exit
                    if ( !this._waitingOnPromise )
                        return;

                    this._waitingOnPromise = false;
                    if ( result )
                        this.disposePane( index, prop );
                });
            }
        }

        /**
         * Internal function that removes the pane reference, disposes it and sets a new index
         */
        private disposePane( index: number, prop: ITabPaneProps ) {
            this._panes.splice( index, 1 );

            // Notify of its removal
            if ( prop.onDispose )
                prop.onDispose( index, prop );

            if ( this._disposed )
                return;

            this.setState( {
                selectedIndex: ( this.state.selectedIndex === this._panes.length && index > 0 ? index - 1 : this.state.selectedIndex )
            } as Y );
        }

		/**
         * Creates the component elements
         */
        render(): JSX.Element {

            const children = this._panes;

            return <div className={'tab' + ( this.props.className ? ' ' + this.props.className : '' ) +
                ( children.length > 0 ? ' has-panes' : ' no-panes' )}>
                <div className="tab-labels">

                    {( children.length > 0 ?
                        <div className="tab-drop-button" onClick={( e ) => {
                            this.showContext( e );
                        } }>
                            <i className="fa fa-arrow-circle-down" aria-hidden="true"></i>
                        </div> : null
                    )}
                    {
                        children.map(( pane, index ) => {
                            return <div key={'tab-' + index}
                                className={'tab-label' +
                                    ( index === this.state.selectedIndex ? ' selected' : '' )}
                                onClick={() =>
                                    this.onTabSelected( index, pane.props )
                                }
                                >
                                <div className="text">
                                    <span className="content">{pane.props.label}</span>
                                </div>
                                {
                                    pane.props.showCloseButton ?
                                        <div className="tab-close"
                                            onClick={( e ) => {
                                                e.stopPropagation();
                                                this.removePane( index, pane.props )
                                            } }>X
                                        </div> : null
                                }
                            </div>
                        })}
                </div>
                <div className="tab-panes">
                    {children.length > 0 ? children[ this.state.selectedIndex ] : null}
                </div>
            </div>
        }

		/**
		 * When we select a tab
		 * @param index The index of the selected tab
		 * @param props props of the selected tab
		 */
        onTabSelected( index: number, props: ITabPaneProps ) {

            let canSelect: Promise<boolean>;
            if ( props.canSelect ) {
                let query = props.canSelect( index, props );
                if ( typeof ( query ) === 'boolean' )
                    canSelect = Promise.resolve( query );
                else
                    canSelect = query as Promise<boolean>;
            }
            else
                canSelect = Promise.resolve( true );

            canSelect.then(( result ) => {
                if ( !result )
                    return;

                this.setState( { selectedIndex: index } as Y )
            });
        }

		/**
		 * Select a panel by index
		 * @param index
		 */
        selectByIndex( index: number ): ITabPaneProps {
            if ( !this._panes[ index ] )
                throw new Error( 'Tab index out of range' );

            this.onTabSelected( index, this._panes[ index ].props );
            return this._panes[ index ].props;
        }

		/**
		 * Select a panel by its label
		 * @param label
		 */
        selectByLabel( label: string ): ITabPaneProps {
            let panes = this._panes;
            for ( let i = 0, l = panes.length; i < l; i++ )
                if ( panes[ i ].props.label === label ) {
                    this.onTabSelected( i, panes[ i ].props );
                    return panes[ i ].props;
                }

            throw new Error( 'Could not find pane with the label: ' + label );
        }

		/**
		 * Select a panel by its property object
		 * @param props
		 */
        selectByProps( props: ITabPaneProps ): ITabPaneProps {
            let panes = this._panes;
            for ( let i = 0, l = panes.length; i < l; i++ )
                if ( panes[ i ].props === props ) {
                    this.onTabSelected( i, panes[ i ].props );
                    return panes[ i ].props;
                }

            throw new Error( 'Could not find pane with those props' );
        }

		/**
		 * Shows the context menu
		 */
        showContext( e: React.MouseEvent ) {
            let items: IReactContextMenuItem[] = [];
            let panes = this._panes;
            for ( let pane of panes )
                items.push( { label: pane.props.label });

            ReactContextMenu.show( {
                x: e.pageX, y: e.pageY, items: items, onChange: ( item ) => {
                    for ( let i = 0, l = panes.length; i < l; i++ )
                        if ( panes[ i ].props.label === item.label )
                            return this.setState( { selectedIndex: i } as Y );
                }
            });
        }

		/**
		 * Adds a dynamic pane to the tab
		 */
        addTab( pane: React.ReactElement<ITabPaneProps> ) {
            this._panes.push( pane );
            this.setState( {
                selectedIndex: this._panes.length - 1
            } as Y );
        }

        removeTabByLabel( label: string ) {
            let panes = this._panes;
            for ( let i = 0, l = panes.length; i < l; i++ )
                if ( panes[ i ].props.label === label )
                    return this.removePane( i, panes[ i ].props );

            throw new Error( 'Could not find pane with that label' );
        }

		/**
		 * Gets a tab's' props by its label
		 * @param val The label text of the tab
		 * @returns The tab pair containing both the label and page {Component}s
		 */
        getPaneByLabel( label: string ): ITabPaneProps {
            const panes = this._panes;
            for ( let i = 0, l = panes.length; i < l; i++ )
                if ( panes[ i ].props.label === label )
                    return panes[ i ].props;

            return null;
        }

		/**
		 * Called when the component is unmounted
		 */
        componentwillunmount() {
            const panes = this._panes;
            for ( let i = 0, l = panes.length; i < l; i++ )
                if ( panes[ i ].props.onDispose )
                    panes[ i ].props.onDispose( i, panes[ i ].props );
        }

		/**
		 * Removes all panes from the tab
		 */
        clear() {

            // Notify of each pane's removal
            const panes = this._panes;
            for ( let i = 0, l = panes.length; i < l; i++ )
                if ( panes[ i ].props.onDispose )
                    panes[ i ].props.onDispose( i, panes[ i ].props );

            this._panes.splice( 0, this._panes.length );
            this.setState( {
                selectedIndex: 0
            } as Y );
        }

		/**
		 * Gets an array of all the tab props
		 */
        get panes(): ITabPaneProps[] {
            return this._panes.map( function( pane ) {
                return pane.props;
            });
        }
    }
}