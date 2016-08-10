module Animate {

    export interface ITabPaneProps {
        label: string;
    }

	/**
	 * A single page/pane/folder pair for use in a Tab
	 */
	export class TabPane extends React.Component<ITabPaneProps, any > {

        /**
         * Creates a new pane instance
         */
        constructor(props:ITabPaneProps) {
            super(props);
        }

        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element {
            return <div className="tab-page background">
                {this.props.children}
            </div>
        }
    }
}