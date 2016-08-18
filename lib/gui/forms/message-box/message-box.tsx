module Animate {

	export interface IMessageBoxProps extends IReactWindowProps {
        message?:string;
		onChange?: (button : string) => void;
		buttons?: string[];
		type?: AttentionType;
    }

	/**
	 * A window to show a blocking window with a message to the user.
	 */
	export class MessageBox extends ReactWindow<IMessageBoxProps> {
		static defaultProps: IMessageBoxProps = {
			buttons: ['Ok'],
			className: 'message-box',
			canResize: false,
			autoCenter: true,
			modal: true,
			type: AttentionType.ERROR
		}

		/**
		 * Creates a new instance of the message box
		 */
		constructor(props : IMessageBoxProps) {
            super(props);
		}

		/**
         * Gets the content JSX for the window. Typically this is the props.children, but can be overriden
         * in derived classes
         */
        getContent() : React.ReactNode {
            return <div id="en-message-box">
				<Attention allowClose={false} mode={this.props.type}>
					<p>{this.props.message}</p>
					<div className="buttons">
						{
							this.props && this.props.buttons.map((button, index)=> {
								return <ButtonPrimary key={'button-' + index} onClick={(e)=>{ this.onButtonClick(e, button) }}>
									{button}
								</ButtonPrimary>
							})
						}

					</div>
				</Attention>
			</div>
        }

		/**
		 * Hide the window when ok is clicked.
		 * @param {any} e The jQuery event object
		 */
        onButtonClick(e: React.MouseEvent, button: string) {
			if ( this.props.onChange )
				this.props.onChange(button);

			this.props._closing();
		}
	}
}