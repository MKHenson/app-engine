module Animate {

    export class TreeNodeModel {
        private _icon: JSX.Element;
        private _label: string;
        private _selected: boolean;
        private _expanded: boolean;
        private _disabled: boolean;
        private _selectable: boolean;
        public children: TreeNodeModel[];
        protected _parent: TreeNodeModel;
        public store: TreeNodeStore;
        public focussed: boolean;

        /**
         * Creates an instance of the node
         */
        constructor(label: string, icon? : JSX.Element, children? : TreeNodeModel[]) {
            this._label = label;
            this._icon = icon;
            this._selectable = true;
            this._expanded = true;
            this._selected = false;
            this._disabled = false;
            this.children = children || null;
            this.store = null;
            this.focussed = false;
        }

        /**
         * Gets the parent node
         * @returns {TreeNodeModel}
         */
        get parent(): TreeNodeModel {
            return this._parent;
        }

        /**
         * Gets or sets the label of the node
         * @param {string} val
         * @returns {string}
         */
        label(val?: string): string {
            if (val === undefined)
                return this._label;

            this._label = val;
            this.invalidate();
            return val;
        }

        /**
         * Gets or sets if the node is selected
         * @param {boolean} val
         * @returns {boolean}
         */
        selected(val?: boolean): boolean {

            if (val === undefined)
                return this._selected;

            this._selected = val;
            this.invalidate();
            return val;
        }

        /**
         * Gets or sets if the node is disabled
         * @param {boolean} val
         * @returns {boolean}
         */
        disabled(val?: boolean): boolean {

            if (val === undefined)
                return this._disabled;

            this._disabled = val;
            this.invalidate();
            return val;
        }

        /**
         * Gets or sets if the node is selectable
         * @param {boolean} val
         * @returns {boolean}
         */
        selectable(val?: boolean): boolean {

            if (val === undefined)
                return this._selectable;

            this._selectable = val;
            this.invalidate();
            return val;
        }

        /**
         * Gets or sets if the node is expanded
         * @param {boolean} val
         * @returns {boolean}
         */
        expanded(val?: boolean): boolean {

            if (val === undefined)
                return this._expanded;

            this._expanded = val;
            this.invalidate();
            return val;
        }

        /**
         * Gets or sets the icon of the node
         * @param {JSX.Element} val
         * @returns {JSX.Element}
         */
        icon(val?: JSX.Element): JSX.Element {

            if (val === undefined)
                return this._icon;

            this._icon = val;
            this.invalidate();
            return val;
        }

        /**
         * Attempts to trigger a change event on the store
         */
        protected invalidate() {
            if (this.store)
                this.store.invalidate();
        }

        /**
         * Adds a child node
         * @param {TreeNodeModel} node
         * @returns {TreeNodeModel}
         */
        addNode(node: TreeNodeModel) : TreeNodeModel {
            this.children.push(node);
            node._parent = this;
            this.store = this.store;
            this.invalidate();
            return node;
        }

        /**
         * Removes a child node
         * @param {TreeNodeModel} node
         */
        removeNode(node: TreeNodeModel) {
            this.children.splice(this.children.indexOf(node), 1);
            //node._treeview.removeNode(this);
            node.store = null;
            node._parent = null;
            this.invalidate();
        }

        /**
         * Called whenever the node receives a context event
         * @param {React.MouseEvent} e
         */
        onContext(e: React.MouseEvent) {
            this.store.onContext(e, this);
        }

        /**
		 * This will recursively look through each of the nodes to find one with
		 * the specified name and value.
		 * @param {string} property The Javascript property on the node that we are evaluating
		 * @param {any} value The value of the property we are comparing.
		 * @returns {TreeNodeModel}
		 */
		findNode( property : string, value : any ) : TreeNodeModel {
			if ( this[property] == value )
				return this;

			let children = this.children;
			for ( let child of children ) {
				var n = child.findNode( property, value );
				if ( n != null )
					return n;
			}
		}
    }
}