import { ISplashAction } from '../actions/splash-actions';

const defaultSplashState: HatcheryEditor.ISplashScreen = {
    error: null,
    loading: false,
    projects: [],
    numProjects: 0,
    serverResponse: null,
    // selectedProject: null
}

/**
 * A reducer for processing splash screen actions
 */
export function splashReducer( state: HatcheryEditor.ISplashScreen, action: ISplashAction ): HatcheryEditor.ISplashScreen {
    let toReturn = state;

    switch ( action.type ) {
        case 'SPLASH_REQUEST_PENDING':
            toReturn = Object.assign<HatcheryEditor.ISplashScreen>( {}, toReturn, { loading: true, error: null, serverResponse: null });
            break;
        case 'SPLASH_REQUEST_REJECTED':
        case 'SPLASH_REQUEST_FULFILLED':
        case 'SPLASH_GET_PROJECTS':
            // case 'SPLASH_PROJECT_CREATED':
            toReturn = Object.assign<HatcheryEditor.ISplashScreen>( {}, toReturn, { loading: false }, action.data! );
            break;
        case 'SPLASH_SET_SCREEN':
            toReturn = Object.assign<HatcheryEditor.ISplashScreen>( {}, toReturn, action.data! );
            break;
        default:
            toReturn = defaultSplashState;
            break;
    }
    return toReturn;
}