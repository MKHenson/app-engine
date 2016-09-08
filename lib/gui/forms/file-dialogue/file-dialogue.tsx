namespace Animate {

    export interface IFileDialogueProps extends IReactWindowProps {
        extensions?: string[],
        multiselect?: boolean;
        readOnly?: boolean;
        onFilesSelected?: ( file: Engine.IFile[] ) => void;
    }

	/**
	 * A form uploading and selecting files
	 */
    export class FileDialogue extends ReactWindow<IFileDialogueProps, IReactWindowState> {
        static defaultProps: IFileDialogueProps = {
            controlBox: true,
            canResize: true,
            autoCenter: true,
            showCloseButton: true,
            title: 'Files',
            modal: true,
            className: 'file-viewer-window',
            extensions: [],
            onFilesSelected: null,
            multiselect: false,
            readOnly: false
        }

        /**
         * Creates a new instance
         */
        constructor( props: IOptionsForm ) {
            super( props )
        }

        /**
         * Gets the content JSX for the window.
         */
        getContent(): React.ReactNode {
            return <FileViewer
                readOnly={this.props.readOnly}
                multiSelect={this.props.multiselect}
                extensions={this.props.extensions}
                onClose={() => { this.onClose() } }
                onFilesSelected={( f ) => {
                    if ( this.props.onFilesSelected )
                        this.props.onFilesSelected( f );

                    this.onClose();
                } }
                />
        }
    }
}