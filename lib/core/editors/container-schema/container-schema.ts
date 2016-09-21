namespace Animate {

    /**
     * An editor that represents the data of a container's inner behaviours and their relationships with eachother.
     * This editor is visualised through a schema component.
     */
    export class ContainerSchema extends Editor {
        public opened: boolean;
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

            this.deserialize( container.entry.json );
        }

        // protected createItem( action: IBehaviourCreated ): Behaviour {
        //     let toAdd: Behaviour;

        //     // if ( template.behaviourName === "Instance" ) {
        //     // 	var nameOfBehaviour: string = "";
        //     // 	var cyclic: boolean = this.isCyclicDependency( container, nameOfBehaviour );
        //     // 	if ( cyclic ) {
        //     // 		ReactWindow.show(MessageBox, { message : `You have a cylic dependency with the behaviour '${nameOfBehaviour}'` } as IMessageBoxProps);
        //     // 		return null;
        //     // 	}
        //     // 	toAdd = new BehaviourInstance( this, container );
        //     // }
        //     if ( action.template.behaviourName === 'Asset' )
        //         toAdd = new BehaviourAsset( action.resource );
        //     // else if (template.behaviourName === "Script")
        //     //     toAdd = new BehaviourScript(this, null, name );
        //     else
        //         toAdd = new Behaviour( action.template );

        //     this.addItem( toAdd );
        //     toAdd.alias = ( action.edits as Engine.Editor.IBehaviour ).alias;
        //     return toAdd
        // }

        // onAction( action: IContainerAction ): Engine.Editor.IContainerWorkspace {
        //     let newItem: CanvasItem;

        //     switch ( action.type ) {
        //         case 'behaviour-created':
        //             newItem = this.createItem( action as IBehaviourCreated );
        //             break;
        //         case 'comment-created':
        //             newItem = new Animate.Comment();
        //             this.addItem( newItem );
        //             break;
        //         case 'items-removed':
        //             this.removeItem( this._items[(action as IItemRemoved).id] );
        //             break;
        //         case 'selection-changed':
        //             // TODO:
        //             for (const id of (action as ISelectionChanged).selectedIds)
        //                 this._items[id].selected

        //             throw new Error('Not implemented');
        //     }

        //     if ( newItem ) {
        //         newItem.left = action.edits.left;
        //         newItem.top = action.edits.top;
        //     }

        //     return this.serialize();
        // }

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
        onNodeSelected( item: Engine.Editor.ICanvasItem, shiftDown: boolean, toggleSelectedState: boolean = true ) {

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
        onContext( item: Engine.Editor.ICanvasItem, e: React.MouseEvent ) {
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
        deserialize( scene: Engine.Editor.IContainerWorkspace ) {

            for ( const item of this._items )
                item.dispose();

            if ( !scene.items )
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
         */
        serialize(): Engine.Editor.IContainerWorkspace {
            let toRet: Engine.Editor.IContainerWorkspace = {
                items: [],
                properties: {}
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