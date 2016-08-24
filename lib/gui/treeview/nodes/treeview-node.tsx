module Animate {

    export class TreeViewNode {
        private _icon: JSX.Element;
        private _label: string;
        private _selected: boolean;
        private _nodes: TreeViewNode[];
        private _parent: TreeViewNode;
        private _treeview: ReactTreeView;

        /**
         * Creates an instance of the node
         */
        constructor(label: string, icon? : JSX.Element, children? : TreeViewNode[]) {
            this._treeview = null;
            this._label = label;
            this._icon = icon;
            this._selected = false;
            this._nodes = children || [];
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
         * @param {string} val
         * @returns {string}
         */
        selected(val?: boolean): boolean {

            if (val === undefined)
                return this._selected;

            this._selected = val;
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

        private invalidate() {
            if (this._treeview)
                this._treeview.invalidate();
        }

        /**
         * Sets the treeview associated with this node and its children
         * @param {ReactTreeView} treeview
         */
        setTreeview(treeview: ReactTreeView) {
            this._treeview = treeview;
            for (let n of this._nodes)
                n.setTreeview(treeview);
        }

        /**
         * Adds a child node
         * @param {TreeViewNode} node
         * @returns {TreeViewNode}
         */
        addNode(node: TreeViewNode) : TreeViewNode {
            this._nodes.push(node);
            node._parent = this;
            this._treeview = this._treeview;
            this.invalidate();
            return node;
        }

        /**
         * Removes a child node
         * @param {TreeViewNode} node
         */
        removeNode(node: TreeViewNode) {
            this._nodes.splice(this._nodes.indexOf(node), 1);
            node._treeview = null;
            node._parent = null;
            this.invalidate();
        }

        /**
         * Creates the parent treeview state object. The treeview will use this object as its propTree
         * state variable and render each property with a corresponding tree node component
         */
        render(level: number, index: number): JSX.Element {
            return (
                <TreeNodeComponent selected={this._selected} icon={this._icon} label={this._label} tree={this._treeview} key={'node-' + level + '-' + index}>
                    { this._nodes && this._nodes.map( (node, index) => {
                        return node.render(level + 1, index)
                    })}
                </TreeNodeComponent>
            )
        }
    }
}