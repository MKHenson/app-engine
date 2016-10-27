import { IStore, ISplashScreen, HatcheryProps, IUser } from 'hatchery-editor';
import { authenticated } from '../../actions/user-actions';

export interface IApplicationState extends HatcheryProps {
    splash?: ISplashScreen;
    user?: IUser;
}

/**
 * The main GUI component of the application.
 */
class Application extends React.Component<IApplicationState, void> {

    constructor( props: IApplicationState ) {
        super( props );
    }

    componentDidMount() {
        this.props.dispatch!( authenticated() );
    }

    /**
     * Creates the component elements
     */
    render(): JSX.Element {
        const isLoading = this.props.user!.loading!;
        const loggedIn = this.props.user!.isLoggedIn!;
        let mainView: JSX.Element | React.ReactNode;

        if ( isLoading )
            mainView = <div className="loading-screen">
                <div className="loading-message fade-in">
                    <h2>Loading Hatchery Editor...</h2>
                    <i className="fa fa-cog fa-spin fa-3x fa-fw"></i>
                </div>
            </div>;
        else
            mainView = <div className="background fade-in splash-view" style={{
                width: ( loggedIn ? '80%' : '20%' ),
                minWidth: ( loggedIn ? '910px' : '450px' )
            }}>{this.props.children}</div>

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