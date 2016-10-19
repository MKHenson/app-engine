namespace Animate {

    export interface IProjectListProps extends React.HTMLAttributes {
        onProjectSelected?: ( project: HatcheryServer.IProject ) => void;
        onProjectDClicked?: ( project: HatcheryServer.IProject ) => void;
        noProjectMessage?: string;
        projects?: HatcheryServer.IProject[];
        numProjects?: number;
        onProjectsRequested?: ( index: number, limit: number, keywords: string ) => void;
    }

    export interface IProjectListState {
        loading?: boolean;
        searchText?: string;
        selectedProject?: HatcheryServer.IProject | null;
        errorMsg?: string | null;
        projects?: HatcheryServer.IProject[];
    }

    /**
     * A list that displays projects
     */
    export class ProjectList extends React.Component<IProjectListProps, IProjectListState> {
        static defaultProps: IProjectListProps = {
            noProjectMessage: 'You have no projects'
        }

        private _user: User;

        /**
         * Creates a new instance
         */
        constructor( props ) {
            super( props );
            this._user = User.get;
            this.state = {
                loading: false,
                selectedProject: null,
                errorMsg: null,
                projects: [],
                searchText: ''
            };
        }

        /**
         * Removes a project from the list
         * @param p The project to remove
         */
        removeProject( p: HatcheryServer.IProject ) {
            const projects = this.state.projects;
            if ( projects!.indexOf( p ) !== -1 ) {
                projects!.splice( projects!.indexOf( p ), 1 );
                this.setState( { projects: projects });
            }
        }

        /*
         * Called when we select a project
         * @param project The project to select
         */
        selectProject( project: HatcheryServer.IProject | null, doubleClick: boolean ) {

            if ( this.state.selectedProject && this.state.selectedProject !== project )
                this.state.selectedProject.selected = false;

            if ( !project ) {
                this.setState( { selectedProject: null });
                return;
            }

            project.selected = true;
            this.setState( { selectedProject: project });
            if ( this.props.onProjectSelected ) {
                this.props.onProjectSelected( project );

                if ( doubleClick && this.props.onProjectDClicked )
                    this.props.onProjectDClicked( project );
            }
        }

        /**
         * Creates the component elements
         */
        render(): JSX.Element {
            const props: IProjectListProps = Object.assign( {}, this.props );
            const projects = this.props.projects!;
            delete props.noProjectMessage;
            delete props.onProjectSelected;
            delete props.onProjectDClicked;
            delete props.projects;
            delete props.numProjects;
            delete props.onProjectsRequested;

            return <div {...props} className={'project-list ' + ( props.className || '' )}>
                <div className="projects-toolbar background">
                    {this.props.children}
                    <SearchBox placeholder="Keywords" onSearch={( e, text ) => {
                        e; // Supresses unused param error
                        this.state.searchText = text;
                        ( this.refs[ 'pager' ] as Pager ).invalidate();
                    } } />
                    {this.state.loading ? <i className="fa fa-cog fa-spin fa-3x fa-fw"></i> : null}
                </div>
                <div className="projects-container" onClick={() => { this.selectProject( null, false ) } }>
                    <Pager
                        limit={6}
                        ref="pager"
                        count={this.props.numProjects!}
                        onUpdate={( index, limit ) => {
                            if ( this.props.onProjectsRequested )
                                this.props.onProjectsRequested( index, limit, this.state.searchText! )
                        } }>
                        <div className="project-items">
                            <div className="error bad-input" style={{ display: ( this.state.errorMsg ? 'block' : '' ) }}>
                                {this.state.errorMsg || ''}
                            </div>
                            {
                                projects.map(( p ) => {
                                    return <ImagePreview key={p._id}
                                        className="project-item"
                                        selected={p.selected}
                                        src={p.image}
                                        label={p.name}
                                        labelIcon={<span className="fa fa-file" />}
                                        onDoubleClick={( e ) => {
                                            this.selectProject( p, true );
                                            e.stopPropagation();
                                        } }
                                        onClick={( e ) => {
                                            this.selectProject( p, false );
                                            e.stopPropagation();
                                        } }
                                        />
                                })}
                            <div className="no-items unselectable" style={{ display: ( projects.length ? 'none' : '' ) }}>
                                {this.props.noProjectMessage}
                            </div>
                        </div>
                    </Pager>
                </div>
            </div>
        }
    }
}