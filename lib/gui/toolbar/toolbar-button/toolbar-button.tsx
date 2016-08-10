module Animate {

	export interface IToolbarButtonProps {
		onChange: (val: boolean) => void;
		pushButton?: boolean;
		selected?: boolean;
		label: string;
		imgUrl?: string;
		disabled?: boolean;
	}

	export interface IToolbarButtonState {
		selected: boolean;
	}

	/**
	 * A very simple wrapper for a toolbar button
	 */
	export class ToolbarButton extends React.Component<IToolbarButtonProps, IToolbarButtonState> {
		static defaultProps : IToolbarButtonProps = {
			onChange: null,
			label: null,
			pushButton: false,
			disabled: false
		};

		constructor( props: IToolbarButtonProps ) {
            super(props);
			this.state = {
				selected : props.selected
			};
		}

		/**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element {
			let className = 'toolbar-button';
			if (this.state.selected)
				className += ' selected';
			if (this.props.disabled)
				className += ' disabled';

			return <Tooltip tooltip={this.props.label} position={TooltipPosition.BOTTOM} offset={0} disabled={this.props.disabled}>
				<div
					className={className}
					onClick={(e)=>this.onClick(e)}>
					<img src={this.props.imgUrl} />
				</div>
			</Tooltip>
		}

		 /**
         * Called when the props are updated
         */
        componentWillReceiveProps(nextProps: IVCheckboxProps) {
			if ( nextProps.selected !== this.props.selected )
				this.selected = nextProps.selected;
        }

		onClick( e ) {
			if (this.props.disabled)
				return;

			if ( this.props.pushButton )
				this.selected = !this.state.selected;
			else
				this.props.onChange(true);
		}

		/**
		 * Set if the component is selected
		 * @param {boolean}
		 */
		set selected ( val: boolean ) {
			if (val !== this.state.selected)
				this.props.onChange(val);

			this.setState({
				selected: !this.state.selected
			});
		}

		/**
		 * Get if the component is selected
		 * @return {boolean}
		 */
		get selected(): boolean { return this.state.selected; }
	}
}