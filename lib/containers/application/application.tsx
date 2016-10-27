import { IStore, ISplashScreen, HatcheryProps, IUser } from 'hatchery-editor';
import { authenticated } from '../../actions/user-actions';
import { LoginWidget } from '../login-widget/login-widget';
import { Splash } from '../splash/splash';
import { Dashboard } from '../../components/dashboard/dashboard';

export interface IApplicationState extends HatcheryProps {
    splash?: ISplashScreen;
    user?: IUser;
}

/**
 * The main GUI component of the application.
 */
class Application extends React.Component<IApplicationState, void> {

    // Configure routes here as this solves a problem with hot loading where
    // the routes are recreated each time.
    private _routes: JSX.Element;

    constructor( props: IApplicationState ) {
        super( props );
        this._routes = (
            <ReactRouter.Route path="/app">
                <ReactRouter.IndexRoute component={LoginWidget} onEnter={( nextState, replace ) => this.authorized( nextState, replace )} />
                <ReactRouter.Route path="/splash" component={Splash} onEnter={( nextState, replace ) => this.requireAuth( nextState, replace )} />
                <ReactRouter.Route path="/dashboard" component={Dashboard} onEnter={( nextState, replace ) => this.requireAuth( nextState, replace )} />
            </ReactRouter.Route> );
    }

    componentDidMount() {
        this.props.dispatch!( authenticated() );
    }

    authorized( nextState: ReactRouter.RouterState, replace: ReactRouter.RedirectFunction ) {
        const isLoggedIn = this.props.user!.isLoggedIn!;
        nextState; // Suppress warnings

        if ( isLoggedIn )
            replace( '/splash' );
    }

    requireAuth( nextState: ReactRouter.RouterState, replace: ReactRouter.RedirectFunction ) {
        const isLoggedIn = this.props.user!.isLoggedIn!;
        nextState; // Suppress warnings

        if ( !isLoggedIn )
            replace( '/' );
    }

    /**
     * Creates the component elements
     */
    render(): JSX.Element {
        const isLoading = this.props.user!.loading!;

        let mainView: JSX.Element;



        if ( isLoading ) {
            mainView = <div className="loading-screen">
                <div className="loading-message fade-in">
                    <h2>Loading Hatchery Editor...</h2>
                    <i className="fa fa-cog fa-spin fa-3x fa-fw"></i>
                </div>
            </div>;
        }
        else {
            mainView = this._routes;
        }

        return <div id="application">
            {mainView}
        </div>;
    }
}

const ConnectedApp = ReactRedux.connect<IApplicationState, any, any>(( state: IStore ) => {
    return {
        splash: state.splash,
        user: state.user
    }
})( Application );

export { ConnectedApp as Application };