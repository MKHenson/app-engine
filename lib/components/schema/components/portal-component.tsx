namespace Animate {

    export interface IPortalComponentProps {
        portal: IPortal;
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
            const size = portal.size;
            const top = portal.top;
            const left = portal.left;
            const svgSizeHalf = size * 0.5;
            const svgBlockS = size * 0.65;
            let svg: JSX.Element | undefined;

            if ( portal.type === 'parameter' ) {
                svg = <svg height={size} width={size}><polygon points={`0,0 ${svgSizeHalf},${size - svgBlockS} ${size},0 ${size},${size} 0,${size}`} /></svg>;
            }
            else if ( portal.type === 'product' ) {
                svg = <svg height={size} width={size}><polygon points={`0,0 ${size},0 ${size},${svgBlockS} ${svgSizeHalf},${size} 0,${svgBlockS}`} /></svg>;
            }
            else if ( portal.type === 'input' ) {
                svg = <svg height={size} width={size}><polygon points={`0,0 ${size},0 ${size},${size} 0,${size} ${size - svgBlockS},${svgSizeHalf}`} /></svg>;
            }
            else if ( portal.type === 'output' ) {
                svg = <svg height={size} width={size}><polygon points={`0,0 ${svgBlockS},0 ${size},${svgSizeHalf} ${svgBlockS},${size} 0,${size}`} /></svg>;
            }

            return (
                <div
                    onMouseDown={this.props.onPortalDown ? ( e ) => { this.props.onPortalDown!( e ); } : undefined}
                    className={'portal ' + portal.type + ( portal.links!.length > 0 ? ' active' : '' )}
                    style={{ top: top + 'px', left: left + 'px' }}
                    >
                    {svg}
                </div>
            )
        }
    }
}