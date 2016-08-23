module Animate {

    export class NodeData {
        public props: IReactTreeNodeProps;
        public nodes: NodeData[];
        public parent: NodeData;
        public treeview: ReactTreeView;
        private _component: ReactTreeNode;

        constructor(props: IReactTreeNodeProps, children? : NodeData[]) {
            this.treeview = null;
            this.props = props;
            this.nodes = children || [];
        }

        setTreeview(treeview: ReactTreeView) {
            this.treeview = treeview;
            for (let n of this.nodes)
                n.setTreeview(treeview);
        }

        addNode(node: NodeData) : NodeData{
            this.nodes.push(node);
            node.parent = this;
            this.treeview = this.treeview;

            if (this.treeview)
                this.treeview.invalidate();

            return node;
        }

        removeNode(node: NodeData) {
            this.nodes.splice(this.nodes.indexOf(node), 1);
            node.treeview = null;
            node.parent = null;
            node._component = null;
            if (this.treeview)
                this.treeview.invalidate();
        }

        /**
         * Creates the parent treeview state object. The treeview will use this object as its propTree
         * state variable and render each property with a corresponding tree node component
         */
        createPropTree(): IReactTreeNodeProps {
            let props = this.props;
            props.children = this.nodes.map(function(i) {
                return i.createPropTree();
            });

            return props;
        }
    }

    export interface IReactTreeViewProps {
        nodes: NodeData[];
        multiSelect?: boolean;
    }

    export interface IReactTreeViewState {
        propTree: IReactTreeNodeProps[];
    }

	/**
	 * This class is used to create tree view items.
	 */
	export class ReactTreeView extends React.Component<IReactTreeViewProps, IReactTreeViewState> {

        private _nodes : NodeData[];
        //private _selectedNodes : ReactTreeNode[];

        constructor(props: IReactTreeViewProps) {
            super(props);
            this._nodes = props.nodes || [new NodeData(null)];
            let rootNodes : IReactTreeNodeProps[] = [];

            // Set the treeview
            for (let node of this._nodes) {
                node.setTreeview(this);
                rootNodes.push( node.createPropTree() );
            }

            // Set the initial state
            this.state = {
                propTree : rootNodes
            };
        }

        /**
         * Called whenever we need to re-create the prop tree. Usually after the structure of the nodes has changed
         */
        invalidate() {
            let rootNodes : IReactTreeNodeProps[] = [];

            // Set the treeview
            for (let node of this._nodes)
                rootNodes.push( node.createPropTree() );

            this.setState({ propTree: rootNodes })
        }

        onNodeSelected(node: ReactTreeNode) {

            // if ( this.props.multiSelect == false ) {

			// 	for (let n in this._selectedNodes)
			// 		n.setState({ selected : false });

			// 	this._selectedNodes.splice( 0, this._selectedNodes.length );
			// }

			// if ( node ) {
            //     this._selectedNodes.push( node );
            //     node.setState({ selected: true });
			// }
        }

        renderNodeProp(props : IReactTreeNodeProps, level: number, index : number) : JSX.Element {
            return <ReactTreeNode {...props} key={'node-' + level + '-' + index}>
                { props.children && props.children.map( (n, index) => { return this.renderNodeProp(n, level + 1, index) })}
            </ReactTreeNode>
        }

        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element {
            return <div className="treeview">
                { this.state.propTree.map((node, index) => { this.renderNodeProp(node, 0, index) })}
            </div>
        }

        /**
         * Gets the root nodes of this treeview
         * @returns {NodeData[]}
         */
        get() : NodeData[] {
            return this._nodes;
        }
    }
}