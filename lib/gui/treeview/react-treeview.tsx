module Animate {

    export interface ITreeNodeView extends IReactTreeNodeProps {
        children?: ITreeNodeView[];
    }

    export class NodeData {
        public props: IReactTreeNodeProps;
        public nodes: NodeData[];
        public treeview: ReactTreeView;

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
            this.treeview = this.treeview;

            if (this.treeview)
                this.treeview.invalidate();

            return node;
        }

        removeNode(node: NodeData) {
            this.nodes.splice(this.nodes.indexOf(node), 1);
            node.treeview = null;
            if (this.treeview)
                this.treeview.invalidate();
        }

        render(): ITreeNodeView {
            let props = Object.assign({}, this.props);
            props.children = this.nodes.map(function(i){
                return i.render();
            });

            return props;
        }
    }

    export interface IReactTreeViewProps {
        nodes: NodeData;
        multiSelect?: boolean;
    }

    export interface IReactTreeViewState {
        nodes: ITreeNodeView;
    }

	/**
	 * This class is used to create tree view items.
	 */
	export class ReactTreeView extends React.Component<IReactTreeViewProps, IReactTreeViewState> {

        private _nodes : NodeData;
        //private _selectedNodes : ReactTreeNode[];

        constructor(props: IReactTreeViewProps) {
            super(props);
            this._nodes = props.nodes || new NodeData(null);
            this._nodes.setTreeview(this);
            this.state = {
                nodes : this._nodes.render()
            };
        }

        invalidate() {
            this.setState({ nodes: this._nodes.render() })
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

        renderNodeView(view : ITreeNodeView, level: number, index : number) : JSX.Element {

            const nodeProps : IVInputProps  = Object.assign({}, view);
            delete nodeProps.children;

            return <ReactTreeNode {...nodeProps} key={'node-' + level + '-' + index}>
                { view.children && view.children.map( (n, index) => { return this.renderNodeView(n, level + 1, index) })}
            </ReactTreeNode>
        }

        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element {
            return <div className="treeview">
                {this.renderNodeView(this.state.nodes, 0, 0)}
            </div>
        }

        addNode(node: NodeData) {
            this._nodes.addNode(node);
        }

        removeNode(node: NodeData) {
            this._nodes.removeNode(node);
        }
    }
}