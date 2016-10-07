namespace Animate {

    export interface IProjectsOverviewProps extends React.HTMLAttributes {
        onCreateProject: () => void;
        onOpenProject: ( project: HatcheryServer.IProject ) => void;
    }

    export interface IProjectsOverviewState {
        loading?: boolean;
        selectedProject?: IInteractiveProject;
        errorMsg?: string;
    }

    /**
     * A component for viewing projects, displaying their stats, removing, adding or opening them.
     */
    export class ProjectsOverview extends React.Component<IProjectsOverviewProps, IProjectsOverviewState> {
        private _user: User;
        private _list: ProjectList;

        /**
         * Creates an instance of the projects overview
         */
        constructor( props: IProjectsOverviewProps ) {
            super( props );
            this._user = User.get;
            this.state = {
                loading: false,
                selectedProject: null,
                errorMsg: null
            };
        }

        /*
        * Removes the selected project if confirmed by the user
        * @param messageBoxAnswer The messagebox confirmation/denial from the user
        */
        removeProject( messageBoxAnswer: string ) {
            if ( messageBoxAnswer === 'No' )
                return;

            this._user.removeProject( this.state.selectedProject._id ).then(() => {
                this._list.removeProject( this.state.selectedProject );
            }).catch( function ( err: Error ) {
                MessageBox.error( err.message );
            });
        }

        /**
        * Creates the component elements
        */
        render(): JSX.Element {
            let projectInfo: JSX.Element;
            const project: HatcheryServer.IProject = ( this.state.selectedProject ? this.state.selectedProject : null );

            // If we have a project
            if ( this.state.selectedProject ) {
                projectInfo = <div className="fade-in project-details">
                    <div>
                        <h2>{project.name}</h2>
                        <p><span className="info">Created By: </span><span className="detail"><b>{project.user}</b></span></p>
                        <p><span className="info">Created On: </span><span className="detail">{new Date( project.createdOn ).toLocaleDateString() }</span></p>
                        <p><span className="info">Last Modified On: </span><span className="detail">{new Date( project.lastModified ).toLocaleDateString() }</span></p>
                        <p><span className="info">No.Plugins: </span><span className="detail">{this.state.selectedProject.plugins.length}</span></p>
                        <div className="fix"></div>
                        <p>{project.description}</p>
                    </div>
                    <div className="buttons">
                        <ButtonLink onClick={( e ) => {
                            MessageBox.warn(
                                `Are you sure you want to permanently remove the project '${project.name}'?`,
                                [ 'Yes', 'No' ],
                                ( button ) => { this.removeProject( button ) }
                            );
                        } }>
                            REMOVE
                        </ButtonLink>
                        <ButtonSuccess onClick={() => { this.props.onOpenProject( this.state.selectedProject ); } }>
                            OPEN <span className="fa fa-chevron-right" />
                        </ButtonSuccess>
                    </div>
                </div>
            }

            return <div className="projects-overview">
                <ProjectList
                    ref={( target ) => { this._list = target; } }
                    noProjectMessage={`Welcome ${this._user.entry.username}, click New Appling to get started`}
                    className="projects-view animate-all"
                    style={{ width: ( this.state.selectedProject ? '70%' : '' ) }}
                    onProjectDClicked={( project ) => {
                        this.setState( { selectedProject: project });
                        this.props.onOpenProject( project );
                    } }
                    onProjectSelected={( project ) => {
                        this.setState( { selectedProject: project });
                    } }>
                    <ButtonPrimary onClick={() => {
                        if ( this.props.onCreateProject )
                            this.props.onCreateProject();
                    } }>
                        <i className="fa fa-plus" aria-hidden="true"></i> New Appling
                    </ButtonPrimary>
                </ProjectList>
                <div className="project-info background animate-all" style={{ width: ( this.state.selectedProject ? '30%' : '' ), left: ( this.state.selectedProject ? '70%' : '' ) }}>
                    {projectInfo}
                </div>
            </div>
        }
    }
}