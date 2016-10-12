namespace Animate {

    export interface ITreeViewProps {
        nodeStore?: TreeNodeStore;
    }

    export interface ITreeViewState {
        nodes?: TreeNodeModel[];
        focussedNode?: TreeNodeModel | null;
    }

	/**
	 * A component visually represents a TreeNodeStore and its nodes
	 */
    export class TreeView<T extends ITreeViewProps> extends React.Component<T, ITreeViewState> {
        private _isMounted: boolean;

        /**
         * Creates a new instance of the treenode
         */
        constructor( props: T ) {
            super( props );

            this._isMounted = false;

            // Set the initial state
            this.state = {
                nodes: props.nodeStore!.getNodes(),
                focussedNode: null
            };

            props.nodeStore!.on<TreeviewEvents, void>( 'change', this.onChange, this );
            props.nodeStore!.on<TreeviewEvents, INodeEvent>( 'focus-node', this.onFocusNodeChange, this );
        }

        /**
         * Called whenever a node is focussed
         */
        onFocusNodeChange( type: TreeviewEvents, e: INodeEvent ) {
            this.setState( { focussedNode: e.node });
        }

        /**
         * Called whenever we need to re-create the prop tree. Usually after the structure of the nodes has changed
         */
        onChange( type: TreeviewEvents ) {
            if ( this._isMounted )
                this.setState( { nodes: this.props.nodeStore!.getNodes() });
        }

        /**
         * When the component is updated, we check for any focussed nodes so we can scroll to them
         */
        componentDidUpdate() {
            if ( this.state.focussedNode ) {
                let dom = ReactDOM.findDOMNode( this ) as HTMLElement;
                jQuery( dom ).scrollTo( '.focussed', 500 );
                this.setState( { focussedNode: null });
            }
        }

        /**
         * Make sure that any new node store has the appropriate event handlers
         */
        componentWillReceiveProps( nextProps: ITreeViewProps ) {
            if ( nextProps.nodeStore === this.props.nodeStore )
                return;

            const store = this.props.nodeStore!;
            const nextStore = nextProps.nodeStore!;

            store.on<TreeviewEvents, INodeEvent>( 'focus-node', this.onFocusNodeChange, this );
            store.off<TreeviewEvents, void>( 'change', this.onChange, this );

            nextStore.on<TreeviewEvents, void>( 'change', this.onChange, this );
            nextStore.on<TreeviewEvents, INodeEvent>( 'focus-node', this.onFocusNodeChange, this );

            this.setState( {
                nodes: nextStore.getNodes()
            });
        }

        /**
         * Set the mounted variable so we dont get warnings
         */
        componentDidMount() {
            this._isMounted = true;
        }

        /**
         * Cleans up the component
         */
        componentWillUnmount() {
            const store = this.props.nodeStore!;
            store.off<TreeviewEvents, void>( 'change', this.onChange, this );
            store.on<TreeviewEvents, INodeEvent>( 'focus-node', this.onFocusNodeChange, this );
        }

        /**
         * Creates the component elements
         */
        render(): JSX.Element {
            return <div className="treeview" >
                {this.state.nodes!.map(( node, index ) => {
                    return <TreeNode key={'node-0-' + index} node={node} />
                })}
            </div>
        }
    }
}