module Animate {

    export interface IReactTreeNodeProps {
        label: string;
        onClick? : (e: React.MouseEvent) => void;
        // nodes?: React.ReactElement<IReactTreeNodeProps>[];
    }

    export interface IReactTreeNodeState {
        expanded?: boolean;
        selected?: boolean;
    }

	/**
	 * This class is used to create tree view items.
	 */
	export class ReactTreeNode extends React.Component<IReactTreeNodeProps, IReactTreeNodeState> {

        // private _nodes : React.ReactElement<IReactTreeNodeProps>[];
        // public treeview: ReactTreeView;

        constructor(props: IReactTreeNodeProps) {
            super(props);
            // this._nodes = props.nodes || [];
            this.state = {
                expanded: true,
                selected: true
            };
        }

        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element {
            let state = this.state;

            return (
                <div className={"treenode" + (state.expanded ? ' expanded' : '') + (state.expanded ? ' selected' : '')}>
                    <div className="label">
                        <i className="fa fa-plus" style={{display : (state.expanded ? 'none' : '') }} aria-hidden="true" onClick={(e) => {
                            this.setState({ expanded: true })
                        }}></i>
                        <i className="fa fa-minus" style={{display : (!state.expanded ? 'none' : '') }} aria-hidden="true" onClick={(e) => {
                            this.setState({ expanded: false })
                        }}></i>
                        <i className="label" onClick={(e) => {
                            if (this.props.onClick)
                                this.props.onClick(e); }}>
                            {this.props.label}
                        </i>
                    </div>
                    <div className="child-nodes">
                        {this.props.children}
                    </div>
                </div>
            )
        }

        // addNode(node: ReactTreeNode) {
        //     this._nodes.push(node);
        //     node.treeview = this.treeview;
        // }

        // removeNode(node: ReactTreeNode) {
        //     this._nodes.splice(this._nodes.indexOf(node), 1);
        //     node.treeview = null;
        // }
    }
}