namespace Animate {

    export enum TooltipPosition {
        TOP,
        BOTTOM
    }

    export interface ITooltipProps {
        tooltip?: JSX.Element | string;
        position?: TooltipPosition;
        offset?: number;
        disabled?: boolean;
    }

    export interface ITooltipState {
        showTooltip: boolean;
    }

    /**
     * Creates a new tooltip react Component. The content of this Component
     * is wrapped in a div which listens for mouse enter and leave events.
     * When entered the tooltip property is displayed.
     */
    export class Tooltip extends React.Component<ITooltipProps, ITooltipState> {

        private static _tooltip: HTMLElement;
        static defaultProps: ITooltipProps = {
            tooltip: 'Tooltip',
            position: TooltipPosition.TOP,
            offset: 10,
            disabled: false
        };

        /**
         * Creates an instance
         */
        constructor( props: ITooltipProps ) {
            super( props );
            if ( !Tooltip._tooltip ) {
                Tooltip._tooltip = document.createElement( "div" );
                Tooltip._tooltip.className = "tooltip";
            }

            this.state = {
                showTooltip: false
            };
        }

        /**
         * When the mouse enters over the element we add the tooltip to the body
         */
        onMouseEnter( e: React.MouseEvent ) {
            if ( this.props.disabled )
                return;

            let tooltipParent = Tooltip._tooltip;
            let target: HTMLElement = e.target as HTMLElement;
            let jsx: JSX.Element = ( typeof ( this.props.tooltip ) === "string" ? <span>{this.props.tooltip as string}</span> : this.props.tooltip as JSX.Element );

            this.setState( { showTooltip: true });

            // Add the tooltip to the dom
            document.body.appendChild( tooltipParent );
            ReactDOM.render( jsx, tooltipParent );

            let offset = this.props.offset;
            let h: number = tooltipParent.offsetHeight;
            let w: number = tooltipParent.offsetWidth;
            let bounds = target.getBoundingClientRect();
            let className = "tooltip";
            let x;
            let y;

            if ( this.props.position === TooltipPosition.TOP ) {
                className += " top";
                x = ( bounds.left + bounds.width * 0.5 > document.body.offsetWidth ? document.body.offsetWidth - w : bounds.left + bounds.width * 0.5 );
                y = ( bounds.top - h - offset < 0 ? 0 : bounds.top - h - offset );
            }
            else {
                className += " bottom";
                x = ( bounds.left + bounds.width * 0.5 > document.body.offsetWidth ? document.body.offsetWidth - w : bounds.left + bounds.width * 0.5 );
                y = ( bounds.bottom + offset > document.body.offsetHeight ? document.body.offsetHeight - h : bounds.bottom + offset );
                y += 5;
            }

            tooltipParent.className = className;


            // Position the tooltip just above the element
            tooltipParent.style.left = x + "px";
            tooltipParent.style.top = y + "px";

            // Add CSS classes for animation
            setTimeout( function () {
                tooltipParent.className = className + " enter";
                setTimeout( function () {
                    tooltipParent.className = className + " enter active";
                }, 20 );
            }, 20 );
        }

        /**
         * When the element is unmounted we remove the tooltip if its added
         */
        componentWillUnmount() {
            this.onMouseleave( null );
        }

        /**
         * When the mouse leaves we remove the tooltip
         */
        onMouseleave( e: React.MouseEvent ) {
            const tooltipParent = Tooltip._tooltip;

            if ( !document.body.contains( tooltipParent ) )
                return;

            this.setState( { showTooltip: false });
            document.body.removeChild( tooltipParent );
            ReactDOM.unmountComponentAtNode( tooltipParent );
        }

        /**
        * Creates the component elements
        * @returns {JSX.Element}
        */
        render(): JSX.Element {
            let tooltipContent: JSX.Element;

            if ( this.state.showTooltip ) {
                tooltipContent = <React.addons.CSSTransitionGroup
                    transitionName="tooltip"
                    transitionAppear={true}
                    transitionEnterTimeout={500}
                    transitionLeaveTimeout={500}
                    transitionAppearTimeout={500}
                    style={{ position: "relative" }}
                    >
                    <div className="tooltip">
                        {this.props.tooltip}
                    </div>
                </React.addons.CSSTransitionGroup>
            }

            return <span
                onMouseEnter={( e ) => this.onMouseEnter( e ) }
                onMouseLeave={( e ) => this.onMouseleave( e ) }
                >
                {this.props.children}
            </span>;
        }
    }
}