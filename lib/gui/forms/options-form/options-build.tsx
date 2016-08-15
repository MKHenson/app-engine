module Animate {

	export interface IOptionsBuild extends IReactWindowProps {
    }

	/**
	 * A component for editing the build properties
	 */
	export class OptionsBuild extends React.Component<IOptionsUser, any> {
		static defaultProps: IOptionsBuild = {
		}

        /**
         * Creates a new instance
         */
        constructor( props : IOptionsBuild) {
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