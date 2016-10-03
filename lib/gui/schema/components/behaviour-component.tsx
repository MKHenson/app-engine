namespace Animate {

    export interface IBehaviourComponentProps {
        editor: ContainerSchema;
        behaviour: Serializable<Engine.Editor.IBehaviour>;
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

        onLinkStart( e: React.MouseEvent, portal: Engine.Editor.IPortal ) {
            e.preventDefault();
            e.stopPropagation();
            const behaviour = this.props.behaviour;
            const p = { x: behaviour.get('left') + portal.left, y: behaviour.get('top') + portal.top };
            this.props.editor.beginLinkRouting( portal, p );
        }

        getPortalFromTarget( target: HTMLElement ): Engine.Editor.IPortal {
            let ref: Element | React.Component<any, any>;
            let elm: HTMLElement;

            for ( let i in this.refs ) {
                ref = this.refs[ i ];
                if ( ref instanceof PortalComponent ) {
                    elm = ReactDOM.findDOMNode( ref ) as HTMLElement;
                    if ( elm === target )
                        return ref.props.portal;
                }
            }

            return null;
        }

        shouldComponentUpdate( nextProps: IBehaviourComponentProps, nextState ) {
            return !(nextProps.behaviour.immutable === this.props.behaviour.immutable );
        }


        /**
         * Creates the component elements
         */
        render(): JSX.Element {
            const behaviour = this.props.behaviour;
            const json = behaviour.toObject() as Engine.Editor.IBehaviour;
            const portals = json.portals;
            const editor = this.props.editor;

            let behaviourTypeClass = '';
            if ( json.type == 'portal' )
                behaviourTypeClass += ( behaviour as Engine.Editor.IBehaviourPortal ).portal.type;

            return (
                <Draggable
                    ref="draggable"
                    x={json.left}
                    y={json.top}
                    onMove={( x, y ) => {
                        const items = editor.getItems();
                        (items[json.id] as Behaviour).updateLocation(x, y);
                     } }
                    onDragComplete={( start, end ) => {
                        editor.doAction( new Actions.SelectionMoved( [ { index: json.id, x: end.x, y: end.y }] ) );
                    } } >
                    <div
                        ref="behaviour"
                        className={'behaviour scale-in-animation unselectable' +
                            ( json.selected ? ' selected' : '' ) +
                            ( behaviourTypeClass ? ' ' + behaviourTypeClass : '' ) +
                            ' ' + json.type}
                        style={{
                            width: json.width + 'px',
                            height: json.height + 'px'
                        }}
                        onContextMenu={( e ) => {
                            editor.onNodeSelected( behaviour, json.selected ? true : false, false );
                            editor.onContext( behaviour, e );
                        } }
                        onClick={( e ) => {
                            e.stopPropagation();
                            editor.onNodeSelected( json, e.shiftKey )
                        } }
                        >
                        {
                            portals.map(( p, i ) => {
                                return <PortalComponent
                                    portal={p}
                                    ref={ p.type + '-' + i }
                                    key={ p.type + '-' + i }
                                    onPortalDown={ ( p.type === 'product' || p.type === 'output' ?
                                        ( e ) => this.onLinkStart( e, p ) : undefined ) }
                                    />
                            })
                        }
                        <div className="text">{json.alias}</div>
                    </div>
                </Draggable>
            )
        }
    }
}