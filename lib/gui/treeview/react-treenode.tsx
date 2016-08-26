module Animate {

    export interface IReactTreeNodeProps {
        node: TreeNodeModel;
    }

	/**
	 * This visual representation of a TreeNodeModel
	 */
	export class ReactTreeNode extends React.Component<IReactTreeNodeProps, any> {

        private _dropProxy: any;

        /**
         * Creates an instance
         */
        constructor(props: IReactTreeNodeProps) {
            super(props);
        }

        componentDidMount() {
            let div = this.refs['label'] as HTMLElement;
            if (this.props.node.canDrag)
                jQuery(div).draggable({ opacity: 0.7, helper: "clone", appendTo: "body", containment: "body" } as JQueryUI.DroppableOptions);
            if (this.props.node.canDrop)
                jQuery(div).droppable({ drop: this._dropProxy, accept: ".tree-node-asset,.tree-node-group" } as JQueryUI.DroppableOptions);
        }

        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element {
            let node = this.props.node;

            return (
                <div
                    className={"treenode" +
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
                        <div ref="label"
                            draggable={node.canDrag}
                            onDragStart={ (e) => {
                                let json = node.onDragStart(e);
                                if (json)
                                    e.dataTransfer.setData('text', JSON.stringify(json) );

                            }}
                            onDragOver={ (node.canDrop ? (e) => { e.preventDefault(); } : null )}
                            onDrop={(node.canDrop ? (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                try {
                                    let json : IDragDropToken;
                                    let data = e.dataTransfer.getData('text');
                                    if (data && data != '')
                                        json = JSON.parse(data);

                                    node.onDragDrop(e, json);
                                }
                                catch(e) {
                                }

                            } : null )}
                            className={"label unselectable" + (node.selected() ? ' selected' : '')}
                            onContextMenu={(e) => {
                                if (node.disabled())
                                    return;

                                if (node.selectable())
                                    node.store.onNodeSelected(node, false);
                                else
                                    node.store.onNodeSelected(null, false);

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