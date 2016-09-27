namespace Animate {

    export interface ILinkComponentProps {
        editor: ContainerSchema;
        link: Engine.Editor.ILinkItem;
        isRouting: boolean;
        getPortal: ( target: HTMLElement ) =>  Engine.Editor.IPortal;
    }

    /**
     * A visual representation of a Link. Represented on a schema as an SVG line between two behaviours
     */
    export class LinkComponent extends React.Component<ILinkComponentProps, any> {
        private _moveProxy : any;
        private _upProxy : any;

        /**
         * Creates an instance of the component
         */
        constructor( props: ILinkComponentProps ) {
            super( props );
            this._moveProxy = this.onMouseMove.bind(this);
            this._upProxy = this.onMouseUp.bind(this);
        }

        onMouseMove( e: MouseEvent ) {
            const link = this.props.link;
            const targetPortal = this.props.getPortal( e.target as HTMLElement );
            const svg = this.refs['svg'] as SVGAElement;
            const canvas = svg.parentElement;
            const pos = Utils.getRelativePos(e, canvas);
            const width = Math.abs( pos.x - link.left );
            const height = Math.abs( pos.y - link.top );
            svg.style.width = width + 'px';
            svg.style.height = height + 'px';

            if (!targetPortal)
                return;
        }

        /**
         * Remove event listeners
         */
        onMouseUp( e: MouseEvent ) {
            const link = this.props.link;
            const editor = this.props.editor;
            const targetPortal = this.props.getPortal( e.target as HTMLElement );

            // TODO
            if (targetPortal)
                editor.endLinkRouting(targetPortal.name, null)

            window.document.removeEventListener('mousemove', this._moveProxy );
            window.removeEventListener('mouseup', this._upProxy );

        }

        /**
         * If this link is routing, we attach listeners for mouse up so we can detect when to stop routing
         */
        componentDidMount() {
            if ( this.props.isRouting ) {
                window.document.addEventListener('mousemove', this._moveProxy );
                window.addEventListener('mouseup', this._upProxy );
            }
        }

        /**
         * Creates the component elements
         */
        render(): JSX.Element {
            const link = this.props.link;
            const isRouting = this.props.isRouting;

            return (
                <svg ref="svg" className="link" style={{
                    left: link.left + 'px',
                    top: link.top + 'px',
                    width: link.width + 'px',
                    height: link.height + 'px'
                }}>
                </svg>
            )
        }
    }
}