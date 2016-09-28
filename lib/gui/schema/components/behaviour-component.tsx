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

        onLinkStart( e: React.MouseEvent, portal: Engine.Editor.IPortal ) {
            e.preventDefault();
            e.stopPropagation();
            const behaviour = this.props.behaviour;
            const p = { x: behaviour.left + portal.left, y: behaviour.top + portal.top };
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

        /**
         * Creates the component elements
         */
        render(): JSX.Element {
            const behaviour = this.props.behaviour;
            const portals = behaviour.portals;
            const editor = this.props.editor;

            let behaviourTypeClass = '';
            if ( behaviour.type == 'portal' )
                behaviourTypeClass += ( behaviour as Engine.Editor.IBehaviourPortal ).portal.type;

            return (
                <Draggable
                    ref="draggable"
                    x={this.props.behaviour.left}
                    y={this.props.behaviour.top}
                    onMove={( x, y ) => {
                        const items = editor.getItems();
                        (items[behaviour.id] as Behaviour).move(x, y);
                     } }
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
                            width: behaviour.width + 'px',
                            height: behaviour.height + 'px'
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
                        <div className="text">{behaviour.alias}</div>
                    </div>
                </Draggable>
            )
        }
    }
}