namespace Animate {

    export interface IImageUploaderProps {
        onImage?: ( file: Engine.IFile ) => void;
        src: string;
        label: string;
        onError?: ( e: Error ) => void;
    }

    export interface IImageUploaderState {
        src: string;
    }

    /**
     * A small utility class for uploading and previewing an image
     */
    export class ImageUploader extends React.Component<IImageUploaderProps, IImageUploaderState> {

        /**
         * Creates an instance
         */
        constructor( props: IImageUploaderProps ) {
            super( props );
            this.state = {
                src: props.src
            }
        }

        /**
         * Called when the props are updated
         */
        componentWillReceiveProps( nextProps: IImageUploaderProps ) {
            this.setState( {
                src: ( nextProps.src !== this.props.src ? nextProps.src : this.state.src )
            });
        }

        /**
         * Opens the file viewer and lets the user pick an image for their project
         */
        pickProjectPick() {

            ReactWindow.show( FileDialogue, {
                extensions: [ 'jpg', 'png', 'jpeg', 'gif' ],
                multiselect: false,
                onFilesSelected: ( files ) => {
                    this.setState( {
                        src: ( files ? files[ 0 ].url : null )
                    });

                    if ( this.props.onImage )
                        this.props.onImage( files[ 0 ] );
                }
            } as IFileDialogueProps );
        }

        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element {
            return <ImagePreview
                className="image-uploader"
                selected={true}
                label={this.props.label}
                src={this.state.src}
                labelIcon={<i className="fa fa-plus" aria-hidden="true"></i>}
                onLabelClick={( e ) => { this.pickProjectPick(); } }
                />
        }
    }
}