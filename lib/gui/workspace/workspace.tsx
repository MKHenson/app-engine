namespace Animate {

    export interface IWorkspaceProps extends ITabProps {
        project: Project;
    }

	/**
	 * The main workspace area of the application.
	 */
    export class Workspace extends React.Component<IWorkspaceProps, any> {

        /**
         * Creates an instance of the workspace
         */
        constructor( props: IWorkspaceProps ) {
            super( props );
        }

        componentWillMount() {

            // add project events
            this.props.project.on<ContainerEvents, IContainerEvent>( 'workspace-opened', this.onContainerToggled, this );
        }

        componentWillUnmount() {
            // remove project events
            this.props.project.off<ContainerEvents, IContainerEvent>( 'workspace-opened', this.onContainerToggled, this );
        }

        onContainerToggled( type: ContainerEvents, event: IContainerEvent ) {
            this.forceUpdate();
        }

        canContainerClose( container: Resources.Container ): boolean | Promise<boolean> {
            if ( !container.saved ) {
                return new Promise<Boolean>( function ( resolve, reject ) {
                    MessageBox.warn(
                        `'${container.entry.name}' is not saved. Do you want to save it before closing?`,
                        [ 'Yes', 'No' ],
                        ( button ) => {
                            if ( button === 'Yes' ) {
                                this.props.project.openContainerWorkspace( container, false );
                                resolve( false );
                            }
                            else {
                               this.props.project.openContainerWorkspace( container, false );
                                resolve( true );
                            }
                        });
                });
            }

            this.props.project.openContainerWorkspace( container, false );
            return true;
        }

        /**
         * Creates the component elements
         */
        render(): JSX.Element {

            const containers = this.props.project.containers;
            const openWorkspaces: ContainerWorkspace[] = [];

            for ( const c of containers )
                if ( c.workspace.opened )
                    openWorkspaces.push( c.workspace );

            return (
                <div className="workspace">
                    {( openWorkspaces.length === 0 ? (
                        <div className="welcome">
                            <h2>Welcome back {User.get.entry.username}</h2>
                            <ButtonLink>Create Container</ButtonLink>
                            <ButtonLink>Open the Docs</ButtonLink>

                        </div>
                    ) : (
                            <Tab panes={ openWorkspaces.map(( workspace ) => {
                                return (
                                    <TabPane
                                        canClose={ ( i, props ) => {
                                            return this.canContainerClose( workspace.container );
                                        } }
                                        label={ ( workspace.container.saved ? '' : '* ' ) + workspace.container.entry.name}>
                                        <ReactCanvas store={workspace} />
                                    </TabPane>
                                )
                            }) } />
                        ) )}
                </div>
            );
        }
    }
}