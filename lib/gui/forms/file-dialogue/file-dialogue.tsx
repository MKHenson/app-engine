module Animate {

	export interface IFileDialogueProps extends IReactWindowProps {
        extensions?: string[],
        multiselect? : boolean;
        onFileSelected?: (file : Engine.IFile) => void;
    }

	/**
	 * A form uploading and selecting files
	 */
	export class FileDialogue extends ReactWindow<IFileDialogueProps> {
		static defaultProps: IFileDialogueProps = {
            controlBox: true,
            canResize: true,
            autoCenter: true,
            title: 'Files',
            modal: true,
            className: 'file-viewer-window',
            extensions: [],
            onFileSelected : null,
            multiselect: false
		}

        /**
         * Creates a new instance
         */
        constructor( props : IOptionsForm) {
            super(props)
        }

        /**
         * Gets the content JSX for the window.
         */
        getContent() : React.ReactNode {
            return <FileViewer
                multiSelect={this.props.multiselect}
                extensions={this.props.extensions}
                onFileSelected={(f) => {
                    if (this.props.onFileSelected)
                        this.props.onFileSelected(f);
                }}
            />
        }
    }
}