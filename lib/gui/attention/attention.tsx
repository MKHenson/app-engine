module Animate {

    export interface IAttentionProps extends React.HTMLAttributes {
        mode?: AttentionType;
        showIcon?: boolean;
    }

    /**
     * A simple component for displaying a styled message to the user
     */
    export class Attention extends React.Component< IAttentionProps, { mode?: AttentionType, className? : string }> {
        static defaultProps : IAttentionProps = {
            mode: AttentionType.WARNING,
            showIcon: true
        }

        /**
         * Creates an a new intance
         */
        constructor(props : IAttentionProps) {
            super(props);
            this.state = {
                mode: props.mode,
                className: ( props.className ? props.className +  ' attention' : ' attention')
            };
        }

        componentDidMount() {
            this.setState({className : ( this.props.className ? this.props.className +  ' attention enter' : ' attention enter')});
        }

        /**
         * Called when the props are updated
         */
        componentWillReceiveProps(nextProps: IAttentionProps) {

            this.setState({
                mode : nextProps.mode,
                className: ( nextProps.className ? nextProps.className +  ' attention enter' : ' attention enter')
            });
        }

        /**
         * Gets the attention mode
         */
        get mode() : AttentionType
        {
            return this.state.mode;
        }

        /**
         * Sets the attention mode
         */
        set mode( val : AttentionType )
        {
            this.setState({
                mode: val
            });
        }

        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element {
            let props : IAttentionProps = Object.assign({}, this.props);
            delete props.mode;
            delete props.showIcon;
            let primaryClass : string;
            let icon : JSX.Element;

            if (this.state.mode == AttentionType.ERROR) {
                primaryClass = ' error';
                if (this.props.showIcon)
                    icon = <span className="fa fa-exclamation-triangle" />
            }
            else if (this.state.mode == AttentionType.WARNING) {
                primaryClass = ' warning';
                if (this.props.showIcon)
                    icon = <span className="fa fa-exclamation-triangle" />
            }
            else {
                primaryClass = ' success';
                if (this.props.showIcon)
                    icon = <span className="fa fa-check" />
            }

            return <div
                {...props}
                className={this.state.className + primaryClass}
            >
                {icon} {this.props.children}
            </div>
        }
    }
}