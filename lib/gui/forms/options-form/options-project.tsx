module Animate {

	export interface IOptionsProject extends IReactWindowProps {
    }

	/**
	 * A component for editing the project properties
	 */
	export class OptionsProject extends React.Component<IOptionsUser, any> {
		static defaultProps: IOptionsProject = {
		}

        /**
         * Creates a new instance
         */
        constructor( props : IOptionsProject) {
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