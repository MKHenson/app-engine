module Animate {

	export interface IOptionsUser {
    }

	/**
	 * A component for editing the user properties
	 */
	export class OptionsUser extends React.Component<IOptionsUser, any> {
		static defaultProps: IOptionsUser = {
		}

        /**
         * Creates a new instance
         */
        constructor( props : IOptionsUser) {
            super(props)
        }

        /**
         * Draws the options JSX
         * @returns {JSX.Element}
         */
        render() : JSX.Element {
            return <div>
			</div>
        }
    }
}