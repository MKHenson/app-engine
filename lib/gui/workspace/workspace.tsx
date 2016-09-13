namespace Animate {

    export interface IWorkspaceProps extends ITabProps {
        project: Project;
    }

	/**
	 * The main workspace area of the application.
	 */
    export class Workspace extends Tab<IWorkspaceProps, ITabState> {

        static defaultProps: IWorkspaceProps = {
            className : 'workspace',
            project: null
        };

        componentWillMount() {
            // add project events
        }

        componentWillUnmount() {
            // remove project events
        }

        /**
         * Called when there are no panes for the tab and a custom view is desired
         */
        renderEmptyPanes(): JSX.Element {
            return (
                <div className="welcome">
                    <h2>Welcome back {User.get.entry.username}</h2>
                    <ButtonLink>Create Container</ButtonLink>
                    <ButtonLink>Open the Docs</ButtonLink>
                </div>
            );
        }

        /**
         * Creates an instance of the workspace tab
         */
        constructor( props: IWorkspaceProps ) {
            super( props );
        }
    }
}