module Animate {

    export interface ITreeViewProps {
        nodeStore: TreeNodeStore;
    }

    export interface ITreeViewState {
        nodes?: TreeNodeModel[];
        focussedNode?: TreeNodeModel;
    }

	/**
	 * A component visually represents a TreeNodeStore and its nodes
	 */
	export class TreeView extends React.Component<ITreeViewProps, ITreeViewState> {

        /**
         * Creates a new instance of the treenode
         */
        constructor(props: ITreeViewProps) {
            super(props);

            // Set the initial state
            this.state = {
                nodes: props.nodeStore.getNodes(),
                focussedNode: null
            };

            props.nodeStore.on<EditorEventType>( 'change', this.onChange, this );
            props.nodeStore.on<EditorEventType>( 'focus-node', this.onFocusNodeChange, this );
        }

        /**
         * Called whenever a node is focussed
         */
        onFocusNodeChange(type: EditorEventType, e : Event) {
            this.setState({ focussedNode : e.tag });
        }

        /**
         * Called whenever we need to re-create the prop tree. Usually after the structure of the nodes has changed
         */
        onChange(type: EditorEventType) {
            this.setState({ nodes : this.props.nodeStore.getNodes() });
        }

        /**
         * When the component is updated, we check for any focussed nodes so we can scroll to them
         */
        componentDidUpdate() {
            if (this.state.focussedNode) {
                let dom = ReactDOM.findDOMNode(this) as HTMLElement;
                jQuery(dom).scrollTo( '.focussed', 500 );
                this.setState({ focussedNode : null });
            }
        }

        /**
         * Make sure that any new node store has the appropriate event handlers
         */
        componentWillReceiveProps(nextProps: ITreeViewProps) {
            if (nextProps.nodeStore == this.props.nodeStore)
                return;

            this.props.nodeStore.on<EditorEventType>( 'focus-node', this.onFocusNodeChange, this );
            this.props.nodeStore.off<EditorEventType>( 'change', this.onChange, this );

            nextProps.nodeStore.on<EditorEventType>( 'change', this.onChange, this );
            nextProps.nodeStore.on<EditorEventType>( 'focus-node', this.onFocusNodeChange, this );

            this.setState({
                nodes: nextProps.nodeStore.getNodes()
            });
        }

        /**
         * Cleans up the component
         */
        componentWillUnmount() {
            this.props.nodeStore.off( 'change', this.onChange, this );
            this.props.nodeStore.on( 'focus-node', this.onFocusNodeChange, this );
        }

        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element {
            return <div className="treeview" >
                { this.state.nodes.map((node, index) => {
                    return <TreeNode key={'node-0-'+ index} node={node} />
                })}
            </div>
        }
    }
}