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

        /**
         * Bind any project related events
         */
        componentWillMount() {
            this.props.project.on<ProjectEvents, void>( 'change', this.onProjectChanged, this );
        }

        /**
         * Unbind any project related events
         */
        componentWillUnmount() {
            this.props.project.off<ProjectEvents, void>( 'change', this.onProjectChanged, this );
        }

        /**
         * Update the workspace
         */
        onProjectChanged( type: ProjectEvents ) {
            type; // Supresses unused param error
            this.forceUpdate();
        }

        canContainerClose( editor: Editor ): boolean | Promise<boolean> {

            if ( !editor.resource.saved || editor.hasUndos ) {
                return new Promise<Boolean>( function( resolve ) {
                    MessageBox.warn(
                        `'${editor.resource.entry.name}' is not saved. Do you want to save it before closing?`,
                        [ 'Yes', 'No' ],
                        ( button ) => {
                            if ( button === 'Yes' ) {
                                editor.collapse( true );
                                resolve( false );
                            }
                            else {
                                editor.collapse( false );
                                resolve( true );
                            }
                        });
                });
            }

            editor.collapse( false );
            return true;
        }

        /**
         * Creates the component elements
         */
        render(): JSX.Element {

            const editors = this.props.project.openEditors;

            return (
                <div className="workspace">
                    {( editors.length === 0 ? (
                        <div className="welcome">
                            <h2>Welcome back {User.get.entry.username}</h2>
                            <ButtonLink>Create Container</ButtonLink>
                            <ButtonLink>Open the Docs</ButtonLink>
                        </div>
                    ) : (
                            <Tab
                                panes={editors.map(( editor, index ) => {
                                    return (
                                        <TabPane
                                            onSelect={() => {
                                                this.props.project.activateEditor( editor );
                                            } }
                                            key={'pane-' + index}
                                            canClose={() => {
                                                return this.canContainerClose( editor );
                                            } }

                                            label={( !editor.resource.saved || editor.hasUndos ? '* ' : '' ) + editor.resource.entry.name}>
                                            <Schema editor={editor as ContainerSchema} />
                                        </TabPane>
                                    )
                                })} />
                        ) )}
                </div>
            );
        }
    }
}