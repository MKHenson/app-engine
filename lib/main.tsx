import './setup/emitters';
import { LoaderBase } from './core/loaders/loader-base';
import { DB } from './setup/db';
import { editorReducer } from './reducers/editor-reducer';
import { loggerReducer } from './reducers/logger-reducer';
import { projectReducer } from './reducers/project-reducer';
import { splashReducer } from './reducers/splash-reducer';
import { userReducer } from './reducers/user-reducer';
import { PluginManager } from './core/plugin-manager';
import { Application } from './containers/application/application';
import { Splash } from './containers/splash/splash';
import { LoginWidget } from './containers/login-widget/login-widget';
import { IStore } from 'hatchery-editor';

/**
 * Creates the redux store for the application
 */
function createStore(): Redux.Store<any> {

    const actionTypeLogger = store => next => action => {
        store; // Supress unused param error
        console.log( `Action received: '${action.type}'` );
        next( action );
    }

    // Creates the thunk middleware so that we can return
    // functions to redux dispatch actions
    function createThunkMiddleware( extraArgument?): any {
        return ( { dispatch, getState }) => next => action => {
            if ( typeof action === 'function' )
                return action( dispatch, getState, extraArgument );

            return next( action );
        };
    }

    const thunk = createThunkMiddleware();
    thunk.withExtraArgument = createThunkMiddleware;


    // Create the reducers object
    const reducers = Redux.combineReducers( {
        project: projectReducer,
        editorState: editorReducer,
        logs: loggerReducer,
        user: userReducer,
        splash: splashReducer,
        routing: ReactRouterRedux.routerReducer
    });

    // Creat the store
    const store = Redux.createStore( reducers, Redux.applyMiddleware( actionTypeLogger, thunk, ReactRouterRedux.routerMiddleware( ReactRouter.browserHistory ) ) );
    store.subscribe(() => {
        console.log( 'store changed', store.getState() )
    });

    return store;
}



/**
 * Once the plugins are loaded from the DB
 */
function onPluginsLoaded( plugins: HatcheryServer.IPlugin[] ) {
    PluginManager.getSingleton().sortPlugins( plugins );

    const store = createStore();
    const history = ReactRouterRedux.syncHistoryWithStore( ReactRouter.browserHistory, store );

    // function authorized( replace: ReactRouter.RedirectFunction ) {
    //     const isLoggedIn = (store.getState() as IStore).user!.isLoggedIn!;

    //     if ( isLoggedIn )
    //         replace( '/splash/overview' );
    // }

    function requireAuth( currentState: ReactRouter.RouterState, replace: ReactRouter.RedirectFunction ) {
        const isLoggedIn = ( store.getState() as IStore ).user!.isLoggedIn!;

        if ( !isLoggedIn )
            replace( '/?forward=' + currentState.location.pathname );
    }

    // Create the application element
    ReactDOM.render((
        <ReactRedux.Provider store={store}>
            <ReactRouter.Router history={history}>
                <ReactRouter.Route path="/" component={Application} >
                    <ReactRouter.IndexRoute component={LoginWidget} />
                    <ReactRouter.Route path="overview(/:section)" component={Splash} onEnter={( next, replace ) => { requireAuth( next, replace ) } } />
                </ReactRouter.Route>
                <ReactRouter.Route path="/dashboard">
                </ReactRouter.Route>
            </ReactRouter.Router>
        </ReactRedux.Provider > ), document.getElementById( 'main' ) ! );
}


// Once the document is ready we begin
jQuery( document ).ready( function() {
    // Make sure we call ajax with credentials on
    jQuery.ajaxSetup( {
        crossDomain: true,
        xhrFields: { withCredentials: true }
    });

    // Show the loading animation
    LoaderBase.showLoader();

    // Donwload the plugins available to this user
    jQuery.getJSON( `${DB.API}/plugins` ).done( function( response: ModepressAddons.IGetProjects ) {
        onPluginsLoaded( response.data );
    }).fail( function( err: JQueryXHR ) {
        document.write( `An error occurred while connecting to the server. ${err.status}: ${err.responseText}` );
    }).always( function() {
        LoaderBase.hideLoader();
    });
});