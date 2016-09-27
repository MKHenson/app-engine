namespace Animate {

    export interface IPortalComponentProps {
        portal: Engine.Editor.IPortal;
        index: number;
        size: number;
        spacing: number;
        onPortalDown?: ( e: React.MouseEvent ) => void;
    }

    /**
     * A visual representation of a Behaviour's portal
     */
    export class PortalComponent extends React.Component<IPortalComponentProps, any> {

        /**
         * Creates an instance of the component
         */
        constructor( props: IPortalComponentProps ) {
            super( props );
        }

        /**
         * Creates the component elements
         */
        render(): JSX.Element {
            const portal = this.props.portal;
            const size = this.props.size;
            const spacing = this.props.spacing;
            const index = this.props.index;
            const svgSize = 10;
            const svgSizeHalf = svgSize * 0.5;
            const svgBlockS = svgSize * 0.65;
            const svgTriS = svgSize * 0.3;

            let svg: JSX.Element;
            let style;

            if ( portal.type === 'parameter' ) {
                svg = <svg height={svgSize} width={svgSize}><polygon points={`0,0 ${svgSizeHalf},${svgSize - svgBlockS} ${svgSize},0 ${svgSize},${svgSize} 0,${svgSize}`} /></svg>
                style = { left: ( ( size + spacing ) * index ) + 'px', top: -size + 'px' };
            }
            else if ( portal.type === 'product' ) {
                svg = <svg height={svgSize} width={svgSize}><polygon points={`0,0 ${svgSize},0 ${svgSize},${svgBlockS} ${svgSizeHalf},${svgSize} 0,${svgBlockS}`} /></svg>;
                style = { left: ( ( size + spacing ) * index ) + 'px', top: '100%' };
            }
            else if ( portal.type === 'input' ) {
                svg = <svg height={svgSize} width={svgSize}><polygon points={`0,0 ${svgSize},0 ${svgSize},${svgSize} 0,${svgSize} ${svgSize - svgBlockS},${svgSizeHalf}`} /></svg>;
                style = { top: ( ( size + spacing ) * index ) + 'px', left: -size + 'px' };
            }
            else if ( portal.type === 'output' ) {
                svg = <svg height={svgSize} width={svgSize}><polygon points={`0,0 ${svgBlockS},0 ${svgSize},${svgSizeHalf} ${svgBlockS},${svgSize} 0,${svgSize}`} /></svg>;
                style = { top: ( ( size + spacing ) * index ) + 'px', left: '100%' };
            }

            return (
                <div
                    onMouseDown={this.props.onPortalDown ? ( e ) => { this.props.onPortalDown( e ); } : undefined }
                    className={'portal ' + portal.type + ( portal.links.length > 0 ? ' active' : '' ) }
                    style={style}
                    >
                    {svg}
                </div>
            )
        }
    }
}