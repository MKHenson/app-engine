import { JML } from '../../jml/jml';
import { Pager } from '../pager/pager';
import { User } from '../../models/user';
// import { ImagePreview } from '../image-preview/image-preview';
import { SearchBox } from '../search-box/search-box';

/**
 * A list that displays projects in a paginated container.
 */
export class ProjectList extends HTMLElement {

    public onProjectSelected?: ( project: HatcheryServer.IProject ) => void;
    public onProjectDClicked?: ( project: HatcheryServer.IProject ) => void;
    public noProjectMessage?: string;
    public user: User;

    private _loading?: boolean;
    private _searchText?: string;
    private _selectedProject?: HatcheryServer.IProject | null;
    private _errorMsg?: string | null;
    private _projects?: HatcheryServer.IProject[];

    /**
     * Creates a new instance
     */
    constructor() {
        super();
        this.noProjectMessage = 'You have no projects';
        this._loading = false;
        this._selectedProject = null;
        this._errorMsg = null;
        this._projects = [];
        this._searchText = '';

        this.appendChild( JML.div( { className: 'projects-toolbar background' }, [
            JML.elm<SearchBox>( new SearchBox(), {
                placeholder: 'Keywords', onSearch: ( e, text ) => {
                    this._searchText = text;
                    // TODO: ( this.refs[ 'pager' ] as Pager ).invalidate();
                }
            }),
            JML.i( { className: 'loader fa fa-cog fa-spin fa-3x fa-fw' })
        ] ) );

        this.appendChild( JML.div( { className: 'projects-container', onclick: ( e ) => this.selectProject( null, false ) }, [
            JML.elm<Pager>( new Pager( 6 ), { remote: ( index, limit ) => this._fetchProjects( index, limit ) }, [
                JML.div( { className: 'project-items' }, [
                    JML.div( { className: 'error bad-input' }, '' ),
                    JML.div( { className: 'projects' }),
                    JML.div( { className: 'no-items unselectable' }, this.noProjectMessage )
                ] )
            ] )
        ] ) );


        //         <Pager
        //             limit={6}
        //             ref="pager"
        //             count={this.props.numProjects!}
        //             onUpdate={( index, limit ) => {
        //                 if ( this.props.onProjectsRequested )
        //                     this.props.onProjectsRequested( index, limit, this.state.searchText! )
        //             } }>
        //             <div className="project-items">
        //                 <div className="error bad-input" style={{ display: ( this.state.errorMsg ? 'block' : '' ) }}>
        //                     {this.state.errorMsg || ''}
        //                 </div>
        //                 {
        //                     projects.map(( p ) => {
        //                         return <ImagePreview key={p._id}
        //                             className="project-item"
        //                             selected={p.selected}
        //                             src={p.image}
        //                             label={p.name}
        //                             labelIcon={<span className="fa fa-file" />}
        //                             onDoubleClick={( e ) => {
        //                                 this.selectProject( p, true );
        //                                 e.stopPropagation();
        //                             } }
        //                             onClick={( e ) => {
        //                                 this.selectProject( p, false );
        //                                 e.stopPropagation();
        //                             } }
        //                             />
        //                     })}
        //                 <div className="no-items unselectable" style={{ display: ( projects.length ? 'none' : '' ) }}>
        //                     {this.props.noProjectMessage}
        //                 </div>
        //             </div>
        //         </Pager>
    }

    private async _fetchProjects( index: number, limit: number ) {

        // this.user.

        //                      projects.map(( p ) => {
        //                         return <ImagePreview key={p._id}
        //                             className="project-item"
        //                             selected={p.selected}
        //                             src={p.image}
        //                             label={p.name}
        //                             labelIcon={<span className="fa fa-file" />}
        //                             onDoubleClick={( e ) => {
        //                                 this.selectProject( p, true );
        //                                 e.stopPropagation();
        //                             } }
        //                             onClick={( e ) => {
        //                                 this.selectProject( p, false );
        //                                 e.stopPropagation();
        //                             } }
        //                             />
        //                     })}

        // this.props.onProjectsRequested( index, limit, this.state.searchText! )
        return 0;
    }

    /*
     * Called when we select a project
     * @param project The project to select
     */
    selectProject( project: HatcheryServer.IProject | null, doubleClick: boolean ) {

        if ( this._selectedProject && this._selectedProject !== project )
            this._selectedProject.selected = false;

        if ( !project ) {
            this._selectedProject = null;
            return;
        }

        project.selected = true;
        this._selectedProject = project;
        if ( this.onProjectSelected ) {
            this.onProjectSelected( project );

            if ( doubleClick && this.onProjectDClicked )
                this.onProjectDClicked( project );
        }
    }
}