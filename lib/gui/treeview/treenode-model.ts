namespace Animate {

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
        public canDrag: boolean;
        public canDrop: boolean;

        /**
         * Creates an instance of the node
         */
        constructor( label: string, icon?: JSX.Element, children?: TreeNodeModel[] ) {
            this._label = label;
            this._icon = icon;
            this._selectable = true;
            this._expanded = true;
            this._selected = false;
            this._disabled = false;
            this.children = children || [];
            this.store = null;
            this.focussed = false;
            this.canDrag = false;
            this.canDrop = false;
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
        label( val?: string ): string {
            if ( val === undefined )
                return this._label;

            this._label = val;
            this.invalidate();
            return val;
        }

        /**
         * Called whenever we start dragging. This is only called if canDrag is true.
         * Use it to set drag data, eg: e.dataTransfer.setData("text", 'some data');
         * @param {React.DragEvent} e
         * @returns {IDragDropToken} Return data to serialize
         */
        onDragStart( e: React.DragEvent ): IDragDropToken {
            return null;
        }

        /**
         * Called whenever we drop an item on this element. This is only called if canDrop is true.
         * Use it to set drag data, eg: e.dataTransfer.getData("text");
         * @param {React.DragEvent} e
         * @param {IDragDropToken} json The unserialized data
         */
        onDragDrop( e: React.DragEvent, json: IDragDropToken ) {

        }

        /**
         * Gets or sets if the node is selected
         * @param {boolean} val
         * @returns {boolean}
         */
        selected( val?: boolean ): boolean {

            if ( val === undefined )
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
        disabled( val?: boolean ): boolean {

            if ( val === undefined )
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
        selectable( val?: boolean ): boolean {

            if ( val === undefined )
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
        expanded( val?: boolean ): boolean {

            if ( val === undefined )
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
        icon( val?: JSX.Element ): JSX.Element {

            if ( val === undefined )
                return this._icon;

            this._icon = val;
            this.invalidate();
            return val;
        }

        /**
         * Attempts to trigger a change event on the store
         */
        protected invalidate() {
            if ( this.store )
                this.store.invalidate();
        }

        /**
         * Adds a child node
         * @param {TreeNodeModel} node
         * @returns {TreeNodeModel}
         */
        addNode( node: TreeNodeModel ): TreeNodeModel {
            this.children.push( node );
            node._parent = this;
            node.store = this.store;
            this.invalidate();
            return node;
        }

        /**
         * Removes a child node
         * @param {TreeNodeModel} node
         */
        removeNode( node: TreeNodeModel ) {
            if ( this.store ) {
                let selectedNodes = this.store.getSelectedNodes();
                if ( selectedNodes.indexOf( this ) !== -1 )
                    selectedNodes.splice( selectedNodes.indexOf( this ), 1 );
            }

            this.children.splice( this.children.indexOf( node ), 1 );
            node.dispose();
            this.invalidate();
        }

        /**
         * Called whenever the node receives a context event
         * @param {React.MouseEvent} e
         */
        onContext( e: React.MouseEvent ) {
            this.store.onContext( e, this );
        }

        /**
		 * This will recursively look through each of the nodes to find one with
		 * the specified name and value.
		 * @param {string} property The Javascript property on the node that we are evaluating
		 * @param {any} value The value of the property we are comparing.
		 * @returns {TreeNodeModel}
		 */
        findNode( property: string, value: any ): TreeNodeModel {
            if ( this[ property ] === value )
                return this;

            let children = this.children;
            for ( let child of children ) {
                const n = child.findNode( property, value );
                if ( n !== null )
                    return n;
            }
        }

        /**
		 * This will cleanup the model
		 */
        dispose() {
            for ( let node of this.children )
                this.removeNode( node );

            this.children = null;
            this._parent = null;
            this.store = null;
        }
    }
}