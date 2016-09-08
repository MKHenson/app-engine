namespace Animate {

    /**
     * A store of various diagram items
     */
    export class CanvasStore extends EventDispatcher {

        protected _items: CanvasItem[];
        protected _selection: CanvasItem[];

        /**
         * Creates an instance of the canvas store
         */
        constructor( items: CanvasItem[] = [] ) {
            super();
            this._items = items;
            this._selection = [];
        }

        /**
         * Returns all items of this store
         * @returns {CanvasItem[]}
         */
        getItems(): CanvasItem[] {
            return this._items;
        }

        /**
         * Returns the currrently selected items
         * @returns {CanvasItem[]}
         */
        getSelection(): CanvasItem[] {
            return this._selection;
        }

        /**
         * Called whenever an item is clicked.
         * @param {CanvasItem} node
         * @param {boolean} shiftDown
         */
        onNodeSelected( node: CanvasItem, shiftDown: boolean, toggleSelectedState: boolean = true ) {

            let clearSelection = false;
            let selection = this._selection;

            if ( !shiftDown )
                clearSelection = true;

            // Deselect all nodes if either not multi select mode or shiftkey was not pressed
            if ( clearSelection ) {

                for ( let n of selection )
                    n.selected( false );

                selection.splice( 0, selection.length );

                if ( node ) {
                    selection.push( node );
                    node.selected( true );
                }
            }
            else if ( node ) {
                let selected = ( toggleSelectedState ? !node.selected() : node.selected() );
                node.selected( selected );

                if ( !selected && selection.indexOf( node ) !== -1 )
                    selection.splice( selection.indexOf( node ), 1 );
                else if ( selection.indexOf( node ) === -1 )
                    selection.push( node );
            }

            this.onSelectionChange( selection );
        }

        /**
		 * Called whenever the selection has changed
		 * @param {CanvasItem[]} selection
		 */
        onSelectionChange( selection: CanvasItem[] ) {
        }

        /**
         * Adds a canvas item to the canvas
         * @param {CanvasItem} item
         * @returns {CanvasItem}
         */
        addItem( item: CanvasItem ): CanvasItem {
            if ( this._items.indexOf( item ) !== -1 )
                return item;

            this._items.push( item );
            this.invalidate();
            item.store = this;
            return item;
        }

        /**
         * Removes a canvas item from the canvas
         * @param {CanvasItem} item
         */
        removeItem( item: CanvasItem ) {
            if ( this._items.indexOf( item ) !== -1 )
                this._items.splice( this._items.indexOf( item ), 1 );

            this.invalidate();
            item.dispose();
        }

        /**
         * Gets all the canvas items in a serialized array
         * @returns {ICanvasItem[]}
         */
        serialize(): Engine.Editor.ICanvasItem[] {
            let toRet: Engine.Editor.ICanvasItem[] = [];
            let id = 1;

            for ( let item of this._items ) {
                let token = item.serialize( id );
                id++;
                toRet.push( token );
            }

            return toRet;
        }

        /**
		 * Triggers a change in the tree structure
		 */
        invalidate() {
            this.emit( new Event( 'change' ) );
        }
    }
}