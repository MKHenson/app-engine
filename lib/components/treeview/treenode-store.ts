namespace Animate {

	/**
	 * This class is used to create tree view items.
	 */
    export class TreeNodeStore extends EventDispatcher {

        protected _children: TreeNodeModel[];
        protected _selectedNodes: TreeNodeModel[];
        protected _multiSelect: boolean;
        protected _onlySimilarNodeSelection: boolean;

		/**
		 * Creates a treenode store
		 */
        constructor( children: TreeNodeModel[] = [] ) {
            super();

            this._children = children;
            this._selectedNodes = [];
            this._multiSelect = true;
            this._onlySimilarNodeSelection = true;

            for ( let node of this._children )
                this.setStore( node );
        }

		/**
         * Adds a child node
         * @param node
         */
        addNode( node: TreeNodeModel ): TreeNodeModel {
            let children = this._children;
            children.push( node );
            node.store = this;
            this.invalidate();
            return node;
        }

        /**
         * Removes a child node
         * @param node
         */
        removeNode( node: TreeNodeModel ) {
            let children = this._children;
            let selection = this._selectedNodes;
            if ( children.indexOf( node ) === -1 )
                throw new Error( 'Node must be child of store in order to remove it' );

            children.splice( children.indexOf( node ), 1 );
            if ( selection.indexOf( node ) !== -1 )
                selection.splice( selection.indexOf( node ), 1 );

            node.dispose();
            this.invalidate();
        }

		/**
		 * Removes all nodes from the store
		 */
        clear() {
            for ( let node of this._children )
                this.removeNode( node );
        }

		/**
		 * Triggers a change in the tree structure
		 */
        invalidate() {
            this.emit<TreeviewEvents, void>( 'change', null );
        }

		/**
		 * Called whenever the selection has changed
		 * @param selection
		 */
        onSelectionChange( selection: TreeNodeModel[] ) {

        }

		/**
         * Called whenever a node is selectable and clicked.
         * @param node
         * @param shiftDown
         */
        onNodeSelected( node: TreeNodeModel, shiftDown: boolean, toggleSelectedState: boolean = true ) {

            let clearSelection = false;
            let selection = this._selectedNodes;

            if ( this._multiSelect === false )
                clearSelection = true;
            else if ( this._multiSelect && !shiftDown )
                clearSelection = true;
            else if ( this._onlySimilarNodeSelection && selection.length > 0 && selection[ 0 ].constructor !== node.constructor )
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
		 * Sets the store of the node and all its children to be this store
		 */
        public setStore( node: TreeNodeModel ) {
            node.store = this;
            for ( let n of node.children )
                this.setStore( n );
        }

        private unFocus( node: TreeNodeModel ) {
            node.focussed = false;
            for ( let n of node.children )
                this.unFocus( n );
        }

		/**
         * Called whenever the node receives a context event
         * @param e
		 * @param node
         */
        onContext( e: React.MouseEvent, node: TreeNodeModel ) {

        }

		/**
		 * This will recursively look through each of the nodes to find a node with
		 * the specified name.
		 * @param property The name property we are evaluating
		 * @param value The object we should be comparing against
		 */
        findNode( property: string, value: any ): TreeNodeModel {
            let children = this._children;
            for ( let child of children ) {
                const n = child.findNode( property, value );
                if ( n !== null )
                    return n;
            }
        }

		/**
		 * Selects a node manually. This will also bring the focus into node
		 */
        selectNode( node: TreeNodeModel ) {
            this.onNodeSelected( node, false );

            for ( let n of node.children )
                this.unFocus( n );

            // Make sure the tree node is expanded
            let p = node.parent;
            while ( p ) {
                if ( !p.expanded )
                    p.expanded( true );

                p = p.parent;
            }

            node.focussed = true;
            this.emit<TreeviewEvents, INodeEvent>( 'focus-node', { node: node });
        }

		/**
		 * Gets the nodes associated with this store
		 */
        getNodes(): TreeNodeModel[] {
            return this._children;
        }

		/**
		 * Gets the currently selected nodes
		 */
        getSelectedNodes(): TreeNodeModel[] {
            return this._selectedNodes;
        }
    }
}