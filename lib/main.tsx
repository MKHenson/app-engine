import './setup/emitters';
import { JML } from './jml/jml';
import { ButtonPrimary, ButtonError, ButtonLink, ButtonSuccess } from './components/buttons/buttons';
import { Attention } from './components/attention/attention';
import { ValidatedText } from './components/validated-text/validated-text';
import { ValidatedSelect } from './components/validated-select/validated-select';
import { Checkbox } from './components/checkbox/checkbox';
import { JsonForm } from './components/json-form/json-form';
import { Group } from './components/group/group';
import { Popup } from './components/popup/popup';
import { Menu } from './components/menu/menu';
import { IconMenu } from './components/icon-menu/icon-menu';
import { Window } from './components/window/window';
import { SearchBox } from './components/search-box/search-box';

import { SplitPanel } from './components/split-panel/split-panel';
import { LoginForm } from './components/login-form/login-form';
import { RegisterForm } from './components/register-form/register-form';


// import { editorReducer } from './reducers/editor-reducer';
// import { loggerReducer } from './reducers/logger-reducer';
// import { projectReducer } from './reducers/project-reducer';
// import { splashReducer } from './reducers/splash-reducer';
// import { userReducer } from './reducers/user-reducer';
import { LoginWidget } from './containers/login-widget/login-widget';
import { Application } from './containers/application/application';
import { Splash } from './containers/splash/splash';


// import { Splash } from './containers/splash/splash';
// import { LoginWidget } from './containers/login-widget/login-widget';
// import { PluginManager } from './core/plugin-manager';
// import { Dashboard } from './containers/dashboard/dashboard';

// /**
//  * Creates the redux store for the application
//  */
// function createStore(): Redux.Store<any> {

//     const actionTypeLogger = store => next => action => {
//         store; // Supress unused param error
//         console.log( `Action received: '${action.type}'` );
//         next( action );
//     }

//     // Creates the thunk middleware so that we can return
//     // functions to redux dispatch actions
//     function createThunkMiddleware( extraArgument?): any {
//         return ( { dispatch, getState }) => next => action => {
//             if ( typeof action === 'function' )
//                 return action( dispatch, getState, extraArgument );

//             return next( action );
//         };
//     }

//     const thunk = createThunkMiddleware();
//     thunk.withExtraArgument = createThunkMiddleware;


//     // Create the reducers object
//     const reducers = Redux.combineReducers( {
//         project: projectReducer,
//         editorState: editorReducer,
//         logs: loggerReducer,
//         user: userReducer,
//         splash: splashReducer,
//         routing: ReactRouterRedux.routerReducer
//     });

//     // Creat the store
//     const store = Redux.createStore( reducers, Redux.applyMiddleware( actionTypeLogger, thunk, ReactRouterRedux.routerMiddleware( ReactRouter.browserHistory ) ) );
//     store.subscribe(() => {
//         console.log( 'store changed', store.getState() )
//     });

//     return store;
// }

/**
 * Once the plugins are loaded from the DB
 */
// function initialize() {
// const store = createStore();
// const history = ReactRouterRedux.syncHistoryWithStore( ReactRouter.browserHistory, store );
// PluginManager.getSingleton( store );

// function requireAuth( currentState: ReactRouter.RouterState, replace: ReactRouter.RedirectFunction ) {
//     const isLoggedIn = ( store.getState() as HatcheryEditor.IStore ).user!.isLoggedIn!;
//     if ( !isLoggedIn )
//         replace( '/?forward=' + currentState.location.pathname );
// }

// // Create the application element
// ReactDOM.render((
//     <ReactRedux.Provider store={store}>
//         <ReactRouter.Router history={history}>
//             <ReactRouter.Route path="/" component={Application} >
//                 <ReactRouter.IndexRoute component={LoginWidget} />
//                 <ReactRouter.Route path="overview(/:section)" component={Splash} onEnter={( next, replace ) => { requireAuth( next, replace ) } } />
//             </ReactRouter.Route>
//             <ReactRouter.Route path="/dashboard/:projectId" component={Dashboard} onEnter={( next, replace ) => { requireAuth( next, replace ) } } />
//             <ReactRouter.Redirect from="/**" to="/" />
//         </ReactRouter.Router>
//     </ReactRedux.Provider > ), document.getElementById( 'main' ) ! );
// };




// Once the document is ready we begin
// initialize();
customElements.define( 'x-attention', Attention );
customElements.define( 'x-checkbox', Checkbox );
customElements.define( 'x-validated-text', ValidatedText );
customElements.define( 'x-validated-select', ValidatedSelect );
customElements.define( 'x-primary', ButtonPrimary, { extends: 'button' });
customElements.define( 'x-error', ButtonError, { extends: 'button' });
customElements.define( 'x-link', ButtonLink, { extends: 'button' });
customElements.define( 'x-success', ButtonSuccess, { extends: 'button' });
customElements.define( 'x-json-form', JsonForm, { extends: 'form' });
customElements.define( 'x-login-form', LoginForm );
customElements.define( 'x-register-form', RegisterForm );
customElements.define( 'x-split-panel', SplitPanel );
customElements.define( 'x-popup', Popup );
customElements.define( 'x-menu', Menu );
customElements.define( 'x-icon-menu', IconMenu );
customElements.define( 'x-splash', Splash );
customElements.define( 'x-login-widget', LoginWidget );
customElements.define( 'x-application', Application );
customElements.define( 'x-group', Group );
customElements.define( 'x-window', Window );
customElements.define( 'x-search-box', SearchBox );

document.body.appendChild( JML.elm( new Application() ) );