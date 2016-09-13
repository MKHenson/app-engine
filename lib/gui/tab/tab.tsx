namespace Animate {

    export interface ITabProps {
        panes?: React.ReactElement<ITabPaneProps>[];
        className?: string;
    }

    export interface ITabState {
        selectedIndex: number;
    }

	/**
	 * A Tab Component for organising pages of content into separate labelled tabs/folders
	 */
    export class Tab extends React.Component<ITabProps, ITabState> {

        private _panes: React.ReactElement<ITabPaneProps>[];

		/**
		 * Creates a new instance of the tab
		 */
        constructor( props: ITabProps ) {
            super( props );
            this._panes = props.panes || [];
            this.state = {
                selectedIndex: 0
            };
        }

        /**
         * When the props are reset we remove all the existing panes and create the new ones
         */
        componentWillReceiveProps( nextProps: ITabProps ) {
            if ( this._panes !== nextProps.panes ) {
                this.clear();
                this._panes = nextProps.panes || [];
                this.setState( { selectedIndex: ( this.state.selectedIndex < this._panes.length ? this.state.selectedIndex : 0 ) });
            }
        }

		/**
		 * Removes a pane from from the tab
		 * @param {number} index The index of the selected tab
		 * @param {ITabPaneProps} props props of the selected tab
		 */
        removePane( index: number, prop: ITabPaneProps ) {

            let canClose: Promise<boolean>;
            if ( prop.canClose ) {
                let query = prop.canClose( index, prop );
                if ( typeof ( query ) === 'boolean' )
                    canClose = Promise.resolve( query );
                else
                    canClose = query as Promise<boolean>;
            }
            else
                canClose = Promise.resolve( true );

            canClose.then(( result ) => {
                if ( !result )
                    return;

                // Notify of its removal
                if ( prop.onDispose )
                    prop.onDispose( index, prop );

                this._panes.splice( index );
                this.setState( {
                    selectedIndex: ( this.state.selectedIndex === this._panes.length && index > 0 ? index - 1 : this.state.selectedIndex )
                });
            });
        }

        /**
         * Called when there are no panes for the tab and a custom view is desired
         */
        renderEmptyPanes() : JSX.Element {
            return null;
        }

		/**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element {

            const children = this._panes;

            return <div className={'tab' + (this.props.className ? ' ' + this.props.className : '' ) +
                    ( children.length > 0 ? ' has-panes' : ' no-panes' ) }>
                <div className="tab-labels">

                    {( children.length > 0 ?
                        <div className="tab-drop-button" onClick={( e ) => {
                            this.showContext( e );
                        } }>
                            <i className="fa fa-arrow-circle-down" aria-hidden="true"></i>
                        </div> : null
                    ) }
                    {
                        children.map(( pane, index ) => {
                            return <div key={'tab-' + index}
                                className={'tab-label' +
                                    ( index === this.state.selectedIndex ? ' selected' : '' ) }
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
                        }) }
                </div>
                <div className="tab-panes">
                    { children.length > 0 ? children[ this.state.selectedIndex ] :  this.renderEmptyPanes() }
                </div>
            </div>
        }

		/**
		 * When we select a tab
		 * @param {number} index The index of the selected tab
		 * @param {ITabPaneProps} props props of the selected tab
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

                this.setState( { selectedIndex: index })
            });
        }

		/**
		 * Select a panel by index
		 * @param {number} index
		 */
        selectByIndex( index: number ): ITabPaneProps {
            if ( !this._panes[ index ] )
                throw new Error( 'Tab index out of range' );

            this.onTabSelected( index, this._panes[ index ].props );
            return this._panes[ index ].props;
        }

		/**
		 * Select a panel by its label
		 * @param {string} label
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
		 * @param {ITabPaneProps} props
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
                            return this.setState( { selectedIndex: i });
                }
            });
        }

		/**
		 * Adds a dynamic pane to the tab
		 */
        addTab( pane: React.ReactElement<ITabPaneProps> ) {
            this._panes.push( pane );
            this.setState( {
                selectedIndex: this.state.selectedIndex
            });
        }

		/**
		 * Gets a tab's' props by its label
		 * @param {string} val The label text of the tab
		 * @returns {TabPair} The tab pair containing both the label and page {Component}s
		 */
        getPaneByLabel( label: string ): ITabPaneProps {
            const panes = this._panes;
            for ( let i = 0, l = panes.length; i < panes.length; i++ )
                if ( panes[ i ].props.label === label )
                    return panes[ i ].props;

            return null;
        }

		/**
		 * Called when the component is unmounted
		 */
        componentwillunmount() {
            const panes = this._panes;
            for ( let i = 0, l = panes.length; i < panes.length; i++ )
                if ( panes[ i ].props.onDispose )
                    panes[ i ].props.onDispose( i, panes[ i ].props );
        }

		/**
		 * Removes all panes from the tab
		 */
        clear() {

            // Notify of each pane's removal
            const panes = this._panes;
            for ( let i = 0, l = panes.length; i < panes.length; i++ )
                if ( panes[ i ].props.onDispose )
                    panes[ i ].props.onDispose( i, panes[ i ].props );

            this._panes.splice( 0, this._panes.length );
            this.setState( {
                selectedIndex: 0
            });
        }

		/**
		 * Gets an array of all the tab props
		 * @returns {ITabPaneProps[]}
		 */
        get panes(): ITabPaneProps[] {
            return this._panes.map( function ( pane ) {
                return pane.props;
            });
        }
    }
}