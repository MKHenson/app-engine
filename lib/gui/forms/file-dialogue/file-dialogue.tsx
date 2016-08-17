module Animate {

	export interface IFileDialogueProps extends IReactWindowProps {
    }

	/**
	 * A form uploading and selecting files
	 */
	export class FileDialogue extends ReactWindow<IFileDialogueProps> {
		static defaultProps: IOptionsForm = {
            controlBox: true,
            canResize: true,
            autoCenter: true,
            title: 'Files',
            modal: true,
            className: 'file-dialogue'
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
            return <div>File viewer</div>
        }
    }
}