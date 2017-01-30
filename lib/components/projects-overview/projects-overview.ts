import { ButtonSuccess, ButtonLink, ButtonPrimary } from '../buttons/buttons';
import { ProjectList } from '../project-list/project-list';
import { MessageBox } from '../forms/message-box/message-box';

export interface IProjectsOverviewProps {
    splash: HatcheryEditor.ISplashScreen;
    username: string;
    onProjectDelete: ( project: HatcheryServer.IProject ) => void;
    onCreateProject: () => void;
    onOpenProject: ( project: HatcheryServer.IProject ) => void;
    onProjectsRefresh: ( index: number, limit: number, searchTerm: string ) => void;
}

export interface IProjectsOverviewState {
    selectedProject?: HatcheryServer.IProject | null;
}

/**
 * A component for viewing projects, displaying their stats, removing, adding or opening them.
 */
export class ProjectsOverview extends React.Component<IProjectsOverviewProps, IProjectsOverviewState> {
    private _list: ProjectList;

    /**
     * Creates an instance of the projects overview
     */
    constructor( props: IProjectsOverviewProps ) {
        super( props );
        this.state = {
            selectedProject: null
        };
    }

    /**
     * Renders the project details section
     */
    renderProjectInfo() {
        const project = this.state.selectedProject!;

        return (
            <div className="fade-in project-details">
                <div>
                    <h2>{project.name}</h2>
                    <p><span className="info">Created By: </span><span className="detail"><b>{project.user}</b></span></p>
                    <p><span className="info">Created On: </span><span className="detail">{new Date( project.createdOn! ).toLocaleDateString()}</span></p>
                    <p><span className="info">Last Modified On: </span><span className="detail">{new Date( project.lastModified! ).toLocaleDateString()}</span></p>
                    <p><span className="info">No.Plugins: </span><span className="detail">{project.versions!.length}</span></p>
                    <div className="fix"></div>
                    <p>{project.description}</p>
                </div>
                <div className="buttons">
                    <ButtonLink onClick={() => {
                        MessageBox.warn(
                            `Are you sure you want to permanently remove the project '${project.name}'?`,
                            [ 'Yes', 'No' ],
                            ( button ) => {
                                if ( button === 'No' )
                                    return;

                                if ( this.props.onProjectDelete )
                                    this.props.onProjectDelete( this.state.selectedProject! );
                            }
                        );
                    } }>
                        REMOVE
                        </ButtonLink>
                    <ButtonSuccess onClick={() => {
                        if ( this.props.onOpenProject )
                            this.props.onOpenProject( project );
                    }
                    }>
                        OPEN <span className="fa fa-chevron-right" />
                    </ButtonSuccess>
                </div>
            </div>
        );
    }

    /**
     * Creates the component elements
     */
    render(): JSX.Element {
        const splash = this.props.splash;
        const username = this.props.username;
        const project: HatcheryServer.IProject | null = ( this.state.selectedProject ? this.state.selectedProject : null );

        return (
            <div className="projects-overview">
                <ProjectList
                    ref={( target ) => { this._list = target; } }
                    projects={splash.projects}
                    numProjects={splash.numProjects}
                    onProjectsRequested={( index, limit, keywords ) => {
                        if ( this.props.onProjectsRefresh )
                            this.props.onProjectsRefresh( index, limit, keywords );
                    } }
                    noProjectMessage={`Welcome ${username}, click New Appling to get started`}
                    className="projects-view animate-all"
                    style={{ width: ( this.state.selectedProject ? '70%' : '' ) }}
                    onProjectDClicked={( project ) => {
                        this.setState( { selectedProject: project });
                        if ( this.props.onOpenProject )
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
                    {( project ? this.renderProjectInfo() : undefined )}
                </div>
            </div>
        )
    }
}