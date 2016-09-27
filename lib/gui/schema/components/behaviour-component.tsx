namespace Animate {

    export interface IBehaviourComponentProps {
        editor: ContainerSchema;
        behaviour: Engine.Editor.IBehaviour;
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

        onLinkStart( e: React.MouseEvent, portal: string, behaviour: number ) {
            e.preventDefault();
            e.stopPropagation();
            const p = Utils.getRelativePos( e, ( ReactDOM.findDOMNode( this.refs[ 'draggable' ] ) as HTMLElement ).parentElement );
            this.props.editor.beginLinkRouting( portal, behaviour, p );
        }

        getPortalFromTarget( target: HTMLElement ) : Engine.Editor.IPortal {
            let ref : Element | React.Component<any, any>;
            let elm: HTMLElement;

            for ( let i in this.refs ) {
                ref = this.refs[i];
                if ( ref instanceof PortalComponent ) {
                    elm = ReactDOM.findDOMNode( ref ) as HTMLElement;
                    if ( elm === target )
                        return ref.props.portal;
                }
            }

            return null;
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
            const portals = behaviour.portals;
            const params: Engine.Editor.IPortal[] = [];
            const products: Engine.Editor.IPortal[] = [];
            const inputs: Engine.Editor.IPortal[] = [];
            const outputs: Engine.Editor.IPortal[] = [];
            const editor = this.props.editor;

            for ( const portal of portals )
                if ( portal.type === 'parameter' )
                    params.push( portal );
                else if ( portal.type === 'product' )
                    products.push( portal );
                else if ( portal.type === 'input' )
                    inputs.push( portal );
                else
                    outputs.push( portal );



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

            let behaviourTypeClass = '';
            if ( behaviour.type == 'portal' )
                behaviourTypeClass += ( behaviour as Engine.Editor.IBehaviourPortal ).portal.type;

            return (
                <Draggable
                    ref="draggable"
                    x={this.props.behaviour.left}
                    y={this.props.behaviour.top}
                    onDragComplete={( start, end ) => {
                        editor.doAction( new Actions.SelectionMoved( [ { index: behaviour.id, x: end.x, y: end.y }] ) );
                    } } >
                    <div
                        ref="behaviour"
                        className={'behaviour scale-in-animation unselectable' +
                            ( this.props.behaviour.selected ? ' selected' : '' ) +
                            ( behaviourTypeClass ? ' ' + behaviourTypeClass : '' ) +
                            ' ' + this.props.behaviour.type}
                        style={{
                            width: tw + 'px',
                            height: th + 'px'
                        }}
                        onContextMenu={( e ) => {
                            editor.onNodeSelected( behaviour, behaviour.selected ? true : false, false );
                            editor.onContext( behaviour, e );
                        } }
                        onClick={( e ) => {
                            e.stopPropagation();
                            editor.onNodeSelected( this.props.behaviour, e.shiftKey )
                        } }
                        >
                        {params.map(( p, i ) => {
                            return <PortalComponent
                                size={portalSize}
                                spacing={portalSpacing}
                                portal={p}
                                index={i}
                                ref={'param-' + i}
                                key={'param-' + i}
                                />
                        }
                        )
                        }
                        {products.map(( p, i ) => {
                            return <PortalComponent
                                size={portalSize}
                                spacing={portalSpacing}
                                portal={p}
                                index={i}
                                ref={'product-' + i}
                                key={'product-' + i}
                                onPortalDown={( e ) => this.onLinkStart( e, p.name, behaviour.id ) }
                                />
                        }
                        )
                        }
                        {inputs.map(( p, i ) => {
                            return <PortalComponent
                                size={portalSize}
                                spacing={portalSpacing}
                                portal={p}
                                index={i}
                                ref={'input-' + i}
                                key={'input-' + i}
                                />
                        }
                        )
                        }
                        {outputs.map(( p, i ) => {
                            return <PortalComponent
                                size={portalSize}
                                spacing={portalSpacing}
                                portal={p}
                                index={i}
                                ref={'output-' + i}
                                key={'output-' + i}
                                onPortalDown={( e ) => this.onLinkStart( e, p.name, behaviour.id ) }
                                />
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