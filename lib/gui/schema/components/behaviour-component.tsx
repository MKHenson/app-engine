namespace Animate {

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
        constructor( props: IBehaviourComponentProps ) {
            super( props );
        }

        onLinkStart( e: React.MouseEvent ) {

        }

        /**
         * Creates the component elements
         */
        render(): JSX.Element {
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
            const maxHorPortals = ( products.length > params.length ? products.length : params.length );
            const maxVertPortals = ( inputs.length > outputs.length ? inputs.length : outputs.length );
            const totalPortalSpacing = portalSize + portalSpacing;
            const maxHorSize = totalPortalSpacing * maxHorPortals;
            const maxVertSize = totalPortalSpacing * maxVertPortals;

            // If the portals increase the size - the update the dimensions
            tw = tw + padding > maxHorSize ? tw + padding : maxHorSize;
            th = th + padding > maxVertSize ? th + padding : maxVertSize;

            // Round off to the nearest 10 and minus border. This is so that they line up nicely to the graph
            tw = Math.ceil(( tw ) / 10 ) * 10;
            th = Math.ceil(( th ) / 10 ) * 10;

            return (
                <Draggable onMove={( x, y ) => {
                    behaviour.left = x;
                    behaviour.top = y;
                } } x={this.props.behaviour.left} y={this.props.behaviour.top}>
                    <div
                        ref="behaviour"
                        className={'behaviour scale-in-animation unselectable' +
                            ( this.props.behaviour.selected() ? ' selected' : '' ) +
                            ( this.props.behaviour.className ? ' ' + this.props.behaviour.className : '' ) }
                        style={{
                            width: tw + 'px',
                            height: th + 'px'
                        }}
                        onContextMenu={( e ) => {
                            behaviour.store.onNodeSelected( behaviour, behaviour.selected() ? true : false, false );
                            behaviour.onContext( e );
                        } }
                        onClick={( e ) => {
                            e.stopPropagation();
                            this.props.behaviour.store.onNodeSelected( this.props.behaviour, e.shiftKey )
                        } }
                        >
                        {params.map(( p, i ) => {
                            return <div
                                key={'param-' + i}
                                className={'portal parameter' + ( p.links.length > 0 ? ' active' : '' ) }
                                style={{ left: ( ( portalSize + portalSpacing ) * i ) + 'px', top: -portalSize + 'px' }}
                                >
                                <svg height={svgSize} width={svgSize}><polygon points={`0,0 ${svgSizeHalf},${svgSize - svgBlockS} ${svgSize},0 ${svgSize},${svgSize} 0,${svgSize}`} /></svg>
                            </div>
                        }
                        )
                        }
                        {products.map(( p, i ) => {
                            return <div
                                key={'product-' + i}
                                className={'portal product' + ( p.links.length > 0 ? ' active' : '' ) }
                                style={{ left: ( ( portalSize + portalSpacing ) * i ) + 'px', top: '100%' }}
                                onMouseDown={( e ) => this.onLinkStart( e ) }
                                >
                                <svg height={svgSize} width={svgSize}><polygon points={`0,0 ${svgSize},0 ${svgSize},${svgBlockS} ${svgSizeHalf},${svgSize} 0,${svgBlockS}`} /></svg>
                            </div>
                        }
                        )
                        }
                        {inputs.map(( p, i ) => {
                            return <div
                                key={'input-' + i}
                                className={'portal input' + ( p.links.length > 0 ? ' active' : '' ) }
                                style={{ top: ( ( portalSize + portalSpacing ) * i ) + 'px', left: -portalSize + 'px' }}
                                >
                                <svg height={svgSize} width={svgSize}><polygon points={`0,0 ${svgSize},0 ${svgSize},${svgSize} 0,${svgSize} ${svgSize - svgBlockS},${svgSizeHalf}`} /></svg>
                            </div>
                        }
                        )
                        }
                        {outputs.map(( p, i ) => {
                            return <div
                                key={'output-' + i}
                                className={'portal output' + ( p.links.length > 0 ? ' active' : '' ) }
                                style={{ top: ( ( portalSize + portalSpacing ) * i ) + 'px', left: '100%' }}
                                onMouseDown={( e ) => this.onLinkStart( e ) }
                                >
                                <svg height={svgSize} width={svgSize}><polygon points={`0,0 ${svgBlockS},0 ${svgSize},${svgSizeHalf} ${svgBlockS},${svgSize} 0,${svgSize}`} /></svg>
                            </div>
                        }
                        )
                        }

                        <div className="text">{behaviour.alias}</div>
                    </div>
                </Draggable>
            )
        }
    }
}