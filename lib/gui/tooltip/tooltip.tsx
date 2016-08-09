module Animate {

    export interface ITooltipProps {
        tooltip: JSX.Element;
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

        constructor(props: ITooltipProps) {
            super(props);
            if (!Tooltip._tooltip) {
                Tooltip._tooltip = document.createElement("div");
                Tooltip._tooltip.className = "tooltip";
            }

            this.state = {
                showTooltip: false
            };
        }

        onMouseEnter(e: React.MouseEvent) {
            let tooltipParent = Tooltip._tooltip;
            let target : HTMLElement = e.target as HTMLElement;
            this.setState({ showTooltip: true });
            document.body.appendChild( tooltipParent );
            ReactDOM.render( this.props.tooltip, tooltipParent );



            let h: number = tooltipParent.offsetHeight;
            let offset = 20;
            let w: number = tooltipParent.offsetWidth;
            let y = ( e.clientY - h - offset < 0 ? 0 :e.clientY - h - offset * 2 );
            let x = ( e.clientX + w + offset < document.body.offsetWidth ? e.clientX + offset : document.body.offsetWidth - w );

            x = ( target.offsetLeft < 0 ? 0 : target.offsetLeft );
            y = ( target.offsetTop - h - offset < 0 ? 0 : target.offsetTop - h - offset * 2 );

            tooltipParent.style.left = x + "px";
            tooltipParent.style.top = y + "px";


        }

        onMouseleave(e: React.MouseEvent) {
            var tooltipParent = Tooltip._tooltip;

            if (!document.body.contains(tooltipParent))
                return;


            this.setState({ showTooltip: false });
            document.body.removeChild( tooltipParent );
            ReactDOM.unmountComponentAtNode( tooltipParent );
        }

        onMouseMove(e: React.MouseEvent) {
            // let tooltipParent = Tooltip._tooltip;
            // let target : HTMLElement = e.target as HTMLElement;
            // let h: number = tooltipParent.offsetHeight;
            // let offset = 20;
            // let w: number = tooltipParent.offsetWidth;
            // let y = ( e.clientY - h - offset < 0 ? 0 :e.clientY - h - offset * 2 );
            // let x = ( e.clientX + w + offset < document.body.offsetWidth ? e.clientX + offset : document.body.offsetWidth - w );
            // tooltipParent.style.left = x + "px";
            // tooltipParent.style.top = y + "px";
        }

         /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element {
            var tooltipContent: JSX.Element;

            if ( this.state.showTooltip ) {
                    tooltipContent = <React.addons.CSSTransitionGroup
                        transitionName="tooltip"
                        transitionAppear={true}
                        transitionEnterTimeout={500}
                        transitionLeaveTimeout={500}
                        transitionAppearTimeout={500}
                        style={{position: "relative"}}
                    >
                        <div className="tooltip">
                            {this.props.tooltip}
                        </div>
                    </React.addons.CSSTransitionGroup>
            }

            return <span
                onMouseMove={(e)=>{ this.onMouseMove(e) }}
                onMouseEnter={(e)=> this.onMouseEnter(e) }
                onMouseLeave={(e)=> this.onMouseleave(e) }
            >
                {this.props.children}
            </span>;
        }
    }
}