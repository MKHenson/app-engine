module Animate {

    export interface IReactTreeViewProps {
        nodeStore: TreeNodeStore;
    }

    export interface IReactTreeViewState {
        nodes: TreeNodeModel[];
    }

	/**
	 * A component visually represents a TreeNodeStore and its nodes
	 */
	export class ReactTreeView extends React.Component<IReactTreeViewProps, IReactTreeViewState> {

        /**
         * Creates a new instance of the treenode
         */
        constructor(props: IReactTreeViewProps) {
            super(props);

            // Set the initial state
            this.state = {
                nodes: props.nodeStore.getNodes()
            };

            props.nodeStore.on( 'change', this.onChange, this );
        }

        /**
         * Called whenever we need to re-create the prop tree. Usually after the structure of the nodes has changed
         */
        onChange(type: string) {
            this.setState({ nodes : this.props.nodeStore.getNodes() });
        }

        /**
         * Make sure that any new node store has the appropriate event handlers
         */
        componentWillReceiveProps(nextProps: IReactTreeViewProps) {
            if (nextProps.nodeStore == this.props.nodeStore)
                return;

            this.props.nodeStore.off( 'change', this.onChange, this );
            nextProps.nodeStore.on( 'change', this.onChange, this );
            this.setState({
                nodes: nextProps.nodeStore.getNodes()
            });
        }

        /**
         * Cleans up the component
         */
        componentWillUnmount() {
            this.props.nodeStore.off( 'change', this.onChange, this );
        }

        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element {
            return <div className="treeview" >
                { this.state.nodes.map((node, index) => {
                    return <ReactTreeNode key={'node-0-'+ index} node={node} />
                })}
            </div>
        }
    }
}