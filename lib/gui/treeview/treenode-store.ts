module Animate {

	/**
	 * This class is used to create tree view items.
	 */
	export class TreeNodeStore extends EventDispatcher {

		protected _children : TreeNodeModel[];
        protected _selectedNodes : TreeNodeModel[];
		protected _multiSelect: boolean;
		protected _onlySimilarNodeSelection: boolean;

		/**
		 * Creates a treenode store
		 */
		constructor(children : TreeNodeModel[] = []) {
			super();

			this._children = children;
            this._selectedNodes = [];
			this._multiSelect = true;
			this._onlySimilarNodeSelection = true;
		}

		/**
         * Adds a child node
         * @param {TreeNodeModel} node
         * @returns {TreeNodeModel}
         */
        addNode(node: TreeNodeModel) : TreeNodeModel {
            this._children.push(node);
            node.store = this;
            this.invalidate();
            return node;
        }

        /**
         * Removes a child node
         * @param {TreeNodeModel} node
         */
        removeNode(node: TreeNodeModel) {
			if (this._children.indexOf(node) == -1 )
				return;

            this._children.splice(this._children.indexOf(node), 1);
            node.store = null;
            this.invalidate();
        }

		/**
		 * Triggers a change in the tree structure
		 */
		invalidate() {
			this.emit(new Event('change'));
		}

		/**
		 * Called whenever the selection has changed
		 * @param {TreeNodeModel[]} selection
		 */
		onSelectionChange( selection : TreeNodeModel[] ) {

		}

		/**
         * Called whenever a node is selectable and clicked.
         * @param {TreeNodeModel} node
         * @param {React.MouseEvent} e
         */
        onNodeSelected( node: TreeNodeModel, e: React.MouseEvent ) {

			let clearSelection = false;

			if (this._multiSelect == false)
				clearSelection = true;
			else if ( this._multiSelect && !e.shiftKey)
				clearSelection = true;
			else if ( this._onlySimilarNodeSelection && this._selectedNodes.length > 0 && this._selectedNodes[0].constructor != node.constructor )
				clearSelection = true;

            // Deselect all nodes if either not multi select mode or shiftkey was not pressed
            if ( clearSelection ) {

				for (let n of this._selectedNodes)
					n.selected(false);

				this._selectedNodes.splice( 0, this._selectedNodes.length );

                this._selectedNodes.push( node );
                node.selected(true);
			}
            else {
                let selected = !node.selected();
                node.selected(selected);

                if (!selected)
                    this._selectedNodes.splice( this._selectedNodes.indexOf(node), 1 );
                else
                    this._selectedNodes.push( node );
            }

			this.onSelectionChange(this._selectedNodes);
        }

		/**
         * Called whenever the node receives a context event
         * @param {React.MouseEvent} e
		 * @param {TreeNodeModel} node
         */
        onContext(e: React.MouseEvent, node : TreeNodeModel) {

        }

		/**
		 * Gets the nodes associated with this store
		 */
		getNodes() : TreeNodeModel[] {
			return this._children;
		}
    }
}