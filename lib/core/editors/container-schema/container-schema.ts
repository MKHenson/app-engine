namespace Animate {

    /**
     * An editor that represents the data of a container's inner behaviours and their relationships with eachother.
     * This editor is visualised through a schema component.
     */
    export class ContainerSchema extends Editor {
        public opened: boolean;
        protected _activeLink: Link;
        protected _items: CanvasItem[];
        protected _selection: CanvasItem[];

        /**
         * Creates an instance of the canvas store
         */
        constructor( container: Resources.Container, project: Project ) {
            super( container, project );
            this._items = [];
            this._selection = [];
            this.opened = false;
            this._activeLink = null;

            this.deserialize( container.entry.json );
        }

        /**
         * Begins the process of creating a link between behaviours.
         * This should be followed by a call to endLinkRouting when
         * the process is completed
         */
        beginLinkRouting( portal : IPortal, pos: Point ) {
            this._activeLink = new Link();
            this._activeLink.startPortal = portal.name;
            this._activeLink.startBehaviour = portal.behaviour;
            this._activeLink.top = pos.y;
            this._activeLink.left = pos.x;
            this.invalidate();
        }

        /**
         * Completes the process of linking two behaviours together
         */
        endLinkRouting( options: ILinkItem ) {
            if ( options )
                this.doAction( new Actions.LinkCreated( options) );

            this._activeLink.dispose();
            this._activeLink = null;
            this.invalidate();
        }

        get activeLink() : Link {
            return this._activeLink;
        }

        /**
         * Returns all items of this store
         */
        getItems(): CanvasItem[] {
            return this._items;
        }

        /**
         * Returns the currrently selected items
         */
        getSelection(): CanvasItem[] {
            return this._selection;
        }

        /**
         * Called whenever an item is clicked.
         */
        onNodeSelected( item: ICanvasItem, shiftDown: boolean, toggleSelectedState: boolean = true ) {

            let clearSelection = false;
            const prevSelection = this._selection.slice();
            let previousNumSelected = this._selection.length;
            let selection = this._selection;
            let node: CanvasItem = null;
            const selectedIds = [];
            const items = this._items;

            // Check if the item exists
            if ( item )
                node = this._items[ item.id ];

            if ( !shiftDown )
                clearSelection = true;

            // Deselect all nodes if either not multi select mode or shiftkey was not pressed
            if ( clearSelection ) {

                selection.splice( 0, selection.length );

                if ( node )
                    selection.push( node );
            }
            else if ( node ) {
                let selected = ( toggleSelectedState ? !node.selected : node.selected );

                if ( !selected && selection.indexOf( node ) !== -1 )
                    selection.splice( selection.indexOf( node ), 1 );
                else if ( selection.indexOf( node ) === -1 )
                    selection.push( node );
            }

            // Do nothing if no changes
            if ( previousNumSelected === 0 && selection.length === 0 )
                return;

            let selectionChanged = ( previousNumSelected !== selection.length ? true : false );

            if (!selectionChanged) {
                for ( let i = 0, l = prevSelection.length; i < l; i++ )
                    if ( prevSelection[ i ] !== selection[ i ] ) {
                        selectionChanged = true;
                        break;
                    }
            }

            for ( const item of selection )
                selectedIds.push( items.indexOf( item ) );

            if ( selectionChanged )
                this.doAction( new Actions.SelectionChanged( selectedIds ) );
        }

        /**
         * Whenever we receive a context event on an item
         */
        onContext( item: ICanvasItem, e: React.MouseEvent ) {
            let node = this._items[ item.id ];
            node.onContext( e );
        }

        /**
         * Adds a canvas item to the canvas
         * @param item The item to add
         */
        addItem( item: CanvasItem ): CanvasItem {
            if ( this._items.indexOf( item ) !== -1 )
                return item;

            this._items.push( item );
            item.store = this;
            return item;
        }

        /**
         * Removes a canvas item from the canvas
         * @param item The item to remove
         */
        removeItem( item: CanvasItem ) {
            if ( this._items.indexOf( item ) !== -1 )
                this._items.splice( this._items.indexOf( item ), 1 );

            item.dispose();
        }

        /**
         * De-serializes the workspace from its JSON format
         * @param scene The schema scene we are loading from
         */
        deserialize( scene: HatcheryServer.IContainerWorkspace ) {

            for ( const item of this._items )
                item.dispose();

            if ( !scene.items )
                scene.items = [];

            let canvasItem: CanvasItem;
            let manager = PluginManager.getSingleton();

            for ( const item of scene.items ) {
                switch ( item.type ) {
                    case 'comment':
                        canvasItem = new Comment(( item as IComment ).label );
                        break;
                    case 'behaviour':
                        canvasItem = new Behaviour( manager.getTemplate(( item as IBehaviour ).behaviourType ) );
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
         */
        serialize(): HatcheryServer.IContainerWorkspace {
            let toRet: HatcheryServer.IContainerWorkspace = {
                items: [],
                properties: {},
                activeLink: ( this._activeLink ? this._activeLink.serialize( -1 ) : null )
            };

            for ( let i = 0, l = this._items.length; i < l; i++ ) {
                let item = this._items[ i ];
                let token = item.serialize( i );
                toRet.items.push( token );
            }

            return toRet;
        }
    }
}