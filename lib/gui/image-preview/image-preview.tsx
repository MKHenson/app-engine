module Animate {

    export interface IImagePreviewProps extends React.HTMLAttributes {
        src: string;
        defaultSrc?: string;
        label: string;
        labelIcon?: React.ReactDOM;
        className? : string;
        selected? : boolean;
        onLabelClick? : (e: React.MouseEvent) => void;
    }

    /**
     * Shows an image in a against transparent backdrop that is vertically centered and scaled into its container
     */
    export class ImagePreview extends React.Component<IImagePreviewProps, any> {

        static defaultProps: IImagePreviewProps = {
            selected: false,
            src: null,
            label: null,
            defaultSrc: './media/appling.png'
        }

        /**
         * Creates an instance
         */
        constructor(props: IImagePreviewProps) {
            super(props)
        }

        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element {

            // Remove the custom properties
            const props : IImagePreviewProps  = Object.assign({}, this.props);
            delete props.defaultSrc;
            delete props.labelIcon;
            delete props.onLabelClick;

            let className = 'image-preview unselectable' + ( this.props.className ? ' ' + this.props.className : '' );

            return <div {...props} className={className}>
                <div className="preview-child">
                    <div className="background-tiles inner">
                        <img className="vert-align" src={this.props.src || this.props.defaultSrc }/>
                        <div className="div-center"></div>
                    </div>
                </div>
                <div
                    className={'item-name' + (this.props.selected ? ' selected' : '')}
                    onClick={(e) => {
                        if (this.props.onLabelClick)
                            this.props.onLabelClick(e);
                    }}
                >
                    {this.props.labelIcon} {this.props.label}
                </div>
            </div>
        }
    }
}