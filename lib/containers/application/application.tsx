import { IStore, ISplashScreen, HatcheryProps, IUser } from 'hatchery-editor';
import { authenticated } from '../../actions/user-actions';
import { PropertyGrid } from '../../components/property-grid';
import { User } from '../../core/user';
import { PluginManager } from '../../core/plugin-manager';
import { Component } from '../../components/component';
import { LoginWidget } from '../login-widget/login-widget';
import { Splash } from '../splash/splash';
import { Dashboard } from '../../components/dashboard/dashboard';
import { connect } from 'react-redux';

export interface IApplicationState extends HatcheryProps {
    splash?: ISplashScreen;
    user?: IUser;
}

/**
 * The main GUI component of the application.
 */
export class Application extends React.Component<IApplicationState, void> {
    private static _singleton: Application;
    public static bodyComponent: Component;
    private _focusObj: Component;

    // Configure routes here as this solves a problem with hot loading where
    // the routes are recreated each time.
    private _routes: JSX.Element;


    constructor( props: IApplicationState ) {
        super( props );

        Application._singleton = this;
        User.get;

        this._routes = (
            <ReactRouter.Route path="/">
                <ReactRouter.IndexRoute component={LoginWidget} onEnter={( nextState, replace ) => this.authorized( nextState, replace )} />
                <ReactRouter.Route path="/splash" component={Splash} onEnter={( nextState, replace ) => this.requireAuth( nextState, replace )} />
                <ReactRouter.Route path="/dashboard" component={Dashboard} onEnter={( nextState, replace ) => this.requireAuth( nextState, replace )} />
            </ReactRouter.Route> );
    }

    componentWillMount() {
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
            mainView = (
                <ReactRouter.Router history={ReactRouter.browserHistory}>
                    {this._routes}
                </ReactRouter.Router>
            );
        }

        return <div id="application">
            {mainView}
        </div>;
    }

    /**
     * Deals with the focus changes
     */
    onMouseDown( e ): void {
        let elem: JQuery = jQuery( e.target );
        let comp: Component = elem.data( 'component' ) as Component;

        while ( !comp && elem.length !== 0 ) {
            elem = jQuery( elem ).parent();
            comp = elem.data( 'component' );
        }

        this.setFocus( comp );
    }

    /**
    * Sets a component to be focused.
    * @param comp The component to focus on.
    */
    setFocus( comp: Component ): void {
        if ( this._focusObj )
            this._focusObj.element.data( 'focus', false );

        if ( comp !== null ) {
            comp.element.data( 'focus', true );
            this._focusObj = comp;
        }
    }

    /**
    *  This is called when a project is unloaded and we need to reset the GUI.
    */
    projectReset() {
        const user = User.get;

        // TODO: Figure out what to do with resets?
        PropertyGrid.getSingleton().projectReset();
        // LoggerStore.get.clear();
        // TreeViewScene.getSingleton().projectReset( user.project );
        // CanvasTab.getSingleton().projectReset();

        // Must be called after reset
        if ( user.project )
            user.project.reset();

        // Unload all the plugins
        PluginManager.getSingleton().projectReset();
    }

    /**
     * Gets the singleton instance
     * @returns {Application}
     */
    public static getInstance(): Application {
        return Application._singleton;
    }

    get focusObj(): Component { return this._focusObj; }
}

connect<IApplicationState, any, any>(( state: IStore ) => {
    return {
        splash: state.splash,
        user: state.user
    }
});