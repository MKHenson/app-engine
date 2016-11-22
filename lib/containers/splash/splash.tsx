import { IStore, ISplashScreen, HatcheryProps, IUser } from 'hatchery-editor';
import { logout, removeProject } from '../../actions/user-actions';
import { getProjectList, createProject } from '../../actions/splash-actions';
import { LogActions } from '../../actions/logger-actions';
import { OpenProject } from '../../components/open-project/open-project';
import { NewProject } from '../../components/new-project/new-project';
import { ProjectsOverview } from '../../components/projects-overview/projects-overview';

/**
 * An interface that describes the props of the Splash Component
 */
export interface ISplashProps extends HatcheryProps {
    user?: IUser;
    splash?: ISplashScreen;
    section?: string;
}

/**
 * Describes the state interface for the Splash Component
 */
export interface ISplashState {
    project?: HatcheryServer.IProject | null;
}

/**
 * The splash screen when starting the app
 */
class Splash extends React.Component<ISplashProps, ISplashState> {

    /**
     * Creates an instance of the splash screen
     */
    constructor( props: ISplashProps ) {
        super( props );
        this.state = {
            project: null
        };
    }

    /**
     * Renders the projects overview sub section
     */
    renderOverview() {
        const dispatch = this.props.dispatch!;
        const username = this.props.user!.entry!.username!;
        const splash = this.props.splash!;

        return (
            <ProjectsOverview
                splash={splash}
                username={username}
                onProjectDelete={( project ) => dispatch( removeProject( username, project._id ) )}
                onProjectsRefresh={( index, limit, searchterm ) => dispatch( getProjectList( username, index, limit, searchterm ) )}
                onCreateProject={() => { dispatch( ReactRouterRedux.push( '/overview/new' ) ) } }
                onOpenProject={( project ) => {
                    if ( !project )
                        return;

                    dispatch( ReactRouterRedux.push( '/overview/open' ) );
                } }
                />
        )
    }

    /**
     * Renders the open project sub section
     */
    renderOpenProject() {
        const dispatch = this.props.dispatch!;

        return (
            <OpenProject
                dispatch={dispatch}
                project={this.state.project!}
                onComplete={() => {
                    dispatch( LogActions.message( `Opened project '${this.state.project!.name!}''` ) );
                    throw new Error( 'Not implemented' );
                } }
                onCancel={() => { dispatch( ReactRouterRedux.push( '/overview' ) ) } }
                />
        );
    }

    /**
     * Renders the new project sub section
     */
    renderNewProject() {
        const dispatch = this.props.dispatch!;
        const splash = this.props.splash!;

        return (
            <NewProject
                splash={splash}
                onCreateProject={( options ) => { dispatch( createProject( options ) ) } }
                onCancel={() => { dispatch( ReactRouterRedux.push( '/overview' ) ) } }
                />
        );
    }

    /**
     * Creates the component elements
     */
    render(): JSX.Element {
        // const splash = this.props.splash!;
        const dispatch = this.props.dispatch!;

        let mainView: JSX.Element | undefined;

        switch ( this.props.section ) {
            case 'new':
                mainView = this.renderNewProject();
                break;
            case 'open':
                mainView = this.renderOpenProject();
                break;
            default:
                mainView = this.renderOverview();
                break
        }

        return <div id="splash" className="fade-in" ref={( elm ) => {
            if ( elm )
                setTimeout( function() { ( elm as HTMLElement ).style.width = '80%' }, 300 )
        } }>
            <div className="logo">
                <div className="logout">
                    <a onClick={() => { dispatch( logout() ) } }>
                        <i className="fa fa-sign-out" aria-hidden="true"></i> Logout
                        </a>
                </div>
                <h2>Hatchery</h2>
            </div>
            <div className="background projects">
                {mainView}
            </div>
        </div>
    }
}

// Connects th splash screen with its store properties
const ConnectedSplash = ReactRedux.connect<ISplashProps, any, any>(( state: IStore, ownProps ) => {
    return {
        user: state.user,
        splash: state.splash,
        section: ownProps.routeParams.section
    }
})( Splash )

export { ConnectedSplash as Splash };