module Animate {

    export interface IOptionsBuildState {

    }

	export interface IOptionsBuildProps extends IReactWindowProps {
    }

	/**
	 * A component for editing the build properties
	 */
	export class OptionsBuild extends React.Component<IOptionsBuildProps, any> {
		static defaultProps: IOptionsBuildProps = {
		}

        /**
         * Creates a new instance
         */
        constructor( props : IOptionsBuildProps) {
            super(props)
        }

        /**
         * Draws the options JSX
         * @returns {JSX.Element}
         */
        render() : JSX.Element {
            return <div id='options-build'>
                <Group label="Build">
                    <div className="field-option">
                        <div className="label">Version:</div>
                        <div className="build-version">
                            V
                            <input type="text" className="background-view-light" /> -
                            <input type="text" className="background-view-light" /> -
                            <input type="text" className="background-view-light" />
                        </div>
                        <div className="fix"></div>
                    </div>
                    <div className="soft-text info field-option">
                        When you build a project it saves the data according to its version number.
                        This helps you differenciate your builds and release incremental versions. You can switch between the different
                        builds by specifying which version to use. Use the above fields to select,
                        or if its not present create, a particular build.
                    </div>
                    <ButtonPrimary>Select Build</ButtonPrimary>
                    <div className="fix" />
                </Group>
                <Group label="Properties">
                    <div className="field-option">
                        <div className="label">Notes</div>
                        <textarea className="background-view-light"></textarea>
                        <div className="info soft-text">Use the above pad to store some build notes for the selected build.</div>
                    </div>
                    <div className="field-option">
                        <div className="label">Visibility</div>
                        <div className="dropdown">
                            <select>
                                <option value="0">Private</option>
                                <option value="1">Public</option>
                            </select>
                        </div>
                        <div className="info soft-text">By default all builds are public. If you want to make your project private, then please upgrade your account.</div>
                    </div>
                    <ButtonPrimary>Update Build Properties</ButtonPrimary>
                    <div className="fix" />
                </Group>
            </div>
        }
    }
}