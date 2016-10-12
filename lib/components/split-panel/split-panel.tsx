namespace Animate {

    export enum SplitOrientation {
        VERTICAL,
        HORIZONTAL
    }

    export interface ISplitPanelProps {
        left?: JSX.Element;
        right?: JSX.Element;
        top?: JSX.Element;
        bottom?: JSX.Element;
        orientation?: SplitOrientation;
        ratio?: number;
        dividerSize?: number;
        onRatioChanged?: ( ratio: number ) => void;
    }

    export interface ISplitPanelState {
        ratio?: number;
        dragging?: boolean;
    }

	/**
	 * A Component that holds 2 sub Components and a splitter to split between them.
	 */
    export class SplitPanel extends React.Component<ISplitPanelProps, ISplitPanelState> {

        static defaultProps: ISplitPanelProps = {
            orientation: SplitOrientation.VERTICAL,
            ratio: 0.5,
            dividerSize: 6
        }

        private mMouseUpProxy: any;
        private mMouseMoveProxy: any;

		/**
		 * Creates a new instance
		 */
        constructor( props: ISplitPanelProps ) {
            super( props );
            // Proxies
            this.mMouseUpProxy = this.onStageMouseUp.bind( this );
            this.mMouseMoveProxy = this.onStageMouseMove.bind( this );
            this.state = {
                dragging: false,
                ratio: props.ratio
            };
        }

		/**
         * Called when the props are updated
         */
        componentWillReceiveProps( nextProps: ISplitPanelProps ) {
            this.setState( {
                ratio: ( nextProps.ratio !== this.props.ratio ? nextProps.ratio : this.state.ratio )
            });
        }

		/**
         * Creates the component elements
         */
        render(): JSX.Element {
            let orientation = this.props.orientation;
            let panel1Style;
            let panel2Style;
            let dividerStyle;
            let dividerSize = this.props.dividerSize;
            let dividerSizeHalf = dividerSize * 0.5;
            let ratio = this.state.ratio;

            // Calculate ratios etc...
            if ( orientation === SplitOrientation.VERTICAL ) {
                panel1Style = {
                    width: `calc(${ratio * 100}% - ${dividerSizeHalf}px)`,
                    height: '100%'
                };
                dividerStyle = {
                    width: dividerSize + 'px',
                    height: '100%'
                };
                panel2Style = {
                    width: `calc(${( 1 - ratio ) * 100}% - ${dividerSizeHalf}px)`,
                    height: '100%'
                };
            }
            else {
                panel1Style = {
                    height: `calc(${ratio * 100}% - ${dividerSizeHalf}px)`,
                    width: '100%'
                };
                dividerStyle = {
                    height: dividerSize + 'px',
                    width: '100%'
                };
                panel2Style = {
                    height: `calc(${( 1 - ratio ) * 100}% - ${dividerSizeHalf}px)`,
                    width: '100%'
                };
            }

            return <div className={'split-panel ' + ( orientation === SplitOrientation.VERTICAL ? 'vertical' : 'horizontal' )} >
                <div className="panel1" style={panel1Style}>
                    {this.state.dragging ? <div className="panel-input"></div> : null}
                    {this.props.left || this.props.top}
                </div>
                <div ref="divider" onMouseDown={( e ) => { this.onDividerMouseDown( e ) } }
                    style={dividerStyle}
                    className="split-panel-divider background-dark" />
                <div
                    ref="scrubber"
                    className="split-panel-divider-dragging"
                    style={{
                        display: ( !this.state.dragging ? 'none' : '' )
                    }} />
                <div className="panel2" style={panel2Style}>
                    {this.state.dragging ? <div className="panel-input"></div> : null}
                    {this.props.right || this.props.bottom}
                </div>
                <div className="fix"></div>
            </div>
        }

		/**
		  * This function is called when the mouse is down on the divider
		  */
        onDividerMouseDown( e: React.MouseEvent ) {
            e.preventDefault();
            this.setState( { dragging: true });
            let ratio = this.state.ratio;
            let orientation = this.props.orientation;
            let scrubber = this.refs[ 'scrubber' ] as HTMLElement;
            let dividerSizeHalf = this.props.dividerSize * 0.5;

            scrubber.style.height = ( orientation === SplitOrientation.VERTICAL ? '100%' : this.props.dividerSize + 'px' );
            scrubber.style.width = ( orientation === SplitOrientation.VERTICAL ? this.props.dividerSize + 'px' : '100%' );
            scrubber.style.left = ( orientation === SplitOrientation.VERTICAL ? `calc(${ratio * 100}% - ${dividerSizeHalf}px)` : `0` );
            scrubber.style.top = ( orientation === SplitOrientation.VERTICAL ? `0` : `calc(${ratio * 100}% - ${dividerSizeHalf}px)` );

            window.addEventListener( 'mouseup', this.mMouseUpProxy );
            document.body.addEventListener( 'mousemove', this.mMouseMoveProxy );
        }

		/**
		 * Recalculate the ratios on mouse up
		 */
        onStageMouseUp( e: MouseEvent ): void {

            window.removeEventListener( 'mouseup', this.mMouseUpProxy );
            document.body.removeEventListener( 'mousemove', this.mMouseMoveProxy );

            let orientation = this.props.orientation;
            let scrubber = this.refs[ 'scrubber' ] as HTMLElement;

            // Get the new ratio
            let left = parseFloat( scrubber.style.left!.split( 'px' )[ 0 ] );
            let top = parseFloat( scrubber.style.top!.split( 'px' )[ 0 ] );
            let w = scrubber.parentElement.clientWidth;
            let h = scrubber.parentElement.clientHeight;
            let ratio = 0;

            if ( orientation === SplitOrientation.VERTICAL )
                ratio = left / w;
            else
                ratio = top / h;

            if ( ratio < 0 )
                ratio = 0;
            if ( ratio > 1 )
                ratio = 1;

            this.setState( {
                ratio: ratio,
                dragging: false
            });

            if ( this.props.onRatioChanged )
                this.props.onRatioChanged( ratio );
        }

		/**
		 * This function is called when the mouse is up from the body of stage.
		 */
        onStageMouseMove( e: MouseEvent ) {
            let orientation = this.props.orientation;
            let scrubber = this.refs[ 'scrubber' ] as HTMLElement;
            let bounds = scrubber.parentElement.getBoundingClientRect();
            let left = e.clientX - bounds.left;
            let top = e.clientY - bounds.top;

            scrubber.style.left = ( orientation === SplitOrientation.VERTICAL ? `${left}px` : `0` );
            scrubber.style.top = ( orientation === SplitOrientation.HORIZONTAL ? `${top}px` : `0` );
        }

		/**
		 * Call this function to get the ratio of the panel. Values are from 0 to 1
		 */
        get ratio(): number {
            return this.state.ratio!;
        }

		/**
		 * Call this function to set the ratio of the panel. Values are from 0 to 1.
		 * @param val The ratio from 0 to 1 of where the divider should be
		 */
        set ratio( val: number ) {
            if ( val > 1 )
                val = 1;
            else if ( val < 0 )
                val = 0;

            this.setState( { ratio: val });
        }
    }
}