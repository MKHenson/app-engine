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
        private _deltaX;
        private _deltaY;

        /**
         * Creates an instance of the component
         */
        constructor(props: IBehaviourComponentProps) {
            super(props);
            this._upProxy = this.onMouseUp.bind(this);
            this._moveProxy = this.onMouseMove.bind(this);
        }

        componentDidMount() {
            // let elm = this.refs['behaviour'] as HTMLElement;
            // jQuery(elm).draggable({  cancel: ".portal", scroll: true, scrollSensitivity: 1 } as JQueryUI.DraggableOptions);
            //toRet.element.draggable({ drag: this._proxyMoving, start: this._proxyStartDrag, stop: this._proxyStopDrag, cancel: ".portal", scroll: true, scrollSensitivity: 10 } as JQueryUI.DraggableOptions);
        }

        componentWillUnmount() {
            // The draggable functionality is added in the Canvas addChild function because we need to listen for the events.
			// To make sure its properly removed however we put it here.
			//this.element.draggable( "destroy" );
            window.removeEventListener('mouseup', this._upProxy);
            window.removeEventListener('mousemove', this._moveProxy);
        }

        onLinkStart(e: React.MouseEvent) {

        }

        onMouseDown(e: React.MouseEvent) {
            e.preventDefault();
            window.addEventListener('mouseup', this._upProxy);
            window.addEventListener('mousemove', this._moveProxy);
        }

        getRelativePos( e: React.MouseEvent ) : {x: number; y: number} {
            let elm = this.refs['behaviour'] as HTMLElement;
            let offsetX = elm.parentElement.offsetLeft;
            let offsetY = elm.parentElement.offsetTop;
            let ref = elm.offsetParent as HTMLElement;

            while ( ref ) {
                offsetX += ref.offsetLeft;
                offsetY += ref.offsetTop;
                ref = ref.offsetParent as HTMLElement;
            }

            let scrollX = elm.parentElement.scrollLeft;
            let scrollY = elm.parentElement.scrollTop;
            let mouse = { x: e.pageX - offsetX, y: e.pageY - offsetY };
            let x = mouse.x + scrollX;
            let y = mouse.y + scrollY;
            return { x: x, y: y };
        }

        onMouseMove(e: React.MouseEvent) {
            let pos = this.getRelativePos(e);
            let elm = this.refs['behaviour'] as HTMLElement;
            let xBuffer = 0;
            let yBuffer = 0;

            elm.style.left = pos.x + 'px';
            elm.style.top = pos.y + 'px';

            if ( pos.x + (elm.offsetWidth + xBuffer) > elm.parentElement.offsetWidth + elm.parentElement.scrollLeft )
                elm.parentElement.scrollLeft = ( pos.x - elm.parentElement.offsetWidth ) + (elm.offsetWidth + xBuffer);
            else if ( pos.x  - xBuffer < elm.parentElement.scrollLeft )
                elm.parentElement.scrollLeft = ( pos.x ) - (elm.offsetWidth + xBuffer);

            if ( pos.y + (elm.offsetHeight + yBuffer) > elm.parentElement.offsetHeight + elm.parentElement.scrollTop )
                elm.parentElement.scrollTop = ( pos.y - elm.parentElement.offsetHeight ) + (elm.offsetHeight + yBuffer);
            else if ( pos.y - yBuffer < elm.parentElement.scrollTop )
                elm.parentElement.scrollTop = ( pos.y ) - ( elm.offsetHeight + yBuffer );
        }

        onMouseUp(e: React.MouseEvent) {
            window.removeEventListener('mouseup', this._upProxy);
            window.removeEventListener('mousemove', this._moveProxy);
        }

        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render() : JSX.Element {
            let behaviour = this.props.behaviour;
            let fontSize = 5;
            let tw = fontSize * behaviour.alias.length + 20;
            let th = fontSize + 20;
            let portalSize = 10;
			let portalSpacing = 5;
            let padding = 10;
            let params = behaviour.parameters;
            let products = behaviour.products;
            let inputs = behaviour.inputs;
            let outputs = behaviour.outputs;
            let svgSize = 10;
            let svgSizeHalf = svgSize * 0.5;
            let svgBlockS = svgSize * 0.65;
            let svgTriS = svgSize * 0.3;

            // for ( let portal of behaviour.portals )
            //     switch (portal.type) {
            //         case 'product':
            //             products.push(portal);
            //             break;
            //         case 'parameter':
            //             params.push(portal);
            //             break;
            //         case 'input':
            //             inputs.push(portal);
            //             break;
            //         case 'output':
            //             outputs.push(portal);
            //             break;
            //     }

			let maxHorPortals = (products.length > params.length ? products.length : params.length );
			let maxVertPortals = (inputs.length > outputs.length ? inputs.length : outputs.length );
            let totalPortalSpacing = portalSize + portalSpacing;
            let maxHorSize = totalPortalSpacing * maxHorPortals;
            let maxVertSize = totalPortalSpacing * maxVertPortals;

            // If the portals increase the size - the update the dimensions
            tw = tw + padding > maxHorSize ? tw + padding : maxHorSize;
            th = th + padding > maxVertSize ? th + padding : maxVertSize;

			// Round off to the nearest 10 and minus border. This is so that they line up nicely to the graph
			tw = Math.ceil( ( tw ) / 10 ) * 10;
			th = Math.ceil( ( th ) / 10 ) * 10;

            return (
                <div
                    ref="behaviour"
                    className={'behaviour scale-in-animation unselectable' + ( this.props.behaviour.selected() ? ' selected' : '' )}
                    style={{
                        width: tw + 'px',
                        height: th + 'px',
                        left: this.props.behaviour.left + 'px',
                        top: this.props.behaviour.top + 'px'
                    }}
                    onMouseDown={(e) => { this.onMouseDown(e) }}
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