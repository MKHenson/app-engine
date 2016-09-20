namespace Animate {

    export interface ITabPaneProps {
        label: string;
        showCloseButton?: boolean;
        onDispose?: ( paneIndex: number, prop: ITabPaneProps ) => void;
        canSelect?: ( paneIndex: number, prop: ITabPaneProps ) => boolean | Promise<boolean>;
        canClose?: ( paneIndex: number, prop: ITabPaneProps ) => boolean | Promise<boolean>;
        onSelect?: ( paneIndex: number ) => void;
    }

	/**
	 * A single page/pane/folder pane for use in a Tab
	 */
    export class TabPane extends React.Component<ITabPaneProps, any> {
        static defaultProps: ITabPaneProps = {
            label: null,
            showCloseButton: true,
            canClose: null,
            canSelect: null,
            onDispose: null
        }

        /**
         * Creates a new pane instance
         */
        constructor( props: ITabPaneProps ) {
            super( props );
        }

        /**
         * Creates the component elements
         */
        render(): JSX.Element {
            return <div className="tab-pane">
                {this.props.children}
            </div>
        }
    }
}