module Animate {

    export interface IReactTreeNodeProps {
        node: TreeNodeModel;
    }

	/**
	 * This visual representation of a TreeNodeModel
	 */
	export class ReactTreeNode extends React.Component<IReactTreeNodeProps, any> {

        /**
         * Creates an instance
         */
        constructor(props: IReactTreeNodeProps) {
            super(props);
        }

        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element {
            let node = this.props.node;

            return (
                <div className={"treenode" +
                        (node.expanded() ? ' expanded' : ' collapsed')  +
                        (node.selectable() ? ' selectable' : '') +
                        (node.disabled() ? ' disabled' : '') +
                        (node.focussed ? ' focussed' : '') }>
                    <div className="node-header">
                        <i className="expand-button" style={{display: ( React.Children.count(this.props.children) == 0 ? 'none' : '' )}}>
                            {( node.expanded() ?
                                <i className="fa fa-minus" aria-hidden="true" onClick={(e) => {
                                    if (node.disabled())
                                        return;

                                    node.expanded(false);
                                }}></i> :
                                <i className="fa fa-plus" aria-hidden="true" onClick={(e) => {
                                    if (node.disabled())
                                        return;

                                    node.expanded(true);
                                }}></i>
                            )}
                        </i>
                        <div className={"label unselectable" + (node.selected() ? ' selected' : '')}
                            onContextMenu={(e) => {
                                if (node.disabled())
                                    return;

                                node.onContext(e);
                            }}
                            onClick={(e) => {
                                if (node.disabled())
                                    return;

                                if (node.selectable()) {
                                    node.store.onNodeSelected(node, e.shiftKey);
                                }
                            }}>
                            {node.icon()}
                            {node.label()}
                        </div>
                    </div>
                    <div className="child-nodes">
                        {this.props.node.children && this.props.node.children.map(function(n, index) {
                            return <ReactTreeNode key={'node-' + index} node={n} />
                        })}
                    </div>
                </div>
            )
        }
    }
}