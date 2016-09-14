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
            this.props.project.on<ContainerEvents, IContainerEvent>('workspace-opened', this.onContainerToggled, this );
        }

        componentWillUnmount() {
            // remove project events
            this.props.project.off<ContainerEvents, IContainerEvent>('workspace-opened', this.onContainerToggled, this );
        }

        onContainerToggled( type: ContainerEvents, event: IContainerEvent ) {
            if ( type == 'workspace-opened' ) {
                this.addTab(
                    <TabPane label={event.container.entry.name} showCloseButton={true}>
                        <ReactCanvas store={event.container.workspace} />
                    </TabPane>
                );
            }
            else {
                this.removeTabByLabel( event.container.entry.name );
            }
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