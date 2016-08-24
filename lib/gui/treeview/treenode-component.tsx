module Animate {

    export interface IReactTreeNodeProps {
        expanded?: boolean;
        label: string;
        tree: ReactTreeView;
        selectable?: boolean;
        selected? : boolean;
        icon?: JSX.Element;
        onClick? : (e: React.MouseEvent) => void;
    }

    export interface IReactTreeNodeState {
        expanded?: boolean;
        selected?: boolean;
    }

	/**
	 * This class is used to create tree view items.
	 */
	export class TreeNodeComponent extends React.Component<IReactTreeNodeProps, IReactTreeNodeState> {

        static defaultProps : IReactTreeNodeProps = {
            label: '',
            selectable: true,
            tree: null,
            expanded: true,
            selected: false
        };

        /**
         * Creates an instance
         */
        constructor(props: IReactTreeNodeProps) {
            super(props);
            this.state = {
                expanded: props.expanded || true,
                selected: props.selected || false
            };
        }

        /**
         * Check for updates in the props & update state accordingly
         */
        componentWillReceiveProps(nextProps : IReactTreeNodeProps ) {
            if (nextProps.expanded != this.state.expanded )
                this.setState({ expanded: nextProps.expanded })
            if (nextProps.selected != this.state.selected )
                this.setState({ selected: nextProps.selected })
        }

        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element {
            let state = this.state;

            return (
                <div className={"treenode" + (state.expanded ? ' expanded' : ' collapsed') + (this.props.selectable ? ' selectable' : '')}>
                    <div className="node-header">
                        <i className="expand-button" style={{display: ( React.Children.count(this.props.children) == 0 ? 'none' : '' )}}>
                            {( state.expanded ?
                                <i className="fa fa-minus" aria-hidden="true" onClick={(e) => {
                                    this.setState({ expanded: false })
                                }}></i> :
                                <i className="fa fa-plus" aria-hidden="true" onClick={(e) => {
                                    this.setState({ expanded: true })
                                }}></i>
                            )}
                        </i>
                        <div className={"label unselectable" + (state.selected ? ' selected' : '')} onClick={(e) => {
                            if (this.props.selectable) {
                                this.props.tree.onNodeSelected(this, e);
                            }

                            if (this.props.onClick)
                                this.props.onClick(e);
                        }}>
                            {this.props.icon}
                            {this.props.label}
                        </div>
                    </div>
                    <div className="child-nodes">
                        {this.props.children}
                    </div>
                </div>
            )
        }
    }
}