module Animate {

    export interface IBehaviourComponentProps {
        behaviour: Behaviour;
    }

    /**
     * A visual representation of a Behaviour
     */
    export class BehaviourComponent extends React.Component<IBehaviourComponentProps, any> {

        /**
         * Creates an instance of the component
         */
        constructor(props: IBehaviourComponentProps) {
            super(props);
        }

        componentDidMount() {
            //toRet.element.draggable({ drag: this._proxyMoving, start: this._proxyStartDrag, stop: this._proxyStopDrag, cancel: ".portal", scroll: true, scrollSensitivity: 10 } as JQueryUI.DraggableOptions);
        }

        componentWillUnmount() {
            // The draggable functionality is added in the Canvas addChild function because we need to listen for the events.
			// To make sure its properly removed however we put it here.
			//this.element.draggable( "destroy" );
        }

        onLinkStart(e: React.MouseEvent) {

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
                    className={'behaviour scale-in-animation' + ( this.props.behaviour.selected() ? ' selected' : '' )}
                    style={{
                        width: tw + 'px',
                        height: th + 'px',
                        left: this.props.behaviour.left + 'px',
                        top: this.props.behaviour.top + 'px'
                    }}
                    onClick={(e) => {
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