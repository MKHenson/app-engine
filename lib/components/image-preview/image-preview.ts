

// export interface IImagePreviewProps extends React.HTMLAttributes {
//     src: string | undefined;
//     defaultSrc?: string;
//     label?: string;
//     labelIcon?: JSX.Element;
//     className?: string;
//     selected?: boolean;
//     onLabelClick?: ( e: React.MouseEvent ) => void;
//     showLoadingIcon?: boolean;
// }

// /**
//  * Shows an image in a against transparent backdrop that is vertically centered and scaled into its container
//  */
// export class ImagePreview extends React.Component<IImagePreviewProps, { loading: boolean }> {

//     static defaultProps: IImagePreviewProps = {
//         selected: false,
//         src: undefined,
//         defaultSrc: './media/appling.png',
//         showLoadingIcon: false
//     }

//     private _imgLoader: HTMLImageElement;
//     private _mounted: boolean;
//     /**
//      * Creates an instance
//      */
//     constructor( props: IImagePreviewProps ) {
//         super( props );
//         this._mounted = true;
//         this.state = { loading: false };
//         this._imgLoader = new Image();
//         this._imgLoader.onload = () => {
//             if ( !this._mounted )
//                 return;
//             this.setState( { loading: false });
//         }
//     }

//     componentWillUnmount() {
//         this._mounted = false;
//     }

//     /**
//      * When the preview is added we start the loading process
//      */
//     componentDidMount() {
//         this._imgLoader.src = this.props.src! || this.props.defaultSrc!;
//         this.setState( { loading: true });
//     }

//     /**
//      * If the src or default props change, we reload the new image
//      */
//     componentWillReceiveProps( nextProps: IImagePreviewProps ) {
//         let nextSrc = nextProps.src || nextProps.defaultSrc;
//         let curSrc = this.props.src || this.props.defaultSrc;
//         if ( nextSrc !== curSrc ) {
//             this._imgLoader.src = nextSrc!;
//             this.setState( { loading: true });
//         }
//     }

//     /**
//      * Creates the component elements
//      */
//     render(): JSX.Element {

//         // Remove the custom properties
//         const props: IImagePreviewProps = Object.assign( {}, this.props );
//         delete props.defaultSrc;
//         delete props.labelIcon;
//         delete props.onLabelClick;
//         delete props.showLoadingIcon;

//         let img = <i className="fa fa-cog fa-spin fa-3x fa-fw"></i>;

//         if ( !this.props.showLoadingIcon ) {
//             if ( !this.state.loading )
//                 img = <img ref="img" className="vert-align" src={this._imgLoader.src} />
//         }

//         let className = 'image-preview unselectable' + ( this.props.className ? ' ' + this.props.className : '' );

//         return <div {...props} className={className}>
//             <div className="preview-child">
//                 <div className="background-tiles inner">
//                     {img}
//                     <div className="div-center"></div>
//                 </div>
//             </div>
//             <div
//                 className={'item-name' + ( this.props.selected ? ' selected' : '' )}
//                 onClick={( e ) => {
//                     if ( this.props.onLabelClick )
//                         this.props.onLabelClick( e );
//                 } }
//                 >
//                 {this.props.labelIcon} {this.props.label}
//             </div>
//         </div>
//     }
// }

import { JML } from '../../jml/jml';

/**
 * Shows an image in a against transparent backdrop that is vertically centered and scaled into its container
 */
export class ImagePreview extends HTMLElement {

    private _src: string;
    private _defaultSrc: string;
    private _imgLoader: HTMLImageElement;
    private _mounted: boolean;
    private _loader: HTMLElement;
    private _img: HTMLImageElement;

    public onLabelClick?: ( sender: ImagePreview ) => void;

    constructor() {
        super();

        this._src = '';
        this._defaultSrc = './media/appling.png';
        this.className = 'image-preview unselectable';

        // let img = <i className="fa fa-cog fa-spin fa-3x fa-fw"></i>;

        //         if ( !this.props.showLoadingIcon ) {
        //             if ( !this.state.loading )
        //                 img = <img ref="img" className="vert-align" src={this._imgLoader.src} />
        //         }
        this._loader = JML.i( { className: 'fa fa-cog fa-spin fa-3x fa-fw' });
        this._img = JML.img( { className: 'vert-align', style: { display: 'none' } });


        JML.div( { className: 'preview-child' }, [
            JML.div( { className: 'background-tiles inner' }, [
                this._loader,
                this._img,
                JML.div( { className: 'div-center' })
            ] )
        ] );

        JML.div( {
            className: 'item-name', onclick: ( e ) => {
                e.target.classList.toggle( 'selected' );
                if ( this.onLabelClick )
                    this.onLabelClick( this );
            }
        }, [

            ] )
        //             <div className="preview-child">
        //                 <div className="background-tiles inner">
        //                     {img}
        //                     <div className="div-center"></div>
        //                 </div>
        //             </div>
        //             <div
        //                 className={'item-name' + ( this.props.selected ? ' selected' : '' )}
        //                 onClick={( e ) => {
        //                     if ( this.props.onLabelClick )
        //                         this.props.onLabelClick( e );
        //                 } }
        //                 >
        //                 {this.props.labelIcon} {this.props.label}
        //             </div>
    }

    disconnectedCallback() {
        this._mounted = false;
    }

    connectedCallback() {
        this._imgLoader = new Image();
        this._imgLoader.onload = () => {
            if ( !this._mounted )
                return;

            this._loader.style.display = 'none';
            this._img.style.display = '';
            this._img.src = this._imgLoader.src;
        }


        this._loader.style.display = '';
        this._img.style.display = 'none';
        JML.img( { className: 'vert-align', src: this._src })
    }

    get src(): string {
        return this._src;
    }

    set src( val: string ) {
        this._src = val;
        this._loader.style.display = '';
        this._img.style.display = 'none';
        this._imgLoader.src = this._src || this._defaultSrc;
    }
}