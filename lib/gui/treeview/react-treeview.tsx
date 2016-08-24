module Animate {

    export interface IReactTreeViewProps {
        nodes: TreeViewNode[];
        multiSelect?: boolean;
    }

    export interface IReactTreeViewState {
    }

	/**
	 * This class is used to create tree view items.
	 */
	export class ReactTreeView extends React.Component<IReactTreeViewProps, IReactTreeViewState> {
        static defaultProps: IReactTreeViewProps = {
            multiSelect: true,
            nodes: null
        };

        private _nodes : TreeViewNode[];
        private _selectedNodes : TreeNodeComponent[];

        /**
         * Creates a new instance of the treenode
         */
        constructor(props: IReactTreeViewProps) {
            super(props);
            this._nodes = props.nodes || [new TreeViewNode(null)];
            this._selectedNodes = [];

            // Set the treeview
            for (let node of this._nodes)
                node.setTreeview(this);

            // Set the initial state
            this.state = {
            };
        }

        /**
         * Called whenever we need to re-create the prop tree. Usually after the structure of the nodes has changed
         */
        invalidate() {
            this.forceUpdate();
        }

        /**
         * Cleans up the component
         */
        componentWillUnmount() {
            this._nodes = null;
            this._selectedNodes = null;
        }

        /**
         * Called whenever a node is selectable and clicked.
         * @param {ReactTreeNode} node
         * @param {React.MouseEvent} e
         */
        onNodeSelected( node: TreeNodeComponent, e: React.MouseEvent ) {

            // Deselect all nodes if either not multi select mode or shiftkey was not pressed
            if ( this.props.multiSelect == false || ( this.props.multiSelect && !e.shiftKey) ) {

				for (let n of this._selectedNodes)
					n.setState({ selected : false });

				this._selectedNodes.splice( 0, this._selectedNodes.length );

                this._selectedNodes.push( node );
                node.setState({ selected: true });
			}
            else {
                let selected = !node.state.selected;
                node.setState({ selected: selected });

                if (!selected)
                    this._selectedNodes.splice( this._selectedNodes.indexOf(node), 1 );
                else
                    this._selectedNodes.push( node );
            }
        }

        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element {
            return <div className="treeview">
                { this._nodes.map((node, index) => {
                    return node.render(0, index)
                })}
            </div>
        }

        /**
         * Gets the root nodes of this treeview
         * @returns {TreeViewNode[]}
         */
        get() : TreeViewNode[] {
            return this._nodes;
        }
    }
}