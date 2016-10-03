namespace Animate {

    export interface ILinkComponentProps {
        editor: ContainerSchema;
        link: Serializable<Engine.Editor.ILinkItem>;
        isRouting: boolean;
        getPortal: ( target: HTMLElement ) => Engine.Editor.IPortal;
    }

    /**
     * A visual representation of a Link. Represented on a schema as an SVG line between two behaviours
     */
    export class LinkComponent extends React.Component<ILinkComponentProps, any> {
        private _moveProxy: any;
        private _upProxy: any;

        /**
         * Creates an instance of the component
         */
        constructor( props: ILinkComponentProps ) {
            super( props );
            this._moveProxy = this.onMouseMove.bind( this );
            this._upProxy = this.onMouseUp.bind( this );
        }

        calculateRect( pos: Point ) : { left: number; top: number; height: number; width: number; } {
            const link = this.props.link;
            let top = 0;
            let left = 0;
            const linkLeft: number = link.get('left');
            const linkTop: number = link.get('top');

            let width = Math.abs( pos.x - linkLeft );
            let height = Math.abs( pos.y - linkTop );

            if (pos.x < linkLeft )
                left = pos.x;
            else
                left = linkLeft;

            if (pos.y < linkTop)
                top = pos.y;
            else
                top = linkTop;

            return {
                left: left,
                top: top,
                height: height,
                width: width
            }
        }

        onMouseMove( e: MouseEvent ) {
            const link = this.props.link;
            const targetPortal = this.props.getPortal( e.target as HTMLElement );
            const svg = this.refs[ 'svg' ] as SVGAElement;
            const canvas = svg.parentElement;
            const pos = Utils.getRelativePos( e, canvas );
            const rect = this.calculateRect(pos);

            svg.style.left = rect.left + 'px';
            svg.style.top = rect.top + 'px';
            svg.style.width = rect.width + 'px';
            svg.style.height = rect.height + 'px';

            if ( !targetPortal )
                return;
        }

        /**
         * Remove event listeners
         */
        onMouseUp( e: MouseEvent ) {
            const editor = this.props.editor;
            const link = this.props.link;
            const targetPortal = this.props.getPortal( e.target as HTMLElement );
            const linkStartBehaviour: number = link.get('startBehaviour');
            const linkStartPortal: string = link.get('startPortal');

            if ( targetPortal ) {
                const items = editor.getItems();
                const targetBehaviour = items[targetPortal.behaviour];
                const rect = this.calculateRect({
                    x: targetBehaviour.serializer.get('left') + targetPortal.left + targetPortal.size,
                    y: targetBehaviour.serializer.get('top') + targetPortal.top + targetPortal.size
                });

                editor.endLinkRouting( {
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height,
                    startBehaviour: linkStartBehaviour,
                    startPortal: linkStartPortal,
                    endPortal: targetPortal.name,
                    endBehaviour: targetPortal.behaviour
                } );
            }
             else
                editor.endLinkRouting(null);

            window.document.removeEventListener( 'mousemove', this._moveProxy );
            window.removeEventListener( 'mouseup', this._upProxy );

        }

        /**
         * If this link is routing, we attach listeners for mouse up so we can detect when to stop routing
         */
        componentDidMount() {
            if ( this.props.isRouting ) {
                window.document.addEventListener( 'mousemove', this._moveProxy );
                window.addEventListener( 'mouseup', this._upProxy );
            }
        }

        /**
         * Creates the component elements
         */
        render(): JSX.Element {
            const link = this.props.link;
            const isRouting = this.props.isRouting;
            const json = link.toObject() as Engine.Editor.ILinkItem;

            return (
                <svg ref="svg" className="link" style={{
                    left: json.left + 'px',
                    top: json.top + 'px',
                    width: json.width + 'px',
                    height: json.height + 'px',
                    pointerEvents: ( this.props.isRouting ? 'none' : undefined )
                }}>
                </svg>
            )
        }
    }
}