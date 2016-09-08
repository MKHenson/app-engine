namespace Animate {

    export interface IAttentionProps extends React.HTMLAttributes {
        mode?: AttentionType;
        showIcon?: boolean;
        allowClose?: boolean;
    }

    /**
     * A simple component for displaying a styled message to the user
     */
    export class Attention extends React.Component<IAttentionProps, { isClosed: boolean }> {
        static defaultProps: IAttentionProps = {
            mode: AttentionType.WARNING,
            showIcon: true,
            allowClose: true
        }

        /**
         * Creates an a new intance
         */
        constructor( props: IAttentionProps ) {
            super( props );
            this.state = {
                isClosed: false
            };
        }

        /**
         * Called when the props are updated
         */
        componentWillReceiveProps( nextProps: IAttentionProps ) {
            this.setState( {
                isClosed: false
            });
        }

        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element {
            let props: IAttentionProps = Object.assign( {}, this.props );
            delete props.mode;
            delete props.showIcon;
            delete props.className;
            delete props.allowClose;

            let primaryClass: string;
            let icon: JSX.Element;
            let className = ( props.className ? props.className + ' attention' : 'attention' )

            if ( this.props.mode === AttentionType.ERROR ) {
                className += ' error';
                if ( this.props.showIcon )
                    icon = <div className="icon"><span className="fa fa-exclamation-triangle" /></div>
            }
            else if ( this.props.mode === AttentionType.WARNING ) {
                className += ' warning';
                if ( this.props.showIcon )
                    icon = <div className="icon"><span className="fa fa-exclamation-circle" /></div>
            }
            else {
                className += ' success';
                if ( this.props.showIcon )
                    icon = <div className="icon"><span className="fa fa-check" /></div>
            }

            if ( this.props.showIcon )
                className += ' with-icon';

            let content: JSX.Element;
            if ( !this.state.isClosed ) {
                content = <div key="attention"  {...props} className={className}>
                    {icon}
                    <div className={'message'}>
                        {this.props.children}
                    </div>
                    {
                        ( this.props.allowClose ?
                            <span className="close fa fa-times" onClick={() => {
                                this.setState( { isClosed: true });
                            } } /> : null )
                    }

                </div>
            }


            return <React.addons.CSSTransitionGroup
                transitionName="attention"
                transitionAppear={true}
                transitionEnterTimeout={500}
                transitionLeaveTimeout={500}
                transitionAppearTimeout={500}
                >
                {content}
            </React.addons.CSSTransitionGroup>

        }
    }
}