import { IStore, ISplashScreen, HatcheryProps, IUser } from 'hatchery-editor';


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

    /**
     * Creates the component elements
     */
    render(): JSX.Element {
        const isLoading = this.props.user!.loading!;
        let mainView: JSX.Element | React.ReactNode;

        if ( isLoading )
            mainView = <div className="loading-screen">
                <div className="loading-message fade-in">
                    <h2>Loading Hatchery Editor...</h2>
                    <i className="fa fa-cog fa-spin fa-3x fa-fw"></i>
                </div>
            </div>;

        return <div id="application">
            <div className="splash-view">
                {this.props.children}
            </div>
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