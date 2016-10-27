import { IStore, ISplashScreen, HatcheryProps, IUser } from 'hatchery-editor';
import { logout, removeProject } from '../../actions/user-actions';
import { setSplashScreen, getProjectList, createProject } from '../../actions/splash-actions';
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
export class Splash extends React.Component<ISplashProps, ISplashState> {

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
                onCreateProject={() => { dispatch( setSplashScreen( 'new-project' ) ) } }
                onOpenProject={( project ) => {
                    if ( !project )
                        return;

                    dispatch( setSplashScreen( 'opening-project' ) );
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
                onCancel={() => { dispatch( setSplashScreen( 'welcome' ) ) } }
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
                onCancel={() => { dispatch( setSplashScreen( 'welcome' ) ) } }
                />
        );
    }

    /**
     * Creates the component elements
     */
    render(): JSX.Element {
        const splash = this.props.splash!;
        const dispatch = this.props.dispatch!;

        let mainView: JSX.Element | undefined;

        switch ( splash.screen ) {
            case 'welcome':
                mainView = this.renderOverview();
                break;
            case 'opening-project':
                mainView = this.renderOpenProject();
                break;
            default:
                mainView = this.renderNewProject();
                break
        }

        return <div id="splash">
            <div className="logo">
                <div className="logout background-a">
                    <a onClick={() => { dispatch( logout() ) } }>
                        <i className="fa fa-sign-out" aria-hidden="true"></i> Logout
                        </a>
                </div>
                <h2>Hatchery</h2>
            </div>
            <div id="splash-view">
                {mainView}
            </div>
        </div>
    }
}

// Connects th splash screen with its store properties
ReactRedux.connect<ISplashProps, any, any>(( state: IStore ) => {
    return {
        user: state.user,
        splash: state.splash
    }
})( Splash )