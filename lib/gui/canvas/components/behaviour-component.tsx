module Animate {

    export interface IBehaviourComponentProps {
        behaviour: Behaviour;
    }

    /**
     * A visual representation of a Behaviour
     */
    export class BehaviourComponent extends React.Component<IBehaviourComponentProps, any> {
        private _upProxy;
        private _moveProxy;
        private _mouseDelta: {x: number, y: number};
        private _scrollInterval: number;

        /**
         * Creates an instance of the component
         */
        constructor(props: IBehaviourComponentProps) {
            super(props);
            this._upProxy = this.onMouseUp.bind(this);
            this._moveProxy = this.onMouseMove.bind(this);
            this._mouseDelta = null;
        }

        /**
         * When unmounting, we remove any listeners
         */
        componentWillUnmount() {;
            window.removeEventListener('mouseup', this._upProxy);
            window.removeEventListener('mousemove', this._moveProxy);
        }

        onLinkStart(e: React.MouseEvent) {

        }

        /**
         * When the mouse is down on the behaviour, we add the drag listeners
         * @param {React.MouseEvent} e
         */
        onMouseDown(e: React.MouseEvent) {
            this._mouseDelta = Utils.getRelativePos(e, this.refs['behaviour'] as HTMLElement );
            e.preventDefault();
            window.addEventListener('mouseup', this._upProxy);
            window.addEventListener('mousemove', this._moveProxy);
        }



        /**
         * When the mouses moves we drag the behaviour
         * @param {React.MouseEvent} e
         */
        onMouseMove(e: React.MouseEvent) {
            const elm = this.refs['behaviour'] as HTMLElement;
            const pos = Utils.getRelativePos( e, elm.parentElement );
            const xBuffer = 10;
            const yBuffer = 10;
            let targetScrollX = elm.parentElement.scrollLeft;
            let targetScrollY = elm.parentElement.scrollTop;

            pos.x -=  this._mouseDelta.x;
            pos.y -= this._mouseDelta.y;

            elm.style.left = pos.x + 'px';
            elm.style.top = pos.y + 'px';

            if ( pos.x + (elm.offsetWidth + xBuffer) > elm.parentElement.offsetWidth + elm.parentElement.scrollLeft )
                targetScrollX = ( pos.x - elm.parentElement.offsetWidth ) + (elm.offsetWidth + xBuffer);
            else if ( pos.x  - xBuffer < elm.parentElement.scrollLeft )
                targetScrollX = ( pos.x ) - (elm.offsetWidth + xBuffer);

            if ( pos.y + (elm.offsetHeight + yBuffer) > elm.parentElement.offsetHeight + elm.parentElement.scrollTop )
               targetScrollY = ( pos.y - elm.parentElement.offsetHeight ) + (elm.offsetHeight + yBuffer);
            else if ( pos.y - yBuffer < elm.parentElement.scrollTop )
               targetScrollY = ( pos.y ) - ( elm.offsetHeight + yBuffer );

            if ( targetScrollX != elm.parentElement.scrollLeft || targetScrollY != elm.parentElement.scrollTop ) {
                window.clearInterval( this._scrollInterval );
                this._scrollInterval = Utils.scrollTo( { x: targetScrollX, y : targetScrollY }, elm.parentElement, 250 );
            }
        }

        /**
         * When the mouse is up we remove the events
         * @param {React.MouseEvent} e
         */
        onMouseUp(e: React.MouseEvent) {
            window.removeEventListener('mouseup', this._upProxy);
            window.removeEventListener('mousemove', this._moveProxy);
        }

        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render() : JSX.Element {
            const behaviour = this.props.behaviour;
            const fontSize = 5;
            let tw = fontSize * behaviour.alias.length + 20;
            let th = fontSize + 20;
            const portalSize = 10;
			const portalSpacing = 5;
            const padding = 10;
            const params = behaviour.parameters;
            const products = behaviour.products;
            const inputs = behaviour.inputs;
            const outputs = behaviour.outputs;
            const svgSize = 10;
            const svgSizeHalf = svgSize * 0.5;
            const svgBlockS = svgSize * 0.65;
            const svgTriS = svgSize * 0.3;
			const maxHorPortals = (products.length > params.length ? products.length : params.length );
			const maxVertPortals = (inputs.length > outputs.length ? inputs.length : outputs.length );
            const totalPortalSpacing = portalSize + portalSpacing;
            const maxHorSize = totalPortalSpacing * maxHorPortals;
            const maxVertSize = totalPortalSpacing * maxVertPortals;

            // If the portals increase the size - the update the dimensions
            tw = tw + padding > maxHorSize ? tw + padding : maxHorSize;
            th = th + padding > maxVertSize ? th + padding : maxVertSize;

			// Round off to the nearest 10 and minus border. This is so that they line up nicely to the graph
			tw = Math.ceil( ( tw ) / 10 ) * 10;
			th = Math.ceil( ( th ) / 10 ) * 10;

            return (
                <div
                    ref="behaviour"
                    className={'behaviour scale-in-animation unselectable' +
                        ( this.props.behaviour.selected() ? ' selected' : '' ) +
                        ( this.props.behaviour.className ? ' ' + this.props.behaviour.className : '' )}
                    style={{
                        width: tw + 'px',
                        height: th + 'px',
                        left: this.props.behaviour.left + 'px',
                        top: this.props.behaviour.top + 'px'
                    }}
                    onMouseDown={(e) => { this.onMouseDown(e) }}
                    onContextMenu={(e) => {
                        behaviour.store.onNodeSelected(behaviour, behaviour.selected() ? true : false, false );
                        behaviour.onContext(e);
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        this.props.behaviour.store.onNodeSelected(this.props.behaviour, e.shiftKey )}}
                >
                    {params.map( (p, i) => {
                        return <div
                                    key={'param-' + i}
                                    className={'portal parameter' + ( p.links.length > 0 ? ' active' : '')}
                                    style={{ left: ((portalSize + portalSpacing) * i ) + "px", top: -portalSize + "px"}}
                                >
                                    <svg height={svgSize} width={svgSize}><polygon points={`0,0 ${svgSizeHalf},${svgSize - svgBlockS} ${svgSize},0 ${svgSize},${svgSize} 0,${svgSize}`} /></svg>
                                </div>
                            }
                        )
                    }
                    {products.map( (p, i) => {
                        return <div
                                    key={'product-' + i}
                                    className={'portal product' + ( p.links.length > 0 ? ' active' : '')}
                                    style={{ left: ((portalSize + portalSpacing) * i ) + "px", top: '100%' }}
                                    onMouseDown={(e) => this.onLinkStart(e)}
                                >
                                    <svg height={svgSize} width={svgSize}><polygon points={`0,0 ${svgSize},0 ${svgSize},${svgBlockS} ${svgSizeHalf},${svgSize} 0,${svgBlockS}`} /></svg>
                                </div>
                            }
                        )
                    }
                    {inputs.map( (p, i) => {
                        return <div
                                    key={'input-' + i}
                                    className={'portal input' + ( p.links.length > 0 ? ' active' : '')}
                                    style={{ top: ((portalSize + portalSpacing) * i ) + "px", left: -portalSize + "px" }}
                                >
                                    <svg height={svgSize} width={svgSize}><polygon points={`0,0 ${svgSize},0 ${svgSize},${svgSize} 0,${svgSize} ${svgSize - svgBlockS},${svgSizeHalf}`} /></svg>
                                </div>
                            }
                        )
                    }
                    {outputs.map( (p, i) => {
                        return <div
                                    key={'output-' + i}
                                    className={'portal output' + ( p.links.length > 0 ? ' active' : '')}
                                    style={{ top: ((portalSize + portalSpacing) * i ) + "px", left: '100%' }}
                                    onMouseDown={(e) => this.onLinkStart(e)}
                                >
                                    <svg height={svgSize} width={svgSize}><polygon points={`0,0 ${svgBlockS},0 ${svgSize},${svgSizeHalf} ${svgBlockS},${svgSize} 0,${svgSize}`} /></svg>
                                </div>
                            }
                        )
                    }

                    <div className='text'>{behaviour.alias}</div>
                </div>
            )
        }
    }
}