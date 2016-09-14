namespace Animate {

    /**
     * Acts as a store/container of the various items that can be interacted with by the user
     * when they open a container. Think of this as the model of a Container's inner components.
     */
    export class ContainerWorkspace extends EventDispatcher {
        public opened: boolean;
        private _container: Resources.Container;
        protected _items: CanvasItem[];
        protected _selection: CanvasItem[];

        /**
         * Creates an instance of the canvas store
         */
        constructor( container: Resources.Container, items: CanvasItem[] = [] ) {
            super();
            this._container = container;
            this._items = items;
            this._selection = [];
            this.opened = false;
        }

        /**
         * Gets the container this workspace represents
         * @returns {Resources.Container}
         */
        get container(): Resources.Container {
            return this._container;
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
         * De-serializes the workspace from its JSON format
         * @param {Engine.Editor.IContainerWorkspace} scene
         */
        deserialize( scene: Engine.Editor.IContainerWorkspace ) {

            for ( const item of this._items )
                item.dispose();

            if (!scene.items)
                scene.items = [];

            let canvasItem: CanvasItem;
            let manager = PluginManager.getSingleton();

            for ( const item of scene.items ) {
                switch ( item.type ) {
                    case 'comment':
                        canvasItem = new Comment(( item as Engine.Editor.IComment ).label );
                        break;
                    case 'behaviour':
                        canvasItem = new Behaviour( manager.getTemplate(( item as Engine.Editor.IBehaviour ).behaviourType ) );
                        break;
                    case 'asset':
                        canvasItem = new BehaviourAsset( null );
                        break;
                }

                canvasItem.deSerialize( item );
                this.addItem( canvasItem );
            }
        }

        /**
         * Serializes the workspace into its JSON format
         * @returns {Engine.Editor.IContainerWorkspace}
         */
        serialize(): Engine.Editor.IContainerWorkspace {

            let id = 1;
            let toRet: Engine.Editor.IContainerWorkspace = {
                items: [],
                properties: {}
            };


            for ( let item of this._items ) {
                let token = item.serialize( id );
                id++;
                toRet.items.push( token );
            }

            return toRet;
        }

        /**
		 * Triggers a change in the tree structure
		 */
        invalidate() {
            this.emit<WorkspaceEvents, void>( 'change' );
        }
    }
}